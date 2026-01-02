// Test API Route to verify proxy works and check IP rotation
// Access: GET /api/test-proxy?calls=5 (default: 3 calls)
import { NextResponse } from 'next/server';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Proxy configuration
const PROXY_CONFIG = {
  host: process.env.KAMBI_PROXY_HOST || '104.252.62.178',
  port: process.env.KAMBI_PROXY_PORT || '5549',
  username: process.env.KAMBI_PROXY_USER || 'xzskxfzx',
  password: process.env.KAMBI_PROXY_PASS || 't3xvzuubsk2d'
};

// Build proxy URL
const PROXY_URL = `http://${PROXY_CONFIG.username}:${PROXY_CONFIG.password}@${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`;

// IP check service (returns your current IP)
const IP_CHECK_SERVICE = 'https://api.ipify.org?format=json';
const IP_CHECK_SERVICE_ALT = 'https://api.myip.com';

// Test function to get IP through proxy
async function getIPThroughProxy(attemptNumber) {
  try {
    console.log(`🔍 [TEST] Attempt ${attemptNumber}: Fetching IP through proxy...`);
    
    // Create proxy agent
    const httpsAgent = new HttpsProxyAgent(PROXY_URL);
    
    // Use axios with proxy agent (more reliable than fetch)
    let response;
    try {
      response = await axios.get(IP_CHECK_SERVICE, {
        httpsAgent: httpsAgent,
        httpAgent: httpsAgent,
        timeout: 10000,
        validateStatus: () => true
      });
    } catch (error) {
      // Fallback to alternative service
      console.log(`⚠️ [TEST] Primary IP service failed, trying alternative...`);
      response = await axios.get(IP_CHECK_SERVICE_ALT, {
        httpsAgent: httpsAgent,
        httpAgent: httpsAgent,
        timeout: 10000,
        validateStatus: () => true
      });
    }
    
    if (response.status !== 200) {
      throw new Error(`IP check service returned ${response.status}`);
    }
    
    const data = response.data;
    const ip = data.ip || data.query || data.IPv4 || 'Unknown';
    
    console.log(`✅ [TEST] Attempt ${attemptNumber}: IP = ${ip}`);
    return {
      success: true,
      ip: ip,
      attempt: attemptNumber,
      timestamp: new Date().toISOString(),
      rawResponse: data
    };
  } catch (error) {
    console.error(`❌ [TEST] Attempt ${attemptNumber} failed:`, error.message);
    return {
      success: false,
      ip: null,
      attempt: attemptNumber,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Test function to get IP WITHOUT proxy (for comparison)
async function getIPWithoutProxy() {
  try {
    console.log(`🔍 [TEST] Fetching IP WITHOUT proxy (direct connection)...`);
    const response = await axios.get(IP_CHECK_SERVICE, {
      timeout: 10000
    });
    
    const data = response.data;
    const ip = data.ip || data.query || data.IPv4 || 'Unknown';
    
    console.log(`✅ [TEST] Direct IP = ${ip}`);
    return {
      success: true,
      ip: ip,
      method: 'direct',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ [TEST] Direct IP fetch failed:`, error.message);
    return {
      success: false,
      ip: null,
      error: error.message,
      method: 'direct'
    };
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const numCalls = parseInt(searchParams.get('calls') || '3', 10);
    const testDirect = searchParams.get('direct') !== 'false'; // Default true
    
    console.log(`🧪 [TEST] Starting proxy test with ${numCalls} calls...`);
    console.log(`🧪 [TEST] Proxy URL: http://${PROXY_CONFIG.username}:***@${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`);
    
    const results = {
      proxyConfig: {
        host: PROXY_CONFIG.host,
        port: PROXY_CONFIG.port,
        username: PROXY_CONFIG.username,
        url: `http://${PROXY_CONFIG.username}:***@${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`
      },
      testResults: [],
      directIP: null,
      analysis: {
        uniqueIPs: [],
        ipRotationDetected: false,
        allCallsSuccessful: true,
        totalCalls: numCalls,
        successfulCalls: 0,
        proxyWorking: null // Will be set after comparison
      }
    };
    
    // Test direct IP first (for comparison) - ALWAYS test direct
    results.directIP = await getIPWithoutProxy();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Make multiple calls through proxy to test IP rotation
    const promises = [];
    for (let i = 1; i <= numCalls; i++) {
      // Add small delay between calls to see if IP rotates
      if (i > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
      const result = await getIPThroughProxy(i);
      results.testResults.push(result);
      
      if (result.success) {
        results.analysis.successfulCalls++;
        // Track unique IPs
        if (!results.analysis.uniqueIPs.includes(result.ip)) {
          results.analysis.uniqueIPs.push(result.ip);
        }
      } else {
        results.analysis.allCallsSuccessful = false;
      }
    }
    
    // Analyze results
    results.analysis.uniqueIPs = results.analysis.uniqueIPs.filter(ip => ip && ip !== 'Unknown');
    results.analysis.ipRotationDetected = results.analysis.uniqueIPs.length > 1;
    results.analysis.rotationCount = results.analysis.uniqueIPs.length;
    
    // ✅ CRITICAL: Check if proxy is actually working
    // If proxy IP = direct IP, proxy is NOT being used!
    if (results.directIP.success && results.analysis.uniqueIPs.length > 0) {
      const directIP = results.directIP.ip;
      const proxyIP = results.analysis.uniqueIPs[0];
      results.analysis.proxyWorking = directIP !== proxyIP;
      results.analysis.directIP = directIP;
      results.analysis.proxyIP = proxyIP;
    }
    
    // Summary
    results.summary = {
      totalCalls: numCalls,
      successfulCalls: results.analysis.successfulCalls,
      failedCalls: numCalls - results.analysis.successfulCalls,
      uniqueIPs: results.analysis.uniqueIPs.length,
      ipRotationDetected: results.analysis.ipRotationDetected,
      ips: results.analysis.uniqueIPs,
      directIP: results.analysis.directIP,
      proxyIP: results.analysis.proxyIP,
      proxyWorking: results.analysis.proxyWorking,
      conclusion: results.analysis.proxyWorking === false
        ? `❌ WARNING: Proxy IP (${results.analysis.proxyIP}) matches Direct IP (${results.analysis.directIP}). Proxy is NOT working! Check configuration.`
        : results.analysis.proxyWorking === true
        ? `✅ Proxy is WORKING! Direct IP: ${results.analysis.directIP}, Proxy IP: ${results.analysis.proxyIP}. ${results.analysis.ipRotationDetected ? `IP Rotation: ${results.analysis.uniqueIPs.length} different IPs detected.` : `Static IP: ${results.analysis.proxyIP} (this is OK for fallback use).`}`
        : `⚠️ Could not verify proxy status. Direct IP: ${results.analysis.directIP || 'Unknown'}, Proxy IPs: ${results.analysis.uniqueIPs.join(', ') || 'None'}`
    };
    
    console.log(`📊 [TEST] Test Summary:`, results.summary);
    
    return NextResponse.json({
      success: true,
      message: 'Proxy test completed',
      ...results
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ [TEST] Proxy test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// Ensure Node.js runtime (required for proxy agent)
export const runtime = 'nodejs';

