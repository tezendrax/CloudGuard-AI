#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testUIComponents() {
  console.log('🎨 Testing UI Components and Interactions...\n');
  
  const tests = [
    {
      name: 'Main Dashboard Load',
      test: async () => {
        const response = await makeRequest(BASE_URL);
        return response.statusCode === 200 && 
               response.data.includes('CloudGuard') &&
               response.data.includes('dashboard');
      }
    },
    {
      name: 'Real-time Metrics Component',
      test: async () => {
        const response = await makeRequest(BASE_URL + '/api/metrics?resourceId=test');
        return response.statusCode === 200;
      }
    },
    {
      name: 'Cloud Resources Component',
      test: async () => {
        const response = await makeRequest(BASE_URL + '/api/cloud/resources');
        return response.statusCode === 200;
      }
    },
    {
      name: 'Digital Twin Visualization',
      test: async () => {
        const response = await makeRequest(BASE_URL + '/api/digital-twins');
        return response.statusCode === 200;
      }
    },
    {
      name: 'Cost Optimization',
      test: async () => {
        const response = await makeRequest(BASE_URL + '/api/cost/optimization');
        return response.statusCode === 200;
      }
    },
    {
      name: 'Security Monitoring',
      test: async () => {
        const response = await makeRequest(BASE_URL + '/api/security/events');
        return response.statusCode === 200;
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.test();
      if (result) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 UI Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All UI components are working perfectly!');
  } else {
    console.log('\n⚠️  Some components need attention.');
  }
}

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname + urlObj.search,
      method: method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

testUIComponents().catch(console.error);
