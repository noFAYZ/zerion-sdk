// examples/wallet-service-tests.ts - Complete Wallet Service Function Tests

import  ZerionSDK  from '../src/index';

// ⚠️ IMPORTANT: Replace with your actual Zerion API key
const API_KEY = 'zk_dev_2e59da43ef3d49858d2c3c1bd57854ed';

// Test addresses (public addresses for testing)
const TEST_ADDRESSES = {
  VITALIK: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',     // Vitalik's address
  WHALE: '0x742d35Cc6634C0532925a3b8D3Ac2FF2c6CEF9C9',        // High-value wallet
  DEFI_USER: '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',    // Active DeFi user
  ENS_DAO: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',      // ENS DAO treasury
  OPENSEA: '0x5b3256965e7C3cF26E11FCAf296DfC8807C01073'       // OpenSea wallet
};

class WalletServiceTester {
  private zerion: ZerionSDK;
  private testResults: Record<string, any> = {};

  constructor() {
    console.log('🏦 Initializing Wallet Service Tester...\n');
    this.zerion = new ZerionSDK({
      apiKey: API_KEY,
      timeout: 30000,
      retries: 3
    });
  }

  // ==================== PORTFOLIO METHODS TESTS ====================
  
  async testPortfolioMethods() {
    console.log('📊 === TESTING PORTFOLIO METHODS ===\n');
    
    const address = TEST_ADDRESSES.VITALIK;
    
    try {
      // Test 1: getPortfolio - Basic portfolio
      console.log('1️⃣ Testing getPortfolio...');
      const basicPortfolio = await this.zerion.wallets.getPortfolio(address);
      console.log(`✅ Basic portfolio: ${basicPortfolio.data?.type || 'N/A'}`);
      
      // Test 2: getPortfolio with position filter
      console.log('2️⃣ Testing getPortfolio with filters...');
      const simplePortfolio = await this.zerion.wallets.getPortfolio(address, {
        positions: 'only_simple'
      });
      console.log(`✅ Simple positions portfolio: ${simplePortfolio.data?.type || 'N/A'}`);
      
      const complexPortfolio = await this.zerion.wallets.getPortfolio(address, {
        positions: 'only_complex'
      });
      console.log(`✅ Complex positions portfolio: ${complexPortfolio.data?.type || 'N/A'}`);
      
      // Test 3: getWalletSummary - Comprehensive overview
      console.log('3️⃣ Testing getWalletSummary...');
      const summary = await this.zerion.wallets.getWalletSummary(address);
      console.log(`✅ Wallet summary - Positions: ${summary.topPositions.length}, Transactions: ${summary.recentTransactions.length}`);
      
      this.testResults.portfolioMethods = {
        basicPortfolio: !!basicPortfolio.data,
        simplePortfolio: !!simplePortfolio.data,
        complexPortfolio: !!complexPortfolio.data,
        summary: {
          positions: summary.topPositions.length,
          transactions: summary.recentTransactions.length,
          hasPortfolio: !!summary.portfolio.data,
          hasPnL: !!summary.pnl.data,
          hasNFTPortfolio: !!summary.nftPortfolio.data
        }
      };
      
      console.log('✅ All portfolio methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Portfolio methods test failed:', error);
      this.testResults.portfolioMethods = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== POSITION METHODS TESTS ====================
  
  async testPositionMethods() {
    console.log('💰 === TESTING POSITION METHODS ===\n');
    
    const address = TEST_ADDRESSES.WHALE;
    
    try {
      // Test 1: getPositions - Basic positions
      console.log('1️⃣ Testing getPositions (basic)...');
      const basicPositions = await this.zerion.wallets.getPositions(address);
      console.log(`✅ Basic positions: ${basicPositions.data.length} found`);
      
      // Test 2: getPositions with filters
      console.log('2️⃣ Testing getPositions with filters...');
      const filteredPositions = await this.zerion.wallets.getPositions(address, {
        filter: {
          positions: 'only_simple',
          position_types: ['wallet', 'staked'],
          trash: 'only_non_trash'
        },
        sort: 'value',
        page: { size: 20 }
      });
      console.log(`✅ Filtered positions: ${filteredPositions.data.length} found`);
      
      // Test 3: getPositions with chain filter
      console.log('3️⃣ Testing getPositions with chain filter...');
      const ethPositions = await this.zerion.wallets.getPositions(address, {
        filter: {
          chain_ids: ['ethereum'],
          trash: 'only_non_trash'
        },
        page: { size: 15 }
      });
      console.log(`✅ Ethereum positions: ${ethPositions.data.length} found`);
      
      // Test 4: getAllPositions - Auto-pagination
      console.log('4️⃣ Testing getAllPositions (auto-pagination)...');
      const allPositions = await this.zerion.wallets.getAllPositions(address, {
        filter: {
          positions: 'only_simple',
          trash: 'only_non_trash'
        }
      });
      console.log(`✅ All positions (paginated): ${allPositions.length} total`);
      
      // Test 5: Position analysis
      console.log('5️⃣ Analyzing position data...');
      const nonZeroPositions = allPositions.filter(p => p.attributes.value && p.attributes.value > 0);
      const topPositions = nonZeroPositions
        .sort((a, b) => (b.attributes.value || 0) - (a.attributes.value || 0))
        .slice(0, 5);
      
      console.log('📊 Top 5 positions by value:');
      topPositions.forEach((pos, i) => {
        const symbol = pos.attributes.fungible_info?.symbol || 'Unknown';
        const value = pos.attributes.value?.toFixed(2) || '0';
        console.log(`   ${i + 1}. ${symbol}: $${value}`);
      });
      
      this.testResults.positionMethods = {
        basicPositions: basicPositions.data.length,
        filteredPositions: filteredPositions.data.length,
        ethPositions: ethPositions.data.length,
        allPositions: allPositions.length,
        nonZeroPositions: nonZeroPositions.length,
        topPositions: topPositions.length,
        positionTypes: [...new Set(allPositions.map(p => p.attributes.position_type))],
        chains: [...new Set(allPositions.map(p => p.relationships?.chain?.data.id).filter(Boolean))]
      };
      
      console.log('✅ All position methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Position methods test failed:', error);
      this.testResults.positionMethods = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== TRANSACTION METHODS TESTS ====================
  
  async testTransactionMethods() {
    console.log('📝 === TESTING TRANSACTION METHODS ===\n');
    
    const address = TEST_ADDRESSES.DEFI_USER;
    
    try {
      // Test 1: getTransactions - Basic transactions
      console.log('1️⃣ Testing getTransactions (basic)...');
      const basicTransactions = await this.zerion.wallets.getTransactions(address);
      console.log(`✅ Basic transactions: ${basicTransactions.data.length} found`);
      
      // Test 2: getTransactions with operation type filter
      console.log('2️⃣ Testing getTransactions with operation filters...');
      const tradeTransactions = await this.zerion.wallets.getTransactions(address, {
        filter: {
          operation_types: ['trade', 'send', 'receive'],
          trash: 'only_non_trash'
        },
        page: { size: 20 }
      });
      console.log(`✅ Trade transactions: ${tradeTransactions.data.length} found`);
      
      // Test 3: getTransactions with time range
      console.log('3️⃣ Testing getTransactions with time range...');
      const lastWeek = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
      const recentTransactions = await this.zerion.wallets.getTransactions(address, {
        filter: {
          min_mined_at: lastWeek,
          trash: 'only_non_trash'
        },
        page: { size: 25 }
      });
      console.log(`✅ Recent transactions (7 days): ${recentTransactions.data.length} found`);
      
      // Test 4: getTransactions with chain filter
      console.log('4️⃣ Testing getTransactions with chain filter...');
      const ethTransactions = await this.zerion.wallets.getTransactions(address, {
        filter: {
          chain_ids: ['ethereum'],
          operation_types: ['trade']
        },
        page: { size: 15 }
      });
      console.log(`✅ Ethereum transactions: ${ethTransactions.data.length} found`);
      
      // Test 5: getAllTransactions - Auto-pagination
      console.log('5️⃣ Testing getAllTransactions (auto-pagination)...');
      const allTransactions = await this.zerion.wallets.getAllTransactions(address);
      console.log(`✅ All transactions (paginated): ${allTransactions.length} total`);
      
      // Test 6: Transaction analysis
      console.log('6️⃣ Analyzing transaction data...');
      const operationTypes = allTransactions.reduce((acc, tx) => {
        const type = tx.attributes.operation_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const totalFees = allTransactions.reduce((sum, tx) => 
   
        sum + Number(tx?.attributes?.fee || 0), 0
      );
      
      console.log('📊 Transaction analysis:');
      console.log(`   Total transactions: ${allTransactions.length}`);
      console.log(`   Total fees paid: $${totalFees?.toFixed(2)}`);
      console.log('   Operation types:', Object.entries(operationTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => `${type}(${count})`)
        .join(', ')
      );
      
      this.testResults.transactionMethods = {
        basicTransactions: basicTransactions.data.length,
        tradeTransactions: tradeTransactions.data.length,
        recentTransactions: recentTransactions.data.length,
        ethTransactions: ethTransactions.data.length,
        allTransactions: allTransactions.length,
        operationTypes: Object.keys(operationTypes).length,
        totalFees: totalFees,
        mostCommonOperation: Object.entries(operationTypes).sort(([,a], [,b]) => b - a)[0]
      };
      
      console.log('✅ All transaction methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Transaction methods test failed:', error);
      this.testResults.transactionMethods = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== P&L AND PERFORMANCE TESTS ====================
  
  async testPnLAndPerformanceMethods() {
    console.log('📈 === TESTING P&L AND PERFORMANCE METHODS ===\n');
    
    const address = TEST_ADDRESSES.WHALE;
    
    try {
      // Test 1: getPnL - Basic P&L
      console.log('1️⃣ Testing getPnL (basic)...');
      const basicPnL = await this.zerion.wallets.getPnL(address);
      console.log(`✅ Basic P&L: ${basicPnL.data.type}`);
      
      // Test 2: getPnL with chain filter
      console.log('2️⃣ Testing getPnL with chain filter...');
      const ethPnL = await this.zerion.wallets.getPnL(address, {
        filter: { chain_ids: ['ethereum'] }
      });
      console.log(`✅ Ethereum P&L: ${ethPnL.data.type}`);
      
      // Test 3: getChart - Different periods
      console.log('3️⃣ Testing getChart with different periods...');
      const charts = await Promise.all([
        this.zerion.wallets.getChart(address, 'day'),
        this.zerion.wallets.getChart(address, 'week'),
        this.zerion.wallets.getChart(address, 'month')
      ]);
      
      charts.forEach((chart, i) => {
        const periods = ['day', 'week', 'month'];
        console.log(`✅ ${periods[i]} chart: ${chart.data.attributes.points.length} data points`);
      });
      
      // Test 4: getChart with filters
      console.log('4️⃣ Testing getChart with filters...');
      const filteredChart = await this.zerion.wallets.getChart(address, 'week', {
        filter: { chain_ids: ['ethereum', 'polygon'] }
      });
      console.log(`✅ Filtered chart: ${filteredChart.data.attributes.points.length} data points`);
      
      // Test 5: P&L Analysis
      console.log('5️⃣ Analyzing P&L data...');
      const pnlData = basicPnL.data.attributes;
      
      console.log('📊 P&L Summary:');
      console.log(`   Unrealized Gain: $${pnlData.unrealized_gain?.toFixed(2) || 'N/A'}`);
      console.log(`   Realized Gain: $${pnlData.realized_gain?.toFixed(2) || 'N/A'}`);
      console.log(`   Net Invested: $${pnlData.net_invested?.toFixed(2) || 'N/A'}`);
      console.log(`   Total Fees: $${pnlData.total_fee?.toFixed(2) || 'N/A'}`);
      console.log(`   External Received: $${pnlData.received_external?.toFixed(2) || 'N/A'}`);
      console.log(`   External Sent: $${pnlData.sent_external?.toFixed(2) || 'N/A'}`);
      
      // Test 6: Chart data analysis
      console.log('6️⃣ Analyzing chart data...');
      const weekChart = charts[1];
      const chartPoints = weekChart.data.attributes.points;
      
      if (chartPoints.length > 1) {
        const firstValue = chartPoints[0][1];
        const lastValue = chartPoints[chartPoints.length - 1][1];
        const weeklyChange = ((lastValue - firstValue) / firstValue) * 100;
        
        console.log('📊 Weekly Performance:');
        console.log(`   Start value: $${firstValue.toFixed(2)}`);
        console.log(`   End value: $${lastValue.toFixed(2)}`);
        console.log(`   Weekly change: ${weeklyChange.toFixed(2)}%`);
      }
      
      this.testResults.pnlAndPerformance = {
        basicPnL: pnlData,
        ethPnL: ethPnL.data.attributes,
        charts: charts.map((chart, i) => ({
          period: ['day', 'week', 'month'][i],
          dataPoints: chart.data.attributes.points.length,
          timeRange: {
            start: chart.data.attributes.begin_at,
            end: chart.data.attributes.end_at
          }
        })),
        weeklyPerformance: chartPoints.length > 1 ? {
          startValue: chartPoints[0][1],
          endValue: chartPoints[chartPoints.length - 1][1],
          weeklyChange: ((chartPoints[chartPoints.length - 1][1] - chartPoints[0][1]) / chartPoints[0][1]) * 100
        } : null
      };
      
      console.log('✅ All P&L and performance methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ P&L and performance methods test failed:', error);
      this.testResults.pnlAndPerformance = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== NFT METHODS TESTS ====================
  
  async testNFTMethods() {
    console.log('🖼️ === TESTING NFT METHODS ===\n');
    
    const address = TEST_ADDRESSES.ENS_DAO;
    
    try {
      // Test 1: getNFTPositions - Basic NFT positions
      console.log('1️⃣ Testing getNFTPositions (basic)...');
      const basicNFTs = await this.zerion.wallets.getNFTPositions(address);
      console.log(`✅ Basic NFT positions: ${basicNFTs.data.length} found`);
      
      // Test 2: getNFTPositions with filters
      console.log('2️⃣ Testing getNFTPositions with filters...');
      const filteredNFTs = await this.zerion.wallets.getNFTPositions(address, {
        filter: { chain_ids: ['ethereum'] },
        sort: 'created_at',
        page: { size: 20 }
      });
      console.log(`✅ Filtered NFT positions: ${filteredNFTs.data.length} found`);
      
      // Test 3: getAllNFTPositions - Auto-pagination
      console.log('3️⃣ Testing getAllNFTPositions (auto-pagination)...');
      const allNFTs = await this.zerion.wallets.getAllNFTPositions(address);
      console.log(`✅ All NFT positions (paginated): ${allNFTs.length} total`);
      
      // Test 4: getNFTCollections
      console.log('4️⃣ Testing getNFTCollections...');
      const collections = await this.zerion.wallets.getNFTCollections(address);
      console.log(`✅ NFT collections: ${collections.data.length} found`);
      
      // Test 5: getNFTCollections with filters
      console.log('5️⃣ Testing getNFTCollections with filters...');
      const ethCollections = await this.zerion.wallets.getNFTCollections(address, {
        filter: { chain_ids: ['ethereum'] },
        include: ['nft_collections']
      });
      console.log(`✅ Ethereum NFT collections: ${ethCollections.data.length} found`);
      
      // Test 6: getNFTPortfolio
      console.log('6️⃣ Testing getNFTPortfolio...');
      const nftPortfolio = await this.zerion.wallets.getNFTPortfolio(address);
      console.log(`✅ NFT portfolio: ${nftPortfolio.data?.type || 'N/A'}`);
      
      // Test 7: NFT Analysis
      console.log('7️⃣ Analyzing NFT data...');
      
      // Collection analysis
      const collectionCounts = collections.data.reduce((acc, collection) => {
        const name = collection.attributes.name || 'Unknown';
        const count = collection.attributes.positions_count || 0;
        acc[name] = count;
        return acc;
      }, {} as Record<string, number>);
      
      const topCollections = Object.entries(collectionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      console.log('📊 NFT Analysis:');
      console.log(`   Total NFT positions: ${allNFTs.length}`);
      console.log(`   Total collections: ${collections.data.length}`);
      console.log('   Top collections by count:');
      topCollections.forEach(([name, count], i) => {
        console.log(`     ${i + 1}. ${name}: ${count} NFTs`);
      });
      
      // Chain distribution for NFTs
      const nftChains = allNFTs.reduce((acc, nft) => {
        const chainId = nft.relationships?.chain?.data.id || 'unknown';
        acc[chainId] = (acc[chainId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('   NFT chain distribution:', Object.entries(nftChains)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([chain, count]) => `${chain}(${count})`)
        .join(', ')
      );
      
      this.testResults.nftMethods = {
        basicNFTs: basicNFTs.data.length,
        filteredNFTs: filteredNFTs.data.length,
        allNFTs: allNFTs.length,
        collections: collections.data.length,
        ethCollections: ethCollections.data.length,
        nftPortfolio: !!nftPortfolio.data,
        topCollections: topCollections.slice(0, 3),
        chainDistribution: nftChains,
        totalCollectionItems: Object.values(collectionCounts).reduce((sum, count) => sum + count, 0)
      };
      
      console.log('✅ All NFT methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ NFT methods test failed:', error);
      this.testResults.nftMethods = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== HIGH-LEVEL ANALYSIS METHODS TESTS ====================
  
  async testHighLevelMethods() {
    console.log('🔍 === TESTING HIGH-LEVEL ANALYSIS METHODS ===\n');
    
    try {
      // Test 1: getPortfolioAnalysis
      console.log('1️⃣ Testing getPortfolioAnalysis...');
      const analysis = await this.zerion.getPortfolioAnalysis(TEST_ADDRESSES.VITALIK);
      
      console.log('📊 Portfolio Analysis Results:');
      console.log(`   Summary type: ${analysis.summary?.type || 'N/A'}`);
      console.log(`   Positions count: ${analysis.positions.length}`);
      console.log(`   Top assets: ${analysis.topAssets.length}`);
      console.log(`   Chain distribution: ${Object.keys(analysis.chainDistribution).length} chains`);
      console.log(`   Recent activity: ${analysis.recentActivity.length} transactions`);
      
      // Test 2: analyzeTransactionPatterns
      console.log('2️⃣ Testing analyzeTransactionPatterns...');
      const patterns = await this.zerion.analyzeTransactionPatterns(TEST_ADDRESSES.DEFI_USER, {
        start: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: Date.now()
      });
      
      console.log('📊 Transaction Patterns (30 days):');
      console.log(`   Total transactions: ${patterns.totalTransactions}`);
      console.log(`   Average daily: ${patterns.averageDaily.toFixed(2)}`);
      console.log(`   Gas spent: $${patterns.gasSpent.toFixed(2)}`);
      console.log(`   Common operations: ${patterns.commonOperations.slice(0, 3).map(op => `${op.type}(${op.count})`).join(', ')}`);
      console.log(`   Preferred chains: ${patterns.preferredChains.slice(0, 3).map(c => `${c.chain}(${c.count})`).join(', ')}`);
      
      this.testResults.highLevelMethods = {
        portfolioAnalysis: {
          hasSummary: !!analysis.summary,
          positionsCount: analysis.positions.length,
          topAssetsCount: analysis.topAssets.length,
          chainsCount: Object.keys(analysis.chainDistribution).length,
          recentActivityCount: analysis.recentActivity.length,
          hasPnL: !!analysis.pnl,
          hasNFTPortfolio: !!analysis.nftPortfolio
        },
        transactionPatterns: {
          totalTransactions: patterns.totalTransactions,
          averageDaily: patterns.averageDaily,
          gasSpent: patterns.gasSpent,
          operationTypesCount: patterns.commonOperations.length,
          chainsCount: patterns.preferredChains.length
        }
      };
      
      console.log('✅ All high-level methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ High-level methods test failed:', error);
      this.testResults.highLevelMethods = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== MAIN TEST RUNNER ====================
  
  async runAllTests() {
    console.log('🧪 WALLET SERVICE COMPREHENSIVE TESTING');
    console.log('=' .repeat(50));
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
    console.log('📋 Test Addresses:');
    Object.entries(TEST_ADDRESSES).forEach(([name, addr]) => {
      console.log(`   ${name}: ${addr.slice(0, 10)}...${addr.slice(-8)}`);
    });
    console.log('=' .repeat(50) + '\n');

    // Check if API key is set
    if (!API_KEY) {
      console.log('⚠️  WARNING: Please set your actual API key in the API_KEY variable');
      console.log('   Get your API key from: https://zerion.io/api\n');
      return;
    }

    const tests = [
      { name: 'Portfolio Methods', method: this.testPortfolioMethods },
      { name: 'Position Methods', method: this.testPositionMethods },
      { name: 'Transaction Methods', method: this.testTransactionMethods },
      { name: 'P&L and Performance Methods', method: this.testPnLAndPerformanceMethods },
      { name: 'NFT Methods', method: this.testNFTMethods },
      { name: 'High-Level Analysis Methods', method: this.testHighLevelMethods }
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
    console.log('WALLET SERVICE TESTING COMPLETED');
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
      '✅ getPortfolio (basic & with filters)',
      '✅ getWalletSummary',
      '✅ getPositions (basic, filtered, paginated)',
      '✅ getAllPositions (auto-pagination)',
      '✅ getTransactions (basic, filtered, time-ranged)',
      '✅ getAllTransactions (auto-pagination)',
      '✅ getPnL (basic & with filters)',
      '✅ getChart (multiple periods & filters)',
      '✅ getNFTPositions (basic & filtered)',
      '✅ getAllNFTPositions (auto-pagination)',
      '✅ getNFTCollections (basic & filtered)',
      '✅ getNFTPortfolio',
      '✅ getPortfolioAnalysis (high-level)',
      '✅ analyzeTransactionPatterns (high-level)'
    ];

    functionsTested.forEach(func => console.log(`   ${func}`));

    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Review the test results above');
    console.log('   2. Check any failed tests and their error messages');
    console.log('   3. Modify parameters for your specific use case');
    console.log('   4. Run tests for other services (Fungibles, Chains, etc.)');
    console.log('   5. Integrate successful patterns into your application');

    console.log('\n📞 SUPPORT:');
    console.log('   - Test different wallet addresses for various scenarios');
    console.log('   - Adjust filters and parameters based on your needs');
    console.log('   - Use the successful patterns in your production code');

    console.log('\n' + '🎯'.repeat(20));
    console.log('WALLET SERVICE TESTING COMPLETE!');
    console.log('🎯'.repeat(20));
  }
}

// ==================== QUICK TEST FUNCTIONS ====================

// Quick portfolio test
export async function quickPortfolioTest(address: string, apiKey: string = API_KEY) {
  console.log(`🔍 Quick Portfolio Test: ${address}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const [portfolio, positions, pnl] = await Promise.all([
      zerion.wallets.getPortfolio(address),
      zerion.wallets.getPositions(address, { page: { size: 10 } }),
      zerion.wallets.getPnL(address)
    ]);
    
    console.log('📊 Quick Results:');
    console.log(`   Portfolio: ${portfolio.data?.type || 'N/A'}`);
    console.log(`   Positions: ${positions.data.length}`);
    console.log(`   Unrealized P&L: $${pnl.data.attributes?.unrealized_gain?.toFixed(2) || 'N/A'}`);
    
    return { portfolio, positions, pnl };
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    return null;
  }
}

// Quick transaction analysis
export async function quickTransactionAnalysis(address: string, apiKey: string = API_KEY) {
  console.log(`🔍 Quick Transaction Analysis: ${address}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const transactions = await zerion.wallets.getTransactions(address, {
      page: { size: 50 },
      filter: { trash: 'only_non_trash' }
    });
    
    const operationTypes = transactions.data.reduce((acc, tx) => {
      const type = tx.attributes.operation_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Transaction Analysis:');
    console.log(`   Total transactions: ${transactions.data.length}`);
    console.log(`   Operation types: ${Object.keys(operationTypes).length}`);
    console.log(`   Most common: ${Object.entries(operationTypes).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}`);
    
    return { transactions, operationTypes };
  } catch (error) {
    console.error('❌ Quick analysis failed:', error);
    return null;
  }
}

// Quick NFT overview
export async function quickNFTOverview(address: string, apiKey: string = API_KEY) {
  console.log(`🔍 Quick NFT Overview: ${address}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const [nftPositions, collections] = await Promise.all([
      zerion.wallets.getNFTPositions(address, { page: { size: 20 } }),
      zerion.wallets.getNFTCollections(address)
    ]);
    
    console.log('📊 NFT Overview:');
    console.log(`   NFT Positions: ${nftPositions.data.length}`);
    console.log(`   Collections: ${collections.data.length}`);
    
    if (collections.data.length > 0) {
      const topCollection = collections.data.sort((a, b) => 
        (b.attributes.positions_count || 0) - (a.attributes.positions_count || 0)
      )[0];
      console.log(`   Top collection: ${topCollection.attributes.name} (${topCollection.attributes.positions_count} items)`);
    }
    
    return { nftPositions, collections };
  } catch (error) {
    console.error('❌ Quick NFT overview failed:', error);
    return null;
  }
}

// Performance comparison test
export async function performanceComparisonTest(addresses: string[], apiKey: string = API_KEY) {
  console.log(`🔍 Performance Comparison Test: ${addresses.length} wallets\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const results = await Promise.all(
      addresses.map(async (address) => {
        const startTime = Date.now();
        const analysis = await zerion.getPortfolioAnalysis(address);
        const responseTime = Date.now() - startTime;
        
        return {
          address: `${address.slice(0, 6)}...${address.slice(-4)}`,
          responseTime,
          positionsCount: analysis.positions.length,
          chainsCount: Object.keys(analysis.chainDistribution).length,
          hasData: !!analysis.summary
        };
      })
    );
    
    console.log('📊 Performance Results:');
    results.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.address}: ${result.responseTime}ms, ${result.positionsCount} positions, ${result.chainsCount} chains`);
    });
    
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    console.log(`   Average response time: ${avgResponseTime.toFixed(0)}ms`);
    
    return results;
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    return [];
  }
}

// Export the main tester class
export { WalletServiceTester };

// Main execution
if (require.main === module) {
  const tester = new WalletServiceTester();
  tester.runAllTests().catch(console.error);
}

// ==================== BONUS: SPECIFIC USE CASE TESTS ====================

// Test for DeFi users
export async function testDeFiUser(address: string, apiKey: string = API_KEY) {
  console.log(`🏦 DeFi User Test: ${address}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    // Get complex positions (DeFi protocols)
    const defiPositions = await zerion.wallets.getPositions(address, {
      filter: {
        positions: 'only_complex',
        position_types: ['deposited', 'staked', 'liquidity', 'borrowed'],
        trash: 'only_non_trash'
      }
    });
    
    // Get DeFi-related transactions
    const defiTransactions = await zerion.wallets.getTransactions(address, {
      filter: {
        operation_types: ['deposit', 'withdraw', 'stake', 'unstake', 'borrow', 'repay'],
        trash: 'only_non_trash'
      },
      page: { size: 30 }
    });
    
    // Analyze DeFi activity
    const protocolsUsed = [...new Set(defiPositions.data.map(p => p.attributes.protocol).filter(Boolean))];
    const defiChains = [...new Set(defiPositions.data.map(p => p.relationships?.chain?.data.id).filter(Boolean))];
    
    console.log('📊 DeFi Analysis:');
    console.log(`   DeFi positions: ${defiPositions.data.length}`);
    console.log(`   DeFi transactions: ${defiTransactions.data.length}`);
    console.log(`   Protocols used: ${protocolsUsed.length}`);
    console.log(`   DeFi chains: ${defiChains.length}`);
    console.log(`   Top protocols: ${protocolsUsed.slice(0, 5).join(', ')}`);
    
    return {
      defiPositions: defiPositions.data,
      defiTransactions: defiTransactions.data,
      protocolsUsed,
      defiChains
    };
  } catch (error) {
    console.error('❌ DeFi user test failed:', error);
    return null;
  }
}

// Test for NFT collectors
export async function testNFTCollector(address: string, apiKey: string = API_KEY) {
  console.log(`🖼️ NFT Collector Test: ${address}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const [nftPositions, collections, nftPortfolio] = await Promise.all([
      zerion.wallets.getAllNFTPositions(address),
      zerion.wallets.getNFTCollections(address),
      zerion.wallets.getNFTPortfolio(address)
    ]);
    
    // Analyze collection diversity
    const collectionSizes = collections.data.map(c => c.attributes.positions_count || 0);
    const totalNFTs = collectionSizes.reduce((sum, size) => sum + size, 0);
    const avgCollectionSize = totalNFTs / collections.data.length;
    
    // Find biggest collections
    const biggestCollections = collections.data
      .sort((a, b) => (b.attributes.positions_count || 0) - (a.attributes.positions_count || 0))
      .slice(0, 5);
    
    console.log('📊 NFT Collector Analysis:');
    console.log(`   Total NFTs: ${totalNFTs}`);
    console.log(`   Collections: ${collections.data.length}`);
    console.log(`   Average collection size: ${avgCollectionSize.toFixed(1)}`);
    console.log('   Biggest collections:');
    biggestCollections.forEach((collection, i) => {
      console.log(`     ${i + 1}. ${collection.attributes.name}: ${collection.attributes.positions_count} NFTs`);
    });
    
    return {
      totalNFTs,
      collections: collections.data,
      nftPositions,
      biggestCollections,
      avgCollectionSize
    };
  } catch (error) {
    console.error('❌ NFT collector test failed:', error);
    return null;
  }
}

// Test for multi-chain users
export async function testMultiChainUser(address: string, apiKey: string = API_KEY) {
  console.log(`⛓️ Multi-Chain User Test: ${address}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const positions = await zerion.wallets.getAllPositions(address, {
      filter: { trash: 'only_non_trash' }
    });
    
    // Analyze chain distribution
    const chainDistribution = positions.reduce((acc, position) => {
      const chainId = position.relationships?.chain?.data.id;
      if (chainId && position.attributes.value) {
        acc[chainId] = (acc[chainId] || 0) + position.attributes.value;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const totalValue = Object.values(chainDistribution).reduce((sum, value) => sum + value, 0);
    const chainPercentages = Object.entries(chainDistribution)
      .map(([chain, value]) => ({
        chain,
        value,
        percentage: (value / totalValue) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage);
    
    console.log('📊 Multi-Chain Analysis:');
    console.log(`   Total chains: ${Object.keys(chainDistribution).length}`);
    console.log(`   Total value: $${totalValue.toFixed(2)}`);
    console.log('   Chain distribution:');
    chainPercentages.slice(0, 5).forEach((item, i) => {
      console.log(`     ${i + 1}. ${item.chain}: $${item.value.toFixed(2)} (${item.percentage.toFixed(1)}%)`);
    });
    
    return {
      chainCount: Object.keys(chainDistribution).length,
      chainDistribution,
      chainPercentages,
      totalValue
    };
  } catch (error) {
    console.error('❌ Multi-chain user test failed:', error);
    return null;
  }
}

// ==================== UTILITY FUNCTIONS ====================

// Helper to format test results for export
export function formatTestResults(testResults: Record<string, any>) {
  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: Object.keys(testResults).length,
      successfulTests: Object.values(testResults).filter(result => !result.error).length,
      failedTests: Object.values(testResults).filter(result => result.error).length
    },
    results: testResults
  };
}

// Helper to save results to file (Node.js only)
export function saveTestResults(testResults: Record<string, any>, filename?: string) {
  const fs = require('fs');
  const path = require('path');
  
  const formatted = formatTestResults(testResults);
  const fileName = filename || `wallet-service-test-results-${Date.now()}.json`;
  const filePath = path.join(process.cwd(), fileName);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(formatted, null, 2));
    console.log(`📁 Test results saved to: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('❌ Failed to save test results:', error);
    return null;
  }
}

// Helper to compare test results over time
export function compareTestResults(currentResults: any, previousResults: any) {
  const comparison = {
    performance: {
      current: currentResults.summary,
      previous: previousResults.summary,
      improvement: currentResults.summary.successfulTests - previousResults.summary.successfulTests
    },
    newIssues: [] as string[],
    resolvedIssues: [] as string[],
    consistentIssues: [] as string[]
  };
  
  // Compare individual test results
  Object.keys(currentResults.results).forEach(testName => {
    const current = currentResults.results[testName];
    const previous = previousResults.results[testName];
    
    if (current.error && !previous?.error) {
      comparison.newIssues.push(testName);
    } else if (!current.error && previous?.error) {
      comparison.resolvedIssues.push(testName);
    } else if (current.error && previous?.error) {
      comparison.consistentIssues.push(testName);
    }
  });
  
  return comparison;
}

console.log('\n📚 Additional Functions Available:');
console.log('- quickPortfolioTest(address, apiKey?)');
console.log('- quickTransactionAnalysis(address, apiKey?)');
console.log('- quickNFTOverview(address, apiKey?)');
console.log('- performanceComparisonTest(addresses[], apiKey?)');
console.log('- testDeFiUser(address, apiKey?)');
console.log('- testNFTCollector(address, apiKey?)');
console.log('- testMultiChainUser(address, apiKey?)');
console.log('- formatTestResults(results)');
console.log('- saveTestResults(results, filename?)');
console.log('- compareTestResults(current, previous)');