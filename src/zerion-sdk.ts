import { HttpClient } from './lib/http-client';
import { WalletService } from './services/wallet.service';
import { FungiblesService } from './services/fungibles.service';
import { ChainsService } from './services/chains.service';
import { SwapService } from './services/swap.service';
import { NFTService } from './services/nft.service';
import { GasService } from './services/gas.service';
import { ZerionConfig, Environment } from './types';
import { isValidApiKey } from './utils';

export class ZerionSDK {
  private httpClient: HttpClient;
  
  public readonly wallets: WalletService;
  public readonly fungibles: FungiblesService;
  public readonly chains: ChainsService;
  public readonly swap: SwapService;
  public readonly nfts: NFTService;
  public readonly gas: GasService;

  constructor(config: ZerionConfig) {
    this.validateConfig(config);
    
    this.httpClient = new HttpClient(config);
    
    // Initialize services
    this.wallets = new WalletService(this.httpClient);
    this.fungibles = new FungiblesService(this.httpClient);
    this.chains = new ChainsService(this.httpClient);
    this.swap = new SwapService(this.httpClient);
    this.nfts = new NFTService(this.httpClient);
    this.gas = new GasService(this.httpClient);
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: ZerionConfig): void {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    if (!isValidApiKey(config.apiKey)) {
      throw new Error('Invalid API key format. Expected format: zk_prod_... or zk_dev_...');
    }

    if (config.timeout && config.timeout < 1000) {
      throw new Error('Timeout must be at least 1000ms');
    }

    if (config.retries && (config.retries < 0 || config.retries > 10)) {
      throw new Error('Retries must be between 0 and 10');
    }
  }

  /**
   * Set environment (production or testnet)
   */
  setEnvironment(env: Environment): void {
    this.httpClient.setEnvironment(env);
  }

  /**
   * Set request timeout
   */
  setTimeout(timeout: number): void {
    this.httpClient.setTimeout(timeout);
  }

  /**
   * Set retry configuration
   */
  setRetries(retries: number, delay?: number): void {
    this.httpClient.setRetries(retries);
    if (delay) {
      this.httpClient.setRetryDelay(delay);
    }
  }

  /**
   * Get comprehensive portfolio analysis for a wallet
   */
  async getPortfolioAnalysis(address: string): Promise<{
    summary: any;
    positions: any[];
    nftPortfolio: any;
    pnl: any;
    recentActivity: any[];
    chainDistribution: Record<string, number>;
    topAssets: any[];
  }> {
    const [
      portfolio,
      positions,
      nftPortfolio,
     // pnl,
      transactions
    ] = await Promise.all([
      this.wallets.getPortfolio(address),
      this.wallets.getPositions(address, { page: { size: 50 } }),
      this.wallets.getNFTPortfolio(address),
     // this.wallets.getPnL(address),
      this.wallets.getTransactions(address, { page: { size: 20 } })
    ]);

    // Calculate chain distribution
    const chainDistribution: Record<string, number> = {};
    const positionsArray = Array.isArray(positions.data) ? positions.data : [];
    
    positionsArray.forEach(position => {
      const chainId = position.relationships?.chain?.data.id;
      if (chainId && position.attributes.value) {
        chainDistribution[chainId] = (chainDistribution[chainId] || 0) + position.attributes.value;
      }
    });

    // Get top assets by value
    const topAssets = positionsArray
      .filter(p => p.attributes.value)
      .sort((a, b) => (b.attributes.value || 0) - (a.attributes.value || 0))
      .slice(0, 10);

    return {
      summary: portfolio.data,
      positions: positionsArray,
      nftPortfolio: nftPortfolio.data,
      pnl: "pnl.data", // Placeholder, would need pnl service
      recentActivity: Array.isArray(transactions.data) ? transactions.data : [],
      chainDistribution,
      topAssets
    };
  }

  /**
   * Get market overview with trending assets
   */
  async getMarketOverview(): Promise<{
    topAssets: any[];
    trending: any[];
    chains: any[];
    totalChains: number;
  }> {
    const [topAssets, trending, chains] = await Promise.all([
      this.fungibles.getTopFungibles(50),
      this.fungibles.getTrendingFungibles('1d', 20),
      this.chains.getPopularChains()
    ]);

    const allChains = await this.chains.getAllChains();

    return {
      topAssets,
      trending,
      chains,
      totalChains: allChains.length
    };
  }

  /**
   * Find best swap route between tokens
   */
  async findBestSwapRoute(
    fromToken: { chainId: string; address?: string },
    toToken: { chainId: string; address?: string },
    amount: string,
    options?: {
      slippage?: number;
      gasPrice?: string;
    }
  ): Promise<{
    bestOffer: any;
    allOffers: any[];
    route: any;
    gasEstimate: any;
  } | null> {
    const swapParams = {
      input: {
        chain_id: fromToken.chainId,
        address: fromToken.address,
        amount
      },
      output: {
        chain_id: toToken.chainId,
        address: toToken.address
      },
      slippage_percent: options?.slippage || 2,
      gas_price: options?.gasPrice
    };

    const [offers, route, gasPrice] = await Promise.all([
      this.swap.getSwapOffers(swapParams),
      this.swap.getSwapRoute(swapParams),
      this.gas.getChainGasPrice(fromToken.chainId, 'classic')
    ]);

    const allOffers = Array.isArray(offers.data) ? offers.data : [];
    const bestOffer = allOffers.length > 0 ? allOffers[0] : null;

    if (!bestOffer) {
      return null;
    }

    const gasEstimate = gasPrice ? await this.gas.estimateTransactionCost(
      fromToken.chainId,
      bestOffer.attributes.data.gas_limit,
      'classic'
    ) : null;

    return {
      bestOffer,
      allOffers,
      route,
      gasEstimate
    };
  }

  /**
   * Batch operation to get multiple wallet summaries
   */
  async batchGetWalletSummaries(addresses: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    const promises = addresses.map(async (address) => {
      try {
        const summary = await this.wallets.getWalletSummary(address);
        return { address, summary, error: null };
      } catch (error) {
        return { 
          address, 
          summary: null, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    const settlements = await Promise.allSettled(promises);
    
    settlements.forEach((settlement, index) => {
      const address = addresses[index];
      if (settlement.status === 'fulfilled') {
        results[address] = settlement.value;
      } else {
        results[address] = {
          address,
          summary: null,
          error: settlement.reason?.message || 'Failed to fetch wallet summary'
        };
      }
    });

    return results;
  }

  /**
   * Get cross-chain asset analysis
   */
  async getCrossChainAssetAnalysis(tokenSymbol: string): Promise<{
    implementations: any[];
    priceVariance: number;
    liquidityAnalysis: any[];
    bridgeOptions: any[];
  }> {
    // Search for the token across all chains
    const fungibles = await this.fungibles.searchFungibles(tokenSymbol, { limit: 50 });
    
    // Filter to exact symbol matches
    const exactMatches = fungibles.filter(
      f => f.attributes.symbol.toLowerCase() === tokenSymbol.toLowerCase()
    );

    if (exactMatches.length === 0) {
      return {
        implementations: [],
        priceVariance: 0,
        liquidityAnalysis: [],
        bridgeOptions: []
      };
    }

    // Get prices and calculate variance
    const prices = exactMatches
      .map(f => f.attributes.market_data?.price)
      .filter(p => p !== undefined) as number[];
    
    const priceVariance = prices.length > 1 
      ? Math.max(...prices) - Math.min(...prices)
      : 0;

    // Get bridge options between top chains
    const topChains = await this.chains.getPopularChains();
    const bridgeOptions = [];

    for (let i = 0; i < Math.min(topChains.length, 3); i++) {
      for (let j = i + 1; j < Math.min(topChains.length, 3); j++) {
        try {
          const options = await this.swap.getCrossChainSwapOptions(
            topChains[i].id,
            topChains[j].id,
            tokenSymbol
          );
          bridgeOptions.push({
            from: topChains[i].attributes.name,
            to: topChains[j].attributes.name,
            available: options.availableTokens.length > 0
          });
        } catch (error) {
          // Continue with other pairs if one fails
        }
      }
    }

    return {
      implementations: exactMatches,
      priceVariance,
      liquidityAnalysis: [], // Would require additional market data
      bridgeOptions
    };
  }

  /**
   * Monitor wallet activity
   */
  async *monitorWalletActivity(
    address: string,
    intervalMs: number = 60000
  ): AsyncGenerator<{
    timestamp: number;
    newTransactions: any[];
    portfolioChange: any;
    alerts: string[];
  }> {
    let lastCheck = Date.now();
    
    while (true) {
      try {
        const currentTime = Date.now();
        
        // Get recent transactions since last check
        const transactions = await this.wallets.getTransactions(address, {
          filter: {
            min_mined_at: Math.floor(lastCheck / 1000)
          },
          page: { size: 50 }
        });

        const newTransactions = Array.isArray(transactions.data) ? transactions.data : [];
        
        // Get current portfolio for comparison
        const portfolio = await this.wallets.getPortfolio(address);
        
        // Generate alerts based on activity
        const alerts: string[] = [];
        if (newTransactions.length > 0) {
          alerts.push(`${newTransactions.length} new transactions detected`);
        }

        yield {
          timestamp: currentTime,
          newTransactions,
          portfolioChange: portfolio.data,
          alerts
        };

        lastCheck = currentTime;
      } catch (error) {
        console.error('Error monitoring wallet activity:', error);
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  /**
   * Get SDK health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    responseTime: number;
  }> {
    const startTime = Date.now();
    const services: Record<string, boolean> = {};

    try {
      // Test basic endpoints
      const tests = [
        { name: 'chains', test: () => this.chains.getChains() },
        { name: 'gasPrices', test: () => this.gas.getGasPrices() },
      ];

      const results = await Promise.allSettled(
        tests.map(async ({ name, test }) => {
          try {
            await test();
            return { name, success: true };
          } catch (error) {
            return { name, success: false };
          }
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          services[result.value.name] = result.value.success;
        } else {
          services['unknown'] = false;
        }
      });

      const successfulServices = Object.values(services).filter(Boolean).length;
      const totalServices = Object.keys(services).length;
      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (successfulServices === totalServices) {
        status = 'healthy';
      } else if (successfulServices > 0) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return { status, services, responseTime };
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        services: {},
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get aggregated data for multiple wallets
   */
  async getMultiWalletAggregation(addresses: string[]): Promise<{
    totalValue: number;
    totalPnL: number;
    combinedPositions: any[];
    topChains: Array<{ chainId: string; value: number; percentage: number }>;
    topAssets: Array<{ symbol: string; value: number; percentage: number }>;
  }> {
    const walletSummaries = await this.batchGetWalletSummaries(addresses);
    
    let totalValue = 0;
    let totalPnL = 0;
    const combinedPositions: any[] = [];
    const chainValues: Record<string, number> = {};
    const assetValues: Record<string, number> = {};

    Object.values(walletSummaries).forEach((walletData: any) => {
      if (walletData.summary && !walletData.error) {
        const { summary } = walletData;
        
        // Add to total value
        if (summary.portfolio?.data?.attributes?.total_value) {
          totalValue += summary.portfolio.data.attributes.total_value;
        }
        
        // Add to total PnL
        if (summary.pnl?.attributes?.unrealized_gain) {
          totalPnL += summary.pnl.attributes.unrealized_gain;
        }
        if (summary.pnl?.attributes?.realized_gain) {
          totalPnL += summary.pnl.attributes.realized_gain;
        }
        
        // Combine positions
        if (summary.topPositions) {
          combinedPositions.push(...summary.topPositions);
        }
      }
    });

    // Calculate chain distribution
    combinedPositions.forEach(position => {
      const chainId = position.relationships?.chain?.data.id;
      const value = position.attributes?.value || 0;
      if (chainId) {
        chainValues[chainId] = (chainValues[chainId] || 0) + value;
      }
      
      const symbol = position.attributes?.fungible_info?.symbol;
      if (symbol) {
        assetValues[symbol] = (assetValues[symbol] || 0) + value;
      }
    });

    // Get top chains by value
    const topChains = Object.entries(chainValues)
      .map(([chainId, value]) => ({
        chainId,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Get top assets by value
    const topAssets = Object.entries(assetValues)
      .map(([symbol, value]) => ({
        symbol,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalValue,
      totalPnL,
      combinedPositions,
      topChains,
      topAssets
    };
  }

  /**
   * Get DeFi yield opportunities
   */
  async getYieldOpportunities(chainIds?: string[]): Promise<{
    stakingOpportunities: any[];
    liquidityPools: any[];
    lendingProtocols: any[];
  }> {
    // This would require additional API endpoints or data sources
    // For now, return mock structure that could be implemented
    return {
      stakingOpportunities: [],
      liquidityPools: [],
      lendingProtocols: []
    };
  }

  /**
   * Analyze transaction patterns
   */
  async analyzeTransactionPatterns(
    address: string,
    timeRange: { start: number; end: number }
  ): Promise<{
    totalTransactions: number;
    averageDaily: number;
    mostActiveDay: string;
    commonOperations: Array<{ type: string; count: number }>;
    gasSpent: number;
    preferredChains: Array<{ chain: string; count: number }>;
  }> {
    const transactions = await this.wallets.getAllTransactions(address);
    
    // Filter by time range
    const filteredTxs = transactions.filter(tx => {
      const minedAt = tx.attributes.mined_at * 1000; // Convert to ms
      return minedAt >= timeRange.start && minedAt <= timeRange.end;
    });

    const totalTransactions = filteredTxs.length;
    const daysDiff = Math.ceil((timeRange.end - timeRange.start) / (24 * 60 * 60 * 1000));
    const averageDaily = totalTransactions / daysDiff;

    // Count operations
    const operationCounts: Record<string, number> = {};
    const chainCounts: Record<string, number> = {};
    let totalGasSpent = 0;

    filteredTxs.forEach(tx => {
      const operation = tx.attributes.operation_type;
      operationCounts[operation] = (operationCounts[operation] || 0) + 1;
      
      const chainId = tx.relationships?.chain?.data.id;
      if (chainId) {
        chainCounts[chainId] = (chainCounts[chainId] || 0) + 1;
      }
      
      if (tx.attributes.fee) {
        totalGasSpent += tx.attributes.fee;
      }
    });

    const commonOperations = Object.entries(operationCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const preferredChains = Object.entries(chainCounts)
      .map(([chain, count]) => ({ chain, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalTransactions,
      averageDaily,
      mostActiveDay: 'N/A', // Would need daily breakdown
      commonOperations,
      gasSpent: totalGasSpent,
      preferredChains
    };
  }
}