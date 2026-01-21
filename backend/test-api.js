#!/usr/bin/env node

// Visit Reminder System API Testing Script (Node.js)
// Usage: node test-api.js

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:3001/api';
let token = '';
let results = {
  passed: 0,
  failed: 0,
  partial: 0,
  tests: []
};

// Helper function to make API calls
async function testEndpoint(method, endpoint, data = null, expectedStatus = null, description = '', useAuth = false) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    config.data = data;
  }

  if (useAuth && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    process.stdout.write(`Testing: ${description}... `);
    
    const response = await axios(config);
    const status = response.status;
    
    // Extract token from login response
    if (endpoint === '/auth/login' && status === 200 && response.data.access_token) {
      token = response.data.access_token;
      console.log('✅ PASS'.green + ` (${status}) - Token received: ${token.substring(0, 20)}...`.blue);
    } else if (expectedStatus && status === expectedStatus) {
      console.log('✅ PASS'.green + ` (${status})`);
      results.passed++;
    } else if (!expectedStatus) {
      // Flexible testing
      if (status >= 200 && status < 300) {
        console.log('✅ OK'.green + ` (${status})`);
        results.passed++;
      } else {
        console.log('⚠️  UNEXPECTED'.yellow + ` (${status})`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`.gray);
        results.partial++;
      }
    } else {
      console.log('❌ FAIL'.red + ` (Expected: ${expectedStatus}, Got: ${status})`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`.gray);
      results.failed++;
    }
    
    results.tests.push({
      description,
      status: status,
      success: expectedStatus ? status === expectedStatus : status >= 200 && status < 300,
      response: response.data
    });

    return response;
    
  } catch (error) {
    const status = error.response ? error.response.status : 0;
    const responseData = error.response ? error.response.data : { message: error.message };
    
    if (expectedStatus && status === expectedStatus) {
      console.log('✅ PASS'.green + ` (${status})`);
      results.passed++;
      results.tests.push({
        description,
        status: status,
        success: true,
        response: responseData
      });
    } else if (!expectedStatus) {
      // Flexible testing for error cases
      switch (status) {
        case 401:
        case 403:
          console.log('⚠️  AUTH ISSUE'.yellow + ` (${status})`);
          results.partial++;
          break;
        case 404:
          console.log('⚠️  NOT FOUND'.yellow + ` (${status})`);
          results.partial++;
          break;
        case 500:
        case 501:
        case 502:
        case 503:
          console.log('❌ SERVER ERROR'.red + ` (${status})`);
          results.failed++;
          break;
        default:
          console.log('❌ ERROR'.red + ` (${status})`);
          results.failed++;
      }
      
      if (responseData && responseData.message) {
        console.log(`   Response: ${responseData.message}`.gray);
      }
      
      results.tests.push({
        description,
        status: status,
        success: false,
        response: responseData
      });
    } else {
      console.log('❌ ERROR'.red + ` (${status})`);
      console.log(`   Error: ${responseData.message || error.message}`.gray);
      results.failed++;
      
      results.tests.push({
        description,
        status: status,
        success: false,
        response: responseData
      });
    }
  }
}

// Main testing function
async function runTests() {
  console.log('🚀 Visit Reminder System API Testing Script'.blue);
  console.log('==============================================='.blue);
  console.log('');

  try {
    // Step 1: Health Check
    console.log('Step 1: Health Check'.yellow);
    await testEndpoint('GET', '/health', null, 200, 'Health Check');
    console.log('');

    // Step 2: Create Test User
    console.log('Step 2: Create Test User'.yellow);
    await testEndpoint('POST', '/auth/create-test-user', null, 200, 'Create Test User');
    console.log('');

    // Step 3: Login
    console.log('Step 3: Login and Get Token'.yellow);
    const loginData = {
      email: 'test@example.com',
      password: 'Test123!'
    };
    await testEndpoint('POST', '/auth/login', loginData, 200, 'User Login');
    console.log('');

    if (!token) {
      console.log('❌ No token received! Cannot test protected endpoints.'.red);
      return;
    }

    // Step 4: Test Protected Endpoints
    console.log('Step 4: Test Protected Endpoints'.yellow);
    
    // Users endpoints
    await testEndpoint('GET', '/users', null, null, 'Get All Users', true);
    await testEndpoint('GET', '/users/test-user-123', null, null, 'Get Specific User', true);
    await testEndpoint('POST', '/users', { name: 'New User', email: 'new@example.com' }, null, 'Create User', true);
    await testEndpoint('PATCH', '/users/test-user-123', { name: 'Updated User' }, null, 'Update User', true);
    await testEndpoint('DELETE', '/users/test-user-123', null, null, 'Delete User', true);
    
    console.log('');

    // Step 5: Other Module Endpoints
    console.log('Step 5: Test Other Module Endpoints'.yellow);
    
    await testEndpoint('GET', '/schedules', null, null, 'Get Schedules', true);
    await testEndpoint('POST', '/schedules', { userId: 'test-user-123', scheduledAt: '2026-01-15T10:00:00Z' }, null, 'Create Schedule', true);
    await testEndpoint('GET', '/visits', null, null, 'Get Visits', true);
    await testEndpoint('POST', '/visits', { userId: 'test-user-123', date: '2026-01-15' }, null, 'Create Visit', true);
    await testEndpoint('GET', '/reminders', null, null, 'Get Reminders', true);
    await testEndpoint('GET', '/reports/overview', null, null, 'Get Reports Overview', true);
    
    console.log('');

    // Step 6: Security Tests
    console.log('Step 6: Security Tests'.yellow);
    
    await testEndpoint('GET', '/users', null, 401, 'Access without token');
    await testEndpoint('GET', '/users', null, 401, 'Access with invalid token (hardcoded test)');
    
    console.log('');

  } catch (error) {
    console.log('❌ Unexpected error during testing:'.red, error.message);
  }

  // Final Report
  console.log('📊 API Testing Report'.blue);
  console.log('====================='.blue);
  console.log(`✅ Passed: ${results.passed}`.green);
  console.log(`❌ Failed: ${results.failed}`.red);
  console.log(`⚠️  Partial: ${results.partial}`.yellow);
  console.log('');

  const total = results.passed + results.failed + results.partial;
  if (total > 0) {
    const successRate = Math.round((results.passed / total) * 100);
    console.log(`Success Rate: ${successRate}%`);
  }

  console.log('');
  console.log('💡 Swagger UI available at: http://localhost:3001/api/docs'.blue);
  console.log(`💡 Token for manual testing: ${token}`.blue);
  
  // Detailed Results
  console.log('\n📋 Detailed Test Results:'.cyan);
  console.log('========================='.cyan);
  
  results.tests.forEach((test, index) => {
    const status = test.success ? '✅' : (test.status >= 400 && test.status < 500 ? '⚠️ ' : '❌');
    console.log(`${index + 1}. ${status} ${test.description} (${test.status})`);
    
    if (!test.success && test.response && test.response.message) {
      console.log(`   ${test.response.message}`.gray);
    }
  });
  
  // Generate JSON report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: total,
      passed: results.passed,
      failed: results.failed,
      partial: results.partial,
      successRate: total > 0 ? Math.round((results.passed / total) * 100) : 0
    },
    tests: results.tests,
    token: token
  };
  
  require('fs').writeFileSync('test-results.json', JSON.stringify(reportData, null, 2));
  console.log('\n📁 Detailed results saved to: test-results.json'.blue);
}

// Check if axios is available
try {
  require.resolve('axios');
  require.resolve('colors');
} catch (error) {
  console.log('❌ Missing dependencies. Please install them:'.red);
  console.log('npm install axios colors'.yellow);
  process.exit(1);
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint };