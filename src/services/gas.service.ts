import { HttpClient } from '../lib/http-client';
import {
  ApiResponse,
  GasPrice,
  GasPricesParams,
  GasPricesType
} from '../types';
import { buildQueryParams, validateRequired } from '../utils';

export class GasService {
  private gasPriceCache = new Map<string, { data: GasPrice[]; timestamp: number }>();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds

  constructor(private httpClient: HttpClient) {}

  /**
   * Get gas prices for all or specific chains
   */
  async getGasPrices(params?: GasPricesParams): Promise<ApiResponse<GasPrice[]>> {
    const query = params ? `?${buildQueryParams(params)}` : '';
    
    return this.httpClient.get<ApiResponse<GasPrice[]>>(
      `/v1/gas-prices/${query}`
    );
  }

  /**
   * Get gas prices for a specific chain
   */
  async getChainGasPrices(
    chainId: string,
    useCache: boolean = true
  ): Promise<GasPrice[]> {
    validateRequired({ chainId }, ['chainId']);
    
    const cacheKey = `chain_${chainId}`;
    
    if (useCache && this.isCacheValid(cacheKey)) {
      return this.gasPriceCache.get(cacheKey)!.data;
    }
    
    const response = await this.getGasPrices({
      filter: { chain_ids: [chainId] }
    });
    
    const gasPrices = Array.isArray(response.data) ? response.data : [];
    
    if (useCache) {
      this.gasPriceCache.set(cacheKey, {
        data: gasPrices,
        timestamp: Date.now()
      });
    }
    
    return gasPrices;
  }

  /**
   * Get specific gas type for a chain
   */
  async getChainGasPrice(
    chainId: string,
    gasType: GasPricesType = 'classic'
  ): Promise<GasPrice | null> {
    const gasPrices = await this.getChainGasPrices(chainId);
    
    return gasPrices.find(price => 
      price.attributes.gas_type === gasType
    ) || null;
  }

  /**
   * Get all gas types for a chain as an object
   */
  async getChainGasPricesByType(chainId: string): Promise<{
    classic?: GasPrice;
    eip1559?: GasPrice;
    optimistic?: GasPrice;
  }> {
    const gasPrices = await this.getChainGasPrices(chainId);
    
    const result: { classic?: GasPrice; eip1559?: GasPrice; optimistic?: GasPrice } = {};
    
    gasPrices.forEach(price => {
      result[price.attributes.gas_type] = price;
    });
    
    return result;
  }

  /**
   * Get gas prices for multiple chains
   */
  async getMultiChainGasPrices(chainIds: string[]): Promise<Record<string, GasPrice[]>> {
    validateRequired({ chainIds }, ['chainIds']);
    
    if (chainIds.length === 0) {
      return {};
    }
    
    const response = await this.getGasPrices({
      filter: { chain_ids: chainIds }
    });
    
    const gasPrices = Array.isArray(response.data) ? response.data : [];
    const result: Record<string, GasPrice[]> = {};
    
    // Initialize empty arrays for each chain
    chainIds.forEach(chainId => {
      result[chainId] = [];
    });
    
    // Group gas prices by chain
    gasPrices.forEach(price => {
      const chainId = price.relationships?.chain?.data.id;
      if (chainId && result[chainId]) {
        result[chainId].push(price);
      }
    });
    
    return result;
  }

  /**
   * Compare gas prices across chains
   */
  async compareGasPricesAcrossChains(
    chainIds: string[],
    gasType: 'classic' | 'fast' | 'instant' = 'classic'
  ): Promise<{
    prices: Array<{
      chainId: string;
      gasPrice: GasPrice | null;
      priceInWei: string;
      estimatedTimeMinutes: number;
    }>;
    cheapest: { chainId: string; price: string } | null;
    fastest: { chainId: string; time: number } | null;
  }> {
    const gasData = await this.getMultiChainGasPrices(chainIds);
    
    const prices = chainIds.map(chainId => {
      const chainGasPrices = gasData[chainId] || [];
      const gasPrice = chainGasPrices.find(p => p.attributes.gas_type === gasType) || null;
      
      return {
        chainId,
        gasPrice,
        priceInWei: gasPrice?.attributes.info.standard || '0',
        estimatedTimeMinutes: gasPrice?.attributes.updated_at || 0
      };
    });
    
    // Find cheapest (lowest price)
    const cheapest = prices
      .filter(p => p.gasPrice)
      .reduce((min, current) => {
        const minPrice = min ? BigInt(min.priceInWei) : BigInt('0');
        const currentPrice = BigInt(current.priceInWei);
        return currentPrice < minPrice ? current : min;
      }, prices.find(p => p.gasPrice) || null);
    
    // Find fastest (lowest time)
    const fastest = prices
      .filter(p => p.gasPrice)
      .reduce((min, current) => 
        current.estimatedTimeMinutes < min.estimatedTimeMinutes ? current : min,
        prices.find(p => p.gasPrice) || { chainId: '', gasPrice: null, priceInWei: '0', estimatedTimeMinutes: Infinity }
      );
    
    return {
      prices,
      cheapest: cheapest ? { 
        chainId: cheapest.chainId, 
        price: cheapest.priceInWei 
      } : null,
      fastest: fastest ? { 
        chainId: fastest.chainId, 
        time: fastest.estimatedTimeMinutes 
      } : null
    };
  }

  /**
   * Get gas price recommendations
   */
  async getGasRecommendations(chainId: string): Promise<{
    recommended: 'classic' | 'fast' | 'instant';
    options: {
      classic: { price: string; timeMinutes: number; description: string };
      fast: { price: string; timeMinutes: number; description: string };
      instant: { price: string; timeMinutes: number; description: string };
    };
  } | null> {
    const gasPrices = await this.getChainGasPricesByType(chainId);
    
    if (!gasPrices.classic && !gasPrices.eip1559 && !gasPrices.optimistic) {
      return null;
    }
    
    const options = {
      classic: {
        price: gasPrices.classic?.attributes.info.standard || '0',
        timeMinutes: gasPrices.classic?.attributes.updated_at || 0,
        description: 'Standard speed, lowest cost'
      },
      fast: {
        price: gasPrices.eip1559?.attributes.info.standard || '0',
        timeMinutes: gasPrices.eip1559?.attributes.updated_at || 0,
        description: 'Faster confirmation, moderate cost'
      },
      instant: {
        price: gasPrices.optimistic?.attributes.info.standard || '0',
        timeMinutes: gasPrices.optimistic?.attributes.updated_at || 0,
        description: 'Fastest confirmation, highest cost'
      }
    };
    
    // Recommend based on time difference and price difference
    let recommended: 'classic' | 'fast' | 'instant' = 'classic';
    
    if (gasPrices.eip1559 && gasPrices.classic) {
      const timeDiff = gasPrices.classic.attributes.updated_at - gasPrices.eip1559.attributes.updated_at;
      const priceDiff = BigInt(gasPrices.eip1559.attributes.info.standard) - BigInt(gasPrices.classic.attributes.info.standard);
      
      // If fast is significantly faster for reasonable price increase
      if (timeDiff > 5 && priceDiff < BigInt(gasPrices.classic.attributes.info.standard) / BigInt(2)) {
        recommended = 'fast';
      }
    }
    
    return { recommended, options };
  }

  /**
   * Estimate transaction cost
   */
  async estimateTransactionCost(
    chainId: string,
    gasLimit: string,
    gasType: GasPricesType = 'classic'
  ): Promise<{
    gasPrice: string;
    gasLimit: string;
    totalCostWei: string;
    estimatedTimeMinutes: number;
  } | null> {
    validateRequired({ chainId, gasLimit }, ['chainId', 'gasLimit']);
    
    const gasPrice = await this.getChainGasPrice(chainId, gasType);
    
    if (!gasPrice) {
      return null;
    }
    
    const gasPriceWei = BigInt(gasPrice.attributes.info.standard);
    const gasLimitBig = BigInt(gasLimit);
    const totalCostWei = gasPriceWei * gasLimitBig;
    
    return {
      gasPrice: gasPrice.attributes.info.standard,
      gasLimit,
      totalCostWei: totalCostWei.toString(),
      estimatedTimeMinutes: gasPrice.attributes.updated_at
    };
  }

  /**
   * Get gas price trends (requires historical data - mock implementation)
   */
  async getGasPriceTrends(chainId: string): Promise<{
    current: GasPrice | null;
    trend: 'rising' | 'falling' | 'stable';
    recommendation: string;
  }> {
    const currentGasPrice = await this.getChainGasPrice(chainId, 'classic');
    
    // This is a simplified implementation
    // In a real scenario, you'd compare with historical data
    return {
      current: currentGasPrice,
      trend: 'stable', // Would be calculated from historical data
      recommendation: currentGasPrice 
        ? 'Current gas prices are within normal range'
        : 'Gas price data not available'
    };
  }

  /**
   * Get optimal gas price for transaction timing
   */
  async getOptimalGasPrice(
    chainId: string,
    urgency: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<GasPrice | null> {
    const gasPricesByType = await this.getChainGasPricesByType(chainId);
    
    switch (urgency) {
      case 'low':
        return gasPricesByType.classic || null;
      case 'medium':
        return gasPricesByType.eip1559 || gasPricesByType.classic || null;
      case 'high':
        return gasPricesByType.optimistic || gasPricesByType.eip1559 || gasPricesByType.classic || null;
      default:
        return gasPricesByType.classic || null;
    }
  }

  /**
   * Calculate gas fee in native token units
   */
  async calculateGasFeeInNativeToken(
    chainId: string,
    gasLimit: string,
    gasType: GasPricesType = 'classic'
  ): Promise<{
    feeWei: string;
    feeEther: string;
    feeGwei: string;
  } | null> {
    const cost = await this.estimateTransactionCost(chainId, gasLimit, gasType);
    
    if (!cost) {
      return null;
    }
    
    const feeWei = cost.totalCostWei;
    const feeEther = (BigInt(feeWei) / BigInt('1000000000000000000')).toString();
    const feeGwei = (BigInt(feeWei) / BigInt('1000000000')).toString();
    
    return {
      feeWei,
      feeEther,
      feeGwei
    };
  }

  /**
   * Monitor gas prices for a chain
   */
  async *monitorGasPrices(
    chainId: string,
    intervalMs: number = 30000
  ): AsyncGenerator<GasPrice[], void, unknown> {
    while (true) {
      try {
        const gasPrices = await this.getChainGasPrices(chainId, false);
        yield gasPrices;
      } catch (error) {
        console.error('Error monitoring gas prices:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  /**
   * Get gas price alerts based on thresholds
   */
  async getGasPriceAlerts(
    chainId: string,
    thresholds: {
      low?: string;  // Wei
      high?: string; // Wei
    }
  ): Promise<{
    currentPrice: string;
    alerts: Array<{
      type: 'low' | 'high';
      threshold: string;
      triggered: boolean;
      message: string;
    }>;
  }> {
    const currentGasPrice = await this.getChainGasPrice(chainId, 'classic');
    const currentPrice = currentGasPrice?.attributes.info.standard || '0';
    
    const alerts = [];
    
    if (thresholds.low) {
      const triggered = BigInt(currentPrice) <= BigInt(thresholds.low);
      alerts.push({
        type: 'low' as const,
        threshold: thresholds.low,
        triggered,
        message: triggered 
          ? `Gas price is below threshold (${thresholds.low} wei)`
          : `Gas price is above low threshold`
      });
    }
    
    if (thresholds.high) {
      const triggered = BigInt(currentPrice) >= BigInt(thresholds.high);
      alerts.push({
        type: 'high' as const,
        threshold: thresholds.high,
        triggered,
        message: triggered 
          ? `Gas price is above threshold (${thresholds.high} wei)`
          : `Gas price is below high threshold`
      });
    }
    
    return {
      currentPrice,
      alerts
    };
  }

  /**
   * Clear gas price cache
   */
  clearCache(): void {
    this.gasPriceCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    keys: string[];
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const keys = Array.from(this.gasPriceCache.keys());
    const timestamps = Array.from(this.gasPriceCache.values()).map(v => v.timestamp);
    
    return {
      size: this.gasPriceCache.size,
      keys,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined
    };
  }

  private isCacheValid(cacheKey: string): boolean {
    const cached = this.gasPriceCache.get(cacheKey);
    if (!cached) return false;
    
    return (Date.now() - cached.timestamp) < this.CACHE_TTL;
  }
}