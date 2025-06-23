# Zerion TypeScript SDK

[![npm version](https://badge.fury.io/js/@zerion%2Fsdk.svg)](https://badge.fury.io/js/@zerion%2Fsdk)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, production-ready TypeScript SDK for the Zerion API. Build powerful DeFi applications with easy access to portfolio data, token information, swap functionality, NFT data, gas monitoring, and cross-chain analytics.

## 🌟 Features

- **Complete API Coverage**: Full support for all Zerion API endpoints
- **TypeScript First**: Built with TypeScript for excellent developer experience and type safety
- **Production Ready**: Robust error handling, automatic retries, intelligent caching
- **Modern Architecture**: Clean, modular design with service-based architecture
- **Advanced Features**: Batch operations, real-time monitoring, cross-chain analysis
- **Zero Dependencies**: Only requires axios for HTTP requests
- **Comprehensive Documentation**: Detailed docs, examples, and API reference

## 📦 Installation

```bash
npm install zerion-sdk-ts
```

```bash
yarn add zerion-sdk-ts
```

```bash
pnpm add zerion-sdk-ts
```

## 🚀 Quick Start

```typescript
import { ZerionSDK } from 'zerion-sdk-ts';

// Initialize the SDK
const zerion = new ZerionSDK({
  apiKey: 'zk_prod_your_api_key_here', // Get your API key from Zerion
  timeout: 30000,
  retries: 3
});

// Get wallet portfolio
async function getPortfolio() {
  try {
    const address = '0x742d35Cc6634C0532925a3b8D3Ac2FF2c6CEF9C9';
    const portfolio = await zerion.wallets.getPortfolio(address);
    console.log('Portfolio:', portfolio.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getPortfolio();
```

## 🏗️ Architecture

The SDK is organized into focused services for better maintainability and ease of use:

```
ZerionSDK
├── wallets      - Portfolio, transactions, positions, P&L, charts
├── fungibles    - Token data, charts, search, market data
├── chains       - Blockchain information and metadata
├── swap         - DEX aggregation and cross-chain bridges
├── nfts         - NFT data, metadata, and collections
└── gas          - Gas price monitoring and estimation
```

## ⚙️ Configuration

### Basic Configuration

```typescript
interface ZerionConfig {
  apiKey: string;           // Your Zerion API key (required)
  baseURL?: string;         // API base URL (default: 'https://api.zerion.io')
  timeout?: number;         // Request timeout in ms (default: 30000)
  retries?: number;         // Number of retries (default: 3)
  retryDelay?: number;      // Delay between retries in ms (default: 1000)
}

const zerion = new ZerionSDK({
  apiKey: 'zk_prod_your_api_key',
  timeout: 45000,
  retries: 5,
  retryDelay: 2000
});
```

### Environment Configuration

```typescript
// Switch between production and testnet
zerion.setEnvironment('testnet');   // Use testnet
zerion.setEnvironment('production'); // Use production (default)

// Adjust configuration at runtime
zerion.setTimeout(60000);           // Set timeout to 60 seconds
zerion.setRetries(3, 1500);        // 3 retries with 1.5s delay
```

## 📖 API Reference

### 🏦 Wallet Service

The wallet service provides comprehensive portfolio and transaction analysis.

#### Portfolio Operations

```typescript
// Get basic portfolio
const portfolio = await zerion.wallets.getPortfolio(address, {
  positions?: 'only_simple' | 'only_complex' | 'no_filter'
});

// Get comprehensive portfolio analysis
const analysis = await zerion.getPortfolioAnalysis(address);
// Returns: { summary, positions, nftPortfolio, pnl, recentActivity, chainDistribution, topAssets }

// Get wallet summary (one-call overview)
const summary = await zerion.wallets.getWalletSummary(address);
// Returns: { portfolio, pnl, nftPortfolio, topPositions, recentTransactions }
```

#### Position Management

```typescript
// Get positions with filtering
const positions = await zerion.wallets.getPositions(address, {
  filter: {
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
    size?: number; // Max 100
  };
});

// Get all positions with auto-pagination
const allPositions = await zerion.wallets.getAllPositions(address, {
  filter?: { /* same as above */ }
});
```

#### Transaction History

```typescript
// Get transactions with filtering
const transactions = await zerion.wallets.getTransactions(address, {
  filter?: {
    search_query?: string;
    operation_types?: ('trade' | 'send' | 'receive' | 'deposit' | 'withdraw' | 'borrow' | 'repay' | 'stake' | 'unstake' | 'claim')[];
    asset_types?: ('fungible' | 'nft')[];
    chain_ids?: string[];
    fungible_ids?: string[];
    min_mined_at?: number; // Unix timestamp
    max_mined_at?: number; // Unix timestamp
    trash?: 'only_trash' | 'only_non_trash' | 'no_filter';
    fungible_implementations?: string[]; // Format: 'chain:address'
  };
  page?: { /* pagination options */ };
});

// Get all transactions with auto-pagination
const allTransactions = await zerion.wallets.getAllTransactions(address);

// Analyze transaction patterns
const patterns = await zerion.analyzeTransactionPatterns(address, {
  start: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
  end: Date.now()
});
// Returns: { totalTransactions, averageDaily, commonOperations, gasSpent, preferredChains }
```

#### P&L and Performance

```typescript
// Get Profit & Loss data
const pnl = await zerion.wallets.getPnL(address, {
  filter?: {
    chain_ids?: string[];
    fungible_ids?: string[];
  }
});
// Returns unrealized_gain, realized_gain, net_invested, total_fee, etc.

// Get balance chart
const chart = await zerion.wallets.getChart(
  address, 
  'hour' | 'day' | 'week' | 'month' | 'year' | 'max',
  {
    filter?: {
      chain_ids?: string[];
      fungible_ids?: string[];
    }
  }
);
```

#### NFT Operations

```typescript
// Get NFT positions
const nftPositions = await zerion.wallets.getNFTPositions(address, {
  filter?: {
    chain_ids?: string[];
    collections_ids?: string[];
  };
  sort?: 'last_acquired_at,desc' | 'last_acquired_at,asc' | 'last_price,desc' | 'last_price,asc';
  include?: string[];
  page?: { /* pagination */ };
});

// Get all NFT positions with auto-pagination
const allNFTPositions = await zerion.wallets.getAllNFTPositions(address);

// Get NFT collections
const collections = await zerion.wallets.getNFTCollections(address, {
  filter?: {
    chain_ids?: string[];
  };
  include?: string[];
  page?: { /* pagination */ };
});

// Get NFT portfolio overview
const nftPortfolio = await zerion.wallets.getNFTPortfolio(address);
```

### 🪙 Fungibles Service

The fungibles service handles token data, market information, and price charts.

#### Token Search and Discovery

```typescript
// Search tokens by name/symbol
const tokens = await zerion.fungibles.searchFungibles('USDC', {
  limit?: number;
  chainId?: string;
});

// Get fungibles with advanced filtering
const fungibles = await zerion.fungibles.getFungibles({
  filter?: {
    search_query?: string;
    implementation_chain_id?: string;
    implementation_address?: string;
    fungible_ids?: string[];
  };
  sort?: 'market_data.market_cap,desc' | 'market_data.market_cap,asc' | 'market_data.percent_change_24h,desc' | 'market_data.percent_change_24h,asc';
  page?: { /* pagination */ };
});

// Get all fungibles with auto-pagination
const allFungibles = await zerion.fungibles.getAllFungibles();
```

#### Token Details and Market Data

```typescript
// Get specific token details
const token = await zerion.fungibles.getFungible(fungibleId);

// Get multiple tokens by IDs
const tokens = await zerion.fungibles.getFungiblesByIds(['id1', 'id2', 'id3']);

// Get token by contract address
const token = await zerion.fungibles.getFungibleByAddress(chainId, contractAddress);
```

#### Market Analysis

```typescript
// Get top tokens by market cap
const topTokens = await zerion.fungibles.getTopFungibles(limit?: number);

// Get trending tokens
const trending = await zerion.fungibles.getTrendingFungibles(
  period?: '1h' | '24h' | '7d' | '30d',
  limit?: number
);

// Get tokens by specific chain
const chainTokens = await zerion.fungibles.getFungiblesByChain(
  chainId: string,
  options?: {
    limit?: number;
    sort?: 'market_data.market_cap,desc' | 'market_data.market_cap,asc';
  }
);
```

#### Price Charts and History

```typescript
// Get price chart for token
const chart = await zerion.fungibles.getFungibleChart(
  fungibleId: string,
  period: 'hour' | 'day' | 'week' | 'month' | 'year' | 'max'
);

// Get price history for multiple periods
const priceHistory = await zerion.fungibles.getFungiblePriceHistory(
  fungibleId: string,
  periods?: ('day' | 'week' | 'month')[]
);
// Returns: Record<ChartPeriod, WalletChartData | null>
```

#### Token Comparison and Analysis

```typescript
// Compare multiple tokens
const comparison = await zerion.fungibles.compareFungibles(['id1', 'id2', 'id3']);
// Returns: { fungibles, comparison: { marketCaps, percentChanges24h, prices } }

// Cross-chain asset analysis
const analysis = await zerion.getCrossChainAssetAnalysis('USDC');
// Returns: { implementations, priceVariance, liquidityAnalysis, bridgeOptions }
```

### ⛓️ Chains Service

The chains service provides blockchain network information and metadata.

#### Chain Discovery

```typescript
// Get all supported chains
const chains = await zerion.chains.getAllChains(useCache?: boolean);

// Get specific chain by ID
const chain = await zerion.chains.getChain(chainId: string);

// Get chain by external ID (e.g., Ethereum chain ID)
const chain = await zerion.chains.getChainByExternalId(externalId: string);
```

#### Chain Categories

```typescript
// Get popular/major chains
const popularChains = await zerion.chains.getPopularChains();

// Get Layer 2 chains
const l2Chains = await zerion.chains.getL2Chains();

// Get mainnet chains (exclude testnets)
const mainnetChains = await zerion.chains.getMainnetChains();

// Get trading-enabled chains
const tradingChains = await zerion.chains.getTradingChains();

// Get EVM compatible chains
const evmChains = await zerion.chains.getEVMChains();
```

#### Chain Search and Validation

```typescript
// Search chains by name
const ethereumChains = await zerion.chains.findChainsByName('ethereum');

// Validate chain ID
const isValid = await zerion.chains.isValidChainId(chainId);

// Get chain display information
const displayInfo = await zerion.chains.getChainDisplayInfo(chainId);
// Returns: { name, icon?, externalId, supportsTrading }
```

#### Chain Statistics

```typescript
// Get comprehensive chain statistics
const stats = await zerion.chains.getChainStats();
// Returns: { total, mainnet, testnet, trading, l2 }

// Refresh chain cache
await zerion.chains.refreshCache();
```

### 🔄 Swap Service

The swap service handles DEX aggregation, cross-chain bridges, and swap routing.

#### Swap Discovery

```typescript
// Get available tokens for swapping
const swapTokens = await zerion.swap.getSwapFungibles({
  input?: { chain_id: string; address?: string };
  output?: { chain_id: string; address?: string };
  direction?: 'input' | 'output' | 'both';
});

// Get input tokens for specific output chain
const inputTokens = await zerion.swap.getInputFungibles(outputChainId);

// Get output tokens for specific input chain
const outputTokens = await zerion.swap.getOutputFungibles(inputChainId);

// Get bridge tokens (cross-chain)
const bridgeTokens = await zerion.swap.getBridgeFungibles(inputChainId, outputChainId);
```

#### Swap Quotes and Routing

```typescript
// Get swap offers
const offers = await zerion.swap.getSwapOffers({
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
});

// Get best swap offer
const bestOffer = await zerion.swap.getBestSwapOffer(swapParams);

// Get gas-optimized offers
const gasOptimizedOffers = await zerion.swap.getGasOptimizedOffers(swapParams);
```

#### Advanced Swap Features

```typescript
// Compare swap rates across providers
const rateComparison = await zerion.swap.compareSwapRates(swapParams);
// Returns: { offers, bestRate, worstRate, averageRate, rateSpread }

// Test different slippage tolerances
const slippageTests = await zerion.swap.estimateSwapWithSlippage(swapParams);
// Returns: Record<string, SwapOffer | null> for different slippage %

// Get cross-chain swap options
const crossChainOptions = await zerion.swap.getCrossChainSwapOptions(
  fromChainId: string,
  toChainId: string,
  tokenSymbol?: string
);
// Returns: { availableTokens, sampleOffers }

// Calculate swap impact and fees
const impact = await zerion.swap.calculateSwapImpact(swapParams);
// Returns: { offer, priceImpact, gasFee, protocolFee, totalCost }
```

#### Swap Utilities

```typescript
// Get quote for exact input amount
const quote = await zerion.swap.getQuoteExactIn(
  inputToken: { chainId: string; address?: string },
  outputToken: { chainId: string; address?: string },
  inputAmount: string,
  options?: { slippage?: number; gasPrice?: string }
);

// Check if tokens can be swapped
const canSwap = await zerion.swap.canSwap(inputToken, outputToken);

// Get swap route information
const route = await zerion.swap.getSwapRoute(swapParams);
// Returns: { route, hops, protocols, estimatedGas }

// Validate swap parameters
const validation = zerion.swap.validateSwapParams(swapParams);
// Returns: { isValid, errors }

// Find best swap route (high-level helper)
const bestRoute = await zerion.findBestSwapRoute(fromToken, toToken, amount, options);
// Returns: { bestOffer, allOffers, route, gasEstimate }
```

### 🖼️ NFT Service

The NFT service handles NFT data, metadata, and collection information.

#### NFT Retrieval

```typescript
// Get NFT by ID
const nft = await zerion.nfts.getNFT(nftId, { include?: string[] });

// Get NFTs by references
const nfts = await zerion.nfts.getNFTs({
  filter: {
    references: string[]; // Format: 'chain:contract:tokenId'
  };
  include?: string[];
});

// Get NFT by chain, contract, and token ID
const nft = await zerion.nfts.getNFTByReference(
  chainId: string,
  contractAddress: string,
  tokenId: string,
  options?: { include?: string[] }
);

// Get multiple NFTs by references
const nfts = await zerion.nfts.getNFTsByReferences(
  references: string[],
  options?: { include?: string[] }
);
```

#### Batch NFT Operations

```typescript
// Batch get NFTs with chunking
const nfts = await zerion.nfts.batchGetNFTs(
  references: string[],
  options?: { 
    include?: string[];
    chunkSize?: number; // Default: 50
  }
);

// Get NFTs from specific collection
const collectionNFTs = await zerion.nfts.getNFTsFromCollection(
  chainId: string,
  contractAddress: string,
  tokenIds: string[],
  options?: { include?: string[] }
);

// Safe NFT retrieval with error handling
const { success, failed } = await zerion.nfts.getNFTsSafely(references);
```

#### NFT Metadata and Analysis

```typescript
// Get NFT with enhanced metadata
const nftWithMetadata = await zerion.nfts.getNFTWithMetadata(nftId);
// Returns: { nft, metadata: { hasImage, hasVideo, hasAudio, contentUrls, estimatedValue } }

// Get collection summary
const collectionSummary = await zerion.nfts.getCollectionSummary(
  chainId: string,
  contractAddress: string,
  sampleTokenIds: string[]
);
// Returns: { collectionInfo, sampleNFTs, totalSampled }

// Check if NFT exists
const exists = await zerion.nfts.nftExists(chainId, contractAddress, tokenId);
```

#### NFT Utilities

```typescript
// Create NFT reference
const reference = zerion.nfts.createReference(chainId, contractAddress, tokenId);

// Parse NFT reference
const { chainId, contractAddress, tokenId } = zerion.nfts.parseReference(reference);

// Validate NFT reference format
const validation = zerion.nfts.validateNFTReference(reference);
// Returns: { isValid, parsed?, error? }
```

### ⛽ Gas Service

The gas service provides gas price monitoring, estimation, and optimization.

#### Gas Price Retrieval

```typescript
// Get gas prices for all chains
const gasPrices = await zerion.gas.getGasPrices({
  filter?: {
    chain_ids?: string[];
    gas_types?: ('classic' | 'fast' | 'instant')[];
  }
});

// Get gas prices for specific chain
const chainGasPrices = await zerion.gas.getChainGasPrices(
  chainId: string,
  useCache?: boolean
);

// Get specific gas type for chain
const gasPrice = await zerion.gas.getChainGasPrice(
  chainId: string,
  gasType?: 'classic' | 'fast' | 'instant'
);

// Get all gas types as object
const gasPricesByType = await zerion.gas.getChainGasPricesByType(chainId);
// Returns: { classic?, fast?, instant? }
```

#### Multi-Chain Gas Analysis

```typescript
// Get gas prices for multiple chains
const multiChainGas = await zerion.gas.getMultiChainGasPrices(chainIds);

// Compare gas prices across chains
const comparison = await zerion.gas.compareGasPricesAcrossChains(
  chainIds: string[],
  gasType?: 'classic' | 'fast' | 'instant'
);
// Returns: { prices, cheapest, fastest }
```

#### Gas Recommendations and Optimization

```typescript
// Get gas recommendations
const recommendations = await zerion.gas.getGasRecommendations(chainId);
// Returns: { recommended, options: { classic, fast, instant } }

// Get optimal gas price for urgency
const optimalGas = await zerion.gas.getOptimalGasPrice(
  chainId: string,
  urgency?: 'low' | 'medium' | 'high'
);

// Get gas price trends (mock implementation)
const trends = await zerion.gas.getGasPriceTrends(chainId);
// Returns: { current, trend, recommendation }
```

#### Transaction Cost Estimation

```typescript
// Estimate transaction cost
const cost = await zerion.gas.estimateTransactionCost(
  chainId: string,
  gasLimit: string,
  gasType?: 'classic' | 'fast' | 'instant'
);
// Returns: { gasPrice, gasLimit, totalCostWei, estimatedTimeMinutes }

// Calculate gas fee in different units
const feeUnits = await zerion.gas.calculateGasFeeInNativeToken(
  chainId: string,
  gasLimit: string,
  gasType?: 'classic' | 'fast' | 'instant'
);
// Returns: { feeWei, feeEther, feeGwei }
```

#### Gas Monitoring and Alerts

```typescript
// Monitor gas prices (async generator)
for await (const gasPrices of zerion.gas.monitorGasPrices(chainId, intervalMs)) {
  console.log('Current gas prices:', gasPrices);
  // Break when needed
}

// Get gas price alerts
const alerts = await zerion.gas.getGasPriceAlerts(chainId, {
  low?: string;  // Wei threshold
  high?: string; // Wei threshold
});
// Returns: { currentPrice, alerts: [{ type, threshold, triggered, message }] }

// Cache management
zerion.gas.clearCache();
const cacheStats = zerion.gas.getCacheStats();
// Returns: { size, keys, oldestEntry?, newestEntry? }
```

## 🚀 Advanced Features

### Multi-Wallet Operations

```typescript
// Batch get wallet summaries
const summaries = await zerion.batchGetWalletSummaries([
  '0x742d35Cc6634C0532925a3b8D3Ac2FF2c6CEF9C9',
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
]);

// Multi-wallet aggregation
const aggregation = await zerion.getMultiWalletAggregation(addresses);
// Returns: { totalValue, totalPnL, combinedPositions, topChains, topAssets }
```

### Real-time Monitoring

```typescript
// Monitor wallet activity
const monitor = zerion.monitorWalletActivity(address, intervalMs);

for await (const activity of monitor) {
  console.log('New transactions:', activity.newTransactions.length);
  console.log('Portfolio changes:', activity.portfolioChange);
  console.log('Alerts:', activity.alerts);
  
  // Break when needed
  if (someCondition) break;
}
```

### Market Analysis

```typescript
// Get comprehensive market overview
const market = await zerion.getMarketOverview();
// Returns: { topAssets, trending, chains, totalChains }

// Cross-chain asset analysis
const analysis = await zerion.getCrossChainAssetAnalysis('USDC');
// Returns: { implementations, priceVariance, liquidityAnalysis, bridgeOptions }

// Transaction pattern analysis
const patterns = await zerion.analyzeTransactionPatterns(address, timeRange);
// Returns: { totalTransactions, averageDaily, mostActiveDay, commonOperations, gasSpent, preferredChains }
```

### Health and Diagnostics

```typescript
// Get SDK health status
const health = await zerion.getHealthStatus();
// Returns: { status: 'healthy' | 'degraded' | 'unhealthy', services, responseTime }
```

## 🛠️ Utility Functions

The SDK includes comprehensive utility functions for common operations:

```typescript
import { 
  isValidAddress, 
  isValidApiKey, 
  normalizeAddress,
  buildQueryParams,
  createNFTReference,
  parseNFTReference,
  formatNumber,
  formatTimestamp,
  parseTimestamp,
  validateRequired,
  chunk,
  debounce,
  calculatePercentageChange,
  safeJsonParse
} from '@zerion/sdk';

// Address validation and normalization
const isValid = isValidAddress('0x742d35Cc6634C0532925a3b8D3Ac2FF2c6CEF9C9');
const normalized = normalizeAddress('0x742D35CC6634C0532925A3B8D3AC2FF2C6CEF9C9');

// API key validation
const isValidKey = isValidApiKey('zk_prod_123456789');

// Query parameter building
const query = buildQueryParams({
  filter: { chain_ids: ['ethereum', 'polygon'] },
  page: { size: 10 }
});

// NFT reference handling
const ref = createNFTReference('ethereum', contractAddress, tokenId);
const { chainId, contractAddress, tokenId } = parseNFTReference(ref);

// Number and date formatting
const formatted = formatNumber(1234567.89, 2); // "1.23M"
const timestamp = formatTimestamp(Date.now() / 1000);
const parsed = parseTimestamp('2023-01-01T00:00:00Z');

// Array utilities
const chunks = chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// Percentage calculation
const change = calculatePercentageChange(100, 120); // 20
```

## 🔧 Error Handling

The SDK provides comprehensive error handling with detailed error information:

```typescript
import { ZerionAPIError } from '@zerion/sdk';

try {
  const portfolio = await zerion.wallets.getPortfolio(address);
} catch (error) {
  if (error instanceof ZerionAPIError) {
    console.log('Error code:', error.code);
    console.log('HTTP status:', error.status);
    console.log('Error details:', error.details);
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

### Error Types

- **ZerionAPIError**: API-related errors with HTTP status codes
- **Network errors**: Connection and timeout issues
- **Validation errors**: Invalid parameters or configuration
- **Rate limiting**: When API limits are exceeded

## 📊 Examples

### Complete Portfolio Analysis

```typescript
async function analyzePortfolio(address: string) {
  const analysis = await zerion.getPortfolioAnalysis(address);
  
  console.log('Portfolio Analysis:');
  console.log(`Total Value: $${analysis.summary.total_value}`);
  console.log(`Positions: ${analysis.positions.length}`);
  console.log(`Top Assets:`, analysis.topAssets.slice(0, 5));
  console.log(`Chain Distribution:`, analysis.chainDistribution);
  console.log(`P&L: $${analysis.pnl.unrealized_gain}`);
  
  return analysis;
}
```

### Token Research

```typescript
async function researchToken(symbol: string) {
  // Search for token
  const tokens = await zerion.fungibles.searchFungibles(symbol);
  
  if (tokens.length === 0) {
    console.log(`No tokens found for ${symbol}`);
    return;
  }
  
  const token = tokens[0];
  
  // Get detailed information
  const details = await zerion.fungibles.getFungible(token.id);
  const chart = await zerion.fungibles.getFungibleChart(token.id, 'week');
  const crossChain = await zerion.getCrossChainAssetAnalysis(symbol);
  
  console.log('Token Research:', {
    name: details.data.attributes.name,
    symbol: details.data.attributes.symbol,
    price: details.data.attributes.market_data?.price,
    marketCap: details.data.attributes.market_data?.market_cap,
    change24h: details.data.attributes.market_data?.percent_change_24h,
    implementations: crossChain.implementations.length,
    priceVariance: crossChain.priceVariance
  });
}
```

### Cross-Chain Swap Analysis

```typescript
async function findBestCrossChainSwap(
  fromToken: { chainId: string; address: string },
  toToken: { chainId: string; address: string },
  amount: string
) {
  // Check if cross-chain swap is possible
  const canSwap = await zerion.swap.canSwap(fromToken, toToken);
  
  if (!canSwap) {
    console.log('Cross-chain swap not available');
    return;
  }
  
  // Get best route
  const route = await zerion.findBestSwapRoute(fromToken, toToken, amount, {
    slippage: 1
  });
  
  if (route) {
    console.log('Best Cross-Chain Swap:');
    console.log(`Input: ${route.bestOffer.attributes.send_quantity.float}`);
    console.log(`Output: ${route.bestOffer.attributes.receive_quantity.float}`);
    console.log(`Rate: ${route.bestOffer.attributes.receive_quantity.float / route.bestOffer.attributes.send_quantity.float}`);
    console.log(`Gas: ${route.gasEstimate?.totalCostWei} wei`);
    console.log(`Route:`, route.route);
  }
  
  return route;
}
```

### Gas Optimization (continued)

```typescript
async function optimizeGasUsage(chainId: string, gasLimit: string) {
  // Get current gas prices
  const gasPrices = await zerion.gas.getChainGasPricesByType(chainId);
  
  // Get recommendations
  const recommendations = await zerion.gas.getGasRecommendations(chainId);
  
  // Calculate costs for different speeds
  const costs = await Promise.all([
    zerion.gas.estimateTransactionCost(chainId, gasLimit, 'classic'),
    zerion.gas.estimateTransactionCost(chainId, gasLimit, 'fast'),
    zerion.gas.estimateTransactionCost(chainId, gasLimit, 'instant')
  ]);
  
  console.log('Gas Optimization Analysis:');
  costs.forEach((cost, i) => {
    const types = ['classic', 'fast', 'instant'];
    if (cost) {
      console.log(`${types[i]}: ${cost.totalCostWei} wei (${cost.estimatedTimeMinutes} min)`);
    }
  });
  
  console.log(`Recommended: ${recommendations?.recommended}`);
  
  return {
    gasPrices,
    recommendations,
    costs: costs.filter(Boolean)
  };
}
```

### NFT Collection Analysis

```typescript
async function analyzeNFTCollection(
  chainId: string, 
  contractAddress: string, 
  sampleTokenIds: string[]
) {
  // Get collection summary
  const summary = await zerion.nfts.getCollectionSummary(
    chainId, 
    contractAddress, 
    sampleTokenIds
  );
  
  // Get detailed NFT data
  const nfts = await zerion.nfts.getNFTsFromCollection(
    chainId, 
    contractAddress, 
    sampleTokenIds
  );
  
  // Analyze metadata
  const metadataAnalysis = await Promise.all(
    nfts.map(nft => zerion.nfts.getNFTWithMetadata(nft.id))
  );
  
  const hasImages = metadataAnalysis.filter(m => m?.metadata.hasImage).length;
  const hasVideos = metadataAnalysis.filter(m => m?.metadata.hasVideo).length;
  
  console.log('NFT Collection Analysis:', {
    name: summary.collectionInfo?.name,
    totalSampled: summary.totalSampled,
    hasImages: `${hasImages}/${nfts.length}`,
    hasVideos: `${hasVideos}/${nfts.length}`,
    avgContentUrls: metadataAnalysis.reduce((sum, m) => 
      sum + (m?.metadata.contentUrls.length || 0), 0) / nfts.length
  });
  
  return {
    summary,
    nfts,
    metadataAnalysis: metadataAnalysis.filter(Boolean)
  };
}
```

### Real-time DeFi Monitoring

```typescript
async function monitorDeFiActivity(addresses: string[], duration: number = 300000) {
  console.log(`Starting DeFi monitoring for ${duration/1000} seconds...`);
  
  const monitors = addresses.map(address => ({
    address,
    monitor: zerion.monitorWalletActivity(address, 30000) // Check every 30s
  }));
  
  const startTime = Date.now();
  const activities: Record<string, any[]> = {};
  
  // Initialize activity arrays
  addresses.forEach(addr => activities[addr] = []);
  
  try {
    await Promise.race([
      // Monitor each wallet
      ...monitors.map(async ({ address, monitor }) => {
        for await (const activity of monitor) {
          activities[address].push({
            timestamp: activity.timestamp,
            newTransactions: activity.newTransactions.length,
            alerts: activity.alerts
          });
          
          console.log(`[${new Date().toLocaleTimeString()}] ${address.slice(0, 8)}... - ${activity.newTransactions.length} new tx, ${activity.alerts.length} alerts`);
          
          if (Date.now() - startTime > duration) break;
        }
      }),
      
      // Timeout after specified duration
      new Promise(resolve => setTimeout(resolve, duration))
    ]);
  } catch (error) {
    console.error('Monitoring error:', error);
  }
  
  // Generate summary
  console.log('\nMonitoring Summary:');
  Object.entries(activities).forEach(([address, activity]) => {
    const totalTx = activity.reduce((sum, a) => sum + a.newTransactions, 0);
    const totalAlerts = activity.reduce((sum, a) => sum + a.alerts.length, 0);
    console.log(`${address.slice(0, 8)}...: ${totalTx} transactions, ${totalAlerts} alerts`);
  });
  
  return activities;
}
```

## 🔄 Pagination and Batching

### Auto-pagination

The SDK automatically handles pagination for large datasets:

```typescript
// These methods automatically paginate through all results
const allPositions = await zerion.wallets.getAllPositions(address);
const allTransactions = await zerion.wallets.getAllTransactions(address);
const allNFTPositions = await zerion.wallets.getAllNFTPositions(address);
const allFungibles = await zerion.fungibles.getAllFungibles();

// Manual pagination with control
let cursor: string | undefined;
const allResults: any[] = [];

do {
  const response = await zerion.wallets.getPositions(address, {
    page: { after: cursor, size: 100 }
  });
  
  allResults.push(...response.data);
  cursor = response.links.next ? 
    new URL(response.links.next).searchParams.get('page[after]') || undefined : 
    undefined;
} while (cursor);
```

### Batch Operations

```typescript
// Batch wallet analysis
const walletAddresses = [
  '0x742d35Cc6634C0532925a3b8D3Ac2FF2c6CEF9C9',
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503'
];

const batchResults = await zerion.batchGetWalletSummaries(walletAddresses);

// Batch NFT retrieval with error handling
const nftReferences = [
  'ethereum:0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d:1',
  'ethereum:0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d:2',
  'ethereum:0x60e4d786628fea6478f785a6d7e704777c86a7c6:1'
];

const { success, failed } = await zerion.nfts.getNFTsSafely(nftReferences);
console.log(`Successfully retrieved: ${success.length}, Failed: ${failed.length}`);

// Batch token comparison
const tokenIds = ['ethereum-usdc', 'ethereum-usdt', 'ethereum-dai'];
const comparison = await zerion.fungibles.compareFungibles(tokenIds);
```

## 🎯 Performance Optimization

### Caching Strategies

```typescript
// Chains service has built-in caching
const chains1 = await zerion.chains.getAllChains(); // API call
const chains2 = await zerion.chains.getAllChains(); // From cache (faster)

// Force refresh cache
await zerion.chains.refreshCache();

// Gas service caching
const gasStats = zerion.gas.getCacheStats();
console.log('Cache stats:', gasStats);

// Clear gas cache when needed
zerion.gas.clearCache();
```

### Parallel Requests

```typescript
// Execute multiple independent requests in parallel
const [portfolio, positions, transactions, gasPrices] = await Promise.all([
  zerion.wallets.getPortfolio(address),
  zerion.wallets.getPositions(address, { page: { size: 20 } }),
  zerion.wallets.getTransactions(address, { page: { size: 10 } }),
  zerion.gas.getChainGasPricesByType('ethereum')
]);

// Parallel token analysis
const tokenPromises = ['USDC', 'USDT', 'DAI'].map(symbol =>
  zerion.fungibles.searchFungibles(symbol, { limit: 1 })
);
const tokenResults = await Promise.all(tokenPromises);
```

### Request Optimization

```typescript
// Use specific filters to reduce data transfer
const positions = await zerion.wallets.getPositions(address, {
  filter: {
    position_types: ['wallet'], // Only wallet positions
    chain_ids: ['ethereum'],    // Only Ethereum
    trash: 'only_non_trash'     // Exclude spam
  },
  page: { size: 50 }            // Reasonable page size
});

// Use include parameter for NFTs when you need related data
const nfts = await zerion.wallets.getNFTPositions(address, {
  include: ['collection', 'chain']
});
```

## 🛡️ Security Best Practices

### API Key Management

```typescript
// ✅ Good: Use environment variables
const zerion = new ZerionSDK({
  apiKey: process.env.ZERION_API_KEY!
});

// ❌ Bad: Hardcode API keys
const zerion = new ZerionSDK({
  apiKey: 'zk_prod_your_actual_key_here'
});

// ✅ Good: Validate API key format
import { isValidApiKey } from '@zerion/sdk';

const apiKey = process.env.ZERION_API_KEY;
if (!apiKey || !isValidApiKey(apiKey)) {
  throw new Error('Invalid or missing Zerion API key');
}
```

### Address Validation

```typescript
import { isValidAddress, normalizeAddress } from '@zerion/sdk';

function safeAddressHandler(address: string) {
  // Always validate addresses
  if (!isValidAddress(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
  
  // Normalize for consistency
  return normalizeAddress(address);
}
```

### Error Handling

```typescript
import { ZerionAPIError } from '@zerion/sdk';

async function safeApiCall<T>(apiCall: () => Promise<T>): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof ZerionAPIError) {
      // Handle API errors appropriately
      if (error.status === 429) {
        console.log('Rate limited, waiting before retry...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return safeApiCall(apiCall); // Retry once
      } else if (error.status === 404) {
        console.log('Resource not found');
        return null;
      } else {
        console.error('API Error:', error.message);
        throw error;
      }
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
```

## 🧪 Testing

### Unit Testing Example

```typescript
// test/wallet.service.test.ts
import { ZerionSDK } from '@zerion/sdk';

describe('Wallet Service', () => {
  let zerion: ZerionSDK;
  
  beforeEach(() => {
    zerion = new ZerionSDK({
      apiKey: process.env.ZERION_TEST_API_KEY!
    });
  });
  
  test('should get wallet portfolio', async () => {
    const address = '0x742d35Cc6634C0532925a3b8D3Ac2FF2c6CEF9C9';
    const portfolio = await zerion.wallets.getPortfolio(address);
    
    expect(portfolio.data).toBeDefined();
    expect(portfolio.data.type).toBe('portfolio');
    expect(portfolio.links.self).toContain(address);
  });
  
  test('should handle invalid address', async () => {
    await expect(
      zerion.wallets.getPortfolio('invalid_address')
    ).rejects.toThrow();
  });
});
```

### Integration Testing

```typescript
// test/integration.test.ts
describe('Integration Tests', () => {
  test('should perform complete portfolio analysis', async () => {
    const address = process.env.TEST_WALLET_ADDRESS!;
    const analysis = await zerion.getPortfolioAnalysis(address);
    
    expect(analysis.summary).toBeDefined();
    expect(analysis.positions).toBeInstanceOf(Array);
    expect(analysis.chainDistribution).toBeInstanceOf(Object);
    expect(analysis.topAssets).toBeInstanceOf(Array);
  });
});
```

## 📱 Framework Integration

### React Integration

```typescript
// hooks/useZerion.ts
import { useState, useEffect } from 'react';
import { ZerionSDK } from '@zerion/sdk';

const zerion = new ZerionSDK({
  apiKey: process.env.REACT_APP_ZERION_API_KEY!
});

export function useWalletPortfolio(address: string) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!address) return;
    
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const result = await zerion.getPortfolioAnalysis(address);
        setPortfolio(result);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolio();
  }, [address]);
  
  return { portfolio, loading, error };
}

// Component usage
function WalletDashboard({ address }: { address: string }) {
  const { portfolio, loading, error } = useWalletPortfolio(address);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>Portfolio Value: ${portfolio?.summary?.total_value}</h1>
      <p>Positions: {portfolio?.positions?.length}</p>
    </div>
  );
}
```

### Node.js/Express Integration

```typescript
// routes/portfolio.ts
import express from 'express';
import { ZerionSDK } from '@zerion/sdk';

const router = express.Router();
const zerion = new ZerionSDK({
  apiKey: process.env.ZERION_API_KEY!
});

router.get('/portfolio/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const portfolio = await zerion.getPortfolioAnalysis(address);
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tokens/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    const tokens = await zerion.fungibles.searchFungibles(q as string, {
      limit: parseInt(limit as string)
    });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Next.js API Routes

```typescript
// pages/api/wallet/[address]/portfolio.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { ZerionSDK } from '@zerion/sdk';

const zerion = new ZerionSDK({
  apiKey: process.env.ZERION_API_KEY!
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { address } = req.query;
  
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ message: 'Invalid address parameter' });
  }
  
  try {
    const portfolio = await zerion.getPortfolioAnalysis(address);
    
    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json(portfolio);
  } catch (error) {
    console.error('Portfolio API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
```

## 🚀 Deployment

### Environment Configuration

```bash
# .env (Production)
ZERION_API_KEY=zk_prod_your_production_key_here
ZERION_TIMEOUT=30000
ZERION_RETRIES=3

# .env.development
ZERION_API_KEY=zk_dev_your_development_key_here
ZERION_TIMEOUT=10000
ZERION_RETRIES=1
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Production Considerations

```typescript
// config/zerion.ts
import { ZerionSDK } from '@zerion/sdk';

export const createZerionClient = () => {
  return new ZerionSDK({
    apiKey: process.env.ZERION_API_KEY!,
    timeout: parseInt(process.env.ZERION_TIMEOUT || '30000'),
    retries: parseInt(process.env.ZERION_RETRIES || '3'),
    retryDelay: parseInt(process.env.ZERION_RETRY_DELAY || '1000')
  });
};

// Use connection pooling for high-traffic applications
let zerionInstance: ZerionSDK | null = null;

export const getZerionClient = (): ZerionSDK => {
  if (!zerionInstance) {
    zerionInstance = createZerionClient();
  }
  return zerionInstance;
};
```

## 📊 Monitoring and Observability

### Health Checks

```typescript
// health-check.ts
import { ZerionSDK } from '@zerion/sdk';

export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: Record<string, boolean>;
}> {
  const zerion = new ZerionSDK({
    apiKey: process.env.ZERION_API_KEY!,
    timeout: 5000 // Short timeout for health checks
  });
  
  try {
    const health = await zerion.getHealthStatus();
    
    return {
      status: health.status === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: health.services
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {}
    };
  }
}
```

### Metrics Collection

```typescript
// metrics.ts
import { ZerionSDK } from '@zerion/sdk';

class ZerionMetrics {
  private requestCount = 0;
  private errorCount = 0;
  private responseTimeSum = 0;
  
  async trackRequest<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.requestCount++;
    
    try {
      const result = await operation();
      this.responseTimeSum += Date.now() - startTime;
      return result;
    } catch (error) {
      this.errorCount++;
      throw error;
    }
  }
  
  getMetrics() {
    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
      averageResponseTime: this.requestCount > 0 ? this.responseTimeSum / this.requestCount : 0
    };
  }
  
  reset() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimeSum = 0;
  }
}

export const metrics = new ZerionMetrics();
```

## 🔧 Troubleshooting

### Common Issues

#### 1. API Key Issues

```typescript
// Problem: Invalid API key format
const zerion = new ZerionSDK({
  apiKey: 'invalid_key' // ❌ Wrong format
});

// Solution: Use correct format
import { isValidApiKey } from '@zerion/sdk';

const apiKey = process.env.ZERION_API_KEY;
if (!isValidApiKey(apiKey)) {
  throw new Error('Invalid API key format. Must be zk_prod_... or zk_dev_...');
}
```

#### 2. Rate Limiting

```typescript
// Problem: Getting 429 errors
try {
  const portfolio = await zerion.wallets.getPortfolio(address);
} catch (error) {
  if (error instanceof ZerionAPIError && error.status === 429) {
    // Solution: Implement exponential backoff
    await new Promise(resolve => setTimeout(resolve, 5000));
    return zerion.wallets.getPortfolio(address); // Retry
  }
}
```

#### 3. Network Timeouts

```typescript
// Problem: Requests timing out
const zerion = new ZerionSDK({
  apiKey: process.env.ZERION_API_KEY!,
  timeout: 5000, // ❌ Too short for complex requests
  retries: 1     // ❌ Too few retries
});

// Solution: Increase timeout and retries
const zerion = new ZerionSDK({
  apiKey: process.env.ZERION_API_KEY!,
  timeout: 30000, // ✅ 30 seconds
  retries: 3,     // ✅ 3 retries
  retryDelay: 2000 // ✅ 2 second delay between retries
});
```

#### 4. Memory Issues with Large Datasets

```typescript
// Problem: Loading too much data at once
const allPositions = await zerion.wallets.getAllPositions(address); // ❌ Might be huge

// Solution: Use pagination
const positions = await zerion.wallets.getPositions(address, {
  page: { size: 50 }, // ✅ Reasonable page size
  filter: {
    trash: 'only_non_trash' // ✅ Filter out spam
  }
});
```

### Debug Mode

```typescript
// Enable debug logging
process.env.NODE_ENV = 'development';

// The SDK will log requests in development mode
const portfolio = await zerion.wallets.getPortfolio(address);
// Output: [Zerion SDK] → GET /v1/wallets/.../portfolio
// Output: [Zerion SDK] ← 200 GET /v1/wallets/.../portfolio
```

## 📚 Additional Resources

### Official Documentation
- [Zerion API Documentation](https://docs.zerion.io)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Community
- [GitHub Repository](https://github.com/noFAYZ/zerion-sdk)


### Support
- [GitHub Issues](https://github.com/noFAYZ/zerion-sdk/issues)
- [Support Email](mailto:api@zerion.io)
- [API Status Page](https://status.zerion.io)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

*Built with ❤️ by the @noFAYZ*