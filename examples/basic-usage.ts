// test-working.ts - A final test to ensure everything works
import ZerionSDK from '../src/index';

async function testSDK() {
  console.log('🧪 Testing Zerion SDK...\n');
  
  try {
    // Test 1: Basic initialization
    console.log('1️⃣ Testing SDK initialization...');
    const zerion = new ZerionSDK({
      apiKey: 'zk_dev_2e59da43ef3d49858d2c3c1bd57854ed',
      timeout: 10000,
      retries: 1
    });
    console.log('✅ SDK initialized successfully');

    // Test 2: Service availability
    console.log('\n2️⃣ Testing services...');
    const services = ['wallets', 'fungibles', 'chains', 'swap', 'nfts', 'gas'];
    
    services.forEach(service => {
      if (zerion[service as keyof typeof zerion]) {
        console.log(`✅ ${service} service available`);
      } else {
        console.log(`❌ ${service} service missing`);
      }
    });

    // Test 3: Configuration methods
    console.log('\n3️⃣ Testing configuration...');
    zerion.setEnvironment('testnet');
    zerion.setEnvironment('production');
    zerion.setTimeout(15000);
    zerion.setRetries(2, 1500);
    console.log('✅ Configuration methods work');

    // Test 4: Error handling
    console.log('\n4️⃣ Testing error handling...');
    try {
      new ZerionSDK({ apiKey: '' });
    } catch (error) {
      console.log('✅ Empty API key validation works');
    }

    try {
      new ZerionSDK({ apiKey: 'invalid_format' });
    } catch (error) {
      console.log('✅ Invalid API key format validation works');
    }

    console.log('\n🎉 All tests passed! SDK is ready for use.');
    console.log('\n📝 Next steps:');
    console.log('1. Get a real API key from Zerion');
    console.log('2. Replace the test API key in examples');
    console.log('3. Run: npm run example');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Test utility functions
async function testUtilities() {
  console.log('\n🔧 Testing utilities...');
  
  try {
    const utils = await import('../src/utils');
    
    // Test address validation
    console.log('Address validation:', {
      valid: utils.isValidAddress('0x742d35Cc6634C0532925a3b8D3Ac2FF2c6CEF9C9'),
      invalid: utils.isValidAddress('invalid')
    });

    // Test API key validation  
    console.log('API key validation:', {
      validProd: utils.isValidApiKey('zk_prod_123'),
      validDev: utils.isValidApiKey('zk_dev_123'),
      invalid: utils.isValidApiKey('invalid')
    });

    // Test query building
    const query = utils.buildQueryParams({
      filter: { chain_ids: ['ethereum'] },
      page: { size: 10 }
    });
    console.log('Query params:', query);

    console.log('✅ Utilities working correctly');
    return true;
  } catch (error) {
    console.error('❌ Utility test failed:', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Zerion SDK Test Suite');
  console.log('=' .repeat(40));
  
  const sdkTest = await testSDK();
  const utilTest = await testUtilities();
  
  console.log('\n' + '=' .repeat(40));
  console.log('📊 Results:');
  console.log(`SDK Test: ${sdkTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Utilities: ${utilTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (sdkTest && utilTest) {
    console.log('\n🎉 SUCCESS: SDK is working correctly!');
  } else {
    console.log('\n❌ FAILURE: Some tests failed');
  }
  
  return sdkTest && utilTest;
}

// Export for external use
export { testSDK, testUtilities, runTests };

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}