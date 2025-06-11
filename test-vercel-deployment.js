const https = require('https');

async function testAPI() {
  const baseURL = 'trell-n4yqaz4jx-vatsonios-projects.vercel.app';
  
  console.log('🧪 Testing Vercel deployment API endpoints...');
  console.log(`📍 Base URL: https://${baseURL}`);
  
  // Test 1: Create a board
  console.log('\n1️⃣ Testing board creation...');
  
  const data = JSON.stringify({ name: 'Test Board from CLI' });
  
  const options = {
    hostname: baseURL,
    port: 443,
    path: '/api/boards',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Response Body:', responseData);
        
        if (res.statusCode === 201) {
          console.log('✅ Board creation successful!');
          try {
            const board = JSON.parse(responseData);
            console.log('📋 Created board:', { id: board._id, name: board.name });
            resolve(board);
          } catch (e) {
            console.log('❌ Failed to parse response as JSON');
            resolve(null);
          }
        } else {
          console.log(`❌ Board creation failed with status ${res.statusCode}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

testAPI().catch(console.error);
