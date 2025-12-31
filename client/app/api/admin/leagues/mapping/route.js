// Next.js API Route - Proxy for Backend League Mapping API (handles CORS)
import { NextResponse } from 'next/server';

// In-memory cache to prevent multiple simultaneous requests
let cache = {
  data: null,
  lastUpdated: null,
  isRefreshing: false
};

const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function GET(request) {
  try {
    // Check if we have cached data that's still fresh
    if (cache.data && cache.lastUpdated && Date.now() - cache.lastUpdated < CACHE_DURATION) {
      console.log(`✅ [NEXT API] Returning cached league mapping (age: ${Math.floor((Date.now() - cache.lastUpdated) / 1000)}s)`);
      return NextResponse.json(cache.data);
    }
    
    // If already refreshing, wait for the current request instead of making a new one
    if (cache.isRefreshing) {
      const maxWait = 5000;
      const startWait = Date.now();
      while (cache.isRefreshing && (Date.now() - startWait) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // If cache was updated, return fresh data
      if (cache.data && cache.lastUpdated && Date.now() - cache.lastUpdated < CACHE_DURATION) {
        console.log(`✅ [NEXT API] Returning fresh league mapping after waiting`);
        return NextResponse.json(cache.data);
      }
    }
    
    // Mark as refreshing
    cache.isRefreshing = true;
    
    // ✅ FIX: Use NEXT_PUBLIC_BASE_API_URL first (without /api)
    // If not available, use NEXT_PUBLIC_API_URL and remove /api suffix if present
    let backendUrl = process.env.NEXT_PUBLIC_BASE_API_URL || 
                     process.env.API_URL || 
                     'http://localhost:4000';
    
    // If using NEXT_PUBLIC_API_URL (which has /api), remove the /api suffix
    if (!process.env.NEXT_PUBLIC_BASE_API_URL && process.env.NEXT_PUBLIC_API_URL) {
      backendUrl = process.env.NEXT_PUBLIC_API_URL;
      // Remove /api suffix if present
      if (backendUrl.endsWith('/api')) {
        backendUrl = backendUrl.replace(/\/api$/, '');
      }
    }
    
    const url = `${backendUrl}/api/admin/leagues/mapping`;
    
    console.log(`🔍 [NEXT API] Fetching league mapping from backend: ${url}`);
    console.log(`🔍 [NEXT API] Backend URL resolved: ${backendUrl}`);
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'cache-control': 'no-cache'
      },
      signal: AbortSignal.timeout(10000) // ✅ FIX: Increased to 10 seconds for Render
    });
    
    if (!response.ok) {
      // ✅ DEBUG: Log more details about the error
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error(`❌ [NEXT API] Backend API error ${response.status}:`, errorText);
      throw new Error(`Backend API returned ${response.status}: ${errorText.substring(0, 200)}`);
    }
    
    const data = await response.json();
    
    // ✅ FIX: Validate response structure
    if (!data.success || !data.data) {
      console.error('❌ [NEXT API] Invalid response structure:', {
        success: data.success,
        hasData: !!data.data,
        dataKeys: data.data ? Object.keys(data.data) : []
      });
      throw new Error('Backend returned invalid response structure');
    }
    
    console.log(`✅ [NEXT API] Successfully fetched league mapping from backend`);
    console.log(`📊 [NEXT API] Mapping data:`, {
      totalLeagues: data.data?.totalLeagues || 0,
      mappingCount: Object.keys(data.data?.unibetToFotmobMapping || {}).length,
      allowedLeagueIdsCount: data.data?.allowedLeagueIds?.length || 0
    });
    
    // ✅ FIX: Validate that we actually have league IDs
    if (!data.data.allowedLeagueIds || data.data.allowedLeagueIds.length === 0) {
      console.warn('⚠️ [NEXT API] Backend returned empty allowedLeagueIds array');
      // Still cache it, but log warning
    }
    
    // Update cache
    cache.data = data;
    cache.lastUpdated = Date.now();
    cache.isRefreshing = false;
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });
    
  } catch (error) {
    cache.isRefreshing = false;
    console.error(`❌ [NEXT API] Error fetching league mapping:`, error);
    
    // If we have stale cache, return it with a warning
    if (cache.data) {
      console.log('⚠️ [NEXT API] Returning stale cached data due to error');
      return NextResponse.json({
        ...cache.data,
        warning: 'Using cached data due to backend error',
        cacheAge: cache.lastUpdated ? Date.now() - cache.lastUpdated : null
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch league mapping',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

