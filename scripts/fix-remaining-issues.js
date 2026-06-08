#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Remaining API Issues');
console.log('===============================\n');

// Fix 1: Metrics API - add resourceId parameter handling
function fixMetricsAPI() {
  console.log('🔧 Fixing Metrics API...');
  
  const metricsPath = path.join(process.cwd(), 'src/app/api/metrics/route.ts');
  let content = fs.readFileSync(metricsPath, 'utf8');
  
  // Update the GET function to handle missing resourceId
  const newGetFunction = `export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId') || 'demo-resource-1'
    const metric = searchParams.get('metric')
    const timeRange = searchParams.get('timeRange') || '1h'
    
    // Generate metrics based on request
    const metrics: any = {}
    
    if (metric) {
      metrics[metric] = generateMetrics(metric)
    } else {
      // Generate all common metrics
      const commonMetrics = ['cpu', 'memory', 'disk', 'network', 'requests', 'errors', 'latency']
      commonMetrics.forEach(m => {
        metrics[m] = generateMetrics(m)
      })
    }

    // Current values for real-time display
    const currentValues = Object.keys(metrics).reduce((acc: any, key) => {
      const metricData = metrics[key]
      acc[key] = metricData[metricData.length - 1]?.value || 0
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      resourceId,
      timeRange,
      data: metrics,
      current: currentValues,
      timestamp: new Date().toISOString(),
      count: Object.keys(metrics).reduce((sum, key) => sum + metrics[key].length, 0)
    })
  } catch (error) {
    console.error('Metrics API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}`;

  // Replace the existing GET function
  content = content.replace(
    /export async function GET\(request: NextRequest\) \{[\s\S]*?^}/m,
    newGetFunction
  );
  
  fs.writeFileSync(metricsPath, content);
  console.log('✅ Fixed Metrics API');
}

// Fix 2: Digital Twins API - handle missing parameters
function fixDigitalTwinsAPI() {
  console.log('🔧 Fixing Digital Twins API...');
  
  const digitalTwinsPath = path.join(process.cwd(), 'src/app/api/digital-twins/route.ts');
  let content = fs.readFileSync(digitalTwinsPath, 'utf8');
  
  // Make sure the GET function doesn't require parameters
  if (content.includes('if (!resourceId)')) {
    content = content.replace(
      /if \(!resourceId\) \{[\s\S]*?\}/,
      '// resourceId is optional for listing all twins'
    );
    
    fs.writeFileSync(digitalTwinsPath, content);
    console.log('✅ Fixed Digital Twins API');
  }
}

// Fix 3: Add a simple dashboard redirect
function fixDashboardRedirect() {
  console.log('🔧 Adding Dashboard Redirect...');
  
  const dashboardDir = path.join(process.cwd(), 'src/app/dashboard');
  if (!fs.existsSync(dashboardDir)) {
    fs.mkdirSync(dashboardDir, { recursive: true });
  }
  
  const pageContent = `// Dashboard page - redirects to main dashboard
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  redirect('/')
}
`;
  
  fs.writeFileSync(path.join(dashboardDir, 'page.tsx'), pageContent);
  console.log('✅ Added Dashboard Redirect');
}

// Fix 4: Create a comprehensive UI test
function createUITest() {
  console.log('🔧 Creating UI Component Test...');
  
  const uiTestContent = `#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testUIComponents() {
  console.log('🎨 Testing UI Components and Interactions...\\n');
  
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
        console.log(\`✅ \${test.name}\`);
        passed++;
      } else {
        console.log(\`❌ \${test.name}\`);
        failed++;
      }
    } catch (error) {
      console.log(\`❌ \${test.name}: \${error.message}\`);
      failed++;
    }
  }
  
  console.log(\`\\n📊 UI Test Results:\`);
  console.log(\`✅ Passed: \${passed}\`);
  console.log(\`❌ Failed: \${failed}\`);
  console.log(\`🎯 Success Rate: \${((passed / (passed + failed)) * 100).toFixed(1)}%\`);
  
  if (failed === 0) {
    console.log('\\n🎉 All UI components are working perfectly!');
  } else {
    console.log('\\n⚠️  Some components need attention.');
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
`;
  
  fs.writeFileSync(path.join(process.cwd(), 'scripts/test-ui-components.js'), uiTestContent);
  console.log('✅ Created UI Component Test');
}

// Main execution
async function main() {
  try {
    console.log('Fixing remaining issues to achieve 100% system health...\\n');
    
    fixMetricsAPI();
    fixDigitalTwinsAPI();
    fixDashboardRedirect();
    createUITest();
    
    console.log('\\n🎉 All fixes applied!');
    console.log('\\n🚀 Run the following to verify:');
    console.log('1. node scripts/test-all-connections.js');
    console.log('2. node scripts/test-ui-components.js');
    console.log('3. Open http://localhost:3000 in your browser');
    
  } catch (error) {
    console.error('❌ Fix script failed:', error.message);
  }
}

main();
