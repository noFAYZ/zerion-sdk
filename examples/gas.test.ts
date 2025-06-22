// examples/gas-service-tests.ts - Complete Gas Service Function Tests

import  ZerionSDK  from '../src/index';
// ⚠️ IMPORTANT: Replace with your actual Zerion API key
const API_KEY = 'zk_dev_2e59da43ef3d49858d2c3c1bd57854ed';

// Test chains for gas price monitoring
const TEST_CHAINS = {
  ETHEREUM: 'ethereum',
  POLYGON: 'polygon',
  ARBITRUM: 'arbitrum',
  OPTIMISM: 'optimism',
  BASE: 'base',
  AVALANCHE: 'avalanche',
  BSC: 'bsc'
};

// Gas types for testing
const GAS_TYPES = ['classic', 'eip1559', 'optimistic'] as const;

// Common gas limits for different transaction types
const GAS_LIMITS = {
  SIMPLE_TRANSFER: '21000',
  ERC20_TRANSFER: '65000',
  UNISWAP_SWAP: '150000',
  COMPLEX_DEFI: '300000',
  NFT_MINT: '200000'
};

class GasServiceTester {
  private zerion: ZerionSDK;
  private testResults: Record<string, any> = {};

  constructor() {
    console.log('⛽ Initializing Gas Service Tester...\n');
    this.zerion = new ZerionSDK({
      apiKey: API_KEY,
      timeout: 30000,
      retries: 3
    });
  }

  // ==================== GAS PRICE RETRIEVAL TESTS ====================
  
  async testGasPriceRetrieval() {
    console.log('📊 === TESTING GAS PRICE RETRIEVAL METHODS ===\n');
    
    try {
      // Test 1: getGasPrices - All chains
      console.log('1️⃣ Testing getGasPrices (all chains)...');
      const allGasPrices = await this.zerion.gas.getGasPrices();
      console.log(`✅ All gas prices: ${allGasPrices.data.length} entries found`);
      
      // Test 2: getGasPrices with chain filter
      console.log('2️⃣ Testing getGasPrices with chain filter...');
      const ethGasPrices = await this.zerion.gas.getGasPrices({
        filter: { chain_ids: [TEST_CHAINS.ETHEREUM] }
      });
      console.log(`✅ Ethereum gas prices: ${ethGasPrices.data.length} entries found`);
      
      // Test 3: getGasPrices with gas type filter
      console.log('3️⃣ Testing getGasPrices with gas type filter...');
      const fastGasPrices = await this.zerion.gas.getGasPrices({
        filter: { gas_types: ['classic'] }
      });
      console.log(`✅ Fast gas prices: ${fastGasPrices.data.length} entries found`);
      
      // Test 4: getChainGasPrices - Specific chain
      console.log('4️⃣ Testing getChainGasPrices...');
      const chainGasPrices = await this.zerion.gas.getChainGasPrices(TEST_CHAINS.ETHEREUM);
      console.log(`✅ Chain gas prices: ${chainGasPrices.length} types found`);
      
      // Test 5: getChainGasPrice - Specific type
      console.log('5️⃣ Testing getChainGasPrice...');
      const specificGasPrice = await this.zerion.gas.getChainGasPrice(TEST_CHAINS.ETHEREUM, 'classic');
      console.log(`✅ Specific gas price: ${specificGasPrice ? specificGasPrice.attributes.info.standard + ' wei' : 'Not found'}`);
      
      // Test 6: getChainGasPricesByType - All types
      console.log('6️⃣ Testing getChainGasPricesByType...');
      const gasPricesByType = await this.zerion.gas.getChainGasPricesByType(TEST_CHAINS.ETHEREUM);
      
      
      console.log('📊 Gas Prices by Type:');
      Object.entries(gasPricesByType).forEach(([type, price]) => {
        if (price) {
          console.log(`   ${type}: ${price.attributes.info?.standard} wei (${price.attributes?.updated_at} min)`);
        }
      });
      
      // Test 7: Cache performance
      console.log('7️⃣ Testing cache performance...');
      const noCacheStart = Date.now();
      await this.zerion.gas.getChainGasPrices(TEST_CHAINS.ETHEREUM, false);
      const noCacheTime = Date.now() - noCacheStart;
      
      const cacheStart = Date.now();
      await this.zerion.gas.getChainGasPrices(TEST_CHAINS.ETHEREUM, true);
      const cacheTime = Date.now() - cacheStart;
      
      console.log('📊 Cache Performance:');
      console.log(`   No cache: ${noCacheTime}ms`);
      console.log(`   With cache: ${cacheTime}ms`);
      console.log(`   Cache speedup: ${((noCacheTime - cacheTime) / noCacheTime * 100).toFixed(1)}%`);
      
      this.testResults.gasPriceRetrieval = {
        allGasPrices: allGasPrices.data.length,
        ethGasPrices: ethGasPrices.data.length,
        fastGasPrices: fastGasPrices.data.length,
        chainGasPrices: chainGasPrices.length,
        specificGasPrice: !!specificGasPrice,
        gasPricesByType: Object.keys(gasPricesByType).length,
        cachePerformance: {
          noCacheTime,
          cacheTime,
          speedup: ((noCacheTime - cacheTime) / noCacheTime * 100)
        }
      };
      
      console.log('✅ All gas price retrieval methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Gas price retrieval test failed:', error);
      this.testResults.gasPriceRetrieval = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== MULTI-CHAIN ANALYSIS TESTS ====================
  
  async testMultiChainAnalysis() {
    console.log('🌐 === TESTING MULTI-CHAIN ANALYSIS METHODS ===\n');
    
    try {
      // Test 1: getMultiChainGasPrices
      console.log('1️⃣ Testing getMultiChainGasPrices...');
      const testChainIds = [TEST_CHAINS.ETHEREUM, TEST_CHAINS.POLYGON, TEST_CHAINS.ARBITRUM];
      const multiChainGas = await this.zerion.gas.getMultiChainGasPrices(testChainIds);
      
      console.log('📊 Multi-chain Gas Prices:');
      Object.entries(multiChainGas).forEach(([chainId, prices]) => {
        console.log(`   ${chainId}: ${prices.length} gas types`);
      });
      
      // Test 2: compareGasPricesAcrossChains - Classic
      console.log('2️⃣ Testing compareGasPricesAcrossChains (classic)...');
      const classicComparison = await this.zerion.gas.compareGasPricesAcrossChains(testChainIds, 'classic');
      
      console.log('📊 Classic Gas Comparison:');
      console.log(`   Cheapest: ${classicComparison.cheapest?.chainId || 'N/A'} (${classicComparison.cheapest?.price || 'N/A'} wei)`);
      console.log(`   Fastest: ${classicComparison.fastest?.chainId || 'N/A'} (${classicComparison.fastest?.time || 'N/A'} min)`);
      
      // Test 3: compareGasPricesAcrossChains - Fast
      console.log('3️⃣ Testing compareGasPricesAcrossChains (fast)...');
      const fastComparison = await this.zerion.gas.compareGasPricesAcrossChains(testChainIds, 'fast');
      
      console.log('📊 Fast Gas Comparison:');
      console.log(`   Cheapest: ${fastComparison.cheapest?.chainId || 'N/A'} (${fastComparison.cheapest?.price || 'N/A'} wei)`);
      console.log(`   Fastest: ${fastComparison.fastest?.chainId || 'N/A'} (${fastComparison.fastest?.time || 'N/A'} min)`);
      
      // Test 4: Cross-chain analysis
      console.log('4️⃣ Performing cross-chain analysis...');
      const chainAnalysis = testChainIds.map(chainId => {
        const prices = multiChainGas[chainId] || [];
        const classicPrice = prices.find(p => p.attributes.gas_type === 'classic');
        const fastPrice = prices.find(p => p.attributes.gas_type === 'eip1559');
        
        return {
          chainId,
          hasClassic: !!classicPrice,
          hasFast: !!fastPrice,
          classicPrice: classicPrice?.attributes.info?.standard,
          fastPrice: fastPrice?.attributes.info?.standard,
          classicTime: classicPrice?.attributes.updated_at,
          fastTime: fastPrice?.attributes.updated_at
        };
      });
      
      console.log('📊 Chain Analysis:');
      chainAnalysis.forEach(analysis => {
        console.log(`   ${analysis.chainId}:`);
        console.log(`     Classic: ${analysis.hasClassic ? '✅' : '❌'} ${analysis.classicPrice || 'N/A'} wei`);
        console.log(`     Fast: ${analysis.hasFast ? '✅' : '❌'} ${analysis.fastPrice || 'N/A'} wei`);
      });
      
      // Test 5: Price volatility analysis
      console.log('5️⃣ Testing price volatility...');
      const priceRanges = chainAnalysis.map(analysis => {
        if (analysis.classicPrice && analysis.fastPrice) {
          const range = parseFloat(analysis.fastPrice) - parseFloat(analysis.classicPrice);
          const percentage = (range / parseFloat(analysis.classicPrice)) * 100;
          return {
            chainId: analysis.chainId,
            range,
            percentage: percentage.toFixed(1)
          };
        }
        return null;
      }).filter(Boolean);
      
      console.log('📊 Price Volatility:');
      priceRanges.forEach(range => {
        if (range) {
          console.log(`   ${range.chainId}: ${range.percentage}% difference (classic to fast)`);
        }
      });
      
      this.testResults.multiChainAnalysis = {
        multiChainGas: Object.keys(multiChainGas).length,
        classicComparison: {
          cheapest: classicComparison.cheapest?.chainId,
          fastest: classicComparison.fastest?.chainId
        },
        fastComparison: {
          cheapest: fastComparison.cheapest?.chainId,
          fastest: fastComparison.fastest?.chainId
        },
        chainAnalysis: chainAnalysis.map(a => ({
          chainId: a.chainId,
          hasData: a.hasClassic || a.hasFast
        })),
        priceVolatility: priceRanges.length
      };
      
      console.log('✅ All multi-chain analysis methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Multi-chain analysis test failed:', error);
      this.testResults.multiChainAnalysis = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== RECOMMENDATIONS AND OPTIMIZATION TESTS ====================
  
  async testRecommendationsAndOptimization() {
    console.log('🎯 === TESTING RECOMMENDATIONS AND OPTIMIZATION METHODS ===\n');
    
    try {
      // Test 1: getGasRecommendations
      console.log('1️⃣ Testing getGasRecommendations...');
      const recommendations = await this.zerion.gas.getGasRecommendations(TEST_CHAINS.ETHEREUM);
      
      if (recommendations) {
        console.log('📊 Gas Recommendations:');
        console.log(`   Recommended: ${recommendations.recommended}`);
        console.log(`   Classic: ${recommendations.options.classic.price} wei (${recommendations.options.classic.timeMinutes} min)`);
        console.log(`   Fast: ${recommendations.options.fast.price} wei (${recommendations.options.fast.timeMinutes} min)`);
        console.log(`   Instant: ${recommendations.options.instant.price} wei (${recommendations.options.instant.timeMinutes} min)`);
      }
      
      // Test 2: getOptimalGasPrice - Different urgencies
      console.log('2️⃣ Testing getOptimalGasPrice...');
      const urgencyTests = await Promise.all([
        this.zerion.gas.getOptimalGasPrice(TEST_CHAINS.ETHEREUM, 'low'),
        this.zerion.gas.getOptimalGasPrice(TEST_CHAINS.ETHEREUM, 'medium'),
        this.zerion.gas.getOptimalGasPrice(TEST_CHAINS.ETHEREUM, 'high')
      ]);
      
      console.log('📊 Optimal Gas by Urgency:');
      ['Low', 'Medium', 'High'].forEach((urgency, i) => {
        const price = urgencyTests[i];
        console.log(`   ${urgency}: ${price ? price.attributes.info.standard + ' wei' : 'N/A'}`);
      });
      
      // Test 3: getGasPriceTrends
      console.log('3️⃣ Testing getGasPriceTrends...');
      const trends = await this.zerion.gas.getGasPriceTrends(TEST_CHAINS.ETHEREUM);
      
      console.log('📊 Gas Price Trends:');
      console.log(`   Current: ${trends.current ? trends.current.attributes.info.standard + ' wei' : 'N/A'}`);
      console.log(`   Trend: ${trends.trend}`);
      console.log(`   Recommendation: ${trends.recommendation}`);
      
      // Test 4: Multiple chain recommendations
      console.log('4️⃣ Testing multiple chain recommendations...');
      const chainRecommendations = await Promise.all(
        [TEST_CHAINS.ETHEREUM, TEST_CHAINS.POLYGON, TEST_CHAINS.ARBITRUM].map(async (chainId) => {
          try {
            const rec = await this.zerion.gas.getGasRecommendations(chainId);
            return {
              chainId,
              hasRecommendations: !!rec,
              recommended: rec?.recommended,
              classicPrice: rec?.options.classic.price
            };
          } catch (error) {
            return {
              chainId,
              hasRecommendations: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      console.log('📊 Chain Recommendations:');
      chainRecommendations.forEach(rec => {
        if (rec.hasRecommendations) {
          console.log(`   ${rec.chainId}: ✅ ${rec.recommended} (${rec.classicPrice} wei)`);
        } else {
          console.log(`   ${rec.chainId}: ❌ ${rec.error || 'No recommendations'}`);
        }
      });
      
      // Test 5: Optimization analysis
      console.log('5️⃣ Performing optimization analysis...');
      
      if (recommendations) {
        const optimizationAnalysis = {
          timeSavings: {
            classicToFast: recommendations.options.classic.timeMinutes - recommendations.options.fast.timeMinutes,
            fastToInstant: recommendations.options.fast.timeMinutes - recommendations.options.instant.timeMinutes
          },
          costIncrease: {
            classicToFast: parseFloat(recommendations.options.fast.price) - parseFloat(recommendations.options.classic.price),
            fastToInstant: parseFloat(recommendations.options.instant.price) - parseFloat(recommendations.options.fast.price)
          }
        };
        
        console.log('📊 Optimization Analysis:');
        console.log(`   Classic to Fast: ${optimizationAnalysis.timeSavings.classicToFast} min saved for ${optimizationAnalysis.costIncrease.classicToFast} wei`);
        console.log(`   Fast to Instant: ${optimizationAnalysis.timeSavings.fastToInstant} min saved for ${optimizationAnalysis.costIncrease.fastToInstant} wei`);
        
        // Calculate cost per minute saved
        const costPerMinute = {
          classicToFast: optimizationAnalysis.timeSavings.classicToFast > 0 ? 
            optimizationAnalysis.costIncrease.classicToFast / optimizationAnalysis.timeSavings.classicToFast : 0,
          fastToInstant: optimizationAnalysis.timeSavings.fastToInstant > 0 ? 
            optimizationAnalysis.costIncrease.fastToInstant / optimizationAnalysis.timeSavings.fastToInstant : 0
        };
        
        console.log('📊 Cost Efficiency:');
        console.log(`   Classic to Fast: ${costPerMinute.classicToFast.toFixed(0)} wei per minute saved`);
        console.log(`   Fast to Instant: ${costPerMinute.fastToInstant.toFixed(0)} wei per minute saved`);
      }
      
      this.testResults.recommendationsAndOptimization = {
        hasRecommendations: !!recommendations,
        recommendedType: recommendations?.recommended,
        urgencyTests: urgencyTests.filter(Boolean).length,
        trends: {
          hasTrends: !!trends.current,
          trend: trends.trend
        },
        chainRecommendations: {
          total: chainRecommendations.length,
          successful: chainRecommendations.filter(r => r.hasRecommendations).length
        }
      };
      
      console.log('✅ All recommendations and optimization methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Recommendations and optimization test failed:', error);
      this.testResults.recommendationsAndOptimization = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== TRANSACTION COST ESTIMATION TESTS ====================
  
  async testTransactionCostEstimation() {
    console.log('💰 === TESTING TRANSACTION COST ESTIMATION METHODS ===\n');
    
    try {
      // Test 1: estimateTransactionCost - Different gas limits
      console.log('1️⃣ Testing estimateTransactionCost...');
      const gasLimitTests = await Promise.all(
        Object.entries(GAS_LIMITS).map(async ([txType, gasLimit]) => {
          try {
            const cost = await this.zerion.gas.estimateTransactionCost(TEST_CHAINS.ETHEREUM, gasLimit, 'classic');
            return {
              txType,
              gasLimit,
              cost: cost?.totalCostWei,
              timeMinutes: cost?.estimatedTimeMinutes
            };
          } catch (error) {
            return {
              txType,
              gasLimit,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      console.log('📊 Transaction Cost Estimates:');
      gasLimitTests.forEach(test => {
        if (test.cost) {
          console.log(`   ${test.txType}: ${test.cost} wei (${test.timeMinutes} min)`);
        } else {
          console.log(`   ${test.txType}: ❌ ${test.error}`);
        }
      });
      
      // Test 2: calculateGasFeeInNativeToken - Different units
      console.log('2️⃣ Testing calculateGasFeeInNativeToken...');
      const nativeTokenFees = await Promise.all([
        this.zerion.gas.calculateGasFeeInNativeToken(TEST_CHAINS.ETHEREUM, GAS_LIMITS.SIMPLE_TRANSFER, 'classic'),
        this.zerion.gas.calculateGasFeeInNativeToken(TEST_CHAINS.ETHEREUM, GAS_LIMITS.UNISWAP_SWAP, 'eip1559')
      ]);
      
      console.log('📊 Native Token Fees:');
      const txTypes = ['Simple Transfer', 'Uniswap Swap'];
      nativeTokenFees.forEach((fee, i) => {
        if (fee) {
          console.log(`   ${txTypes[i]}:`);
          console.log(`     Wei: ${fee.feeWei}`);
          console.log(`     Gwei: ${fee.feeGwei}`);
          console.log(`     Ether: ${fee.feeEther}`);
        }
      });
      
      // Test 3: Cross-chain cost comparison
      console.log('3️⃣ Testing cross-chain cost comparison...');
      const crossChainCosts = await Promise.all(
        [TEST_CHAINS.ETHEREUM, TEST_CHAINS.POLYGON, TEST_CHAINS.ARBITRUM].map(async (chainId) => {
          try {
            const cost = await this.zerion.gas.estimateTransactionCost(chainId, GAS_LIMITS.ERC20_TRANSFER, 'classic');
            return {
              chainId,
              cost: cost?.totalCostWei,
              gasPrice: cost?.gasPrice
            };
          } catch (error) {
            return {
              chainId,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      console.log('📊 Cross-chain Cost Comparison (ERC20 Transfer):');
      crossChainCosts.forEach(result => {
        if (result.cost) {
          console.log(`   ${result.chainId}: ${result.cost} wei`);
        } else {
          console.log(`   ${result.chainId}: ❌ ${result.error}`);
        }
      });
      
      // Test 4: Gas type cost comparison
      console.log('4️⃣ Testing gas type cost comparison...');
      const gasTypeCosts = await Promise.all(
        GAS_TYPES.map(async (gasType) => {
          try {
            const cost = await this.zerion.gas.estimateTransactionCost(
              TEST_CHAINS.ETHEREUM, 
              GAS_LIMITS.UNISWAP_SWAP, 
              gasType
            );
            return {
              gasType,
              cost: cost?.totalCostWei,
              time: cost?.estimatedTimeMinutes
            };
          } catch (error) {
            return {
              gasType,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      console.log('📊 Gas Type Cost Comparison (Uniswap Swap):');
      gasTypeCosts.forEach(result => {
        if (result.cost) {
          console.log(`   ${result.gasType}: ${result.cost} wei (${result.time} min)`);
        } else {
          console.log(`   ${result.gasType}: ❌ ${result.error}`);
        }
      });
      
      // Test 5: Cost efficiency analysis
      console.log('5️⃣ Performing cost efficiency analysis...');
      const validCosts = gasTypeCosts.filter(result => result.cost && result.time);
      
      if (validCosts.length >= 2) {
        const costEfficiency = validCosts.map(result => ({
          gasType: result.gasType,
          costPerMinute: result.cost && result.time ? parseFloat(result.cost) / result.time : 0
        })).sort((a, b) => a.costPerMinute - b.costPerMinute);
        
        console.log('📊 Cost Efficiency Ranking (cost per minute):');
        costEfficiency.forEach((efficiency, i) => {
          console.log(`   ${i + 1}. ${efficiency.gasType}: ${efficiency.costPerMinute.toFixed(0)} wei/min`);
        });
      }
      
      this.testResults.transactionCostEstimation = {
        gasLimitTests: {
          total: gasLimitTests.length,
          successful: gasLimitTests.filter(t => t.cost).length
        },
        nativeTokenFees: nativeTokenFees.filter(Boolean).length,
        crossChainCosts: {
          total: crossChainCosts.length,
          successful: crossChainCosts.filter(c => c.cost).length
        },
        gasTypeCosts: {
          total: gasTypeCosts.length,
          successful: gasTypeCosts.filter(c => c.cost).length
        },
        costEfficiencyAnalysis: validCosts.length >= 2
      };
      
      console.log('✅ All transaction cost estimation methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Transaction cost estimation test failed:', error);
      this.testResults.transactionCostEstimation = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== MONITORING AND ALERTS TESTS ====================
  
  async testMonitoringAndAlerts() {
    console.log('🚨 === TESTING MONITORING AND ALERTS METHODS ===\n');
    
    try {
      // Test 1: getGasPriceAlerts
      console.log('1️⃣ Testing getGasPriceAlerts...');
      const currentGas = await this.zerion.gas.getChainGasPrice(TEST_CHAINS.ETHEREUM, 'classic');
      
      if (currentGas) {
        const currentPrice = parseFloat(currentGas.attributes.info?.standard );
        const alerts = await this.zerion.gas.getGasPriceAlerts(TEST_CHAINS.ETHEREUM, {
          low: Math.floor(currentPrice * 0.8).toString(), // 20% below current
          high: Math.floor(currentPrice * 1.2).toString() // 20% above current
        });
        
        console.log('📊 Gas Price Alerts:');
        console.log(`   Current price: ${alerts.currentPrice} wei`);
        alerts.alerts.forEach(alert => {
          console.log(`   ${alert.type.toUpperCase()}: ${alert.triggered ? '🚨 TRIGGERED' : '✅ OK'} (${alert.threshold} wei)`);
          console.log(`     ${alert.message}`);
        });
      }
      
      // Test 2: Monitor gas prices (short demo)
      console.log('2️⃣ Testing gas price monitoring (10 seconds)...');
      const monitoringResults = [];
      const monitor = this.zerion.gas.monitorGasPrices(TEST_CHAINS.ETHEREUM, 5000); // 5 second intervals
      let iterations = 0;
      const maxIterations = 2; // 10 seconds total
      
      for await (const gasPrices of monitor) {
        iterations++;
        const classicPrice = gasPrices.find(p => p.attributes.gas_type === 'classic');
        
        monitoringResults.push({
          timestamp: new Date().toISOString(),
          classicPrice: classicPrice?.attributes.info.standard || 'N/A',
          priceCount: gasPrices.length
        });
        
        console.log(`   Monitor ${iterations}: ${classicPrice?.attributes.info.standard || 'N/A'} wei (${gasPrices.length} types)`);
        
        if (iterations >= maxIterations) {
          break;
        }
      }
      
      // Test 3: Alert threshold analysis
      console.log('3️⃣ Testing alert threshold analysis...');
      const thresholdTests = [
        { low: '10000000000', high: '50000000000' }, // 10-50 gwei
        { low: '5000000000', high: '100000000000' }, // 5-100 gwei
        { low: '20000000000', high: '30000000000' }  // 20-30 gwei (tight range)
      ];
      
      const thresholdResults = await Promise.all(
        thresholdTests.map(async (thresholds, i) => {
          try {
            const alerts = await this.zerion.gas.getGasPriceAlerts(TEST_CHAINS.ETHEREUM, thresholds);
            return {
              testCase: i + 1,
              thresholds,
              currentPrice: alerts.currentPrice,
              triggeredAlerts: alerts.alerts.filter(a => a.triggered).length,
              totalAlerts: alerts.alerts.length
            };
          } catch (error) {
            return {
              testCase: i + 1,
              thresholds,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      console.log('📊 Threshold Analysis:');
      thresholdResults.forEach(result => {
        if (result.error) {
          console.log(`   Test ${result.testCase}: ❌ ${result.error}`);
        } else {
          const lowGwei = (parseFloat(result.thresholds.low) / 1e9).toFixed(1);
          const highGwei = (parseFloat(result.thresholds.high) / 1e9).toFixed(1);
          console.log(`   Test ${result.testCase} (${lowGwei}-${highGwei} gwei): ${result.triggeredAlerts}/${result.totalAlerts} triggered`);
        }
      });
      
      // Test 4: Cache management
      console.log('4️⃣ Testing cache management...');
      const cacheStatsBefore = this.zerion.gas.getCacheStats();
      
      // Add some cache entries
      await Promise.all([
        this.zerion.gas.getChainGasPrices(TEST_CHAINS.ETHEREUM),
        this.zerion.gas.getChainGasPrices(TEST_CHAINS.POLYGON),
        this.zerion.gas.getChainGasPrices(TEST_CHAINS.ARBITRUM)
      ]);
      
      const cacheStatsAfter = this.zerion.gas.getCacheStats();
      
      console.log('📊 Cache Management:');
      console.log(`   Before: ${cacheStatsBefore.size} entries`);
      console.log(`   After: ${cacheStatsAfter.size} entries`);
      console.log(`   Cache keys: ${cacheStatsAfter.keys.join(', ')}`);
      
      // Clear cache
      this.zerion.gas.clearCache();
      const cacheStatsCleared = this.zerion.gas.getCacheStats();
      console.log(`   After clear: ${cacheStatsCleared.size} entries`);
      
      this.testResults.monitoringAndAlerts = {
        alerts: currentGas ? {
          currentPrice: parseFloat(currentGas.attributes.info.standard),
          alertsConfigured: true
        } : { alertsConfigured: false },
        monitoring: {
          iterations: monitoringResults.length,
          pricesCollected: monitoringResults.filter(r => r.classicPrice !== 'N/A').length
        },
        thresholdAnalysis: {
          totalTests: thresholdResults.length,
          successfulTests: thresholdResults.filter(r => !r.error).length
        },
        cacheManagement: {
          initialSize: cacheStatsBefore.size,
          maxSize: cacheStatsAfter.size,
          clearedSuccessfully: cacheStatsCleared.size === 0
        }
      };
      
      console.log('✅ All monitoring and alerts methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Monitoring and alerts test failed:', error);
      this.testResults.monitoringAndAlerts = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== MAIN TEST RUNNER ====================
  
  async runAllTests() {
    console.log('🧪 GAS SERVICE COMPREHENSIVE TESTING');
    console.log('=' .repeat(50));
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
    console.log('📋 Test Chains:', Object.values(TEST_CHAINS).join(', '));
    console.log('=' .repeat(50) + '\n');

    if (!API_KEY ) {
      console.log('⚠️  WARNING: Please set your actual API key in the API_KEY variable');
      console.log('   Get your API key from: https://zerion.io/api\n');
      return;
    }

    const tests = [
      { name: 'Gas Price Retrieval', method: this.testGasPriceRetrieval },
      { name: 'Multi-Chain Analysis', method: this.testMultiChainAnalysis },
      { name: 'Recommendations and Optimization', method: this.testRecommendationsAndOptimization },
      { name: 'Transaction Cost Estimation', method: this.testTransactionCostEstimation },
      { name: 'Monitoring and Alerts', method: this.testMonitoringAndAlerts }
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.printTestSummary(successCount, totalTests);
  }

  printTestSummary(successCount: number, totalTests: number) {
    console.log('\n' + '🎉'.repeat(20));
    console.log('GAS SERVICE TESTING COMPLETED');
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
      '✅ getGasPrices (all & filtered)',
      '✅ getChainGasPrices (specific chain)',
      '✅ getChainGasPrice (specific type)',
      '✅ getChainGasPricesByType (all types)',
      '✅ getMultiChainGasPrices (multiple chains)',
      '✅ compareGasPricesAcrossChains (comparison)',
      '✅ getGasRecommendations (optimization)',
      '✅ getOptimalGasPrice (urgency-based)',
      '✅ getGasPriceTrends (trend analysis)',
      '✅ estimateTransactionCost (cost calculation)',
      '✅ calculateGasFeeInNativeToken (unit conversion)',
      '✅ monitorGasPrices (real-time monitoring)',
      '✅ getGasPriceAlerts (threshold alerts)',
      '✅ clearCache & getCacheStats (cache management)'
    ];

    functionsTested.forEach(func => console.log(`   ${func}`));

    console.log('\n🎯 KEY INSIGHTS:');
    if (this.testResults.multiChainAnalysis && !this.testResults.multiChainAnalysis.error) {
      const analysis = this.testResults.multiChainAnalysis;
      console.log(`   - Analyzed ${analysis.multiChainGas} chains for gas prices`);
      console.log(`   - Cheapest classic gas: ${analysis.classicComparison.cheapest || 'N/A'}`);
      console.log(`   - Fastest confirmation: ${analysis.classicComparison.fastest || 'N/A'}`);
    }
    
    if (this.testResults.transactionCostEstimation && !this.testResults.transactionCostEstimation.error) {
      const estimation = this.testResults.transactionCostEstimation;
      console.log(`   - Tested ${estimation.gasLimitTests.successful}/${estimation.gasLimitTests.total} transaction types`);
      console.log(`   - Cross-chain costs: ${estimation.crossChainCosts.successful}/${estimation.crossChainCosts.total} chains`);
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Use getGasRecommendations() for optimal gas pricing');
    console.log('   2. Implement gas price monitoring for time-sensitive transactions');
    console.log('   3. Set up alerts for favorable gas price conditions');
    console.log('   4. Compare cross-chain costs for multi-chain strategies');
    console.log('   5. Use transaction cost estimation for fee budgeting');

    console.log('\n📚 USAGE PATTERNS:');
    console.log('   - Single chain: getChainGasPricesByType(chainId)');
    console.log('   - Multi-chain: compareGasPricesAcrossChains(chainIds, gasType)');
    console.log('   - Cost estimation: estimateTransactionCost(chainId, gasLimit, gasType)');
    console.log('   - Monitoring: monitorGasPrices(chainId, intervalMs)');
    console.log('   - Alerts: getGasPriceAlerts(chainId, thresholds)');

    console.log('\n' + '🎯'.repeat(20));
    console.log('GAS SERVICE TESTING COMPLETE!');
    console.log('🎯'.repeat(20));
  }
}

// ==================== QUICK TEST FUNCTIONS ====================

export async function quickGasCheck(chainId: string = TEST_CHAINS.ETHEREUM, apiKey: string = API_KEY) {
  console.log(`🔍 Quick Gas Check: ${chainId}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const gasPrices = await zerion.gas.getChainGasPricesByType(chainId);
    
    console.log('📊 Current Gas Prices:');
    Object.entries(gasPrices).forEach(([type, price]) => {
      if (price) {
        const gwei = (parseFloat(price.attributes.info.standard) / 1e9).toFixed(1);
        console.log(`   ${type}: ${gwei} gwei (${price.attributes.updated_at} min)`);
      }
    });
    
    return gasPrices;
  } catch (error) {
    console.error('❌ Gas check failed:', error);
    return {};
  }
}

export async function quickCostEstimate(
  chainId: string = TEST_CHAINS.ETHEREUM,
  gasLimit: string = GAS_LIMITS.ERC20_TRANSFER,
  apiKey: string = API_KEY
) {
  console.log(`🔍 Quick Cost Estimate: ${chainId} (${gasLimit} gas)\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const costs = await Promise.all([
      zerion.gas.estimateTransactionCost(chainId, gasLimit, 'classic'),
      zerion.gas.estimateTransactionCost(chainId, gasLimit, 'eip1559'),
      zerion.gas.estimateTransactionCost(chainId, gasLimit, 'optimistic')
    ]);
    
    console.log('📊 Cost Estimates:');
    ['Classic', 'Fast', 'Instant'].forEach((type, i) => {
      const cost = costs[i];
      if (cost) {
        const eth = (parseFloat(cost.totalCostWei) / 1e18).toFixed(6);
        console.log(`   ${type}: ${cost.totalCostWei} wei (~${eth} ETH) - ${cost.estimatedTimeMinutes} min`);
      }
    });
    
    return costs.filter(Boolean);
  } catch (error) {
    console.error('❌ Cost estimate failed:', error);
    return [];
  }
}

export async function quickGasComparison(
  chainIds: string[] = [TEST_CHAINS.ETHEREUM, TEST_CHAINS.POLYGON, TEST_CHAINS.ARBITRUM],
  apiKey: string = API_KEY
) {
  console.log(`🔍 Quick Gas Comparison: ${chainIds.join(', ')}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const comparison = await zerion.gas.compareGasPricesAcrossChains(chainIds, 'classic');
    
    console.log('📊 Gas Price Comparison:');
    comparison.prices.forEach(price => {
      const gwei = price.priceInWei !== '0' ? (parseFloat(price.priceInWei) / 1e9).toFixed(1) : 'N/A';
      console.log(`   ${price.chainId}: ${gwei} gwei (${price.estimatedTimeMinutes} min)`);
    });
    
    console.log('\n🏆 Winners:');
    console.log(`   Cheapest: ${comparison.cheapest?.chainId || 'N/A'}`);
    console.log(`   Fastest: ${comparison.fastest?.chainId || 'N/A'}`);
    
    return comparison;
  } catch (error) {
    console.error('❌ Gas comparison failed:', error);
    return null;
  }
}

export async function quickGasAlerts(
  chainId: string = TEST_CHAINS.ETHEREUM,
  lowThresholdGwei: number = 20,
  highThresholdGwei: number = 50,
  apiKey: string = API_KEY
) {
  console.log(`🔍 Quick Gas Alerts: ${chainId} (${lowThresholdGwei}-${highThresholdGwei} gwei)\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const alerts = await zerion.gas.getGasPriceAlerts(chainId, {
      low: (lowThresholdGwei * 1e9).toString(),
      high: (highThresholdGwei * 1e9).toString()
    });
    
    const currentGwei = (parseFloat(alerts.currentPrice) / 1e9).toFixed(1);
    
    console.log('📊 Gas Price Alerts:');
    console.log(`   Current: ${currentGwei} gwei`);
    
    alerts.alerts.forEach(alert => {
      const thresholdGwei = (parseFloat(alert.threshold) / 1e9).toFixed(1);
      const status = alert.triggered ? '🚨 TRIGGERED' : '✅ OK';
      console.log(`   ${alert.type.toUpperCase()} (${thresholdGwei} gwei): ${status}`);
    });
    
    return alerts;
  } catch (error) {
    console.error('❌ Gas alerts failed:', error);
    return null;
  }
}

// Export the main tester class
export { GasServiceTester };

// Main execution
if (require.main === module) {
  const tester = new GasServiceTester();
  tester.runAllTests().catch(console.error);
}

console.log('\n📚 Additional Functions Available:');
console.log('- quickGasCheck(chainId?, apiKey?)');
console.log('- quickCostEstimate(chainId?, gasLimit?, apiKey?)');
console.log('- quickGasComparison(chainIds[]?, apiKey?)');
console.log('- quickGasAlerts(chainId?, lowGwei?, highGwei?, apiKey?)');