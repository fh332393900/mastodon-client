// Test script to verify proxy setup
const { HttpsProxyAgent } = require('https-proxy-agent');
const fetch = require('node-fetch').default;

const proxy = process.env.HTTPS_PROXY;
console.log('HTTPS_PROXY:', proxy);

if (!proxy) {
  console.error('❌ HTTPS_PROXY not set!');
  process.exit(1);
}

const agent = new HttpsProxyAgent(proxy);
console.log('✅ Proxy agent created:', agent.proxy.href);

async function testProxy() {
  try {
    console.log('\n🧪 Testing proxy connection to mastodon.social...');
    const startTime = Date.now();
    
    const response = await fetch('https://mastodon.social/api/v1/instance', {
      agent: agent,
      timeout: 10000
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Success! Status: ${response.status}, Time: ${elapsed}ms`);
    
    const data = await response.json();
    console.log('Instance:', data.title || data.uri);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.code === 'ETIMEDOUT') {
      console.error('\n💡 Possible issues:');
      console.error('  1. Proxy server is not running on 127.0.0.1:7890');
      console.error('  2. Proxy server is not configured correctly');
      console.error('  3. Firewall is blocking the connection');
    }
  }
}

testProxy();
