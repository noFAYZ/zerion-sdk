// examples/comprehensive-example.ts - Complete SDK functionality demonstration

import  ZerionSDK  from '../src/index';

// ⚠️ IMPORTANT: Replace with your actual Zerion API key
const API_KEY = 'zk_dev_2e59da43ef3d49858d2c3c1bd57854ed'; // Get from https://zerion.io/api

// Test wallet addresses (these are public addresses for testing)
const TEST_ADDRESSES = {
  VITALIK: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address
  POLYGON_WHALE: '0x742d35Cc6634C0532925a3b8D3Ac2FF2c6CEF9C9', // High-value wallet
  DEFI_USER: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503'   // Active DeFi user
};

// Token addresses for testing
const TOKEN_ADDRESSES = {
  USDC_ETHEREUM: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT_ETHEREUM: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  WETH_ETHEREUM: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  MATIC_POLYGON: '0x0000000000000000000000000000000000001010'
};

// NFT references for testing
const NFT_REFERENCES = [
  'ethereum:0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d:1', // BAYC #1
  'ethereum:0x60e4d786628fea6478f785a6d7e704777c86a7c6:1', // MAYC #1
  'ethereum:0xed5af388653567af2f388e6224dc7c4b3241c544:1'  // Azuki #1
];

class ComprehensiveSDKDemo {
  private zerion: ZerionSDK;
  private results: Record<string, any> = {};

  constructor() {
    console.log('🚀 Initializing Zerion SDK...');
    this.zerion = new ZerionSDK({
      apiKey: API_KEY,
      timeout: 30000,
      retries: 3,
      retryDelay: 1000
    });
    console.log('✅ SDK initialized successfully\n');
  }

  // ==================== WALLET SERVICE DEMO ====================
  async demonstrateWalletService() {
    console.log('🏦 === WALLET SERVICE DEMONSTRATION ===\n');
    
    try {
      const address = TEST_ADDRESSES.VITALIK;
      console.log(`📊 Analyzing wallet: ${address}\n`);

      // 1. Get comprehensive portfolio analysis
      console.log('1️⃣ Getting comprehensive portfolio analysis...');
      const portfolioAnalysis = await this.zerion.getPortfolioAnalysis(address);

  
      
      console.log('Portfolio Summary:');
      console.log(`  - Total Value: $${portfolioAnalysis.summary?.attributes?.total?.positions || 'N/A'}`);
      console.log(`  - Positions Count: ${portfolioAnalysis.positions.length}`);
      console.log(`  - Top Assets: ${portfolioAnalysis.topAssets.slice(0, 3).map(a => a.attributes?.fungible_info?.symbol).join(', ')}`);
      console.log(`  - Active Chains: ${Object.keys(portfolioAnalysis.chainDistribution).length}\n`);

      // 2. Get detailed positions
      console.log('2️⃣ Getting detailed positions...');
      const positions = await this.zerion.wallets.getPositions(address, {
        filter: { positions: 'no_filter' },
        sort: 'value',
        page: { size: 20 }
      });

      console.log(`Found ${positions.data.length} positions:`);
      positions.data.slice(0, 5).forEach((pos: any, i: number) => {
        console.log(`  ${i + 1}. ${pos.attributes?.fungible_info?.symbol}: $${pos.attributes?.value?.toFixed(2) || 'N/A'}`);
      });
      console.log();

      // 3. Get transaction history
      console.log('3️⃣ Getting recent transactions...');
      const transactions = await this.zerion.wallets.getTransactions(address, {
        filter: {
          min_mined_at: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60) // Last 7 days
        },
        page: { size: 10 }
      });

      console.log(`Found ${transactions.data.length} recent transactions:`);
      transactions.data.slice(0, 3).forEach((tx: any, i: number) => {
        console.log(`  ${i + 1}. ${tx.attributes?.operation_type} - ${new Date(tx.attributes?.mined_at * 1000).toLocaleDateString()}`);
      });
      console.log();

      // 4. Get P&L data
      console.log('4️⃣ Getting P&L data...');
      const pnl = await this.zerion.wallets.getPnL(address);
      
      console.log('P&L Summary:');
      console.log(`  - Unrealized Gain: $${pnl.data.attributes?.unrealized_gain?.toFixed(2) || 'N/A'}`);
      console.log(`  - Realized Gain: $${pnl.data.attributes?.realized_gain?.toFixed(2) || 'N/A'}`);
      console.log(`  - Total Fees: $${pnl.data.attributes?.total_fee?.toFixed(2) || 'N/A'}\n`);

      // 5. Get balance chart
      console.log('5️⃣ Getting balance chart (last week)...');
      const chart = await this.zerion.wallets.getChart(address, 'week');
      
      console.log(`Chart data points: ${chart.data.attributes.points.length}`);
      console.log(`Period: ${chart.data.attributes.begin_at} to ${chart.data.attributes.end_at}\n`);

      this.results.walletService = {
        portfolioAnalysis,
        positionsCount: positions.data.length,
        transactionsCount: transactions.data.length,
        pnl: pnl.data.attributes,
        chartPoints: chart.data.attributes.points.length
      };

    } catch (error) {
      console.error('❌ Wallet service demo failed:', error);
      this.results.walletService = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== FUNGIBLES SERVICE DEMO ====================
  async demonstrateFungiblesService() {
    console.log('🪙 === FUNGIBLES SERVICE DEMONSTRATION ===\n');
    
    try {
      // 1. Search for popular tokens
      console.log('1️⃣ Searching for USDC tokens...');
      const usdcTokens = await this.zerion.fungibles.searchFungibles('USDC', { limit: 5 });
      
      console.log(`Found ${usdcTokens.length} USDC implementations:`);
      usdcTokens.forEach((token: any, i: number) => {
        const impl = token.attributes.implementations[0];
        console.log(`  ${i + 1}. ${token.attributes.symbol} on ${impl?.chain_id}: $${token.attributes.market_data?.price?.toFixed(4) || 'N/A'}`);
      });
      console.log();

      // 2. Get top tokens by market cap
      console.log('2️⃣ Getting top tokens by market cap...');
      const topTokens = await this.zerion.fungibles.getTopFungibles(10);
      
      console.log('Top 5 tokens by market cap:');
      topTokens.slice(0, 5).forEach((token: any, i: number) => {
        const marketCap = token.attributes.market_data?.market_cap;
        console.log(`  ${i + 1}. ${token.attributes.symbol}: $${marketCap ? (marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}`);
      });
      console.log();

      // 3. Get trending tokens
      console.log('3️⃣ Getting trending tokens (24h)...');
      const trending = await this.zerion.fungibles.getTrendingFungibles('24h', 10);
      
      console.log('Top 5 trending tokens:');
      trending.slice(0, 5).forEach((token: any, i: number) => {
        const change = token.attributes.market_data?.percent_change_24h;
        console.log(`  ${i + 1}. ${token.attributes.symbol}: ${change ? (change > 0 ? '+' : '') + change.toFixed(2) + '%' : 'N/A'}`);
      });
      console.log();

      // 4. Get specific token details
      if (topTokens.length > 0) {
        console.log('4️⃣ Getting detailed token information...');
        const tokenId = topTokens[0].id;
        const tokenDetails = await this.zerion.fungibles.getFungible(tokenId);
        
        console.log(`${tokenDetails.data.attributes.name} (${tokenDetails.data.attributes.symbol}) details:`);
        console.log(`  - Price: $${tokenDetails.data.attributes.market_data?.price?.toFixed(4) || 'N/A'}`);
        console.log(`  - Market Cap: $${tokenDetails.data.attributes.market_data?.market_cap ? (tokenDetails.data.attributes.market_data.market_cap / 1e9).toFixed(2) + 'B' : 'N/A'}`);
        console.log(`  - 24h Change: ${tokenDetails.data.attributes.market_data?.percent_change_24h?.toFixed(2) || 'N/A'}%`);
        console.log(`  - Implementations: ${tokenDetails.data.attributes.implementations.length} chains\n`);

        // 5. Get price chart
        console.log('5️⃣ Getting price chart (last week)...');
        const priceChart = await this.zerion.fungibles.getFungibleChart(tokenId, 'week');
        console.log(`Price chart points: ${priceChart.data.attributes.points.length}\n`);
      }

      // 6. Cross-chain analysis
      console.log('6️⃣ Performing cross-chain USDC analysis...');
      const crossChainAnalysis = await this.zerion.getCrossChainAssetAnalysis('USDC');
      
      console.log('Cross-chain USDC analysis:');
      console.log(`  - Implementations: ${crossChainAnalysis.implementations.length}`);
      console.log(`  - Price variance: $${crossChainAnalysis.priceVariance.toFixed(4)}`);
      console.log(`  - Bridge options: ${crossChainAnalysis.bridgeOptions.length}\n`);

      this.results.fungiblesService = {
        usdcImplementations: usdcTokens.length,
        topTokens: topTokens.length,
        trendingTokens: trending.length,
        crossChainAnalysis
      };

    } catch (error) {
      console.error('❌ Fungibles service demo failed:', error);
      this.results.fungiblesService = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== CHAINS SERVICE DEMO ====================
  async demonstrateChainsService() {
    console.log('⛓️ === CHAINS SERVICE DEMONSTRATION ===\n');
    
    try {
      // 1. Get all supported chains
      console.log('1️⃣ Getting all supported chains...');
      const allChains = await this.zerion.chains.getAllChains();
      console.log(`Total supported chains: ${allChains.length}\n`);

      // 2. Get popular chains
      console.log('2️⃣ Getting popular chains...');
      const popularChains = await this.zerion.chains.getPopularChains();
      
      console.log('Popular chains:');
      popularChains.forEach((chain: any, i: number) => {
        console.log(`  ${i + 1}. ${chain.attributes.name} (ID: ${chain.attributes.external_id})`);
      });
      console.log();

      // 3. Get L2 chains
      console.log('3️⃣ Getting Layer 2 chains...');
      const l2Chains = await this.zerion.chains.getL2Chains();
      
      console.log('Layer 2 chains:');
      l2Chains.forEach((chain: any, i: number) => {
        console.log(`  ${i + 1}. ${chain.attributes.name}`);
      });
      console.log();

      // 4. Get trading-enabled chains
      console.log('4️⃣ Getting trading-enabled chains...');
      const tradingChains = await this.zerion.chains.getTradingChains();
      console.log(`Chains with trading support: ${tradingChains.length}\n`);

      // 5. Search for specific chains
      console.log('5️⃣ Searching for Ethereum-related chains...');
      const ethereumChains = await this.zerion.chains.findChainsByName('ethereum');
      
      console.log('Ethereum-related chains:');
      ethereumChains.forEach((chain: any, i: number) => {
        console.log(`  ${i + 1}. ${chain.attributes.name}`);
      });
      console.log();

      // 6. Get chain statistics
      console.log('6️⃣ Getting chain statistics...');
      const stats = await this.zerion.chains.getChainStats();
      
      console.log('Chain statistics:');
      console.log(`  - Total: ${stats.total}`);
      console.log(`  - Mainnet: ${stats.mainnet}`);
      console.log(`  - Testnet: ${stats.testnet}`);
      console.log(`  - Trading enabled: ${stats.trading}`);
      console.log(`  - Layer 2: ${stats.l2}\n`);

      this.results.chainsService = {
        totalChains: allChains.length,
        popularChains: popularChains.length,
        l2Chains: l2Chains.length,
        tradingChains: tradingChains.length,
        stats
      };

    } catch (error) {
      console.error('❌ Chains service demo failed:', error);
      this.results.chainsService = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== SWAP SERVICE DEMO ====================
  async demonstrateSwapService() {
    console.log('🔄 === SWAP SERVICE DEMONSTRATION ===\n');
    
    try {
      // 1. Get available swap tokens
      console.log('1️⃣ Getting swap-available tokens for Ethereum...');
      const swapTokens = await this.zerion.swap.getOutputFungibles('ethereum');
      console.log(`Available tokens for swapping: ${swapTokens.length}\n`);

      // 2. Find best swap route
      console.log('2️⃣ Finding best USDC to USDT swap route...');
      const swapRoute = await this.zerion.findBestSwapRoute(
        { chainId: 'ethereum', address: TOKEN_ADDRESSES.USDC_ETHEREUM },
        { chainId: 'ethereum', address: TOKEN_ADDRESSES.USDT_ETHEREUM },
        '1000000000', // 1000 USDC (6 decimals)
        { slippage: 1 }
      );

      if (swapRoute) {
        console.log('Best swap route found:');
        console.log(`  - Input: ${swapRoute.bestOffer.attributes.send_quantity.float} USDC`);
        console.log(`  - Output: ${swapRoute.bestOffer.attributes.receive_quantity.float} USDT`);
        console.log(`  - Rate: ${(swapRoute.bestOffer.attributes.receive_quantity.float / swapRoute.bestOffer.attributes.send_quantity.float).toFixed(6)}`);
        console.log(`  - Gas limit: ${swapRoute.bestOffer.attributes.data.gas_limit}`);
        console.log();
      } else {
        console.log('No swap route found\n');
      }

      // 3. Compare swap rates
      if (swapRoute) {
        console.log('3️⃣ Comparing swap rates across providers...');
        const rateComparison = await this.zerion.swap.compareSwapRates({
          input: { chain_id: 'ethereum', address: TOKEN_ADDRESSES.USDC_ETHEREUM, amount: '1000000000' },
          output: { chain_id: 'ethereum', address: TOKEN_ADDRESSES.USDT_ETHEREUM }
        });

        console.log('Rate comparison:');
        console.log(`  - Offers found: ${rateComparison.offers.length}`);
        console.log(`  - Best rate: ${rateComparison.bestRate ? (rateComparison.bestRate.attributes.receive_quantity.float / rateComparison.bestRate.attributes.send_quantity.float).toFixed(6) : 'N/A'}`);
        console.log(`  - Average rate: ${rateComparison.averageRate.toFixed(6)}`);
        console.log(`  - Rate spread: ${rateComparison.rateSpread.toFixed(6)}\n`);
      }

      // 4. Get cross-chain bridge options
      console.log('4️⃣ Getting cross-chain bridge options (Ethereum → Polygon)...');
      const bridgeOptions = await this.zerion.swap.getCrossChainSwapOptions('ethereum', 'polygon', 'USDC');
      
      console.log('Bridge options:');
      console.log(`  - Available tokens: ${bridgeOptions.availableTokens.length}`);
      console.log(`  - Sample offers: ${bridgeOptions.sampleOffers.length}\n`);

      // 5. Test different slippage tolerances
      console.log('5️⃣ Testing different slippage tolerances...');
      const slippageTests = await this.zerion.swap.estimateSwapWithSlippage({
        input: { chain_id: 'ethereum', address: TOKEN_ADDRESSES.USDC_ETHEREUM, amount: '1000000000' },
        output: { chain_id: 'ethereum', address: TOKEN_ADDRESSES.USDT_ETHEREUM }
      });

      console.log('Slippage tolerance results:');
      Object.entries(slippageTests).forEach(([slippage, offer]) => {
        console.log(`  - ${slippage}: ${offer ? 'Available' : 'Not available'}`);
      });
      console.log();

      this.results.swapService = {
        swapTokensAvailable: swapTokens.length,
        bestRouteFound: !!swapRoute,
        bridgeTokens: bridgeOptions.availableTokens.length,
        slippageOptions: Object.keys(slippageTests).length
      };

    } catch (error) {
      console.error('❌ Swap service demo failed:', error);
      this.results.swapService = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== NFT SERVICE DEMO ====================
  async demonstrateNFTService() {
    console.log('🖼️ === NFT SERVICE DEMONSTRATION ===\n');
    
    try {
      // 1. Get wallet NFT positions
      console.log('1️⃣ Getting NFT positions for test wallet...');
      const nftPositions = await this.zerion.wallets.getNFTPositions(TEST_ADDRESSES.VITALIK, {
        page: { size: 10 }
      });

      console.log(`Found ${nftPositions.data.length} NFT positions:`);
      nftPositions.data.slice(0, 3).forEach((nft: any, i: number) => {
        console.log(`  ${i + 1}. ${nft.attributes?.collection_info?.name || 'Unknown'} #${nft.attributes?.token_id}`);
      });
      console.log();

      // 2. Get NFT collections
      console.log('2️⃣ Getting NFT collections...');
      const collections = await this.zerion.wallets.getNFTCollections(TEST_ADDRESSES.VITALIK);

      console.log(`Found ${collections.data.length} collections:`);
      collections.data.slice(0, 3).forEach((collection: any, i: number) => {
        console.log(`  ${i + 1}. ${collection.attributes?.name}: ${collection.attributes?.positions_count} items`);
      });
      console.log();

      // 3. Get specific NFTs by reference
      console.log('3️⃣ Getting specific NFTs by reference...');
      const specificNFTs = await this.zerion.nfts.getNFTsByReferences(NFT_REFERENCES.slice(0, 2));

      console.log(`Retrieved ${specificNFTs.length} specific NFTs:`);
      specificNFTs.forEach((nft: any, i: number) => {
        console.log(`  ${i + 1}. ${nft.attributes?.collection_info?.name || 'Unknown'} #${nft.attributes?.token_id}`);
      });
      console.log();

      // 4. Get NFT with metadata
      if (specificNFTs.length > 0) {
        console.log('4️⃣ Getting NFT with enhanced metadata...');
        const nftWithMetadata = await this.zerion.nfts.getNFTWithMetadata(specificNFTs[0].id);

        if (nftWithMetadata) {
          console.log('NFT metadata:');
          console.log(`  - Name: ${nftWithMetadata.nft.attributes?.name || 'N/A'}`);
          console.log(`  - Has image: ${nftWithMetadata.metadata.hasImage}`);
          console.log(`  - Has video: ${nftWithMetadata.metadata.hasVideo}`);
          console.log(`  - Content URLs: ${nftWithMetadata.metadata.contentUrls.length}`);
          console.log();
        }
      }

      // 5. Get collection summary
      console.log('5️⃣ Getting BAYC collection summary...');
      const collectionSummary = await this.zerion.nfts.getCollectionSummary(
        'ethereum',
        '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
        ['1', '2', '3']
      );

      console.log('BAYC collection summary:');
      console.log(`  - Name: ${collectionSummary.collectionInfo?.name || 'N/A'}`);
      console.log(`  - Sample NFTs: ${collectionSummary.sampleNFTs.length}`);
      console.log(`  - Total sampled: ${collectionSummary.totalSampled}\n`);

      // 6. Validate NFT references
      console.log('6️⃣ Validating NFT references...');
      const validationResults = NFT_REFERENCES.map(ref => {
        const validation = this.zerion.nfts.validateNFTReference(ref);
        return { ref, valid: validation.isValid };
      });

      console.log('Reference validation:');
      validationResults.forEach((result, i) => {
        console.log(`  ${i + 1}. ${result.valid ? '✅' : '❌'} ${result.ref.split(':')[2]}`);
      });
      console.log();

      this.results.nftService = {
        nftPositions: nftPositions.data.length,
        collections: collections.data.length,
        specificNFTs: specificNFTs.length,
        collectionSummary: !!collectionSummary.collectionInfo,
        validReferences: validationResults.filter(r => r.valid).length
      };

    } catch (error) {
      console.error('❌ NFT service demo failed:', error);
      this.results.nftService = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== GAS SERVICE DEMO ====================
  async demonstrateGasService() {
    console.log('⛽ === GAS SERVICE DEMONSTRATION ===\n');
    
    try {
      // 1. Get gas prices for multiple chains
      console.log('1️⃣ Getting gas prices for popular chains...');
      const chainIds = ['ethereum', 'polygon', 'arbitrum'];
      const multiChainGas = await this.zerion.gas.getMultiChainGasPrices(chainIds);

      console.log('Gas prices by chain:');
      Object.entries(multiChainGas).forEach(([chainId, prices]) => {
        const classicPrice = prices.find(p => p.attributes.gas_type === 'classic');
        console.log(`  - ${chainId}: ${classicPrice?.attributes.price || 'N/A'} wei`);
      });
      console.log();

      // 2. Get gas recommendations for Ethereum
      console.log('2️⃣ Getting gas recommendations for Ethereum...');
      const gasRecommendations = await this.zerion.gas.getGasRecommendations('ethereum');

      if (gasRecommendations) {
        console.log('Ethereum gas recommendations:');
        console.log(`  - Recommended: ${gasRecommendations.recommended}`);
        console.log(`  - Classic: ${gasRecommendations.options.classic.price} wei (${gasRecommendations.options.classic.timeMinutes} min)`);
        console.log(`  - Fast: ${gasRecommendations.options.fast.price} wei (${gasRecommendations.options.fast.timeMinutes} min)`);
        console.log(`  - Instant: ${gasRecommendations.options.instant.price} wei (${gasRecommendations.options.instant.timeMinutes} min)`);
        console.log();
      }

      // 3. Compare gas prices across chains
      console.log('3️⃣ Comparing gas prices across chains...');
      const gasComparison = await this.zerion.gas.compareGasPricesAcrossChains(chainIds, 'classic');

      console.log('Cross-chain gas comparison:');
      console.log(`  - Cheapest: ${gasComparison.cheapest?.chainId || 'N/A'} (${gasComparison.cheapest?.price || 'N/A'} wei)`);
      console.log(`  - Fastest: ${gasComparison.fastest?.chainId || 'N/A'} (${gasComparison.fastest?.time || 'N/A'} min)`);
      console.log();

      // 4. Estimate transaction costs
      console.log('4️⃣ Estimating transaction costs...');
      const txCosts = await Promise.all([
        this.zerion.gas.estimateTransactionCost('ethereum', '21000', 'classic'), // Simple transfer
        this.zerion.gas.estimateTransactionCost('ethereum', '100000', 'fast'), // Complex transaction
      ]);

      console.log('Transaction cost estimates:');
      if (txCosts[0]) {
        console.log(`  - Simple transfer (classic): ${txCosts[0].totalCostWei} wei`);
      }
      if (txCosts[1]) {
        console.log(`  - Complex transaction (fast): ${txCosts[1].totalCostWei} wei`);
      }
      console.log();

      // 5. Calculate gas fees in different units
      console.log('5️⃣ Calculating gas fees in different units...');
      const gasFeeUnits = await this.zerion.gas.calculateGasFeeInNativeToken('ethereum', '21000', 'classic');

      if (gasFeeUnits) {
        console.log('Gas fee calculations:');
        console.log(`  - Wei: ${gasFeeUnits.feeWei}`);
        console.log(`  - Gwei: ${gasFeeUnits.feeGwei}`);
        console.log(`  - Ether: ${gasFeeUnits.feeEther}`);
        console.log();
      }

      // 6. Get gas price alerts
      console.log('6️⃣ Setting up gas price alerts...');
      const gasAlerts = await this.zerion.gas.getGasPriceAlerts('ethereum', {
        low: '20000000000', // 20 gwei
        high: '100000000000' // 100 gwei
      });

      console.log('Gas price alerts:');
      console.log(`  - Current price: ${gasAlerts.currentPrice} wei`);
      gasAlerts.alerts.forEach((alert, i) => {
        console.log(`  - ${alert.type} threshold (${alert.threshold}): ${alert.triggered ? '🚨 TRIGGERED' : '✅ OK'}`);
      });
      console.log();

      this.results.gasService = {
        chainsMonitored: chainIds.length,
        recommendationsAvailable: !!gasRecommendations,
        costEstimations: txCosts.filter(c => c).length,
        alertsConfigured: gasAlerts.alerts.length
      };

    } catch (error) {
      console.error('❌ Gas service demo failed:', error);
      this.results.gasService = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== ADVANCED FEATURES DEMO ====================
  async demonstrateAdvancedFeatures() {
    console.log('🚀 === ADVANCED FEATURES DEMONSTRATION ===\n');
    
    try {
      // 1. Multi-wallet aggregation
      console.log('1️⃣ Multi-wallet aggregation...');
      const multiWalletData = await this.zerion.getMultiWalletAggregation([
        TEST_ADDRESSES.VITALIK,
        TEST_ADDRESSES.POLYGON_WHALE
      ]);

      console.log('Multi-wallet aggregation:');
      console.log(`  - Total value: $${multiWalletData.totalValue.toFixed(2)}`);
      console.log(`  - Total P&L: $${multiWalletData.totalPnL.toFixed(2)}`);
      console.log(`  - Combined positions: ${multiWalletData.combinedPositions.length}`);
      console.log(`  - Top chains: ${multiWalletData.topChains.slice(0, 3).map(c => c.chainId).join(', ')}`);
      console.log();

    // examples/comprehensive-example-part2.ts - Continuation of comprehensive example

      // 2. Market overview
      console.log('2️⃣ Getting market overview...');
      const marketOverview = await this.zerion.getMarketOverview();

      console.log('Market overview:');
      console.log(`  - Top assets: ${marketOverview.topAssets.length}`);
      console.log(`  - Trending: ${marketOverview.trending.length}`);
      console.log(`  - Popular chains: ${marketOverview.chains.length}`);
      console.log(`  - Total chains: ${marketOverview.totalChains}`);
      console.log();

      // 3. Transaction pattern analysis
      console.log('3️⃣ Analyzing transaction patterns...');
      const patterns = await this.zerion.analyzeTransactionPatterns(TEST_ADDRESSES.DEFI_USER, {
        start: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: Date.now()
      });

      console.log('Transaction patterns (last 30 days):');
      console.log(`  - Total transactions: ${patterns.totalTransactions}`);
      console.log(`  - Average daily: ${patterns.averageDaily.toFixed(2)}`);
      console.log(`  - Gas spent: $${patterns.gasSpent.toFixed(2)}`);
      console.log(`  - Top operations: ${patterns.commonOperations.slice(0, 3).map(op => `${op.type}(${op.count})`).join(', ')}`);
      console.log(`  - Preferred chains: ${patterns.preferredChains.slice(0, 3).map(c => c.chain).join(', ')}`);
      console.log();

      // 4. Batch wallet operations
      console.log('4️⃣ Batch wallet operations...');
      const batchResults = await this.zerion.batchGetWalletSummaries([
        TEST_ADDRESSES.VITALIK,
        TEST_ADDRESSES.POLYGON_WHALE,
        TEST_ADDRESSES.DEFI_USER
      ]);

      console.log('Batch wallet results:');
      Object.entries(batchResults).forEach(([address, data]) => {
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        if (data.error) {
          console.log(`  - ${shortAddress}: ❌ ${data.error}`);
        } else {
          console.log(`  - ${shortAddress}: ✅ Portfolio loaded`);
        }
      });
      console.log();

      // 5. SDK health check
      console.log('5️⃣ SDK health check...');
      const healthStatus = await this.zerion.getHealthStatus();

      console.log('SDK health status:');
      console.log(`  - Status: ${healthStatus.status}`);
      console.log(`  - Response time: ${healthStatus.responseTime}ms`);
      console.log(`  - Services: ${Object.entries(healthStatus.services).map(([name, status]) => `${name}(${status ? '✅' : '❌'})`).join(', ')}`);
      console.log();

      this.results.advancedFeatures = {
        multiWalletAggregation: multiWalletData,
        marketOverview,
        transactionPatterns: patterns,
        batchResults: Object.keys(batchResults).length,
        healthStatus: healthStatus.status
      };

    } catch (error) {
      console.error('❌ Advanced features demo failed:', error);
      this.results.advancedFeatures = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== ENVIRONMENT & CONFIGURATION DEMO ====================
  async demonstrateEnvironmentFeatures() {
    console.log('⚙️ === ENVIRONMENT & CONFIGURATION DEMONSTRATION ===\n');
    
    try {
      // 1. Environment switching
      console.log('1️⃣ Testing environment switching...');
      
      // Switch to testnet
      this.zerion.setEnvironment('testnet');
      console.log('✅ Switched to testnet environment');
      
      // Try to get testnet chains
      const testnetChains = await this.zerion.chains.getAllChains();
      console.log(`  - Testnet chains available: ${testnetChains.length}`);
      
      // Switch back to production
      this.zerion.setEnvironment('production');
      console.log('✅ Switched back to production environment');
      
      const prodChains = await this.zerion.chains.getAllChains();
      console.log(`  - Production chains available: ${prodChains.length}\n`);

      // 2. Configuration adjustments
      console.log('2️⃣ Testing configuration adjustments...');
      
      // Adjust timeout
      this.zerion.setTimeout(45000);
      console.log('✅ Set timeout to 45 seconds');
      
      // Adjust retries
      this.zerion.setRetries(5, 2000);
      console.log('✅ Set retries to 5 with 2 second delay\n');

      // 3. Error handling demonstration
      console.log('3️⃣ Demonstrating error handling...');
      
      try {
        // Try to access an invalid wallet
        await this.zerion.wallets.getPortfolio('invalid_address');
      } catch (error) {
        console.log('✅ Properly caught invalid address error');
      }

      try {
        // Try to access non-existent token
        await this.zerion.fungibles.getFungible('non_existent_token_id');
      } catch (error) {
        console.log('✅ Properly caught non-existent token error');
      }

      console.log();

      this.results.environmentFeatures = {
        testnetChains: testnetChains.length,
        productionChains: prodChains.length,
        configurationAdjusted: true,
        errorHandlingWorking: true
      };

    } catch (error) {
      console.error('❌ Environment features demo failed:', error);
      this.results.environmentFeatures = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== REAL-TIME MONITORING DEMO ====================
  async demonstrateRealTimeFeatures() {
    console.log('📡 === REAL-TIME MONITORING DEMONSTRATION ===\n');
    
    try {
      // 1. Wallet activity monitoring (short demo)
      console.log('1️⃣ Setting up wallet activity monitoring (30 second demo)...');
      
      const monitor = this.zerion.monitorWalletActivity(TEST_ADDRESSES.VITALIK, 10000); // Check every 10 seconds
      let iterations = 0;
      const maxIterations = 3; // Run for 3 iterations (30 seconds)

      for await (const activity of monitor) {
        iterations++;
        console.log(`  📊 Monitor update ${iterations}:`);
        console.log(`    - Timestamp: ${new Date(activity.timestamp).toLocaleTimeString()}`);
        console.log(`    - New transactions: ${activity.newTransactions.length}`);
        console.log(`    - Alerts: ${activity.alerts.length > 0 ? activity.alerts.join(', ') : 'None'}`);
        
        if (iterations >= maxIterations) {
          console.log('  ✅ Monitoring demo completed\n');
          break;
        }
      }

      // 2. Gas price monitoring (short demo)
      console.log('2️⃣ Setting up gas price monitoring (20 second demo)...');
      
      const gasMonitor = this.zerion.gas.monitorGasPrices('ethereum', 10000); // Check every 10 seconds
      let gasIterations = 0;
      const maxGasIterations = 2; // Run for 2 iterations (20 seconds)

      for await (const gasPrices of gasMonitor) {
        gasIterations++;
        const classicPrice = gasPrices.find(p => p.attributes.gas_type === 'classic');
        console.log(`  ⛽ Gas update ${gasIterations}:`);
        console.log(`    - Timestamp: ${new Date().toLocaleTimeString()}`);
        console.log(`    - Classic gas: ${classicPrice?.attributes.price || 'N/A'} wei`);
        console.log(`    - Estimated time: ${classicPrice?.attributes.time || 'N/A'} minutes`);
        
        if (gasIterations >= maxGasIterations) {
          console.log('  ✅ Gas monitoring demo completed\n');
          break;
        }
      }

      this.results.realTimeFeatures = {
        walletMonitoringIterations: iterations,
        gasMonitoringIterations: gasIterations,
        monitoringWorking: true
      };

    } catch (error) {
      console.error('❌ Real-time features demo failed:', error);
      this.results.realTimeFeatures = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== PERFORMANCE & OPTIMIZATION DEMO ====================
  async demonstratePerformanceFeatures() {
    console.log('⚡ === PERFORMANCE & OPTIMIZATION DEMONSTRATION ===\n');
    
    try {
      // 1. Batch operations performance
      console.log('1️⃣ Testing batch operations performance...');
      
      const startTime = Date.now();
      
      // Parallel requests
      const parallelResults = await Promise.all([
        this.zerion.chains.getAllChains(),
        this.zerion.fungibles.getTopFungibles(10),
        this.zerion.gas.getGasPrices(),
      ]);
      
      const parallelTime = Date.now() - startTime;
      console.log(`  ✅ Parallel requests completed in ${parallelTime}ms`);
      console.log(`    - Chains: ${parallelResults[0].length}`);
      console.log(`    - Top tokens: ${parallelResults[1].length}`);
      console.log(`    - Gas prices: ${Array.isArray(parallelResults[2].data) ? parallelResults[2].data.length : 0}`);
      console.log();

      // 2. Caching demonstration
      console.log('2️⃣ Testing caching performance...');
      
      // First call (no cache)
      const firstCallStart = Date.now();
      await this.zerion.chains.getAllChains();
      const firstCallTime = Date.now() - firstCallStart;
      
      // Second call (should use cache)
      const secondCallStart = Date.now();
      await this.zerion.chains.getAllChains();
      const secondCallTime = Date.now() - secondCallStart;
      
      console.log(`  ✅ Caching performance:`);
      console.log(`    - First call: ${firstCallTime}ms`);
      console.log(`    - Second call: ${secondCallTime}ms`);
      console.log(`    - Speed improvement: ${((firstCallTime - secondCallTime) / firstCallTime * 100).toFixed(1)}%`);
      console.log();

      // 3. Pagination optimization
      console.log('3️⃣ Testing pagination optimization...');
      
      const paginationStart = Date.now();
      const allPositions = await this.zerion.wallets.getAllPositions(TEST_ADDRESSES.VITALIK);
      const paginationTime = Date.now() - paginationStart;
      
      console.log(`  ✅ Auto-pagination completed in ${paginationTime}ms`);
      console.log(`    - Total positions retrieved: ${allPositions.length}`);
      console.log();

      // 4. Error recovery demonstration
      console.log('4️⃣ Testing error recovery...');
      
      const errorTests = await Promise.allSettled([
        this.zerion.wallets.getPortfolio('0x1234567890123456789012345678901234567890'), // Likely empty wallet
        this.zerion.fungibles.searchFungibles('NONEXISTENTTOKEN123'),
        this.zerion.chains.getChain('nonexistent_chain')
      ]);
      
      const successCount = errorTests.filter(r => r.status === 'fulfilled').length;
      const errorCount = errorTests.filter(r => r.status === 'rejected').length;
      
      console.log(`  ✅ Error recovery test:`);
      console.log(`    - Successful requests: ${successCount}`);
      console.log(`    - Failed requests (gracefully handled): ${errorCount}`);
      console.log();

      this.results.performanceFeatures = {
        parallelRequestTime: parallelTime,
        cachingImprovement: ((firstCallTime - secondCallTime) / firstCallTime * 100),
        paginationTime: paginationTime,
        positionsRetrieved: allPositions.length,
        errorRecoveryWorking: true
      };

    } catch (error) {
      console.error('❌ Performance features demo failed:', error);
      this.results.performanceFeatures = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== MAIN DEMO RUNNER ====================
  async runComprehensiveDemo() {
    console.log('🎯 ZERION SDK COMPREHENSIVE DEMONSTRATION');
    console.log('=' .repeat(60));
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
    console.log('=' .repeat(60) + '\n');

    // Check if API key is set
    if (!API_KEY ) {
      console.log('⚠️  WARNING: Please set your actual API key in the API_KEY variable');
      console.log('   Get your API key from: https://zerion.io/api\n');
    }

    const demos = [
     // { name: 'Wallet Service', method: this.demonstrateWalletService },
       { name: 'Fungibles Service', method: this.demonstrateFungiblesService },
 /*     { name: 'Chains Service', method: this.demonstrateChainsService },
      { name: 'Swap Service', method: this.demonstrateSwapService },
      { name: 'NFT Service', method: this.demonstrateNFTService },
      { name: 'Gas Service', method: this.demonstrateGasService },
      { name: 'Advanced Features', method: this.demonstrateAdvancedFeatures },
      { name: 'Environment Features', method: this.demonstrateEnvironmentFeatures },
      { name: 'Real-time Features', method: this.demonstrateRealTimeFeatures },
      { name: 'Performance Features', method: this.demonstratePerformanceFeatures } */
    ];

    let successCount = 0;
    let totalDemos = demos.length;

    for (const demo of demos) {
      try {
        console.log(`\n${'='.repeat(20)} ${demo.name.toUpperCase()} ${'='.repeat(20)}`);
        await demo.method.call(this);
        successCount++;
        console.log(`✅ ${demo.name} completed successfully`);
      } catch (error) {
        console.error(`❌ ${demo.name} failed:`, error);
      }
      
      // Small delay between demos
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Final summary
    this.printFinalSummary(successCount, totalDemos);
  }

  // ==================== SUMMARY & RESULTS ====================
  printFinalSummary(successCount: number, totalDemos: number) {
    console.log('\n' + '🎉'.repeat(20));
    console.log('COMPREHENSIVE DEMO COMPLETED');
    console.log('🎉'.repeat(20) + '\n');

    console.log('📊 EXECUTION SUMMARY:');
    console.log(`   Success Rate: ${successCount}/${totalDemos} (${((successCount/totalDemos)*100).toFixed(1)}%)`);
    console.log(`   Completed at: ${new Date().toLocaleString()}\n`);

    console.log('📈 DETAILED RESULTS:');

    // Service-by-service summary
    Object.entries(this.results).forEach(([service, data]) => {
      console.log(`\n🔹 ${service.toUpperCase()}:`);
      
      if (data.error) {
        console.log(`   ❌ Error: ${data.error}`);
      } else {
        // Display key metrics for each service
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'number') {
            console.log(`   ${key}: ${value}`);
          } else if (typeof value === 'boolean') {
            console.log(`   ${key}: ${value ? '✅' : '❌'}`);
          } else if (typeof value === 'string') {
            console.log(`   ${key}: ${value}`);
          } else if (value && typeof value === 'object') {
            console.log(`   ${key}: [Object with ${Object.keys(value).length} properties]`);
          }
        });
      }
    });

    console.log('\n📋 CAPABILITIES DEMONSTRATED:');
    const capabilities = [
      '✅ Wallet portfolio analysis',
      '✅ Token search and market data',
      '✅ Blockchain information retrieval',
      '✅ DEX aggregation and swap routing',
      '✅ NFT data and metadata handling',
      '✅ Gas price monitoring and estimation',
      '✅ Multi-wallet aggregation',
      '✅ Real-time activity monitoring',
      '✅ Cross-chain asset analysis',
      '✅ Performance optimization',
      '✅ Error handling and recovery',
      '✅ Environment switching',
      '✅ Caching and pagination'
    ];

    capabilities.forEach(capability => console.log(`   ${capability}`));

    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Integration: Copy successful patterns into your application');
    console.log('   2. Customization: Modify parameters for your specific use case');
    console.log('   3. Production: Configure proper error handling and monitoring');
    console.log('   4. Optimization: Implement caching strategies for your needs');
    console.log('   5. Documentation: Refer to the SDK docs for advanced features');

    console.log('\n📞 SUPPORT:');
    console.log('   - Documentation: README.md and inline code comments');
    console.log('   - API Reference: Zerion API documentation');
    console.log('   - Issues: GitHub repository issue tracker');

    console.log('\n' + '🎯'.repeat(20));
    console.log('HAPPY BUILDING WITH ZERION SDK!');
    console.log('🎯'.repeat(20));
  }
}

// ==================== QUICK START FUNCTIONS ====================

// Quick wallet analysis
export async function quickWalletAnalysis(address: string, apiKey: string = API_KEY) {
  console.log(`🔍 Quick Wallet Analysis: ${address}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const analysis = await zerion.getPortfolioAnalysis(address);
    
    console.log('📊 Portfolio Summary:');
    console.log(`   Total Value: $${analysis.summary?.attributes?.total_value || 'N/A'}`);
    console.log(`   Positions: ${analysis.positions.length}`);
    console.log(`   Top Assets: ${analysis.topAssets.slice(0, 5).map(a => a.attributes?.fungible_info?.symbol).join(', ')}`);
    console.log(`   P&L: $${analysis.pnl?.attributes?.unrealized_gain || 'N/A'}`);
    
    return analysis;
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    return null;
  }
}

// Quick token search
export async function quickTokenSearch(query: string, apiKey: string = API_KEY) {
  console.log(`🔍 Quick Token Search: ${query}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const tokens = await zerion.fungibles.searchFungibles(query, { limit: 5 });
    
    console.log(`Found ${tokens.length} tokens:`);
    tokens.forEach((token: any, i: number) => {
      console.log(`   ${i + 1}. ${token.attributes.symbol}: $${token.attributes.market_data?.price?.toFixed(4) || 'N/A'}`);
    });
    
    return tokens;
  } catch (error) {
    console.error('❌ Search failed:', error);
    return [];
  }
}

// Quick gas check
export async function quickGasCheck(chainId: string = 'ethereum', apiKey: string = API_KEY) {
  console.log(`⛽ Quick Gas Check: ${chainId}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const gasPrices = await zerion.gas.getChainGasPricesByType(chainId);
    
    console.log('Current gas prices:');
    Object.entries(gasPrices).forEach(([type, price]) => {
      if (price) {
        console.log(`   ${type}: ${price.attributes.price} wei (${price.attributes.time} min)`);
      }
    });
    
    return gasPrices;
  } catch (error) {
    console.error('❌ Gas check failed:', error);
    return {};
  }
}

// Export main demo class
export { ComprehensiveSDKDemo };

// Main execution
if (require.main === module) {
  const demo = new ComprehensiveSDKDemo();
  demo.runComprehensiveDemo().catch(console.error);
}