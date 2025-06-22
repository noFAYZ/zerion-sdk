import { HttpClient } from '../lib/http-client';
import {
  ApiResponse,
  WalletChartData,
  WalletPnLData,
  Position,
  Transaction,
  NFTPosition,
  NFTCollection,
  ChartPeriod,
  WalletChartParams,
  WalletPnLParams,
  WalletPositionsParams,
  WalletTransactionsParams,
  WalletNFTPositionsParams,
  WalletNFTCollectionsParams,
  PositionFilter
} from '../types';
import { normalizeAddress, buildQueryParams, validateRequired } from '../utils';

export class WalletService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get wallet's balance chart for a specified period
   */
  async getChart(
    address: string,
    period: ChartPeriod,
    params?: WalletChartParams
  ): Promise<ApiResponse<WalletChartData>> {
    validateRequired({ address, period }, ['address', 'period']);
    
    const normalizedAddress = normalizeAddress(address);
    const query = params ? `?${buildQueryParams(params)}` : '';
    
    return this.httpClient.get<ApiResponse<WalletChartData>>(
      `/v1/wallets/${normalizedAddress}/charts/${period}${query}`
    );
  }

  /**
   * Get wallet's Profit & Loss data
   */
  async getPnL(
    address: string,
    params?: WalletPnLParams
  ): Promise<ApiResponse<WalletPnLData>> {
    validateRequired({ address }, ['address']);
    
    const normalizedAddress = normalizeAddress(address);
    const query = params ? `?${buildQueryParams(params)}` : '';
    
    return this.httpClient.get<ApiResponse<WalletPnLData>>(
      `/v1/wallets/${normalizedAddress}/pnl/${query}`
    );
  }

  /**
   * Get wallet's portfolio overview
   */
  async getPortfolio(
    address: string,
    options?: {
      positions?: PositionFilter;
    }
  ): Promise<ApiResponse<any>> {
    validateRequired({ address }, ['address']);
    
    const normalizedAddress = normalizeAddress(address);
    const params: Record<string, any> = {};
    
    if (options?.positions) {
      params['filter[positions]'] = options.positions;
    }
    
    const query = Object.keys(params).length > 0 ? `?${buildQueryParams(params)}` : '';
    
    return this.httpClient.get<ApiResponse<any>>(
      `/v1/wallets/${normalizedAddress}/portfolio${query}`
    );
  }

  /**
   * Get list of wallet's fungible positions
   */
  async getPositions(
    address: string,
    params?: WalletPositionsParams
  ): Promise<ApiResponse<Position[]>> {
    validateRequired({ address }, ['address']);
    
    const normalizedAddress = normalizeAddress(address);
    const query = params ? `?${buildQueryParams(params)}` : '';

  
    
    return this.httpClient.get<ApiResponse<Position[]>>(
      `/v1/wallets/${normalizedAddress}/positions/${query}`
    );
  }

  /**
   * Get paginated positions with automatic pagination handling
   */
  async getAllPositions(
    address: string,
    params?: Omit<WalletPositionsParams, 'page'>
  ): Promise<Position[]> {
    const allPositions: Position[] = [];
    let cursor: string | undefined;
    
    do {
      const response = await this.getPositions(address, {
        ...params,
        page: {
          after: cursor,
          size: 100 // Max page size
        }
      });
      
      if (Array.isArray(response.data)) {
        allPositions.push(...response.data);
      }
      
      cursor = response.links.next ? 
        new URL(response.links.next).searchParams.get('page[after]') || undefined : 
        undefined;
        
    } while (cursor);
    
    return allPositions;
  }

  /**
   * Get list of wallet's transactions
   */
  async getTransactions(
    address: string,
    params?: WalletTransactionsParams
  ): Promise<ApiResponse<Transaction[]>> {
    validateRequired({ address }, ['address']);
    
    const normalizedAddress = normalizeAddress(address);
    const query = params ? `?${buildQueryParams(params)}` : '';
    
    return this.httpClient.get<ApiResponse<Transaction[]>>(
      `/v1/wallets/${normalizedAddress}/transactions/${query}`
    );
  }

  /**
   * Get paginated transactions with automatic pagination handling
   */
  async getAllTransactions(
    address: string,
    params?: Omit<WalletTransactionsParams, 'page'>
  ): Promise<Transaction[]> {
    const allTransactions: Transaction[] = [];
    let cursor: string | undefined;
    
    do {
      const response = await this.getTransactions(address, {
        ...params,
        page: {
          after: cursor,
          size: 100
        }
      });
      
      if (Array.isArray(response.data)) {
        allTransactions.push(...response.data);
      }
      
      cursor = response.links.next ? 
        new URL(response.links.next).searchParams.get('page[after]') || undefined : 
        undefined;
        
    } while (cursor);
    
    return allTransactions;
  }

  /**
   * Get list of wallet's NFT positions
   */
  async getNFTPositions(
    address: string,
    params?: WalletNFTPositionsParams
  ): Promise<ApiResponse<NFTPosition[]>> {
    validateRequired({ address }, ['address']);
    
    const normalizedAddress = normalizeAddress(address);
    const query = params ? `?${buildQueryParams(params)}` : '';
    
    return this.httpClient.get<ApiResponse<NFTPosition[]>>(
      `/v1/wallets/${normalizedAddress}/nft-positions/${query}`
    );
  }

  /**
   * Get all NFT positions with automatic pagination
   */
  async getAllNFTPositions(
    address: string,
    params?: Omit<WalletNFTPositionsParams, 'page'>
  ): Promise<NFTPosition[]> {
    const allPositions: NFTPosition[] = [];
    let cursor: string | undefined;
    
    do {
      const response = await this.getNFTPositions(address, {
        ...params,
        page: {
          after: cursor,
          size: 100
        }
      });
      
      if (Array.isArray(response.data)) {
        allPositions.push(...response.data);
      }
      
      cursor = response.links.next ? 
        new URL(response.links.next).searchParams.get('page[after]') || undefined : 
        undefined;
        
    } while (cursor);
    
    return allPositions;
  }

  /**
   * Get list of NFT collections held by wallet
   */
  async getNFTCollections(
    address: string,
    params?: WalletNFTCollectionsParams
  ): Promise<ApiResponse<NFTCollection[]>> {
    validateRequired({ address }, ['address']);
    
    const normalizedAddress = normalizeAddress(address);
    const query = params ? `?${buildQueryParams(params)}` : '';
    
    return this.httpClient.get<ApiResponse<NFTCollection[]>>(
      `/v1/wallets/${normalizedAddress}/nft-collections/${query}`
    );
  }

  /**
   * Get wallet's NFT portfolio overview
   */
  async getNFTPortfolio(address: string): Promise<ApiResponse<any>> {
    validateRequired({ address }, ['address']);
    
    const normalizedAddress = normalizeAddress(address);
    
    return this.httpClient.get<ApiResponse<any>>(
      `/v1/wallets/${normalizedAddress}/nft-portfolio`
    );
  }

  /**
   * Get comprehensive wallet summary
   */
  async getWalletSummary(address: string): Promise<{
    portfolio: ApiResponse<any>;
    pnl: ApiResponse<WalletPnLData>;
    nftPortfolio: ApiResponse<any>;
    topPositions: Position[];
    recentTransactions: Transaction[];
  }> {
    validateRequired({ address }, ['address']);
    
    const [portfolio, pnl, nftPortfolio, positions, transactions] = await Promise.all([
      this.getPortfolio(address),
      this.getPnL(address),
      this.getNFTPortfolio(address),
      this.getPositions(address, { 
        page: { size: 10 },
        sort: 'value'
      }),
      this.getTransactions(address, { 
        page: { size: 10 }
      })
    ]);

    return {
      portfolio,
      pnl,
      nftPortfolio,
      topPositions: Array.isArray(positions.data) ? positions.data : [],
      recentTransactions: Array.isArray(transactions.data) ? transactions.data : []
    };
  }
}