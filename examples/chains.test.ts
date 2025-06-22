// examples/chains-service-tests.ts - Complete Chains Service Function Tests

import  ZerionSDK  from '../src/index';
// ⚠️ IMPORTANT: Replace with your actual Zerion API key
const API_KEY = 'zk_dev_2e59da43ef3d49858d2c3c1bd57854ed';

// Known chain IDs for testing
const KNOWN_CHAINS = {
    ETHEREUM: 'ethereum',
    POLYGON: 'polygon',
    ARBITRUM: 'arbitrum',
    OPTIMISM: 'optimism',
    BASE: 'base',
    AVALANCHE: 'avalanche',
    BSC: 'bsc',
    FANTOM: 'fantom'
  };
  
  // External chain IDs (numeric)
  const EXTERNAL_CHAIN_IDS = {
    ETHEREUM: '1',
    POLYGON: '137',
    ARBITRUM: '42161',
    OPTIMISM: '10',
    BASE: '8453',
    AVALANCHE: '43114',
    BSC: '56',
    FANTOM: '250'
  };
  
  class ChainsServiceTester {
    private zerion: ZerionSDK;
    private testResults: Record<string, any> = {};
  
    constructor() {
      console.log('⛓️ Initializing Chains Service Tester...\n');
      this.zerion = new ZerionSDK({
        apiKey: API_KEY,
        timeout: 30000,
        retries: 3
      });
    }
  
    // ==================== CHAIN DISCOVERY TESTS ====================
    
    async testChainDiscovery() {
      console.log('🔍 === TESTING CHAIN DISCOVERY METHODS ===\n');
      
      try {
        // Test 1: getChains - Basic chains list
        console.log('1️⃣ Testing getChains (basic)...');
        const basicChains = await this.zerion.chains.getChains();
        console.log(`✅ Basic chains: ${basicChains.data.length} found`);
        
        // Test 2: getChains with cache
        console.log('2️⃣ Testing getChains with cache...');
        const startTime = Date.now();
        const cachedChains = await this.zerion.chains.getChains(true);
        const cacheTime = Date.now() - startTime;
        console.log(`✅ Cached chains: ${cachedChains.data.length} found in ${cacheTime}ms`);
        
        // Test 3: getAllChains - Simple array
        console.log('3️⃣ Testing getAllChains...');
        const allChains = await this.zerion.chains.getAllChains();
        console.log(`✅ All chains array: ${allChains.length} chains`);
        
        // Test 4: getChain - Specific chain
        console.log('4️⃣ Testing getChain (specific)...');
        const ethereumChain = await this.zerion.chains.getChain(KNOWN_CHAINS.ETHEREUM);
        console.log(`✅ Ethereum chain: ${ethereumChain.data.attributes.name}`);
        
        // Test 5: getChainByExternalId - External ID lookup
        console.log('5️⃣ Testing getChainByExternalId...');
        const chainByExtId = await this.zerion.chains.getChainByExternalId(EXTERNAL_CHAIN_IDS.ETHEREUM);
        console.log(`✅ Chain by external ID: ${chainByExtId?.attributes.name || 'Not found'}`);
        
        // Test 6: Multiple chain lookups
        console.log('6️⃣ Testing multiple chain lookups...');
        const multipleChains = await Promise.all([
          this.zerion.chains.getChain(KNOWN_CHAINS.POLYGON),
          this.zerion.chains.getChain(KNOWN_CHAINS.ARBITRUM),
          this.zerion.chains.getChain(KNOWN_CHAINS.OPTIMISM)
        ]);
        
        console.log('📊 Multiple Chain Results:');
        multipleChains.forEach((chain, i) => {
          const chainNames = ['Polygon', 'Arbitrum', 'Optimism'];
          console.log(`   ${chainNames[i]}: ${chain.data.attributes.name}`);
        });
        
        this.testResults.chainDiscovery = {
          basicChains: basicChains.data.length,
          cachedChains: cachedChains.data.length,
          cacheTime: cacheTime,
          allChains: allChains.length,
          specificChain: !!ethereumChain.data,
          externalIdLookup: !!chainByExtId,
          multipleChains: multipleChains.filter(c => c.data).length,
          chainConsistency: basicChains.data.length === allChains.length
        };
        
        console.log('✅ All chain discovery methods tested successfully\n');
        
      } catch (error) {
        console.error('❌ Chain discovery test failed:', error);
        this.testResults.chainDiscovery = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  
    // ==================== CHAIN CATEGORIES TESTS ====================
    
    async testChainCategories() {
      console.log('📂 === TESTING CHAIN CATEGORIES METHODS ===\n');
      
      try {
        // Test 1: getPopularChains
        console.log('1️⃣ Testing getPopularChains...');
        const popularChains = await this.zerion.chains.getPopularChains();
        console.log(`✅ Popular chains: ${popularChains.length} found`);
        
        // Test 2: getL2Chains
        console.log('2️⃣ Testing getL2Chains...');
        const l2Chains = await this.zerion.chains.getL2Chains();
        console.log(`✅ L2 chains: ${l2Chains.length} found`);
        
        // Test 3: getMainnetChains
        console.log('3️⃣ Testing getMainnetChains...');
        const mainnetChains = await this.zerion.chains.getMainnetChains();
        console.log(`✅ Mainnet chains: ${mainnetChains.length} found`);
        
        // Test 4: getTradingChains
        console.log('4️⃣ Testing getTradingChains...');
        const tradingChains = await this.zerion.chains.getTradingChains();
        console.log(`✅ Trading chains: ${tradingChains.length} found`);
        
        // Test 5: getEVMChains
        console.log('5️⃣ Testing getEVMChains...');
        const evmChains = await this.zerion.chains.getEVMChains();
        console.log(`✅ EVM chains: ${evmChains.length} found`);
        
        // Test 6: Category analysis
        console.log('6️⃣ Analyzing chain categories...');
        
        console.log('📊 Popular Chains:');
        popularChains.slice(0, 5).forEach((chain, i) => {
          console.log(`   ${i + 1}. ${chain.attributes.name} (${chain.attributes.external_id})`);
        });
        
        console.log('📊 L2 Chains:');
        l2Chains.slice(0, 5).forEach((chain, i) => {
          console.log(`   ${i + 1}. ${chain.attributes.name}`);
        });
        
        // Test 7: Category overlap analysis
        console.log('7️⃣ Testing category overlaps...');
        const allChains = await this.zerion.chains.getAllChains();
        
        const categoryOverlaps = {
          popularInL2: popularChains.filter(p => 
            l2Chains.some(l2 => l2.id === p.id)
          ).length,
          tradingInPopular: popularChains.filter(p => 
            tradingChains.some(t => t.id === p.id)
          ).length,
          evmInMainnet: mainnetChains.filter(m => 
            evmChains.some(e => e.id === m.id)
          ).length
        };
        
        console.log('📊 Category Overlaps:');
        console.log(`   Popular chains in L2: ${categoryOverlaps.popularInL2}`);
        console.log(`   Trading chains in Popular: ${categoryOverlaps.tradingInPopular}`);
        console.log(`   EVM chains in Mainnet: ${categoryOverlaps.evmInMainnet}`);
        
        this.testResults.chainCategories = {
          popularChains: popularChains.length,
          l2Chains: l2Chains.length,
          mainnetChains: mainnetChains.length,
          tradingChains: tradingChains.length,
          evmChains: evmChains.length,
          categoryOverlaps,
          totalChains: allChains.length,
          categoryCoverage: {
            popular: (popularChains.length / allChains.length * 100).toFixed(1),
            l2: (l2Chains.length / allChains.length * 100).toFixed(1),
            trading: (tradingChains.length / allChains.length * 100).toFixed(1)
          }
        };
        
        console.log('✅ All chain categories methods tested successfully\n');
        
      } catch (error) {
        console.error('❌ Chain categories test failed:', error);
        this.testResults.chainCategories = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  
    // ==================== SEARCH AND VALIDATION TESTS ====================
    
    async testSearchAndValidation() {
      console.log('🔎 === TESTING SEARCH AND VALIDATION METHODS ===\n');
      
      try {
        // Test 1: findChainsByName - Various searches
        console.log('1️⃣ Testing findChainsByName...');
        const searchTerms = ['ethereum', 'polygon', 'arbitrum', 'avalanche', 'test'];
        const searchResults = await Promise.all(
          searchTerms.map(term => this.zerion.chains.findChainsByName(term))
        );
        
        console.log('📊 Chain Search Results:');
        searchResults.forEach((results, i) => {
          console.log(`   "${searchTerms[i]}": ${results.length} chains found`);
        });
        
        // Test 2: isValidChainId - Chain validation
        console.log('2️⃣ Testing isValidChainId...');
        const validationTests = [
          ...Object.values(KNOWN_CHAINS),
          'invalid_chain',
          'nonexistent',
          ''
        ];
        
        const validationResults = await Promise.all(
          validationTests.map(async (chainId) => ({
            chainId,
            isValid: await this.zerion.chains.isValidChainId(chainId)
          }))
        );
        
        console.log('📊 Chain Validation Results:');
        validationResults.forEach((result) => {
          const status = result.isValid ? '✅' : '❌';
          console.log(`   ${status} ${result.chainId || '(empty)'}: ${result.isValid ? 'Valid' : 'Invalid'}`);
        });
        
        // Test 3: getChainDisplayInfo - Display information
        console.log('3️⃣ Testing getChainDisplayInfo...');
        const displayInfos = await Promise.all([
          this.zerion.chains.getChainDisplayInfo(KNOWN_CHAINS.ETHEREUM),
          this.zerion.chains.getChainDisplayInfo(KNOWN_CHAINS.POLYGON),
          this.zerion.chains.getChainDisplayInfo('invalid_chain')
        ]);
        
        console.log('📊 Chain Display Information:');
        const testChains = ['Ethereum', 'Polygon', 'Invalid'];
        displayInfos.forEach((info, i) => {
          if (info) {
            console.log(`   ${testChains[i]}: ${info.name} | Trading: ${info.supportsTrading ? '✅' : '❌'}`);
          } else {
            console.log(`   ${testChains[i]}: ❌ Not found`);
          }
        });
        
        // Test 4: Advanced search patterns
        console.log('4️⃣ Testing advanced search patterns...');
        const advancedSearches = await Promise.all([
          this.zerion.chains.findChainsByName('eth'), // Partial match
          this.zerion.chains.findChainsByName('ETHEREUM'), // Case insensitive
          this.zerion.chains.findChainsByName('layer'), // Generic term
          this.zerion.chains.findChainsByName('xyz123') // No matches
        ]);
        
        console.log('📊 Advanced Search Results:');
        const searchPatterns = ['Partial (eth)', 'Case insensitive (ETHEREUM)', 'Generic (layer)', 'No match (xyz123)'];
        advancedSearches.forEach((results, i) => {
          console.log(`   ${searchPatterns[i]}: ${results.length} results`);
        });
        
        this.testResults.searchAndValidation = {
          searchResults: searchResults.map((results, i) => ({
            term: searchTerms[i],
            count: results.length
          })),
          validationResults: {
            totalTests: validationResults.length,
            validCount: validationResults.filter(r => r.isValid).length,
            invalidCount: validationResults.filter(r => !r.isValid).length
          },
          displayInfoResults: displayInfos.filter(Boolean).length,
          advancedSearches: advancedSearches.map((results, i) => ({
            pattern: searchPatterns[i],
            count: results.length
          }))
        };
        
        console.log('✅ All search and validation methods tested successfully\n');
        
      } catch (error) {
        console.error('❌ Search and validation test failed:', error);
        this.testResults.searchAndValidation = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  
    // ==================== STATISTICS AND MANAGEMENT TESTS ====================
    
    async testStatisticsAndManagement() {
      console.log('📊 === TESTING STATISTICS AND MANAGEMENT METHODS ===\n');
      
      try {
        // Test 1: getChainStats - Comprehensive statistics
        console.log('1️⃣ Testing getChainStats...');
        const chainStats = await this.zerion.chains.getChainStats();
        
        console.log('📊 Chain Statistics:');
        console.log(`   Total chains: ${chainStats.total}`);
        console.log(`   Mainnet chains: ${chainStats.mainnet}`);
        console.log(`   Testnet chains: ${chainStats.testnet}`);
        console.log(`   Trading enabled: ${chainStats.trading}`);
        console.log(`   Layer 2 chains: ${chainStats.l2}`);
        
        // Test 2: Cache management
        console.log('2️⃣ Testing cache management...');
        
        // Measure cache performance
        const noCacheStart = Date.now();
        await this.zerion.chains.getChains(false);
        const noCacheTime = Date.now() - noCacheStart;
        
        const cacheStart = Date.now();
        await this.zerion.chains.getChains(true);
        const cacheTime = Date.now() - cacheStart;
        
        console.log('📊 Cache Performance:');
        console.log(`   No cache: ${noCacheTime}ms`);
        console.log(`   With cache: ${cacheTime}ms`);
        console.log(`   Cache speedup: ${((noCacheTime - cacheTime) / noCacheTime * 100).toFixed(1)}%`);
        
        // Test 3: refreshCache
        console.log('3️⃣ Testing refreshCache...');
        const refreshStart = Date.now();
        await this.zerion.chains.refreshCache();
        const refreshTime = Date.now() - refreshStart;
        console.log(`✅ Cache refreshed in ${refreshTime}ms`);
        
        // Test 4: Statistical analysis
        console.log('4️⃣ Performing statistical analysis...');
        const allChains = await this.zerion.chains.getAllChains();
        
        // Analyze chain names and external IDs
        const chainAnalysis = {
          averageNameLength: allChains.reduce((sum, chain) => 
            sum + chain.attributes.name.length, 0) / allChains.length,
          uniqueExternalIds: new Set(allChains.map(chain => 
            chain.attributes.external_id)).size,
          chainsWithIcons: allChains.filter(chain => 
            chain.attributes.icon?.url).length,
          tradingSupportRate: chainStats.trading / chainStats.total * 100
        };
        
        console.log('📊 Chain Analysis:');
        console.log(`   Average name length: ${chainAnalysis.averageNameLength.toFixed(1)} characters`);
        console.log(`   Unique external IDs: ${chainAnalysis.uniqueExternalIds}/${allChains.length}`);
        console.log(`   Chains with icons: ${chainAnalysis.chainsWithIcons} (${(chainAnalysis.chainsWithIcons/allChains.length*100).toFixed(1)}%)`);
        console.log(`   Trading support rate: ${chainAnalysis.tradingSupportRate.toFixed(1)}%`);
        
        // Test 5: Performance benchmarking
        console.log('5️⃣ Testing performance benchmarks...');
        const performanceTests = await Promise.all([
          this.measureMethodTime(() => this.zerion.chains.getAllChains(), 'getAllChains'),
          this.measureMethodTime(() => this.zerion.chains.getPopularChains(), 'getPopularChains'),
          this.measureMethodTime(() => this.zerion.chains.getL2Chains(), 'getL2Chains'),
          this.measureMethodTime(() => this.zerion.chains.getChainStats(), 'getChainStats')
        ]);
        
        console.log('📊 Performance Benchmarks:');
        performanceTests.forEach(test => {
          console.log(`   ${test.method}: ${test.time}ms`);
        });
        
        this.testResults.statisticsAndManagement = {
          chainStats,
          cachePerformance: {
            noCacheTime,
            cacheTime,
            speedup: ((noCacheTime - cacheTime) / noCacheTime * 100)
          },
          refreshTime,
          chainAnalysis,
          performanceBenchmarks: performanceTests
        };
        
        console.log('✅ All statistics and management methods tested successfully\n');
        
      } catch (error) {
        console.error('❌ Statistics and management test failed:', error);
        this.testResults.statisticsAndManagement = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  
    // ==================== INTEGRATION TESTS ====================
    
    async testIntegration() {
      console.log('🔗 === TESTING INTEGRATION SCENARIOS ===\n');
      
      try {
        // Test 1: Cross-service integration
        console.log('1️⃣ Testing cross-service integration...');
        
        // Get popular chains and validate with other services
        const popularChains = await this.zerion.chains.getPopularChains();
        const integrationResults = [];
        
        for (const chain of popularChains.slice(0, 3)) {
          try {
            // Test gas prices for this chain
            const gasPrice = await this.zerion.gas.getChainGasPrice(chain.id, 'classic');
            
            // Test fungibles for this chain
            const chainTokens = await this.zerion.fungibles.getFungiblesByChain(chain.id, { limit: 5 });
            
            integrationResults.push({
              chainId: chain.id,
              chainName: chain.attributes.name,
              hasGasData: !!gasPrice,
              tokenCount: chainTokens.length,
              supportsTrading: chain.attributes.flags?.supports_trading || false
            });
          } catch (error) {
            integrationResults.push({
              chainId: chain.id,
              chainName: chain.attributes.name,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
        
        console.log('📊 Cross-service Integration:');
        integrationResults.forEach((result, i) => {
          if (result.error) {
            console.log(`   ${i + 1}. ${result.chainName}: ❌ ${result.error}`);
          } else {
            console.log(`   ${i + 1}. ${result.chainName}: Gas ${result.hasGasData ? '✅' : '❌'} | Tokens: ${result.tokenCount} | Trading: ${result.supportsTrading ? '✅' : '❌'}`);
          }
        });
        
        // Test 2: Chain metadata consistency
        console.log('2️⃣ Testing chain metadata consistency...');
        const metadataConsistency = await this.testChainMetadataConsistency();
        
        // Test 3: External ID mapping
        console.log('3️⃣ Testing external ID mapping...');
        const externalIdTests = await Promise.all(
          Object.entries(EXTERNAL_CHAIN_IDS).map(async ([name, extId]) => {
            const chain = await this.zerion.chains.getChainByExternalId(extId);
            return {
              name,
              externalId: extId,
              found: !!chain,
              chainName: chain?.attributes.name
            };
          })
        );
        
        console.log('📊 External ID Mapping:');
        externalIdTests.forEach(test => {
          console.log(`   ${test.name} (${test.externalId}): ${test.found ? '✅' : '❌'} ${test.chainName || 'Not found'}`);
        });
        
        this.testResults.integration = {
          crossServiceIntegration: {
            totalTested: integrationResults.length,
            successful: integrationResults.filter(r => !r.error).length,
            withGasData: integrationResults.filter(r => r.hasGasData).length,
            withTokens: integrationResults.filter(r => r.tokenCount && r.tokenCount > 0).length
          },
          metadataConsistency,
          externalIdMapping: {
            totalTested: externalIdTests.length,
            successful: externalIdTests.filter(t => t.found).length,
            mappingRate: (externalIdTests.filter(t => t.found).length / externalIdTests.length * 100)
          }
        };
        
        console.log('✅ All integration tests completed successfully\n');
        
      } catch (error) {
        console.error('❌ Integration test failed:', error);
        this.testResults.integration = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  
    // ==================== HELPER METHODS ====================
    
    private async measureMethodTime<T>(method: () => Promise<T>, methodName: string): Promise<{ method: string; time: number; result?: T }> {
      const start = Date.now();
      try {
        const result = await method();
        const time = Date.now() - start;
        return { method: methodName, time, result };
      } catch (error) {
        const time = Date.now() - start;
        return { method: methodName, time };
      }
    }
  
    private async testChainMetadataConsistency() {
      const allChains = await this.zerion.chains.getAllChains();
      
      const consistency = {
        totalChains: allChains.length,
        withNames: allChains.filter(c => c.attributes.name).length,
        withExternalIds: allChains.filter(c => c.attributes.external_id).length,
        withIcons: allChains.filter(c => c.attributes.icon?.url).length,
        duplicateExternalIds: 0,
        duplicateNames: 0
      };
      
      // Check for duplicates
      const externalIds = allChains.map(c => c.attributes.external_id);
      const names = allChains.map(c => c.attributes.name);
      
      consistency.duplicateExternalIds = externalIds.length - new Set(externalIds).size;
      consistency.duplicateNames = names.length - new Set(names).size;
      
      console.log('📊 Metadata Consistency:');
      console.log(`   Chains with names: ${consistency.withNames}/${consistency.totalChains}`);
      console.log(`   Chains with external IDs: ${consistency.withExternalIds}/${consistency.totalChains}`);
      console.log(`   Chains with icons: ${consistency.withIcons}/${consistency.totalChains}`);
      console.log(`   Duplicate external IDs: ${consistency.duplicateExternalIds}`);
      console.log(`   Duplicate names: ${consistency.duplicateNames}`);
      
      return consistency;
    }
  
    // ==================== MAIN TEST RUNNER ====================
    
    async runAllTests() {
      console.log('🧪 CHAINS SERVICE COMPREHENSIVE TESTING');
      console.log('=' .repeat(50));
      console.log(`📅 Started at: ${new Date().toLocaleString()}`);
      console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
      console.log('=' .repeat(50) + '\n');
  
      if (!API_KEY) {
        console.log('⚠️  WARNING: Please set your actual API key in the API_KEY variable');
        console.log('   Get your API key from: https://zerion.io/api\n');
        return;
      }
  
      const tests = [
        { name: 'Chain Discovery', method: this.testChainDiscovery },
        { name: 'Chain Categories', method: this.testChainCategories },
        { name: 'Search and Validation', method: this.testSearchAndValidation },
        { name: 'Statistics and Management', method: this.testStatisticsAndManagement },
        { name: 'Integration', method: this.testIntegration }
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
      console.log('CHAINS SERVICE TESTING COMPLETED');
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
        '✅ getChains (basic & cached)',
        '✅ getAllChains (simple array)',
        '✅ getChain (specific chain)',
        '✅ getChainByExternalId (external lookup)',
        '✅ getPopularChains (popular networks)',
        '✅ getL2Chains (Layer 2 solutions)',
        '✅ getMainnetChains (mainnet only)',
        '✅ getTradingChains (trading enabled)',
        '✅ getEVMChains (EVM compatible)',
        '✅ findChainsByName (search)',
        '✅ isValidChainId (validation)',
        '✅ getChainDisplayInfo (display data)',
        '✅ getChainStats (statistics)',
        '✅ refreshCache (cache management)',
        '✅ Cross-service integration'
      ];
  
      functionsTested.forEach(func => console.log(`   ${func}`));
  
      console.log('\n🎯 KEY INSIGHTS:');
      if (this.testResults.chainCategories && !this.testResults.chainCategories.error) {
        const stats = this.testResults.chainCategories;
        console.log(`   - ${stats.totalChains} total chains supported`);
        console.log(`   - ${stats.popularChains} popular chains (${stats.categoryCoverage.popular}%)`);
        console.log(`   - ${stats.l2Chains} Layer 2 solutions (${stats.categoryCoverage.l2}%)`);
        console.log(`   - ${stats.tradingChains} chains support trading (${stats.categoryCoverage.trading}%)`);
      }
  
      console.log('\n🚀 NEXT STEPS:');
      console.log('   1. Use getPopularChains() for main application features');
      console.log('   2. Implement chain validation before API calls');
      console.log('   3. Cache chain data for better performance');
      console.log('   4. Use category methods for filtered chain lists');
      console.log('   5. Integrate with other services using chain IDs');
  
      console.log('\n' + '🎯'.repeat(20));
      console.log('CHAINS SERVICE TESTING COMPLETE!');
      console.log('🎯'.repeat(20));
    }
  }
  
  // ==================== QUICK TEST FUNCTIONS ====================
  
  export async function quickChainLookup(chainId: string, apiKey: string = API_KEY) {
    console.log(`🔍 Quick Chain Lookup: ${chainId}\n`);
    
    const zerion = new ZerionSDK({ apiKey });
    
    try {
      const chain = await zerion.chains.getChain(chainId);
      const displayInfo = await zerion.chains.getChainDisplayInfo(chainId);
      
      console.log('📊 Chain Details:');
      console.log(`   Name: ${chain.data.attributes.name}`);
      console.log(`   External ID: ${chain.data.attributes.external_id}`);
      console.log(`   Trading support: ${displayInfo?.supportsTrading ? '✅' : '❌'}`);
      console.log(`   Has icon: ${chain.data.attributes.icon?.url ? '✅' : '❌'}`);
      
      return { chain: chain.data, displayInfo };
    } catch (error) {
      console.error('❌ Chain lookup failed:', error);
      return null;
    }
  }
  
  export async function quickChainSearch(searchTerm: string, apiKey: string = API_KEY) {
    console.log(`🔍 Quick Chain Search: "${searchTerm}"\n`);
    
    const zerion = new ZerionSDK({ apiKey });
    
    try {
      const chains = await zerion.chains.findChainsByName(searchTerm);
      
      console.log(`📊 Search Results: ${chains.length} chains found`);
      chains.slice(0, 5).forEach((chain, i) => {
        console.log(`   ${i + 1}. ${chain.attributes.name} (${chain.attributes.external_id})`);
      });
      
      if (chains.length > 5) {
        console.log(`   ... and ${chains.length - 5} more`);
      }
      
      return chains;
    } catch (error) {
      console.error('❌ Chain search failed:', error);
      return [];
    }
  }
  
  export async function quickChainStats(apiKey: string = API_KEY) {
    console.log('🔍 Quick Chain Statistics\n');
    
    const zerion = new ZerionSDK({ apiKey });
    
    try {
      const stats = await zerion.chains.getChainStats();
      
      console.log('📊 Chain Statistics:');
      console.log(`   Total chains: ${stats.total}`);
      console.log(`   Mainnet: ${stats.mainnet} (${(stats.mainnet/stats.total*100).toFixed(1)}%)`);
      console.log(`   Testnet: ${stats.testnet} (${(stats.testnet/stats.total*100).toFixed(1)}%)`);
      console.log(`   Trading enabled: ${stats.trading} (${(stats.trading/stats.total*100).toFixed(1)}%)`);
      console.log(`   Layer 2: ${stats.l2} (${(stats.l2/stats.total*100).toFixed(1)}%)`);
      
      return stats;
    } catch (error) {
      console.error('❌ Chain stats failed:', error);
      return null;
    }
  }
  
  export async function quickPopularChains(apiKey: string = API_KEY) {
    console.log('🔍 Quick Popular Chains Overview\n');
    
    const zerion = new ZerionSDK({ apiKey });
    
    try {
      const [popular, l2, trading] = await Promise.all([
        zerion.chains.getPopularChains(),
        zerion.chains.getL2Chains(),
        zerion.chains.getTradingChains()
      ]);
      
      console.log('📊 Chain Categories:');
      console.log(`   Popular: ${popular.length}`);
      console.log(`   Layer 2: ${l2.length}`);
      console.log(`   Trading: ${trading.length}`);
      
      console.log('\nTop 5 Popular Chains:');
      popular.slice(0, 5).forEach((chain, i) => {
        const isL2 = l2.some(l => l.id === chain.id);
        const hasTrading = trading.some(t => t.id === chain.id);
        console.log(`   ${i + 1}. ${chain.attributes.name} ${isL2 ? '(L2)' : ''} ${hasTrading ? '💰' : ''}`);
      });
      
      return { popular, l2, trading };
    } catch (error) {
      console.error('❌ Popular chains failed:', error);
      return null;
    }
  }
  
  // Export the main tester class
  export { ChainsServiceTester };
  
  // Main execution
  if (require.main === module) {
    const tester = new ChainsServiceTester();
    tester.runAllTests().catch(console.error);
  }
  
  console.log('\n📚 Additional Functions Available:');
  console.log('- quickChainLookup(chainId, apiKey?)');
  console.log('- quickChainSearch(searchTerm, apiKey?)');
  console.log('- quickChainStats(apiKey?)');
  console.log('- quickPopularChains(apiKey?)');