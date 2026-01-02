// Next.js API Route - Proxy for Unibet Bet Offers API (handles CORS)
// Node.js runtime required for proxy support
import { NextResponse } from 'next/server';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

const UNIBET_BETOFFERS_API = 'https://oc-offering-api.kambicdn.com/offering/v2018/ubau/betoffer/event';

// Proxy configuration (for 410 fallback)
const PROXY_CONFIG = {
  host: process.env.KAMBI_PROXY_HOST || '104.252.62.178',
  port: process.env.KAMBI_PROXY_PORT || '5549',
  username: process.env.KAMBI_PROXY_USER || 'xzskxfzx',
  password: process.env.KAMBI_PROXY_PASS || 't3xvzuubsk2d'
};

const PROXY_URL = `http://${PROXY_CONFIG.username}:${PROXY_CONFIG.password}@${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`;

const UNIBET_BETOFFERS_HEADERS = {
  'accept': 'application/json, text/javascript, */*; q=0.01',
  'accept-language': 'en-US,en;q=0.9',
  'cache-control': 'no-cache',
  'origin': 'https://www.unibet.com.au',
  'pragma': 'no-cache',
  'priority': 'u=1, i',
  'referer': 'https://www.unibet.com.au/',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
};

// Function to fetch bet offers through proxy (fallback for 410)
async function fetchBetOffersViaProxy(eventId) {
  try {
    console.log(`🔄 [NEXT API] Fetching bet offers via PROXY (410 fallback) for event: ${eventId}`);
    
    const url = `${UNIBET_BETOFFERS_API}/${eventId}.json?lang=en_AU&market=AU`;
    
    // Create proxy agent
    const httpsAgent = new HttpsProxyAgent(PROXY_URL);
    
    // Use axios with proxy (more reliable than fetch for proxy)
    const response = await axios.get(url, {
      headers: UNIBET_BETOFFERS_HEADERS,
      httpsAgent: httpsAgent,
      httpAgent: httpsAgent,
      timeout: 5000, // 5 seconds for proxy
      validateStatus: () => true // Don't throw on non-200
    });
    
    if (response.status === 200 && response.data) {
      console.log(`✅ [NEXT API] Successfully fetched bet offers via PROXY for event: ${eventId}`);
      return response.data;
    }
    
    throw new Error(`Proxy request returned ${response.status}`);
  } catch (error) {
    console.error(`❌ [NEXT API] Proxy fallback failed for event ${eventId}:`, error.message);
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    // ✅ FIX: Await params in Next.js 15+ (params is now a Promise)
    const { eventId } = await params;
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // ✅ FIX: Validate that eventId is numeric (Unibet API requires numeric IDs)
    const isNumeric = /^\d+$/.test(eventId);
    if (!isNumeric) {
      console.warn(`⚠️ [NEXT API] Invalid eventId format: "${eventId}" (expected numeric ID)`);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid event ID format',
          message: `Event ID must be numeric. Received: "${eventId}". This appears to be a slug instead of an event ID.`,
          eventId,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    const url = `${UNIBET_BETOFFERS_API}/${eventId}.json?lang=en_AU&market=AU`;
    
    console.log(`🔍 [NEXT API] Proxying Unibet bet offers request for event: ${eventId}`);
    
    // Retry logic for network errors (ENOTFOUND, etc.)
    let response;
    let lastError;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await fetch(url, {
          headers: UNIBET_BETOFFERS_HEADERS,
          signal: AbortSignal.timeout(2500) // 2.5 seconds timeout - balanced for real-time updates
        });
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries && (error.code === 'ENOTFOUND' || error.message?.includes('fetch failed'))) {
          console.warn(`⚠️ [NEXT API] Network error (attempt ${attempt}/${maxRetries}), retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt)); // Exponential backoff
        } else {
          throw error; // Re-throw if not retryable or max retries reached
        }
      }
    }
    
    if (!response) {
      throw lastError || new Error('Failed to fetch after retries');
    }
    
    // Handle 404 (match finished/not found)
    if (response.status === 404) {
      return NextResponse.json({
        success: false,
        eventId,
        error: 'Match not found',
        message: 'Match may be finished or no longer available',
        status: 404,
        timestamp: new Date().toISOString()
      });
    }
    
    // ✅ Special handling for 410 (Gone) - try proxy as fallback
    if (response.status === 410) {
      console.warn(`⚠️ [NEXT API] Kambi API returned 410 for bet offers, trying PROXY fallback...`);
      
      // Try proxy fallback
      const proxyData = await fetchBetOffersViaProxy(eventId);
      if (proxyData) {
        console.log(`✅ [NEXT API] Proxy fallback successful for bet offers!`);
        return NextResponse.json({
          success: true,
          eventId,
          data: proxyData,
          timestamp: new Date().toISOString(),
          source: 'unibet-proxy-nodejs-fallback'
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        });
      }
      
      // If proxy also failed, return error
      return NextResponse.json({
        success: false,
        eventId,
        error: 'API unavailable',
        message: 'Kambi API returned 410 and proxy fallback also failed',
        status: 410,
        timestamp: new Date().toISOString()
      }, { status: 410 });
    }
    
    if (!response.ok) {
      throw new Error(`Unibet API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ [NEXT API] Successfully proxied Unibet bet offers for event: ${eventId}`);
    
    // Return with streaming-friendly response
    return NextResponse.json({
      success: true,
      eventId,
      data: data,
      timestamp: new Date().toISOString(),
      source: 'unibet-proxy-nodejs'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (error) {
    console.error(`❌ [NEXT API] Error proxying Unibet bet offers:`, error);
    
    // ✅ If direct fetch failed and we haven't tried proxy yet, try proxy
    if (error.message?.includes('410') || error.message?.includes('aborted') || error.message?.includes('timeout')) {
      console.warn(`⚠️ [NEXT API] Direct connection failed, trying PROXY fallback...`);
      const { eventId } = await params;
      const proxyData = await fetchBetOffersViaProxy(eventId);
      if (proxyData) {
        console.log(`✅ [NEXT API] Proxy fallback successful after direct failure!`);
        return NextResponse.json({
          success: true,
          eventId,
          data: proxyData,
          timestamp: new Date().toISOString(),
          source: 'unibet-proxy-nodejs-fallback'
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        });
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch bet offers',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Ensure Node.js runtime (required for proxy agent)
export const runtime = 'nodejs';

