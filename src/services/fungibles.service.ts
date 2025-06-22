import { HttpClient } from '../lib/http-client';
import {
  ApiResponse,
  Fungible,
  WalletChartData,
  FungiblesParams,
  ChartPeriod
} from '../types';
import { buildQueryParams, validateRequired } from '../utils';

export class FungiblesService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get list of fungible assets with optional filtering and pagination
   */
  async getFungibles(params?: FungiblesParams): Promise<ApiResponse<Fungible[]>> {
    const query = params ? `?${buildQueryParams(params)}` : '';
    
    return this.httpClient.get<ApiResponse<Fungible[]>>(
      `/v1/fungibles/${query}`
    );
  }

  /**
   * Get all fungibles with automatic pagination
   */
  async getAllFungibles(
    params?: Omit<FungiblesParams, 'page'>
  ): Promise<Fungible[]> {
    const allFungibles: Fungible[] = [];
    let cursor: string | undefined;
    
    do {
      const response = await this.getFungibles({
        ...params,
        page: {
          after: cursor,
          size: 100
        }
      });
      
      if (Array.isArray(response.data)) {
        allFungibles.push(...response.data);
      }
      
      cursor = response.links.next ? 
        new URL(response.links.next).searchParams.get('page[after]') || undefined : 
        undefined;
        
    } while (cursor);
    
    return allFungibles;
  }

  /**
   * Get fungible asset by ID
   */
  async getFungible(fungibleId: string): Promise<ApiResponse<Fungible>> {
    validateRequired({ fungibleId }, ['fungibleId']);
    
    return this.httpClient.get<ApiResponse<Fungible>>(
      `/v1/fungibles/${fungibleId}`
    );
  }

  /**
   * Get chart data for a fungible asset
   */
  async getFungibleChart(
    fungibleId: string,
    period: ChartPeriod
  ): Promise<ApiResponse<WalletChartData>> {
    validateRequired({ fungibleId, period }, ['fungibleId', 'period']);
    
    return this.httpClient.get<ApiResponse<WalletChartData>>(
      `/v1/fungibles/${fungibleId}/charts/${period}`
    );
  }

  /**
   * Search fungibles by query
   */
  async searchFungibles(
    query: string,
    options?: {
      limit?: number;
      chainId?: string;
    }
  ): Promise<Fungible[]> {
    validateRequired({ query }, ['query']);
    
    const params: FungiblesParams = {
      filter: {
        search_query: query,
        implementation_chain_id: options?.chainId
      },
      page: {
        size: options?.limit || 20
      }
    };
    
    const response = await this.getFungibles(params);
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get fungibles by chain
   */
  async getFungiblesByChain(
    chainId: string,
    options?: {
      limit?: number;
      sort?: '-market_data.market_cap' | 'market_data.market_cap';
    }
  ): Promise<Fungible[]> {
    validateRequired({ chainId }, ['chainId']);
    
    const params: FungiblesParams = {
      filter: {
        implementation_chain_id: chainId
      },
      sort: options?.sort || '-market_data.market_cap',
      page: {
        size: options?.limit || 50
      }
    };
    
    const response = await this.getFungibles(params);
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get multiple fungibles by IDs
   */
  async getFungiblesByIds(fungibleIds: string[]): Promise<Fungible[]> {
    validateRequired({ fungibleIds }, ['fungibleIds']);
    
    if (fungibleIds.length === 0) {
      return [];
    }
    
    const params: FungiblesParams = {
      filter: {
        fungible_ids: fungibleIds
      }
    };
    
    const response = await this.getFungibles(params);
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get fungible by contract address
   */
  async getFungibleByAddress(
    chainId: string,
    contractAddress: string
  ): Promise<Fungible | null> {
    validateRequired({ chainId, contractAddress }, ['chainId', 'contractAddress']);
    
    const params: FungiblesParams = {
      filter: {
        implementation_chain_id: chainId,
        implementation_address: contractAddress.toLowerCase()
      }
    };
    
    const response = await this.getFungibles(params);
    const fungibles = Array.isArray(response.data) ? response.data : [];
    
    return fungibles.length > 0 ? fungibles[0] : null;
  }

  /**
   * Get trending fungibles
   */
  async getTrendingFungibles(
    period:  '1d' | '30d' | '90d' | '365d',
    limit: number = 50
  ): Promise<Fungible[]> {
    const sortField = period === '1d' ? 'market_data.price.percent_change_1d' :
                     period === '30d' ? 'market_data.price.percent_change_30d' :
                     period === '90d' ? 'market_data.price.percent_change_90d' :
                     'market_data.percent_change_365d';
    
    const params: FungiblesParams = {
      sort: sortField as any,
      page: {
        size: limit
      }
    };
    
    const response = await this.getFungibles(params);
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get top fungibles by market cap
   */
  async getTopFungibles(limit: number = 100): Promise<Fungible[]> {
    const params: FungiblesParams = {
      sort: '-market_data.market_cap',
      page: {
        size: limit
      }
    };
    
    const response = await this.getFungibles(params);
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get fungible price history for multiple periods
   */
  async getFungiblePriceHistory(
    fungibleId: string,
    periods: ChartPeriod[] = ['day', 'week', 'month']
  ): Promise<Record<ChartPeriod, WalletChartData | null>> {
    validateRequired({ fungibleId }, ['fungibleId']);
    
    const results: Record<string, WalletChartData | null> = {};
    
    await Promise.allSettled(
      periods.map(async (period) => {
        try {
          const response = await this.getFungibleChart(fungibleId, period);
          results[period] = response.data;
        } catch (error) {
          results[period] = null;
        }
      })
    );
    
    return results;
  }

  /**
   * Compare multiple fungibles
   */
  async compareFungibles(fungibleIds: string[]): Promise<{
    fungibles: Fungible[];
    comparison: {
      marketCaps: Record<string, number>;
      percentChanges24h: Record<string, number>;
      prices: Record<string, number>;
    };
  }> {
    validateRequired({ fungibleIds }, ['fungibleIds']);
    
    const fungibles = await this.getFungiblesByIds(fungibleIds);
    
    const comparison = {
      marketCaps: {} as Record<string, number>,
      percentChanges24h: {} as Record<string, number>,
      prices: {} as Record<string, number>
    };
    
    fungibles.forEach(fungible => {
      const marketData = fungible.attributes.market_data;
      if (marketData) {
        comparison.marketCaps[fungible.id] = marketData.market_cap || 0;
        comparison.percentChanges24h[fungible.id] = marketData.percent_change_24h || 0;
        comparison.prices[fungible.id] = marketData.price || 0;
      }
    });
    
    return { fungibles, comparison };
  }
}