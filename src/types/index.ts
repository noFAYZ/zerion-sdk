export interface ZerionConfig {
    apiKey: string;
    baseURL?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  }
  
  export interface ApiResponse<T> {
    data: T;
    links: {
      self: string;
      next?: string;
      prev?: string;
      first?: string;
      last?: string;
    };
    meta?: {
      count?: number;
      total_count?: number;
      has_next?: boolean;
      has_prev?: boolean;
    };
  }
  
  export interface PaginationParams {
    page?: {
      after?: string;
      before?: string;
      size?: number;
    };
  }
  
  export interface WalletChartData {
    type: 'wallet_charts';
    id: string;
    attributes: {
      begin_at: string;
      end_at: string;
      points: Array<[number, number]>;
    };
  }
  
  export interface WalletPnLData {
    type: 'pnl';
    id: string;
    attributes: {
      net_invested: number;
      realized_gain: number;
      received_external: number;
      received_for_nfts: number;
      sent_external: number;
      sent_for_nfts: number;
      total_fee: number;
      unrealized_gain: number;
    };
  }
  
  export interface Position {
    type: string;
    id: string;
    attributes: {
      parent?: string;
      protocol?: string;
      name: string;
      position_type: string;
      quantity: {
        int: string;
        decimals: number;
        float: number;
        numeric: string;
      };
      value?: number;
      price?: number;
      relative_changes?: {
        '1h'?: number;
        '24h'?: number;
        '30d'?: number;
      };
      fungible_info: {
        name: string;
        symbol: string;
        description?: string;
        icon?: {
          url: string;
        };
        flags?: {
          verified?: boolean;
        };
      };
      flags?: {
        displayable?: boolean;
        is_trash?: boolean;
      };
    };
    relationships?: {
      chain?: {
        data: {
          type: string;
          id: string;
        };
      };
      fungible?: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  }
  
  export interface Transaction {
    type: string;
    id: string;
    attributes: {
      operation_type: string;
      hash: string;
      mined_at: number;
      mined_at_block: number;
      sent_from: string;
      sent_to: string;
      status: 'confirmed' | 'failed' | 'pending';
      nonce?: number;
      fee?: number;
      transfers?: Array<{
        fungible_info: {
          name: string;
          symbol: string;
          icon?: {
            url: string;
          };
        };
        direction: 'in' | 'out';
        quantity: {
          int: string;
          decimals: number;
          float: number;
          numeric: string;
        };
        value?: number;
        price?: number;
      }>;
      flags?: {
        is_trash?: boolean;
      };
    };
    relationships?: {
      chain?: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  }
  
  export interface NFTPosition {
    type: string;
    id: string;
    attributes: {
      name?: string;
      token_id: string;
      amount: string;
      collection_info: {
        name: string;
        description?: string;
        icon?: {
          url: string;
        };
      };
      nft_info: {
        content?: {
          preview?: {
            url: string;
          };
          detail?: {
            url: string;
          };
        };
        contract_address: string;
      };
      last_acquired_at?: number;
      last_price?: number;
      flags?: {
        is_trash?: boolean;
      };
    };
    relationships?: {
      chain?: {
        data: {
          type: string;
          id: string;
        };
      };
      collection?: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  }
  
  export interface NFTCollection {
    type: string;
    id: string;
    attributes: {
      name: string;
      description?: string;
      total_supply?: number;
      positions_count: number;
      floor_price?: number;
      collection_info: {
        name: string;
        description?: string;
        icon?: {
          url: string;
        };
      };
    };
    relationships?: {
      chain?: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  }
  
  export interface Fungible {
    type: string;
    id: string;
    attributes: {
      name: string;
      symbol: string;
      description?: string;
      icon?: {
        url: string;
      };
      flags?: {
        verified?: boolean;
      };
      market_data?: {
        price?: number;
        total_supply?: string;
        market_cap?: number;
        fully_diluted_valuation?: number;
        market_cap_rank?: number;
        percent_change_1h?: number;
        percent_change_24h?: number;
        percent_change_7d?: number;
        percent_change_30d?: number;
        percent_change_1y?: number;
      };
      implementations: Array<{
        chain_id: string;
        address?: string;
        decimals: number;
      }>;
    };
    relationships?: {
      chain?: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  }
  
  export interface Chain {
    type: string;
    id: string;
    attributes: {
      external_id: string;
      name: string;
      icon?: {
        url: string;
      };
      flags?: {
        supports_trading?: boolean;
      };
    };
  }
  
  export interface SwapOffer {
    type: string;
    id: string;
    attributes: {
      receive_quantity: {
        int: string;
        decimals: number;
        float: number;
        numeric: string;
      };
      send_quantity: {
        int: string;
        decimals: number;
        float: number;
        numeric: string;
      };
      price?: number;
      data: {
        to: string;
        data: string;
        value: string;
        gas_limit: string;
      };
      meta: {
        suggested_slippage_percent?: number;
        type: 'trade' | 'bridge';
        to_amount_min: string;
        liquidity_source?: {
          name: string;
          id: string;
        };
      };
    };
  }
  
  export interface GasPrice {
    type: string;
    id: string;
    attributes: {
      gas_type: 'classic' | 'eip1559' | 'optimistic';
  
      updated_at: number;
      info: { slow: string, standard: string, fast: string };
    };
    relationships?: {
      chain?: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  }
  
  export interface NFT {
    type: string;
    id: string;
    attributes: {
      token_id: string;
      name?: string;
      description?: string;
      content?: {
        preview?: {
          url: string;
        };
        detail?: {
          url: string;
        };
      };
      contract_address: string;
      collection_info?: {
        name: string;
        description?: string;
        icon?: {
          url: string;
        };
      };
      flags?: {
        is_trash?: boolean;
      };
    };
    relationships?: {
      chain?: {
        data: {
          type: string;
          id: string;
        };
      };
      collection?: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  }
  
  // Filter and Sort Types
  export type ChartPeriod = 'hour' | 'day' | 'week' | 'month' | 'year' | 'max';
  
  export type PositionFilter = 'only_simple' | 'only_complex' | 'no_filter';
  
  export type PositionType = 
    | 'wallet' 
    | 'deposited' 
    | 'borrowed' 
    | 'locked' 
    | 'staked' 
    | 'claimable'
    | 'liquidity';
  
  export type OperationType = 
    | 'trade' 
    | 'send' 
    | 'receive' 
    | 'deposit' 
    | 'withdraw' 
    | 'borrow' 
    | 'repay' 
    | 'stake' 
    | 'unstake' 
    | 'claim';
  
  export type AssetType = 'fungible' | 'nft';
  
  export type TrashFilter = 'only_trash' | 'only_non_trash' | 'no_filter';
  
  export type SortDirection = 'asc' | 'desc';
  
  export type PositionSort = '-value' | 'value' | `value,${SortDirection}` | `relative_changes.24h,${SortDirection}`;
  
  export type TransactionSort = `mined_at,${SortDirection}` | `fee,${SortDirection}`;
  
  export type NFTSort = `created_at` | `-created_at`  | `last_price` | `-last_price` ;
  
  export type FungibleSort = `market_data.market_cap` | 'market_data.price.last' | `-market_data.market_cap` | '-market_data.price.last' | `market_data.price.percent_change_1d` | `-market_data.price.percent_change_1d` | `market_data.price.percent_change_30d` | `-market_data.price.percent_change_30d` | `market_data.price.percent_change_90d` | `-market_data.price.percent_change_365d` | `market_data.price.percent_change_365d` | `-market_data.price.percent_change_365d`;
  
  // Environment Types
  export type Environment = 'production' | 'testnet';
  
  // Error Types
  export interface ZerionError {
    message: string;
    code?: string;
    status?: number;
    details?: unknown;
  }
  
  export class ZerionAPIError extends Error implements ZerionError {
    public code?: string;
    public status?: number;
    public details?: unknown;
  
    constructor(message: string, code?: string, status?: number, details?: unknown) {
      super(message);
      this.name = 'ZerionAPIError';
      this.code = code;
      this.status = status;
      this.details = details;
    }
  }
  
  // Request Parameter Types
  export interface WalletChartParams {
    filter?: {
      chain_ids?: string[];
      fungible_ids?: string[];
    };
  }
  
  export interface WalletPnLParams {
    filter?: {
      chain_ids?: string[];
      fungible_ids?: string[];
    };
  }
  
  export interface WalletPositionsParams extends PaginationParams {
    filter?: {
      positions?: PositionFilter;
      position_types?: PositionType[];
      chain_ids?: string[];
      fungible_ids?: string[];
      dapp_ids?: string[];
      trash?: TrashFilter;
    };
    sort?: PositionSort;
  }
  
  export interface WalletTransactionsParams extends PaginationParams {
    filter?: {
      search_query?: string;
      operation_types?: OperationType[];
      asset_types?: AssetType[];
      chain_ids?: string[];
      fungible_ids?: string[];
      min_mined_at?: number;
      max_mined_at?: number;
      trash?: TrashFilter;
      fungible_implementations?: string[];
    };
  }
  
  export interface WalletNFTPositionsParams extends PaginationParams {
    filter?: {
      chain_ids?: string[];
      collections_ids?: string[];
    };
    sort?: NFTSort;
    include?: string[];
  }
  
  export interface WalletNFTCollectionsParams extends PaginationParams {
    filter?: {
      chain_ids?: string[];
    };
    include?: string[];
  }
  
  export interface FungiblesParams extends PaginationParams {
    filter?: {
      search_query?: string;
      implementation_chain_id?: string;
      implementation_address?: string;
      fungible_ids?: string[];
    };
    sort?: FungibleSort;
  }
  
  export interface NFTsParams {
    filter?: {
      references: string[];
    };
    include?: string[];
  }
  
  export interface SwapFungiblesParams {
    input?: {
      chain_id: string;
      address?: string;
    };
    output?: {
      chain_id: string;
      address?: string;
    };
    direction?: 'input' | 'output' | 'both';
  }
  
  export interface SwapOffersParams {
    input: {
      chain_id: string;
      address?: string;
      amount: string;
    };
    output: {
      chain_id: string;
      address?: string;
    };
    gas_price?: string;
    liquidity_source_id?: string;
    sort?: 'amount' | 'gas_fee';
    slippage_percent?: number;
    integrator?: {
      id?: string;
      fee_recipient?: string;
      fee_percent?: number;
    };
  }
  
  export interface GasPricesParams {
    filter?: {
      chain_ids?: string[];
      gas_types?: ('classic' | 'eip1559' | 'optimistic')[];
    };
  }

  export type GasPricesType = 'classic' | 'eip1559' | 'optimistic' ;
   