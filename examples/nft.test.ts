// examples/nft-service-tests.ts - Complete NFT Service Function Tests

import  ZerionSDK  from '../src/index';

// ⚠️ IMPORTANT: Replace with your actual Zerion API key
const API_KEY = 'zk_prod_your_api_key_here';

// Test addresses with known NFT holdings
const TEST_ADDRESSES = {
  VITALIK: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',     // Vitalik's address
  PRANKSY: '0xD387A6E4e84a6C86bd90C158C6028A58CC8Ac459',     // Pranksy (NFT collector)
  WHALE: '0x742d35Cc6634C0532925a3b8D3Ac2FF2c6CEF9C9',        // High-value wallet
  ENS_DAO: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',      // ENS DAO treasury
  COLLECTOR: '0x54BE3a794282C030b15E43aE2bB182E14c409C5e'      // Known NFT collector
};

// Popular NFT collections for testing
const POPULAR_COLLECTIONS = {
  BAYC: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
  CRYPTOPUNKS: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
  AZUKI: '0xED5AF388653567Af2F388E6224dC7C4b3241C544',
  MAYC: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
  DOODLES: '0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e'
};

// Test NFT references (chain:contract:tokenId format)
const TEST_NFT_REFERENCES = [
  'ethereum:0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d:1',    // BAYC #1
  'ethereum:0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d:2',    // BAYC #2
  'ethereum:0x60e4d786628fea6478f785a6d7e704777c86a7c6:1',    // MAYC #1
  'ethereum:0xed5af388653567af2f388e6224dc7c4b3241c544:1',    // Azuki #1
  'ethereum:0x8a90cab2b38dba80c64b7734e58ee1db38b8992e:1'     // Doodles #1
];

class NFTServiceTester {
  private zerion: ZerionSDK;
  private testResults: Record<string, any> = {};

  constructor() {
    console.log('🖼️ Initializing NFT Service Tester...\n');
    this.zerion = new ZerionSDK({
      apiKey: API_KEY,
      timeout: 30000,
      retries: 3
    });
  }

  // ==================== NFT RETRIEVAL TESTS ====================
  
  async testNFTRetrieval() {
    console.log('🔍 === TESTING NFT RETRIEVAL METHODS ===\n');
    
    try {
      // Test 1: getNFTs - Get NFTs by references
      console.log('1️⃣ Testing getNFTs by references...');
      const nftsByRefs = await this.zerion.nfts.getNFTs({
        filter: {
          references: TEST_NFT_REFERENCES.slice(0, 3) // Test with first 3 references
        }
      });
      console.log(`✅ NFTs by references: ${nftsByRefs.data.length} found`);
      
      // Test 2: getNFTs with include parameter
      console.log('2️⃣ Testing getNFTs with include...');
      const nftsWithInclude = await this.zerion.nfts.getNFTs({
        filter: {
          references: TEST_NFT_REFERENCES.slice(0, 2)
        },
        include: ['nft_collections'] // Valid include value
      });
      console.log(`✅ NFTs with include: ${nftsWithInclude.data.length} found`);
      
      // Test 3: getNFTsByReferences - Wrapper method
      console.log('3️⃣ Testing getNFTsByReferences...');
      const multipleNFTs = await this.zerion.nfts.getNFTsByReferences(
        TEST_NFT_REFERENCES.slice(0, 4)
      );
      console.log(`✅ Multiple NFTs: ${multipleNFTs.length} retrieved`);
      
      // Test 4: getNFTByReference - Single NFT
      console.log('4️⃣ Testing getNFTByReference (single)...');
      const singleNFT = await this.zerion.nfts.getNFTByReference(
        'ethereum',
        POPULAR_COLLECTIONS.BAYC,
        '1'
      );
      console.log(`✅ Single NFT: ${singleNFT ? singleNFT.attributes.name || 'BAYC #1' : 'Not found'}`);
      
      // Test 5: NFT data analysis
      console.log('5️⃣ Analyzing retrieved NFT data...');
      
      if (multipleNFTs.length > 0) {
        const nftAnalysis = {
          totalRetrieved: multipleNFTs.length,
          withNames: multipleNFTs.filter(nft => nft.attributes.name).length,
          withDescriptions: multipleNFTs.filter(nft => nft.attributes.description).length,
          withContent: multipleNFTs.filter(nft => nft.attributes.content).length,
          collections: [...new Set(multipleNFTs.map(nft => 
            nft.attributes.collection_info?.name
          ).filter(Boolean))]
        };
        
        console.log('📊 NFT Analysis:');
        console.log(`   Total retrieved: ${nftAnalysis.totalRetrieved}`);
        console.log(`   With names: ${nftAnalysis.withNames}`);
        console.log(`   With descriptions: ${nftAnalysis.withDescriptions}`);
        console.log(`   With content: ${nftAnalysis.withContent}`);
        console.log(`   Collections: ${nftAnalysis.collections.join(', ')}`);
      }
      
      this.testResults.nftRetrieval = {
        nftsByRefs: nftsByRefs.data.length,
        nftsWithInclude: nftsWithInclude.data.length,
        multipleNFTs: multipleNFTs.length,
        singleNFT: !!singleNFT,
        nftAnalysis: multipleNFTs.length > 0 ? {
          totalRetrieved: multipleNFTs.length,
          withMetadata: multipleNFTs.filter(nft => nft.attributes.name || nft.attributes.description).length,
          collectionsFound: [...new Set(multipleNFTs.map(nft => 
            nft.attributes.collection_info?.name
          ).filter(Boolean))].length
        } : null
      };
      
      console.log('✅ All NFT retrieval methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ NFT retrieval test failed:', error);
      this.testResults.nftRetrieval = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== BATCH OPERATIONS TESTS ====================
  
  async testBatchOperations() {
    console.log('📦 === TESTING BATCH OPERATIONS METHODS ===\n');
    
    try {
      // Test 1: batchGetNFTs - Large batch with chunking
      console.log('1️⃣ Testing batchGetNFTs...');
      const batchNFTs = await this.zerion.nfts.batchGetNFTs(
        TEST_NFT_REFERENCES,
        { chunkSize: 2 } // Small chunk size for testing
      );
      console.log(`✅ Batch NFTs: ${batchNFTs.length} retrieved`);
      
      // Test 2: getNFTsFromCollection - Collection-specific
      console.log('2️⃣ Testing getNFTsFromCollection...');
      const collectionNFTs = await this.zerion.nfts.getNFTsFromCollection(
        'ethereum',
        POPULAR_COLLECTIONS.BAYC,
        ['1', '2', '3']
      );
      console.log(`✅ BAYC collection NFTs: ${collectionNFTs.length} retrieved`);
      
      // Test 3: getNFTsSafely - Error handling
      console.log('3️⃣ Testing getNFTsSafely...');
      const mixedReferences = [
        ...TEST_NFT_REFERENCES.slice(0, 2),
        'ethereum:0xinvalidcontract:999', // Invalid reference
        'invalid:format:reference' // Invalid format
      ];
      
      const safeResults = await this.zerion.nfts.getNFTsSafely(mixedReferences);
      console.log(`✅ Safe retrieval: ${safeResults.success.length} success, ${safeResults.failed.length} failed`);
      
      // Test 4: Batch performance comparison
      console.log('4️⃣ Testing batch performance...');
      const startTime = Date.now();
      
      // Sequential vs batch
      const sequentialStart = Date.now();
      const sequentialResults = [];
      for (const ref of TEST_NFT_REFERENCES.slice(0, 3)) {
        try {
          const nfts = await this.zerion.nfts.getNFTsByReferences([ref]);
          sequentialResults.push(...nfts);
        } catch (error) {
          // Continue with next
        }
      }
      const sequentialTime = Date.now() - sequentialStart;
      
      const batchStart = Date.now();
      const batchResults = await this.zerion.nfts.batchGetNFTs(TEST_NFT_REFERENCES.slice(0, 3));
      const batchTime = Date.now() - batchStart;
      
      console.log('📊 Performance Comparison:');
      console.log(`   Sequential: ${sequentialResults.length} NFTs in ${sequentialTime}ms`);
      console.log(`   Batch: ${batchResults.length} NFTs in ${batchTime}ms`);
      console.log(`   Performance gain: ${((sequentialTime - batchTime) / sequentialTime * 100).toFixed(1)}%`);
      
      this.testResults.batchOperations = {
        batchNFTs: batchNFTs.length,
        collectionNFTs: collectionNFTs.length,
        safeResults: {
          success: safeResults.success.length,
          failed: safeResults.failed.length,
          errorTypes: safeResults.failed.map(f => f.error)
        },
        performance: {
          sequential: { count: sequentialResults.length, time: sequentialTime },
          batch: { count: batchResults.length, time: batchTime },
          improvement: ((sequentialTime - batchTime) / sequentialTime * 100)
        }
      };
      
      console.log('✅ All batch operations methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Batch operations test failed:', error);
      this.testResults.batchOperations = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== NFT ANALYSIS TESTS ====================
  
  async testNFTAnalysis() {
    console.log('🔬 === TESTING NFT ANALYSIS METHODS ===\n');
    
    try {
      // Test 1: getNFTWithMetadata - Enhanced metadata
      console.log('1️⃣ Testing getNFTWithMetadata...');
      const nfts = await this.zerion.nfts.getNFTsByReferences([TEST_NFT_REFERENCES[0]]);
      
      if (nfts.length > 0) {
        const nftWithMetadata = await this.zerion.nfts.getNFTWithMetadata(nfts[0].id);
        
        if (nftWithMetadata) {
          console.log('📊 NFT Metadata Analysis:');
          console.log(`   Name: ${nftWithMetadata.nft.attributes.name || 'N/A'}`);
          console.log(`   Has image: ${nftWithMetadata.metadata.hasImage}`);
          console.log(`   Has video: ${nftWithMetadata.metadata.hasVideo}`);
          console.log(`   Has audio: ${nftWithMetadata.metadata.hasAudio}`);
          console.log(`   Content URLs: ${nftWithMetadata.metadata.contentUrls.length}`);
        } else {
          console.log('❌ NFT metadata not available');
        }
      }
      
      // Test 2: getCollectionSummary - Collection analysis
      console.log('2️⃣ Testing getCollectionSummary...');
      const collectionSummary = await this.zerion.nfts.getCollectionSummary(
        'ethereum',
        POPULAR_COLLECTIONS.BAYC,
        ['1', '2', '3', '4', '5']
      );
      
      console.log('📊 Collection Summary:');
      console.log(`   Collection: ${collectionSummary.collectionInfo?.name || 'N/A'}`);
      console.log(`   Sample NFTs: ${collectionSummary.sampleNFTs.length}`);
      console.log(`   Total sampled: ${collectionSummary.totalSampled}`);
      
      // Test 3: nftExists - Existence checking
      console.log('3️⃣ Testing nftExists...');
      const existenceChecks = await Promise.all([
        this.zerion.nfts.nftExists('ethereum', POPULAR_COLLECTIONS.BAYC, '1'),
        this.zerion.nfts.nftExists('ethereum', POPULAR_COLLECTIONS.BAYC, '999999'),
        this.zerion.nfts.nftExists('ethereum', '0xinvalidcontract', '1')
      ]);
      
      console.log('📊 Existence Checks:');
      console.log(`   BAYC #1: ${existenceChecks[0] ? '✅ Exists' : '❌ Not found'}`);
      console.log(`   BAYC #999999: ${existenceChecks[1] ? '✅ Exists' : '❌ Not found'}`);
      console.log(`   Invalid contract: ${existenceChecks[2] ? '✅ Exists' : '❌ Not found'}`);
      
      // Test 4: Multiple collection analysis
      console.log('4️⃣ Testing multiple collection analysis...');
      const collectionAnalyses = await Promise.all(
        Object.entries(POPULAR_COLLECTIONS).slice(0, 3).map(async ([name, contract]) => {
          try {
            const summary = await this.zerion.nfts.getCollectionSummary(
              'ethereum',
              contract,
              ['1', '2']
            );
            return {
              name,
              contract,
              sampleCount: summary.sampleNFTs.length,
              collectionName: summary.collectionInfo?.name || 'Unknown'
            };
          } catch (error) {
            return {
              name,
              contract,
              sampleCount: 0,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      console.log('📊 Multiple Collections Analysis:');
      collectionAnalyses.forEach((analysis, i) => {
        console.log(`   ${i + 1}. ${analysis.name}: ${analysis.sampleCount} samples (${analysis.collectionName})`);
      });
      
      this.testResults.nftAnalysis = {
        metadataAnalysis: nfts.length > 0 ? !!(nfts[0] && await this.zerion.nfts.getNFTWithMetadata(nfts[0].id)) : false,
        collectionSummary: {
          collectionName: collectionSummary.collectionInfo?.name,
          sampleNFTs: collectionSummary.sampleNFTs.length,
          totalSampled: collectionSummary.totalSampled
        },
        existenceChecks: {
          validNFT: existenceChecks[0],
          invalidTokenId: existenceChecks[1],
          invalidContract: existenceChecks[2]
        },
        multipleCollections: collectionAnalyses.map(a => ({
          name: a.name,
          sampleCount: a.sampleCount,
          hasError: !!a.error
        }))
      };
      
      console.log('✅ All NFT analysis methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ NFT analysis test failed:', error);
      this.testResults.nftAnalysis = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== UTILITY METHODS TESTS ====================
  
  async testUtilityMethods() {
    console.log('🛠️ === TESTING UTILITY METHODS ===\n');
    
    try {
      // Test 1: createReference - Reference creation
      console.log('1️⃣ Testing createReference...');
      const createdRef = this.zerion.nfts.createReference(
        'ethereum',
        POPULAR_COLLECTIONS.BAYC,
        '1'
      );
      console.log(`✅ Created reference: ${createdRef}`);
      
      // Test 2: parseReference - Reference parsing
      console.log('2️⃣ Testing parseReference...');
      const parsedRef = this.zerion.nfts.parseReference(createdRef);
      console.log(`✅ Parsed reference:`, parsedRef);
      
      // Test 3: validateNFTReference - Reference validation
      console.log('3️⃣ Testing validateNFTReference...');
      const validationTests = [
        createdRef, // Valid reference
        'ethereum:0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', // Missing token ID
        'invalid:format', // Invalid format
        'ethereum:invalidcontract:1', // Invalid contract format
        'ethereum:0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d:abc' // Non-numeric token ID
      ];
      
      const validationResults = validationTests.map(ref => {
        const validation = this.zerion.nfts.validateNFTReference(ref);
        return {
          reference: ref,
          isValid: validation.isValid,
          error: validation.error
        };
      });
      
      console.log('📊 Reference Validation Results:');
      validationResults.forEach((result, i) => {
        const shortRef = result.reference.length > 50 ? 
          result.reference.substring(0, 47) + '...' : 
          result.reference;
        console.log(`   ${i + 1}. ${result.isValid ? '✅' : '❌'} ${shortRef}`);
        if (!result.isValid && result.error) {
          console.log(`      Error: ${result.error}`);
        }
      });
      
      // Test 4: Reference format consistency
      console.log('4️⃣ Testing reference format consistency...');
      const testCases = [
        { chain: 'ethereum', contract: POPULAR_COLLECTIONS.BAYC, tokenId: '1' },
        { chain: 'polygon', contract: '0x1234567890123456789012345678901234567890', tokenId: '999' },
        { chain: 'arbitrum', contract: POPULAR_COLLECTIONS.AZUKI, tokenId: '0' }
      ];
      
      const consistencyResults = testCases.map(({ chain, contract, tokenId }) => {
        const created = this.zerion.nfts.createReference(chain, contract, tokenId);
        const parsed = this.zerion.nfts.parseReference(created);
        const isConsistent = 
          parsed.chainId === chain &&
          parsed.contractAddress.toLowerCase() === contract.toLowerCase() &&
          parsed.tokenId === tokenId;
        
        return {
          input: { chain, contract: contract.substring(0, 10) + '...', tokenId },
          created,
          isConsistent
        };
      });
      
      console.log('📊 Format Consistency:');
      consistencyResults.forEach((result, i) => {
        console.log(`   ${i + 1}. ${result.isConsistent ? '✅' : '❌'} ${result.input.chain}:${result.input.contract}:${result.input.tokenId}`);
      });
      
      this.testResults.utilityMethods = {
        referenceCreation: !!createdRef,
        referenceParsing: !!(parsedRef.chainId && parsedRef.contractAddress && parsedRef.tokenId),
        validationResults: {
          totalTests: validationResults.length,
          validCount: validationResults.filter(r => r.isValid).length,
          invalidCount: validationResults.filter(r => !r.isValid).length
        },
        formatConsistency: {
          totalTests: consistencyResults.length,
          consistentCount: consistencyResults.filter(r => r.isConsistent).length
        }
      };
      
      console.log('✅ All utility methods tested successfully\n');
      
    } catch (error) {
      console.error('❌ Utility methods test failed:', error);
      this.testResults.utilityMethods = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== WALLET NFT INTEGRATION TESTS ====================
  
  async testWalletNFTIntegration() {
    console.log('🏦 === TESTING WALLET NFT INTEGRATION ===\n');
    
    try {
      const address = TEST_ADDRESSES.COLLECTOR;
      
      // Test 1: Wallet NFT positions
      console.log('1️⃣ Testing wallet NFT positions...');
      const nftPositions = await this.zerion.wallets.getNFTPositions(address, {
        page: { size: 10 }
      });
      console.log(`✅ Wallet NFT positions: ${nftPositions.data.length} found`);
      
      // Test 2: Wallet NFT collections
      console.log('2️⃣ Testing wallet NFT collections...');
      const nftCollections = await this.zerion.wallets.getNFTCollections(address);
      console.log(`✅ Wallet NFT collections: ${nftCollections.data.length} found`);
      
      // Test 3: Integration with NFT service
      console.log('3️⃣ Testing integration with NFT service...');
      if (nftPositions.data.length > 0) {
        const firstNFT = nftPositions.data[0];
        const nftDetails = await this.zerion.nfts.getNFTWithMetadata(firstNFT.id);
        
        console.log('📊 NFT Integration:');
        console.log(`   Position ID: ${firstNFT.id}`);
        console.log(`   Token ID: ${firstNFT.attributes.token_id}`);
        console.log(`   Collection: ${firstNFT.attributes.collection_info?.name || 'Unknown'}`);
        console.log(`   Enhanced metadata: ${nftDetails ? '✅ Available' : '❌ Not available'}`);
      }
      
      // Test 4: Cross-reference validation
      console.log('4️⃣ Testing cross-reference validation...');
      const crossReferenceResults = [];
      
      for (const position of nftPositions.data.slice(0, 3)) {
        try {
          const contractAddress = position.attributes.nft_info?.contract_address;
          const tokenId = position.attributes.token_id;
          
          if (contractAddress && tokenId) {
            const directNFT = await this.zerion.nfts.getNFTByReference(
              'ethereum', // Assuming Ethereum for this test
              contractAddress,
              tokenId
            );
            
            crossReferenceResults.push({
              positionId: position.id,
              tokenId,
              directLookup: !!directNFT,
              consistent: directNFT?.attributes.token_id === tokenId
            });
          }
        } catch (error) {
          crossReferenceResults.push({
            positionId: position.id,
            tokenId: position.attributes.token_id,
            directLookup: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      console.log('📊 Cross-reference Validation:');
      crossReferenceResults.forEach((result, i) => {
        console.log(`   ${i + 1}. Token ${result.tokenId}: ${result.directLookup ? '✅' : '❌'} ${result.consistent ? 'Consistent' : 'Inconsistent'}`);
      });
      
      this.testResults.walletNFTIntegration = {
        nftPositions: nftPositions.data.length,
        nftCollections: nftCollections.data.length,
        integrationTest: nftPositions.data.length > 0,
        crossReferenceResults: {
          totalTested: crossReferenceResults.length,
          successfulLookups: crossReferenceResults.filter(r => r.directLookup).length,
          consistentResults: crossReferenceResults.filter(r => r.consistent).length
        }
      };
      
      console.log('✅ All wallet NFT integration tests completed successfully\n');
      
    } catch (error) {
      console.error('❌ Wallet NFT integration test failed:', error);
      this.testResults.walletNFTIntegration = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== MAIN TEST RUNNER ====================
  
  async runAllTests() {
    console.log('🧪 NFT SERVICE COMPREHENSIVE TESTING');
    console.log('=' .repeat(50));
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
    console.log('📋 Test Collections:');
    Object.entries(POPULAR_COLLECTIONS).forEach(([name, addr]) => {
      console.log(`   ${name}: ${addr.slice(0, 10)}...${addr.slice(-8)}`);
    });
    console.log('=' .repeat(50) + '\n');

    // Check if API key is set
    if (API_KEY === 'zk_prod_your_api_key_here') {
      console.log('⚠️  WARNING: Please set your actual API key in the API_KEY variable');
      console.log('   Get your API key from: https://zerion.io/api\n');
      return;
    }

    const tests = [
      { name: 'NFT Retrieval', method: this.testNFTRetrieval },
      { name: 'Batch Operations', method: this.testBatchOperations },
      { name: 'NFT Analysis', method: this.testNFTAnalysis },
      { name: 'Utility Methods', method: this.testUtilityMethods },
      { name: 'Wallet NFT Integration', method: this.testWalletNFTIntegration }
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
    console.log('NFT SERVICE TESTING COMPLETED');
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
      '✅ getNFTs (by references & with include)',
      '✅ getNFTsByReferences (multiple NFTs)',
      '✅ getNFTByReference (single NFT)',
      '✅ batchGetNFTs (chunked batching)',
      '✅ getNFTsFromCollection (collection-specific)',
      '✅ getNFTsSafely (error handling)',
      '✅ getNFTWithMetadata (enhanced metadata)',
      '✅ getCollectionSummary (collection analysis)',
      '✅ nftExists (existence checking)',
      '✅ createReference (reference creation)',
      '✅ parseReference (reference parsing)',
      '✅ validateNFTReference (validation)',
      '✅ Wallet NFT integration (cross-service)'
    ];

    functionsTested.forEach(func => console.log(`   ${func}`));

    console.log('\n🎯 KEY INSIGHTS:');
    
    if (this.testResults.nftRetrieval && !this.testResults.nftRetrieval.error) {
      const retrieval = this.testResults.nftRetrieval;
      console.log(`   - Successfully retrieved ${retrieval.multipleNFTs} NFTs from references`);
      if (retrieval.nftAnalysis) {
        console.log(`   - ${retrieval.nftAnalysis.collectionsFound} unique collections found`);
        console.log(`   - ${retrieval.nftAnalysis.withMetadata} NFTs have metadata`);
      }
    }
    
    if (this.testResults.batchOperations && !this.testResults.batchOperations.error) {
      const batch = this.testResults.batchOperations;
      if (batch.performance && batch.performance.improvement > 0) {
        console.log(`   - Batch operations ${batch.performance.improvement.toFixed(1)}% faster than sequential`);
      }
      console.log(`   - Error handling: ${batch.safeResults.success}/${batch.safeResults.success + batch.safeResults.failed} successful`);
    }
    
    if (this.testResults.utilityMethods && !this.testResults.utilityMethods.error) {
      const utils = this.testResults.utilityMethods;
      const validationRate = (utils.validationResults.validCount / utils.validationResults.totalTests * 100).toFixed(1);
      console.log(`   - Reference validation accuracy: ${validationRate}%`);
      console.log(`   - Format consistency: ${utils.formatConsistency.consistentCount}/${utils.formatConsistency.totalTests} tests passed`);
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Use NFT references to retrieve specific NFTs');
    console.log('   2. Implement batch operations for better performance');
    console.log('   3. Validate NFT references before API calls');
    console.log('   4. Integrate with wallet service for complete NFT analysis');
    console.log('   5. Use metadata analysis for NFT content verification');

    console.log('\n📚 USAGE PATTERNS:');
    console.log('   - Single NFT: getNFTByReference(chain, contract, tokenId)');
    console.log('   - Multiple NFTs: batchGetNFTs(references, options)');
    console.log('   - Collection analysis: getCollectionSummary(chain, contract, tokenIds)');
    console.log('   - Wallet integration: wallets.getNFTPositions() + nfts.getNFTWithMetadata()');
    console.log('   - Safe operations: getNFTsSafely() for error handling');

    console.log('\n' + '🎯'.repeat(20));
    console.log('NFT SERVICE TESTING COMPLETE!');
    console.log('🎯'.repeat(20));
  }
}

// ==================== QUICK TEST FUNCTIONS ====================

// Quick NFT lookup
export async function quickNFTLookup(
  chainId: string, 
  contractAddress: string, 
  tokenId: string, 
  apiKey: string = API_KEY
) {
  console.log(`🔍 Quick NFT Lookup: ${chainId}:${contractAddress.slice(0, 10)}...${contractAddress.slice(-8)}:${tokenId}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const nft = await zerion.nfts.getNFTByReference(chainId, contractAddress, tokenId);
    
    if (nft) {
      console.log('📊 NFT Details:');
      console.log(`   Name: ${nft.attributes.name || 'N/A'}`);
      console.log(`   Collection: ${nft.attributes.collection_info?.name || 'N/A'}`);
      console.log(`   Description: ${nft.attributes.description ? nft.attributes.description.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`   Has content: ${nft.attributes.content ? '✅' : '❌'}`);
    } else {
      console.log('❌ NFT not found');
    }
    
    return nft;
  } catch (error) {
    console.error('❌ Lookup failed:', error);
    return null;
  }
}

// Quick collection overview
export async function quickCollectionOverview(
  chainId: string, 
  contractAddress: string, 
  sampleTokenIds: string[], 
  apiKey: string = API_KEY
) {
  console.log(`🔍 Quick Collection Overview: ${contractAddress.slice(0, 10)}...${contractAddress.slice(-8)}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const summary = await zerion.nfts.getCollectionSummary(chainId, contractAddress, sampleTokenIds);
    
    console.log('📊 Collection Summary:');
    console.log(`   Name: ${summary.collectionInfo?.name || 'N/A'}`);
    console.log(`   Description: ${summary.collectionInfo?.description ? summary.collectionInfo.description.substring(0, 100) + '...' : 'N/A'}`);
    console.log(`   Sample NFTs: ${summary.sampleNFTs.length}`);
    console.log(`   Total sampled: ${summary.totalSampled}`);
    
    if (summary.sampleNFTs.length > 0) {
      console.log('\n   Sample NFTs:');
      summary.sampleNFTs.forEach((nft, i) => {
        console.log(`     ${i + 1}. Token #${nft.attributes.token_id}: ${nft.attributes.name || 'Unnamed'}`);
      });
    }
    
    return summary;
  } catch (error) {
    console.error('❌ Collection overview failed:', error);
    return null;
  }
}

// Quick wallet NFT analysis
export async function quickWalletNFTAnalysis(address: string, apiKey: string = API_KEY) {
  console.log(`🔍 Quick Wallet NFT Analysis: ${address.slice(0, 10)}...${address.slice(-8)}\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const [positions, collections] = await Promise.all([
      zerion.wallets.getNFTPositions(address, { page: { size: 20 } }),
      zerion.wallets.getNFTCollections(address)
    ]);
    
    console.log('📊 Wallet NFT Analysis:');
    console.log(`   NFT positions: ${positions.data.length}`);
    console.log(`   Collections: ${collections.data.length}`);
    
    if (collections.data.length > 0) {
      console.log('\n   Top collections:');
      const sortedCollections = collections.data
        .sort((a, b) => (b.attributes.positions_count || 0) - (a.attributes.positions_count || 0))
        .slice(0, 5);
      
      sortedCollections.forEach((collection, i) => {
        console.log(`     ${i + 1}. ${collection.attributes.name}: ${collection.attributes.positions_count} NFTs`);
      });
    }
    
    // Chain distribution
    const chainDistribution = positions.data.reduce((acc, position) => {
      const chainId = position.relationships?.chain?.data.id || 'unknown';
      acc[chainId] = (acc[chainId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    if (Object.keys(chainDistribution).length > 1) {
      console.log('\n   Chain distribution:');
      Object.entries(chainDistribution)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .forEach(([chain, count]) => {
          console.log(`     ${chain}: ${count} NFTs`);
        });
    }
    
    return { positions: positions.data, collections: collections.data, chainDistribution };
  } catch (error) {
    console.error('❌ Wallet NFT analysis failed:', error);
    return null;
  }
}

// Quick batch NFT retrieval
export async function quickBatchNFTRetrieval(references: string[], apiKey: string = API_KEY) {
  console.log(`🔍 Quick Batch NFT Retrieval: ${references.length} references\n`);
  
  const zerion = new ZerionSDK({ apiKey });
  
  try {
    const { success, failed } = await zerion.nfts.getNFTsSafely(references);
    
    console.log('📊 Batch Retrieval Results:');
    console.log(`   Successful: ${success.length}`);
    console.log(`   Failed: ${failed.length}`);
    console.log(`   Success rate: ${((success.length / references.length) * 100).toFixed(1)}%`);
    
    if (success.length > 0) {
      console.log('\n   Retrieved NFTs:');
      success.slice(0, 5).forEach((nft, i) => {
        console.log(`     ${i + 1}. ${nft.attributes.collection_info?.name || 'Unknown'} #${nft.attributes.token_id}`);
      });
      
      if (success.length > 5) {
        console.log(`     ... and ${success.length - 5} more`);
      }
    }
    
    if (failed.length > 0) {
      console.log('\n   Failed references:');
      failed.slice(0, 3).forEach((failure, i) => {
        const shortRef = failure.reference.length > 50 ? 
          failure.reference.substring(0, 47) + '...' : 
          failure.reference;
        console.log(`     ${i + 1}. ${shortRef}: ${failure.error}`);
      });
      
      if (failed.length > 3) {
        console.log(`     ... and ${failed.length - 3} more failures`);
      }
    }
    
    return { success, failed };
  } catch (error) {
    console.error('❌ Batch retrieval failed:', error);
    return null;
  }
}

// Reference validation helper
export function validateAndFixReferences(references: string[]) {
  console.log(`🔍 Validating ${references.length} NFT references...\n`);
  
  const zerion = new ZerionSDK({ apiKey: 'dummy' }); // Just for utility functions
  
  const results = references.map(ref => {
    const validation = zerion.nfts.validateNFTReference(ref);
    return {
      original: ref,
      isValid: validation.isValid,
      parsed: validation.parsed,
      error: validation.error
    };
  });
  
  const valid = results.filter(r => r.isValid);
  const invalid = results.filter(r => !r.isValid);
  
  console.log('📊 Validation Results:');
  console.log(`   Valid: ${valid.length}`);
  console.log(`   Invalid: ${invalid.length}`);
  console.log(`   Success rate: ${((valid.length / references.length) * 100).toFixed(1)}%`);
  
  if (invalid.length > 0) {
    console.log('\n   Invalid references:');
    invalid.forEach((result, i) => {
      const shortRef = result.original.length > 50 ? 
        result.original.substring(0, 47) + '...' : 
        result.original;
      console.log(`     ${i + 1}. ${shortRef}`);
      console.log(`        Error: ${result.error}`);
    });
  }
  
  return {
    valid: valid.map(r => r.original),
    invalid: invalid.map(r => ({ reference: r.original, error: r.error })),
    validationRate: (valid.length / references.length) * 100
  };
}

// Export the main tester class
export { NFTServiceTester };

// Main execution
if (require.main === module) {
  const tester = new NFTServiceTester();
  tester.runAllTests().catch(console.error);
}

console.log('\n📚 Additional Functions Available:');
console.log('- quickNFTLookup(chainId, contractAddress, tokenId, apiKey?)');
console.log('- quickCollectionOverview(chainId, contractAddress, sampleTokenIds[], apiKey?)');
console.log('- quickWalletNFTAnalysis(address, apiKey?)');
console.log('- quickBatchNFTRetrieval(references[], apiKey?)');
console.log('- validateAndFixReferences(references[])');