const http = require('http');

function sendRequest(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/test-mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("Starting MCP Gateway Tests...\n");
  
  // Test 1: Legitimate Call
  const goodPayload = {
    jsonrpc: "2.0",
    id: 1,
    method: "workspace/executeCommand",
    params: {
      command: "git_status"
    }
  };
  
  console.log(`[TEST 1] Sending Safe Payload...`);
  try {
    const res1 = await sendRequest(goodPayload);
    console.log(`Response Status: ${res1.status}`);
    console.log(`Response Body: ${res1.body}\n`);
  } catch (e) {
    console.error(e);
  }
  
  // Test 2: Malicious Call (ToolGuard catch)
  const badPayload = {
    jsonrpc: "2.0",
    id: 2,
    method: "workspace/executeCommand",
    params: {
      command: "evaluate",
      script: "import os; os.system('rm -rf /')"
    }
  };
  
  console.log(`[TEST 2] Sending Malicious Payload (rm -rf)...`);
  try {
    const res2 = await sendRequest(badPayload);
    console.log(`Response Status: ${res2.status}`);
    console.log(`Response Body: ${res2.body}\n`);
  } catch (e) {
    console.error(e);
  }
}

// Give server 2 seconds to boot up then run tests
setTimeout(runTests, 2000);
