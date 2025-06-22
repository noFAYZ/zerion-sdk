# Zerion SDK - Complete Functions Reference

## 📋 Table of Contents

- [Main SDK Class](#main-sdk-class)
- [Wallet Service](#wallet-service)
- [Fungibles Service](#fungibles-service)
- [Chains Service](#chains-service)
- [Swap Service](#swap-service)
- [NFT Service](#nft-service)
- [Gas Service](#gas-service)
- [Utility Functions](#utility-functions)

---

## 🏗️ Main SDK Class

### Constructor
```typescript
new ZerionSDK(config: ZerionConfig)
```

**Parameters:**
- `config.apiKey` (string) - Your Zerion API key
- `config.baseURL?` (string) - API base URL (default: 'https://api.zerion.io')
- `config.timeout?` (number) - Request timeout in ms (default: 30000)
- `config.retries?` (number) - Number of retries (default: 3)
- `config.retryDelay?` (number) - Delay between retries in ms (default: 1000)

### Configuration Methods

#### `setEnvironment(env: Environment): void`
Switch between production and testnet environments.

**Parameters:**
- `env` - 'production' | 'testnet'

#### `setTimeout(timeout: number): void`
Set request timeout.

**Parameters:**
- `timeout` - Timeout in milliseconds

#### `setRetries(retries: number, delay?: number): void`
Configure retry behavior.

**Parameters:**
- `retries` - Number of retry attempts
- `delay?` - Delay between retries in milliseconds

### High-Level Analysis Methods

#### `getPortfolioAnalysis(address: string): Promise<PortfolioAnalysis>`
Get comprehensive portfolio analysis for a wallet.

**Returns:**
```typescript
{
  summary: any;
  positions: any[];
  nftPortfolio: any;
  pnl: any;
  recentActivity: any[];
  chainDistribution: Record<string, number>;
  topAssets: any[];
}
```

#### `getMarketOverview(): Promise<MarketOverview>`
Get market overview with trending assets.

**Returns:**
```typescript
{
  topAssets: any[];
  trending: any[];
  chains: any[];
  totalChains: number;
}
```

#### `findBestSwapRoute(fromToken, toToken, amount, options?): Promise<SwapRoute | null>`
Find the best swap route between tokens.

**Parameters:**
- `fromToken` - `{ chainId: string; address?: string }`
- `toToken` - `{ chainId: string; address?: string }`
- `amount` - Amount to swap (as string)
- `options?` - `{ slippage?: number; gasPrice?: string }`

#### `batchGetWalletSummaries(addresses: string[]): Promise<Record<string, any>>`
Get summaries for multiple wallets in parallel.

#### `getCrossChainAssetAnalysis(tokenSymbol: string): Promise<CrossChainAnalysis>`
Analyze a token across multiple chains.

**Returns:**
```typescript
{
  implementations: any[];
  priceVariance: number;
  liquidityAnalysis: any[];
  bridgeOptions: any[];
}
```

#### `getMultiWalletAggregation(addresses: string[]): Promise<MultiWalletData>`
Aggregate data across multiple wallets.

**Returns:**
```typescript
{
  totalValue: number;
  totalPnL: number;
  combinedPositions: any[];
  topChains: Array<{ chainId: string; value: number; percentage: number }>;
  topAssets: Array<{ symbol: string; value: number; percentage: number }>;
}
```

#### `monitorWalletActivity(address: string, intervalMs?: number): AsyncGenerator<ActivityUpdate>`
Monitor wallet activity in real-time.

**Returns:** AsyncGenerator yielding:
```typescript
{
  timestamp: number;
  newTransactions: any[];
  portfolioChange: any;
  alerts: string[];
}
```

#### `analyzeTransactionPatterns(address: string, timeRange: TimeRange): Promise<TransactionPatterns>`
Analyze transaction patterns over a time period.

**Parameters:**
- `timeRange` - `{ start: number; end: number }` (Unix timestamps)

**Returns:**
```typescript
{
  totalTransactions: number;
  averageDaily: number;
  mostActiveDay: string;
  commonOperations: Array<{ type: string; count: number }>;
  gasSpent: number;
  preferredChains: Array<{ chain: string; count: number }>;
}
```

#### `getHealthStatus(): Promise<HealthStatus>`
Get SDK health status.

**Returns:**
```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, boolean>;
  responseTime: number;
}
```

---

## 🏦 Wallet Service

### Portfolio Methods

#### `getPortfolio(address: string, options?): Promise<ApiResponse<any>>`
Get wallet portfolio overview.

**Parameters:**
- `address` - Wallet address
- `options?` - `{ positions?: 'only_simple' | 'only_complex' | 'no_filter' }`

#### `getWalletSummary(address: string): Promise<WalletSummary>`
Get comprehensive wallet summary.

**Returns:**
```typescript
{
  portfolio: ApiResponse<any>;
  pnl: ApiResponse<WalletPnLData>;
  nftPortfolio: ApiResponse<any>;
  topPositions: Position[];
  recentTransactions: Transaction[];
}
```

### Position Methods

#### `getPositions(address: string, params?): Promise<ApiResponse<Position[]>>`
Get wallet positions with filtering and pagination.

**Parameters:**
- `params?` - `WalletPositionsParams`:
  ```typescript
  {
    filter?: {
      positions?: 'only_simple' | 'only_complex' | 'no_filter';
      position_types?: ('wallet' | 'deposited' | 'borrowed' | 'locked' | 'staked' | 'claimable' | 'liquidity')[];
      chain_ids?: string[];
      fungible_ids?: string[];
      dapp_ids?: string[];
      trash?: 'only_trash' | 'only_non_trash' | 'no_filter';
    };
    sort?: 'value,desc' | 'value,asc' | 'relative_changes.24h,desc' | 'relative_changes.24h,asc';
    page?: {
      after?: string;
      before?: string;
      size?: number;
    };
  }
  ```

#### `getAllPositions(address: string, params?): Promise<Position[]>`
Get all positions with automatic pagination.

### Transaction Methods

#### `getTransactions(address: string, params?): Promise<ApiResponse<Transaction[]>>`
Get wallet transactions with filtering.

**Parameters:**
- `params?` - `WalletTransactionsParams`:
  ```typescript
  {
    filter?: {
      search_query?: string;
      operation_types?: ('trade' | 'send' | 'receive' | 'deposit' | 'withdraw' | 'borrow' | 'repay' | 'stake' | 'unstake' | 'claim')[];
      asset_types?: ('fungible' | 'nft')[];
      chain_ids?: string[];
      fungible_ids?: string[];
      min_mined_at?: number;
      max_mined_at?: number;
      trash?: 'only_trash' | 'only_non_trash' | 'no_filter';
      fungible_implementations?: string[];
    };
    page?: PaginationParams;
  }
  ```

#### `getAllTransactions(address: string, params?): Promise<Transaction[]>`
Get all transactions with automatic pagination.

### P&L and Performance Methods

#### `getPnL(address: string, params?): Promise<ApiResponse<WalletPnLData>>`
Get Profit & Loss data for wallet.

**Parameters:**
- `params?` - `{ filter?: { chain_ids?: string[]; fungible_ids?: string[]; } }`

#### `getChart(address: string, period: ChartPeriod, params?): Promise<ApiResponse<WalletChartData>>`
Get wallet balance chart.

**Parameters:**
- `period` - 'hour' | 'day' | 'week' | 'month' | 'year' | 'max'
- `params?` - `{ filter?: { chain_ids?: string[]; fungible_ids?: string[]; } }`

### NFT Methods

#### `getNFTPositions(address: string, params?): Promise<ApiResponse<NFTPosition[]>>`
Get wallet's NFT positions.

**Parameters:**
- `params?` - `WalletNFTPositionsParams`:
  ```typescript
  {
    filter?: {
      chain_ids?: string[];
      collections_ids?: string[];
    };
    sort?: 'last_acquired_at,desc' | 'last_acquired_at,asc' | 'last_price,desc' | 'last_price,asc';
    include?: string[];
    page?: PaginationParams;
  }
  ```

#### `getAllNFTPositions(address: string, params?): Promise<NFTPosition[]>`
Get all NFT positions with automatic pagination.

#### `getNFTCollections(address: string, params?): Promise<ApiResponse<NFTCollection[]>>`
Get NFT collections held by wallet.

#### `getNFTPortfolio(address: string): Promise<ApiResponse<any>>`
Get wallet's NFT portfolio overview.

---

## 🪙 Fungibles Service

### Search and Discovery

#### `getFungibles(params?): Promise<ApiResponse<Fungible[]>>`
Get fungibles with advanced filtering.

**Parameters:**
- `params?` - `FungiblesParams`:
  ```typescript
  {
    filter?: {
      search_query?: string;
      implementation_chain_id?: string;
      implementation_address?: string;
      fungible_ids?: string[];
    };
    sort?: 'market_data.market_cap,desc' | 'market_data.market_cap,asc' | 'market_data.percent_change_24h,desc' | 'market_data.percent_change_24h,asc';
    page?: PaginationParams;
  }
  ```

#### `getAllFungibles(params?): Promise<Fungible[]>`
Get all fungibles with automatic pagination.

#### `searchFungibles(query: string, options?): Promise<Fungible[]>`
Search tokens by name/symbol.

**Parameters:**
- `query` - Search term
- `options?` - `{ limit?: number; chainId?: string; }`

### Token Details

#### `getFungible(fungibleId: string): Promise<ApiResponse<Fungible>>`
Get specific token details by ID.

#### `getFungiblesByIds(fungibleIds: string[]): Promise<Fungible[]>`
Get multiple tokens by their IDs.

#### `getFungibleByAddress(chainId: string, contractAddress: string): Promise<Fungible | null>`
Get token by contract address on specific chain.

### Market Data

#### `getTopFungibles(limit?: number): Promise<Fungible[]>`
Get top tokens by market capitalization.

**Parameters:**
- `limit?` - Number of results (default: 100)

#### `getTrendingFungibles(period?: string, limit?: number): Promise<Fungible[]>`
Get trending tokens by price change.

**Parameters:**
- `period?` - '1h' | '24h' | '7d' | '30d' (default: '24h')
- `limit?` - Number of results (default: 50)

#### `getFungiblesByChain(chainId: string, options?): Promise<Fungible[]>`
Get tokens for specific blockchain.

**Parameters:**
- `options?` - `{ limit?: number; sort?: 'market_data.market_cap,desc' | 'market_data.market_cap,asc'; }`

### Price Charts

#### `getFungibleChart(fungibleId: string, period: ChartPeriod): Promise<ApiResponse<WalletChartData>>`
Get price chart for token.

**Parameters:**
- `period` - 'hour' | 'day' | 'week' | 'month' | 'year' | 'max'

#### `getFungiblePriceHistory(fungibleId: string, periods?): Promise<Record<ChartPeriod, WalletChartData | null>>`
Get price history for multiple periods.

**Parameters:**
- `periods?` - Array of chart periods (default: ['day', 'week', 'month'])

### Comparison and Analysis

#### `compareFungibles(fungibleIds: string[]): Promise<ComparisonResult>`
Compare multiple tokens.

**Returns:**
```typescript
{
  fungibles: Fungible[];
  comparison: {
    marketCaps: Record<string, number>;
    percentChanges24h: Record<string, number>;
    prices: Record<string, number>;
  };
}
```

---

## ⛓️ Chains Service

### Chain Discovery

#### `getChains(useCache?: boolean): Promise<ApiResponse<Chain[]>>`
Get all supported chains.

#### `getAllChains(useCache?: boolean): Promise<Chain[]>`
Get all chains as simple array.

#### `getChain(chainId: string): Promise<ApiResponse<Chain>>`
Get specific chain by ID.

#### `getChainByExternalId(externalId: string): Promise<Chain | null>`
Get chain by external ID (e.g., Ethereum chain ID).

### Chain Categories

#### `getPopularChains(): Promise<Chain[]>`
Get popular/major blockchain networks.

#### `getL2Chains(): Promise<Chain[]>`
Get Layer 2 scaling solutions.

#### `getMainnetChains(): Promise<Chain[]>`
Get mainnet chains (excluding testnets).

#### `getTradingChains(): Promise<Chain[]>`
Get chains that support trading.

#### `getEVMChains(): Promise<Chain[]>`
Get EVM-compatible chains.

### Search and Validation

#### `findChainsByName(name: string): Promise<Chain[]>`
Search chains by name (case-insensitive).

#### `isValidChainId(chainId: string): Promise<boolean>`
Validate if chain ID exists.

#### `getChainDisplayInfo(chainId: string): Promise<ChainDisplayInfo | null>`
Get chain display information.

**Returns:**
```typescript
{
  name: string;
  icon?: string;
  externalId: string;
  supportsTrading: boolean;
}
```

### Statistics and Management

#### `getChainStats(): Promise<ChainStats>`
Get comprehensive chain statistics.

**Returns:**
```typescript
{
  total: number;
  mainnet: number;
  testnet: number;
  trading: number;
  l2: number;
}
```

#### `refreshCache(): Promise<void>`
Refresh the chains cache.

---

## 🔄 Swap Service

### Token Discovery

#### `getSwapFungibles(params?): Promise<ApiResponse<Fungible[]>>`
Get tokens available for swapping.

**Parameters:**
- `params?` - `SwapFungiblesParams`:
  ```typescript
  {
    input?: { chain_id: string; address?: string; };
    output?: { chain_id: string; address?: string; };
    direction?: 'input' | 'output' | 'both';
  }
  ```

#### `getInputFungibles(outputChainId: string): Promise<Fungible[]>`
Get input tokens for specific output chain.

#### `getOutputFungibles(inputChainId: string): Promise<Fungible[]>`
Get output tokens for specific input chain.

#### `getBridgeFungibles(inputChainId: string, outputChainId: string): Promise<Fungible[]>`
Get tokens available for cross-chain bridging.

### Swap Quotes

#### `getSwapOffers(params: SwapOffersParams): Promise<ApiResponse<SwapOffer[]>>`
Get available swap offers.

**Parameters:**
- `params` - `SwapOffersParams`:
  ```typescript
  {
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
  ```

#### `getBestSwapOffer(params: SwapOffersParams): Promise<SwapOffer | null>`
Get the best swap offer (highest output amount).

#### `getGasOptimizedOffers(params: SwapOffersParams): Promise<SwapOffer[]>`
Get offers optimized for gas efficiency.

### Advanced Swap Features

#### `compareSwapRates(params: SwapOffersParams): Promise<RateComparison>`
Compare swap rates across providers.

**Returns:**
```typescript
{
  offers: SwapOffer[];
  bestRate: SwapOffer | null;
  worstRate: SwapOffer | null;
  averageRate: number;
  rateSpread: number;
}
```

#### `estimateSwapWithSlippage(params: Omit<SwapOffersParams, 'slippage_percent'>): Promise<Record<string, SwapOffer | null>>`
Test different slippage tolerances.

#### `getCrossChainSwapOptions(fromChainId: string, toChainId: string, tokenSymbol?: string): Promise<CrossChainOptions>`
Get cross-chain swap options.

**Returns:**
```typescript
{
  availableTokens: Fungible[];
  sampleOffers: SwapOffer[];
}
```

#### `calculateSwapImpact(params: SwapOffersParams): Promise<SwapImpact>`
Calculate swap impact and fees.

**Returns:**
```typescript
{
  offer: SwapOffer | null;
  priceImpact: number;
  gasFee: string;
  protocolFee: number;
  totalCost: number;
}
```

### Utility Methods

#### `getQuoteExactIn(inputToken, outputToken, inputAmount, options?): Promise<SwapOffer | null>`
Get quote for exact input amount.

#### `canSwap(inputToken, outputToken): Promise<boolean>`
Check if tokens can be swapped.

#### `getSwapRoute(params: SwapOffersParams): Promise<SwapRoute | null>`
Get swap route information.

**Returns:**
```typescript
{
  route: string[];
  hops: number;
  protocols: string[];
  estimatedGas: string;
}
```

#### `validateSwapParams(params: SwapOffersParams): ValidationResult`
Validate swap parameters.

**Returns:**
```typescript
{
  isValid: boolean;
  errors: string[];
}
```

#### `getSupportedLiquiditySources(): Promise<string[]>`
Get list of supported liquidity sources.

---

## 🖼️ NFT Service

### NFT Retrieval

#### `getNFT(nftId: string, options?): Promise<ApiResponse<NFT>>`
Get NFT by ID.

**Parameters:**
- `options?` - `{ include?: string[] }`

#### `getNFTs(params: NFTsParams): Promise<ApiResponse<NFT[]>>`
Get NFTs by references.

**Parameters:**
- `params` - `{ filter: { references: string[] }; include?: string[]; }`

#### `getNFTByReference(chainId: string, contractAddress: string, tokenId: string, options?): Promise<NFT | null>`
Get NFT by chain, contract, and token ID.

#### `getNFTsByReferences(references: string[], options?): Promise<NFT[]>`
Get multiple NFTs by references.

### Batch Operations

#### `batchGetNFTs(references: string[], options?): Promise<NFT[]>`
Batch get NFTs with chunking support.

**Parameters:**
- `options?` - `{ include?: string[]; chunkSize?: number; }`

#### `getNFTsFromCollection(chainId: string, contractAddress: string, tokenIds: string[], options?): Promise<NFT[]>`
Get NFTs from specific collection.

#### `getNFTsSafely(references: string[]): Promise<SafeNFTResult>`
Get NFTs with error handling.

**Returns:**
```typescript
{
  success: NFT[];
  failed: Array<{ reference: string; error: string }>;
}
```

### NFT Analysis

#### `getNFTWithMetadata(nftId: string): Promise<NFTWithMetadata | null>`
Get NFT with enhanced metadata.

**Returns:**
```typescript
{
  nft: NFT;
  metadata: {
    hasImage: boolean;
    hasVideo: boolean;
    hasAudio: boolean;
    contentUrls: string[];
    estimatedValue?: number;
  };
}
```

#### `getCollectionSummary(chainId: string, contractAddress: string, sampleTokenIds: string[]): Promise<CollectionSummary>`
Get collection summary from sample NFTs.

**Returns:**
```typescript
{
  collectionInfo?: {
    name: string;
    description?: string;
    icon?: string;
  };
  sampleNFTs: NFT[];
  totalSampled: number;
}
```

#### `nftExists(chainId: string, contractAddress: string, tokenId: string): Promise<boolean>`
Check if NFT exists.

### Utility Methods

#### `createReference(chainId: string, contractAddress: string, tokenId: string): string`
Create NFT reference string.

#### `parseReference(reference: string): ParsedReference`
Parse NFT reference string.

**Returns:**
```typescript
{
  chainId: string;
  contractAddress: string;
  tokenId: string;
}
```

#### `validateNFTReference(reference: string): ValidationResult`
Validate NFT reference format.

**Returns:**
```typescript
{
  isValid: boolean;
  parsed?: ParsedReference;
  error?: string;
}
```

---

## ⛽ Gas Service

### Gas Price Retrieval

#### `getGasPrices(params?): Promise<ApiResponse<GasPrice[]>>`
Get gas prices for all or specific chains.

**Parameters:**
- `params?` - `GasPricesParams`:
  ```typescript
  {
    filter?: {
      chain_ids?: string[];
      gas_types?: ('classic' | 'fast' | 'instant')[];
    }
  }
  ```

#### `getChainGasPrices(chainId: string, useCache?: boolean): Promise<GasPrice[]>`
Get gas prices for specific chain.

#### `getChainGasPrice(chainId: string, gasType?: 'classic' | 'fast' | 'instant'): Promise<GasPrice | null>`
Get specific gas type for chain.

#### `getChainGasPricesByType(chainId: string): Promise<GasPricesByType>`
Get all gas types as object.

**Returns:**
```typescript
{
  classic?: GasPrice;
  fast?: GasPrice;
  instant?: GasPrice;
}
```

### Multi-Chain Analysis

#### `getMultiChainGasPrices(chainIds: string[]): Promise<Record<string, GasPrice[]>>`
Get gas prices for multiple chains.

#### `compareGasPricesAcrossChains(chainIds: string[], gasType?: 'classic' | 'fast' | 'instant'): Promise<GasComparison>`
Compare gas prices across chains.

**Returns:**
```typescript
{
  prices: Array<{
    chainId: string;
    gasPrice: GasPrice | null;
    priceInWei: string;
    estimatedTimeMinutes: number;
  }>;
  cheapest: { chainId: string; price: string } | null;
  fastest: { chainId: string; time: number } | null;
}
```

### Recommendations and Optimization

#### `getGasRecommendations(chainId: string): Promise<GasRecommendations | null>`
Get gas price recommendations.

**Returns:**
```typescript
{
  recommended: 'classic' | 'fast' | 'instant';
  options: {
    classic: { price: string; timeMinutes: number; description: string };
    fast: { price: string; timeMinutes: number; description: string };
    instant: { price: string; timeMinutes: number; description: string };
  };
}
```

#### `getOptimalGasPrice(chainId: string, urgency?: 'low' | 'medium' | 'high'): Promise<GasPrice | null>`
Get optimal gas price for transaction timing.

#### `getGasPriceTrends(chainId: string): Promise<GasTrends>`
Get gas price trends.

**Returns:**
```typescript
{
  current: GasPrice | null;
  trend: 'rising' | 'falling' | 'stable';
  recommendation: string;
}
```

### Transaction Cost Estimation

#### `estimateTransactionCost(chainId: string, gasLimit: string, gasType?: 'classic' | 'fast' | 'instant'): Promise<TransactionCost | null>`
Estimate transaction cost.

**Returns:**
```typescript
{
  gasPrice: string;
  gasLimit: string;
  totalCostWei: string;
  estimatedTimeMinutes: number;
}
```

#### `calculateGasFeeInNativeToken(chainId: string, gasLimit: string, gasType?: 'classic' | 'fast' | 'instant'): Promise<GasFeeUnits | null>`
Calculate gas fee in different units.

**Returns:**
```typescript
{
  feeWei: string;
  feeEther: string;
  feeGwei: string;
}
```

### Monitoring and Alerts

#### `monitorGasPrices(chainId: string, intervalMs?: number): AsyncGenerator<GasPrice[]>`
Monitor gas prices in real-time.

#### `getGasPriceAlerts(chainId: string, thresholds: GasThresholds): Promise<GasAlerts>`
Get gas price alerts based on thresholds.

**Parameters:**
- `thresholds` - `{ low?: string; high?: string; }` (in Wei)

**Returns:**
```typescript
{
  currentPrice: string;
  alerts: Array<{
    type: 'low' | 'high';
    threshold: string;
    triggered: boolean;
    message: string;
  }>;
}
```

### Cache Management

#### `clearCache(): void`
Clear gas price cache.

#### `getCacheStats(): CacheStats`
Get cache statistics.

**Returns:**
```typescript
{
  size: number;
  keys: string[];
  oldestEntry?: number;
  newestEntry?: number;
}
```

---

## 🛠️ Utility Functions

### Address Validation

#### `isValidAddress(address: string): boolean`
Validate Ethereum address format.

#### `normalizeAddress(address: string): string`
Normalize address to lowercase (throws if invalid).

### API Key Validation

#### `isValidApiKey(apiKey: string): boolean`
Validate API key format (zk_prod_... or zk_dev_...).

### Query Building

#### `buildQueryParams(params: Record<string, any>): string`
Build URL query parameters from object.

#### `buildPaginationParams(pagination?: PaginationParams): Record<string, any>`
Build pagination parameters.

### NFT Utilities

#### `createNFTReference(chainId: string, contractAddress: string, tokenId: string): string`
Create NFT reference string.

#### `parseNFTReference(reference: string): ParsedNFTReference`
Parse NFT reference string.

**Returns:**
```typescript
{
  chainId: string;
  contractAddress: string;
  tokenId: string;
}
```

### Number and Date Formatting

#### `formatNumber(value: number, precision?: number): string`
Format number with appropriate units (K, M, B).

#### `formatTimestamp(timestamp: number): string`
Format Unix timestamp to ISO string.

#### `parseTimestamp(input: string | number | Date): number`
Parse various timestamp formats to Unix timestamp.

### Array Utilities

#### `chunk<T>(array: T[], size: number): T[][]`
Split array into chunks of specified size.

#### `debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void`
Debounce function calls.

### Math Utilities

#### `calculatePercentageChange(oldValue: number, newValue: number): number`
Calculate percentage change between two values.

### Validation

#### `validateRequired(params: Record<string, any>, required: string[]): void`
Validate required parameters (throws if missing).

### Async Utilities

#### `delay(ms: number): Promise<void>`
Delay execution for specified milliseconds.

#### `retry<T>(fn: () => Promise<T>, maxAttempts?: number, baseDelay?: number): Promise<T>`
Retry function with exponential backoff.

### Parsing

#### `safeJsonParse<T>(json: string, fallback: T): T`
Safely parse JSON with fallback value.

---

## 🎯 TypeScript Types

All functions are fully typed with comprehensive TypeScript interfaces. Import types as needed:

```typescript
import { 
  ZerionConfig,
  ApiResponse,
  Position,
  Transaction,
  Fungible,
  Chain,
  NFT,
  SwapOffer,
  GasPrice,
  Environment,
  ChartPeriod,
  PositionFilter,
  TrashFilter,
  ZerionAPIError
} from '@zerion/sdk';
```

---

*This reference covers all available functions in the Zerion SDK. Each function includes proper error handling and TypeScript support.*