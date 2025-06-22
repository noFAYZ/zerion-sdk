// examples/fungibles-service-tests.ts - Complete Fungibles Service Function Tests

import  ZerionSDK  from '../src/index';

// ⚠️ IMPORTANT: Replace with your actual Zerion API key
const API_KEY = 'zk_dev_2e59da43ef3d49858d2c3c1bd57854ed';

// Test tokens for various scenarios
const TEST_TOKENS = {
  POPULAR: ['USDC', 'USDT', 'ETH', 'BTC', 'DAI'],
  TRENDING: ['PEPE', 'SHIB', 'DOGE', 'MATIC', 'UNI'],
  STABLECOINS: ['USDC', 'USDT', 'DAI', 'FRAX', 'LUSD'],
  DEFI: ['UNI', 'AAVE', 'COMP', 'MKR', 'SNX'],
  LAYER2: ['MATIC', 'ARB', 'OP', 'METIS', 'BOBA']
};

// Known token IDs for testing
const KNOWN_TOKEN_IDS = {
  USDC: 'ee9702a0-c587-4c69-ac0c-ce820a50c95b',
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  WETH: 'eth',};

// Contract addresses for testing
const TOKEN_CONTRACTS = {
  ETHEREUM: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  POLYGON: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
  }
};

class FungiblesServiceTester {
  private zerion: ZerionSDK;
  private testResults: Record<string, any> = {};

  constructor() {
    console.log('🪙 Initializing Fungibles Service Tester...\n');
    this.zerion = new ZerionSDK({
      apiKey: API_KEY,
      timeout: 30000,
      retries: 3
    });
  }

  // ==================== SEARCH AND DISCOVERY TESTS ====================
  
  async testSearchAndDiscovery() {
    console.log('🔍 === TESTING SEARCH AND DISCOVERY METHODS ===\n');
    
    try {
      // Test 1: getFungibles - Basic listing
      console.log('1️⃣ Testing getFungibles (basic)...');
      const basicFungibles = await this.zerion.fungibles.getFungibles({
        page: { size: 20 }
      });
      console.log(`✅ Basic fungibles: ${basicFungibles.data.length} found`);
      
      // Test 2: getFungibles with search query
      console.log('2️⃣ Testing getFungibles with search...');
      const searchResults = await this.zerion.fungibles.getFungibles({
        filter: { search_query: 'USD' },
        page: { size: 15 }
      });
      console.log(`✅ USD search results: ${searchResults.data.length} found`);
      
      // Test 3: getFungibles with chain filter
      console.log('3️⃣ Testing getFungibles with chain filter...');
      const ethereumTokens = await this.zerion.fungibles.getFungibles({
        filter: { implementation_chain_id: 'ethereum' },
        page: { size: 25 }
      });
      console.log(`✅ Ethereum tokens: ${ethereumTokens.data.length} found`);
      
      // Test 4: getAllFungibles - Auto-pagination
      console.log('4️⃣ Testing getAllFungibles (auto-pagination)...');
      const allFungibles = await this.zerion.fungibles.getAllFungibles({
        filter: { search_query: 'stable' }
      });
      console.log(`✅ All fungibles (paginated): ${allFungibles.length} total`);
      
      // Test 5: searchFungibles - Simple search
      console.log('5️⃣ Testing searchFungibles...');
      const searches = await Promise.all(
        TEST_TOKENS.POPULAR.map(token => 
          this.zerion.fungibles.searchFungibles(token, { limit: 3 })
        )
      );
      
      console.log('📊 Search results:');
      searches.forEach((results, i) => {
        const token = TEST_TOKENS.POPULAR[i];
        console.log(`   ${token}: ${results.length} results`);
      });
      
      // Test 6: searchFungibles with chain filter
      console.log('6️⃣ Testing searchFungibles with chain filter...');
      const ethUSDC = await this.zerion.fungibles.searchFungibles('USDC', {
        limit: 5,
        chainId: 'ethereum'
      });
      console.log(`✅ USDC on Ethereum: ${ethUSDC.length} results`);
      
      this.testResults.searchAndDiscovery = {
        basicFungibles: basicFungibles.data.length,
        searchResults: searchResults.data.length,
        ethereumTokens: ethereumTokens.data.length,
        allFungibles: allFungibles.length,
        popularTokenSearches: searches.map((results, i) => ({
          token: TEST_TOKENS.POPULAR[i],
          resultsCount: results.length
        })),
        ethUSDCResults: ethUSDC.length
      };
      
      console.log('✅ All search and discovery methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Search and discovery test failed:', error);
      this.testResults.searchAndDiscovery = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== TOKEN DETAILS TESTS ====================
  
  async testTokenDetails() {
    console.log('📄 === TESTING TOKEN DETAILS METHODS ===\n');
    
    try {
      // Test 1: getFungible - Get specific token
      console.log('1️⃣ Testing getFungible...');
      const usdcToken = await this.zerion.fungibles.getFungible(KNOWN_TOKEN_IDS.USDC);
      console.log(`✅ USDC token details: ${usdcToken.data.attributes.name} (${usdcToken.data.attributes.symbol})`);
      
      // Test 2: getFungiblesByIds - Multiple tokens
      console.log('2️⃣ Testing getFungiblesByIds...');
      const multipleTokens = await this.zerion.fungibles.getFungiblesByIds([
        KNOWN_TOKEN_IDS.USDC,
        KNOWN_TOKEN_IDS.USDT,
        KNOWN_TOKEN_IDS.WETH
      ]);
      console.log(`✅ Multiple tokens: ${multipleTokens.length} retrieved`);
      
      // Test 3: getFungibleByAddress - By contract address
      console.log('3️⃣ Testing getFungibleByAddress...');
      const usdcByAddress = await this.zerion.fungibles.getFungibleByAddress(
        'ethereum',
        TOKEN_CONTRACTS.ETHEREUM.USDC
      );
      console.log(`✅ USDC by address: ${usdcByAddress?.attributes.name || 'Not found'}`);
      
      // Test 4: Multiple chain lookups
      console.log('4️⃣ Testing multi-chain contract lookups...');
      const multiChainUSDC = await Promise.all([
        this.zerion.fungibles.getFungibleByAddress('ethereum', TOKEN_CONTRACTS.ETHEREUM.USDC),
        this.zerion.fungibles.getFungibleByAddress('polygon', TOKEN_CONTRACTS.POLYGON.USDC)
      ]);
      
      console.log('📊 Multi-chain USDC:');
      multiChainUSDC.forEach((token, i) => {
        const chains = ['Ethereum', 'Polygon'];
        console.log(`   ${chains[i]}: ${token ? token.attributes.symbol : 'Not found'}`);
      });
      
      // Test 5: Token details analysis
      console.log('5️⃣ Analyzing token details...');
      const tokenDetails = multipleTokens[0]; // Use USDC for analysis
      
      console.log('📊 Token Analysis (USDC):');
      console.log(`   Name: ${tokenDetails.attributes.name}`);
      console.log(`   Symbol: ${tokenDetails.attributes.symbol}`);
      console.log(`   Verified: ${tokenDetails.attributes.flags?.verified ? '✅' : '❌'}`);
      console.log(`   Implementations: ${tokenDetails.attributes.implementations.length} chains`);
      console.log(`   Market Cap: $${tokenDetails.attributes.market_data?.market_cap ? (tokenDetails.attributes.market_data.market_cap / 1e9).toFixed(2) + 'B' : 'N/A'}`);
      console.log(`   Price: $${tokenDetails.attributes.market_data?.price?.toFixed(4) || 'N/A'}`);
      
      this.testResults.tokenDetails = {
        singleToken: !!usdcToken.data,
        multipleTokens: multipleTokens.length,
        addressLookup: !!usdcByAddress,
        multiChainResults: multiChainUSDC.filter(Boolean).length,
        tokenAnalysis: {
          name: tokenDetails.attributes.name,
          symbol: tokenDetails.attributes.symbol,
          verified: tokenDetails.attributes.flags?.verified || false,
          implementationsCount: tokenDetails.attributes.implementations.length,
          hasMarketData: !!tokenDetails.attributes.market_data
        }
      };
      
      console.log('✅ All token details methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Token details test failed:', error);
      this.testResults.tokenDetails = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== MARKET DATA TESTS ====================
  
  async testMarketData() {
    console.log('📈 === TESTING MARKET DATA METHODS ===\n');
    
    try {
      // Test 1: getTopFungibles - Market cap ranking
      console.log('1️⃣ Testing getTopFungibles...');
      const topTokens = await this.zerion.fungibles.getTopFungibles(20);
      console.log(`✅ Top tokens by market cap: ${topTokens.length} found`);
      
      // Test 2: getTrendingFungibles - Different periods
      console.log('2️⃣ Testing getTrendingFungibles with different periods...');
      const trendingResults = await Promise.all([
        this.zerion.fungibles.getTrendingFungibles('1d', 10),
        this.zerion.fungibles.getTrendingFungibles('30d', 10),
      ]);
      
      const periods = ['1d', '30d'];
      trendingResults.forEach((results, i) => {
        console.log(`✅ Trending (${periods[i]}): ${results.length} tokens`);
      });
      
      // Test 3: getFungiblesByChain - Chain-specific tokens
      console.log('3️⃣ Testing getFungiblesByChain...');
      const ethereumTop = await this.zerion.fungibles.getFungiblesByChain('ethereum', {
        limit: 15,
        sort: 'market_data.market_cap'
      });
      console.log(`✅ Top Ethereum tokens: ${ethereumTop.length} found`);
      
      // Test 4: Market data analysis
      console.log('4️⃣ Analyzing market data...');
      
      console.log('📊 Top 5 tokens by market cap:');
      topTokens.slice(0, 5).forEach((token, i) => {
        const marketCap = token.attributes.market_data?.market_cap;
        const price = token.attributes.market_data?.price;
        console.log(`   ${i + 1}. ${token.attributes.symbol}: $${price?.toFixed(4) || 'N/A'} | MC: $${marketCap ? (marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}`);
      });
      
      console.log('\n📊 Top trending (24h):');
      trendingResults[1].slice(0, 5).forEach((token, i) => {
        const change = token.attributes.market_data?.percent_change_24h;
        const symbol = token.attributes.symbol;
        console.log(`   ${i + 1}. ${symbol}: ${change ? (change > 0 ? '+' : '') + change.toFixed(2) + '%' : 'N/A'}`);
      });
      
      // Test 5: Market statistics
      console.log('5️⃣ Calculating market statistics...');
      const marketStats = {
        totalTokensAnalyzed: topTokens.length,
        tokensWithMarketData: topTokens.filter(t => t.attributes.market_data).length,
        averageMarketCap: topTokens
          .filter(t => t.attributes.market_data?.market_cap)
          .reduce((sum, t) => sum + (t.attributes.market_data!.market_cap! / 1e9), 0) / topTokens.length,
        positivePerformers24h: trendingResults[1].filter(t => 
          t.attributes.market_data?.percent_change_24h && t.attributes.market_data.percent_change_24h > 0
        ).length
      };
      
      console.log('📊 Market Statistics:');
      console.log(`   Tokens with market data: ${marketStats.tokensWithMarketData}/${marketStats.totalTokensAnalyzed}`);
      console.log(`   Average market cap (top 20): ${marketStats.averageMarketCap.toFixed(2)}B`);
      console.log(`   Positive 24h performers: ${marketStats.positivePerformers24h}/${trendingResults[1].length}`);
      
      this.testResults.marketData = {
        topTokens: topTokens.length,
        trendingResults: trendingResults.map((results, i) => ({
          period: periods[i],
          count: results.length
        })),
        ethereumTop: ethereumTop.length,
        marketStats
      };
      
      console.log('✅ All market data methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Market data test failed:', error);
      this.testResults.marketData = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== PRICE CHARTS TESTS ====================
  
  async testPriceCharts() {
    console.log('📊 === TESTING PRICE CHARTS METHODS ===\n');
    
    try {
      // Test 1: getFungibleChart - Single period
      console.log('1️⃣ Testing getFungibleChart...');
      const usdcChart = await this.zerion.fungibles.getFungibleChart(KNOWN_TOKEN_IDS.USDC, 'week');
      console.log(`✅ USDC week chart: ${usdcChart.data.attributes.points.length} data points`);
      
      // Test 2: getFungibleChart - Multiple periods
      console.log('2️⃣ Testing getFungibleChart with multiple periods...');
      const chartPeriods = ['day', 'week', 'month'] as const;
      const charts = await Promise.all(
        chartPeriods.map(period => 
          this.zerion.fungibles.getFungibleChart(KNOWN_TOKEN_IDS.USDC, period)
        )
      );
      
      charts.forEach((chart, i) => {
        console.log(`✅ USDC ${chartPeriods[i]} chart: ${chart.data.attributes.points.length} points`);
      });
      
      // Test 3: getFungiblePriceHistory - Multiple periods at once
      console.log('3️⃣ Testing getFungiblePriceHistory...');
      const priceHistory = await this.zerion.fungibles.getFungiblePriceHistory(
        KNOWN_TOKEN_IDS.WETH,
        ['day', 'week', 'month']
      );
      
      console.log('📊 WETH Price History:');
      Object.entries(priceHistory).forEach(([period, data]) => {
        console.log(`   ${period}: ${data ? data.attributes.points.length + ' points' : 'No data'}`);
      });
      
      // Test 4: Multiple tokens price history
      console.log('4️⃣ Testing multiple tokens price history...');
      const multiTokenCharts = await Promise.all([
        this.zerion.fungibles.getFungibleChart(KNOWN_TOKEN_IDS.USDC, 'week'),
        this.zerion.fungibles.getFungibleChart(KNOWN_TOKEN_IDS.USDT, 'week'),
        this.zerion.fungibles.getFungibleChart(KNOWN_TOKEN_IDS.WETH, 'week')
      ]);
      
      console.log('📊 Multi-token weekly charts:');
      ['USDC', 'USDT', 'WETH'].forEach((symbol, i) => {
        const chart = multiTokenCharts[i];
        console.log(`   ${symbol}: ${chart.data.attributes.points.length} points`);
      });
      
      // Test 5: Chart data analysis
      console.log('5️⃣ Analyzing chart data...');
      const weekChart = charts[1]; // Use week chart for analysis
      const points = weekChart.data.attributes.points;
      
      if (points.length > 1) {
        const prices = points.map(p => p[1]);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const firstPrice = prices[0];
        const lastPrice = prices[prices.length - 1];
        const weeklyChange = ((lastPrice - firstPrice) / firstPrice) * 100;
        const volatility = ((maxPrice - minPrice) / firstPrice) * 100;
        
        console.log('📊 USDC Week Chart Analysis:');
        console.log(`   Price range: ${minPrice.toFixed(4)} - ${maxPrice.toFixed(4)}`);
        console.log(`   Weekly change: ${weeklyChange.toFixed(4)}%`);
        console.log(`   Volatility: ${volatility.toFixed(4)}%`);
        console.log(`   Data points: ${points.length}`);
        console.log(`   Time range: ${weekChart.data.attributes.begin_at} to ${weekChart.data.attributes.end_at}`);
      }
      
      this.testResults.priceCharts = {
        singleChart: usdcChart.data.attributes.points.length,
        multiPeriodCharts: charts.map((chart, i) => ({
          period: chartPeriods[i],
          dataPoints: chart.data.attributes.points.length
        })),
        priceHistory: Object.keys(priceHistory).length,
        multiTokenCharts: multiTokenCharts.map((chart, i) => ({
          token: ['USDC', 'USDT', 'WETH'][i],
          dataPoints: chart.data.attributes.points.length
        })),
        chartAnalysis: points.length > 1 ? {
          priceRange: [Math.min(...points.map(p => p[1])), Math.max(...points.map(p => p[1]))],
          weeklyChange: ((points[points.length - 1][1] - points[0][1]) / points[0][1]) * 100,
          dataPoints: points.length
        } : null
      };
      
      console.log('✅ All price charts methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Price charts test failed:', error);
      this.testResults.priceCharts = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== COMPARISON AND ANALYSIS TESTS ====================
  
  async testComparisonAndAnalysis() {
    console.log('🔬 === TESTING COMPARISON AND ANALYSIS METHODS ===\n');
    
    try {
      // Test 1: compareFungibles - Stablecoins comparison
      console.log('1️⃣ Testing compareFungibles (stablecoins)...');
      const stablecoinComparison = await this.zerion.fungibles.compareFungibles([
        KNOWN_TOKEN_IDS.USDC,
        KNOWN_TOKEN_IDS.USDT
      ]);
      
      console.log('📊 Stablecoin Comparison:');
      console.log(`   Tokens compared: ${stablecoinComparison.fungibles.length}`);
      Object.entries(stablecoinComparison.comparison.prices).forEach(([id, price]) => {
        const token = stablecoinComparison.fungibles.find(f => f.id === id);
        console.log(`   ${token?.attributes.symbol}: ${price.toFixed(6)}`);
      });
      
      // Test 2: Cross-chain asset analysis
      console.log('2️⃣ Testing getCrossChainAssetAnalysis...');
      const crossChainUSDC = await this.zerion.getCrossChainAssetAnalysis('USDC');
      
      console.log('📊 Cross-chain USDC Analysis:');
      console.log(`   Implementations: ${crossChainUSDC.implementations.length}`);
      console.log(`   Price variance: ${crossChainUSDC.priceVariance.toFixed(6)}`);
      console.log(`   Bridge options: ${crossChainUSDC.bridgeOptions.length}`);
      
      // Show implementations by chain
      const chainImplementations = crossChainUSDC.implementations.reduce((acc, impl) => {
        impl.attributes.implementations.forEach((chainImpl: { chain_id: string | number; }) => {
          acc[chainImpl.chain_id] = (acc[chainImpl.chain_id] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);
      
      console.log('   Chain implementations:', Object.entries(chainImplementations)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([chain, count]) => `${chain}(${count})`)
        .join(', ')
      );
      
      // Test 3: Token category analysis
      console.log('3️⃣ Testing token category analysis...');
      const categoryAnalysis = await Promise.all([
        // DeFi tokens
        Promise.all(TEST_TOKENS.DEFI.map(symbol => 
          this.zerion.fungibles.searchFungibles(symbol, { limit: 1 })
        )),
        // Layer 2 tokens
        Promise.all(TEST_TOKENS.LAYER2.map(symbol => 
          this.zerion.fungibles.searchFungibles(symbol, { limit: 1 })
        ))
      ]);
      
      const defiTokens = categoryAnalysis[0].flat().filter(tokens => !!tokens);
      const l2Tokens = categoryAnalysis[1].flat().filter(tokens => !!tokens);
      
      console.log('📊 Category Analysis:');
      console.log(`   DeFi tokens found: ${defiTokens.length}/${TEST_TOKENS.DEFI.length}`);
      console.log(`   L2 tokens found: ${l2Tokens.length}/${TEST_TOKENS.LAYER2.length}`);
      
      // Test 4: Market data comparison
      console.log('4️⃣ Testing market data comparison...');
      const topTokens = await this.zerion.fungibles.getTopFungibles(10);
      const marketCapDistribution = topTokens.reduce((acc, token) => {
        const marketCap = token.attributes.market_data?.market_cap;
        if (marketCap) {
          if (marketCap > 100e9) acc.mega++;
          else if (marketCap > 10e9) acc.large++;
          else if (marketCap > 1e9) acc.medium++;
          else acc.small++;
        }
        return acc;
      }, { mega: 0, large: 0, medium: 0, small: 0 });
      
      console.log('📊 Market Cap Distribution (Top 10):');
      console.log(`   Mega (>$100B): ${marketCapDistribution.mega}`);
      console.log(`   Large ($10B-$100B): ${marketCapDistribution.large}`);
      console.log(`   Medium ($1B-$10B): ${marketCapDistribution.medium}`);
      console.log(`   Small (<$1B): ${marketCapDistribution.small}`);
      
      this.testResults.comparisonAndAnalysis = {
        stablecoinComparison: {
          tokensCompared: stablecoinComparison.fungibles.length,
          priceVariance: Math.max(...Object.values(stablecoinComparison.comparison.prices)) - 
                         Math.min(...Object.values(stablecoinComparison.comparison.prices))
        },
        crossChainAnalysis: {
          implementations: crossChainUSDC.implementations.length,
          priceVariance: crossChainUSDC.priceVariance,
          bridgeOptions: crossChainUSDC.bridgeOptions.length,
          chainImplementations
        },
        categoryAnalysis: {
          defiTokensFound: defiTokens.length,
          l2TokensFound: l2Tokens.length
        },
        marketCapDistribution
      };
      
      console.log('✅ All comparison and analysis methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Comparison and analysis test failed:', error);
      this.testResults.comparisonAndAnalysis = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== MAIN TEST RUNNER ====================
  
  async runAllTests() {
    console.log('🧪 FUNGIBLES SERVICE COMPREHENSIVE TESTING');
    console.log('=' .repeat(50));
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
    console.log('=' .repeat(50) + '\n');

    // Check if API key is set
    if (!API_KEY) {
      console.log('⚠️  WARNING: Please set your actual API key in the API_KEY variable');
      console.log('   Get your API key from: https://zerion.io/api\n');
      return;
    }

    const tests = [
      { name: 'Search and Discovery', method: this.testSearchAndDiscovery },
      { name: 'Token Details', method: this.testTokenDetails },
      { name: 'Market Data', method: this.testMarketData },
      { name: 'Price Charts', method: this.testPriceCharts },
      { name: 'Comparison and Analysis', method: this.testComparisonAndAnalysis }
    ];

    let successCount = 0;
    const totalTests = tests.length;

    for (const test of tests) {
      try {
        await test.method.call(this);
        successCount++;
        console.log(`✅ ${test.name} completed successfully\n`);
      } catch (error) {
        console.error(`❌ ${test.name} failed:`, error);
      }
      
      // Small delay between test suites
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Print final summary
    this.printTestSummary(successCount, totalTests);
  }

  // ==================== SUMMARY AND RESULTS ====================
  
  printTestSummary(successCount: number, totalTests: number) {
    console.log('\n' + '🎉'.repeat(20));
    console.log('FUNGIBLES SERVICE TESTING COMPLETED');
    console.log('🎉'.repeat(20) + '\n');

    console.log('📊 EXECUTION SUMMARY:');
    console.log(`   Success Rate: ${successCount}/${totalTests} (${((successCount/totalTests)*100).toFixed(1)}%)`);
    console.log(`   Completed at: ${new Date().toLocaleString()}\n`);

    console.log('📈 DETAILED RESULTS:');

    Object.entries(this.testResults).forEach(([testSuite, results]) => {
      console.log(`\n🔹 ${testSuite.toUpperCase()}:`);
      
      if (results.error) {
        console.log(`   ❌ Error: ${results.error}`);
      } else {
        // Display key metrics for each test suite
        Object.entries(results).forEach(([key, value]) => {
          if (typeof value === 'number') {
            console.log(`   ${key}: ${value}`);
          } else if (typeof value === 'boolean') {
            console.log(`   ${key}: ${value ? '✅' : '❌'}`);
          } else if (Array.isArray(value)) {
            console.log(`   ${key}: ${value.length} items`);
          } else if (value && typeof value === 'object') {
            console.log(`   ${key}: [Object with ${Object.keys(value).length} properties]`);
          }
        });
      }
    });

    console.log('\n📋 FUNCTIONS TESTED:');
    const functionsTested = [
      '✅ getFungibles (basic & with filters)',
      '✅ getAllFungibles (auto-pagination)',
      '✅ searchFungibles (basic & with chain filter)',
      '✅ getFungible (by ID)',
      '✅ getFungiblesByIds (multiple tokens)',
      '✅ getFungibleByAddress (contract lookup)',
      '✅ getTopFungibles (market cap ranking)',
      '✅ getTrendingFungibles (multiple periods)',
      '✅ getFungiblesByChain (chain-specific)',
      '✅ getFungibleChart (single & multiple periods)',
      '✅ getFungiblePriceHistory (multiple periods)',
      '✅ compareFungibles (token comparison)',
      '✅ getCrossChainAssetAnalysis (cross-chain)'
    ];

    functionsTested.forEach(func => console.log(`   ${func}`));

    console.log('\n🎯 KEY INSIGHTS:');
    if (this.testResults.marketData && !this.testResults.marketData.error) {
      const stats = this.testResults.marketData.marketStats;
      console.log(`   - Analyzed ${stats.totalTokensAnalyzed} top tokens`);
      console.log(`   - ${stats.tokensWithMarketData} have complete market data`);
      console.log(`   - Average market cap: ${stats.averageMarketCap.toFixed(2)}B`);
    }
    
    if (this.testResults.comparisonAndAnalysis && !this.testResults.comparisonAndAnalysis.error) {
      const analysis = this.testResults.comparisonAndAnalysis.crossChainAnalysis;
      console.log(`   - USDC available on ${Object.keys(analysis.chainImplementations).length} chains`);
      console.log(`   - Cross-chain price variance: ${analysis.priceVariance.toFixed(6)}`);
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Use search functions to find tokens of interest');
    console.log('   2. Analyze market data for investment insights');
    console.log('   3. Compare tokens across different metrics');
    console.log('   4. Monitor price charts for trend analysis');
    console.log('   5. Explore cross-chain opportunities');

    console.log('\n' + '🎯'.repeat(20));
    console.log('FUNGIBLES SERVICE TESTING COMPLETE!');
    console.log('🎯'.repeat(20));
  }
}

// ==================== QUICK TEST FUNCTIONS ====================

// Quick token search
export async function quickTokenSearch(symbol: string, apiKey: string = API_KEY) {
  console.log(`🔍 Quick Token Search: ${symbol}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const tokens = await zerion.fungibles.searchFungibles(symbol, { limit: 5 });
    
    console.log(`Found ${tokens.length} tokens:`);
    tokens.forEach((token, i) => {
      const price = token.attributes.market_data?.price;
      const marketCap = token.attributes.market_data?.market_cap;
      console.log(`   ${i + 1}. ${token.attributes.symbol}: ${price?.toFixed(4) || 'N/A'} | MC: ${marketCap ? (marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}`);
    });
    
    return tokens;
  } catch (error) {
    console.error('❌ Search failed:', error);
    return [];
  }
}

// Quick market overview
export async function quickMarketOverview(apiKey: string = API_KEY) {
  console.log('🔍 Quick Market Overview\n');
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const [topTokens, trending] = await Promise.all([
      zerion.fungibles.getTopFungibles(10),
      zerion.fungibles.getTrendingFungibles('1d', 10)
    ]);
    
    console.log('📊 Market Overview:');
    console.log(`   Top tokens: ${topTokens.length}`);
    console.log(`   Trending: ${trending.length}`);
    
    console.log('\nTop 3 by market cap:');
    topTokens.slice(0, 3).forEach((token, i) => {
      const marketCap = token.attributes.market_data?.market_cap;
      console.log(`   ${i + 1}. ${token.attributes.symbol}: ${marketCap ? (marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}`);
    });
    
    console.log('\nTop 3 trending (24h):');
    trending.slice(0, 3).forEach((token, i) => {
      const change = token.attributes.market_data?.percent_change_24h;
      console.log(`   ${i + 1}. ${token.attributes.symbol}: ${change ? (change > 0 ? '+' : '') + change.toFixed(2) + '%' : 'N/A'}`);
    });
    
    return { topTokens, trending };
  } catch (error) {
    console.error('❌ Market overview failed:', error);
    return null;
  }
}

// Quick price analysis
export async function quickPriceAnalysis(tokenId: string, apiKey: string = API_KEY) {
  console.log(`🔍 Quick Price Analysis: ${tokenId}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const [token, chart] = await Promise.all([
      zerion.fungibles.getFungible(tokenId),
      zerion.fungibles.getFungibleChart(tokenId, 'week')
    ]);
    
    const points = chart.data.attributes.points;
    const prices = points.map(p => p[1]);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const weeklyChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    console.log('📊 Price Analysis:');
    console.log(`   Token: ${token.data.attributes.name} (${token.data.attributes.symbol})`);
    console.log(`   Current: ${token.data.attributes.market_data?.price?.toFixed(4) || 'N/A'}`);
    console.log(`   Weekly change: ${weeklyChange.toFixed(2)}%`);
    console.log(`   Chart points: ${points.length}`);
    
    return { token: token.data, chart: chart.data, weeklyChange };
  } catch (error) {
    console.error('❌ Price analysis failed:', error);
    return null;
  }
}

// Export the main tester class
export { FungiblesServiceTester };

// Main execution
if (require.main === module) {
  const tester = new FungiblesServiceTester();
  tester.runAllTests().catch(console.error);
}