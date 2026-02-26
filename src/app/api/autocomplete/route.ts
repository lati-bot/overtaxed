import { NextRequest, NextResponse } from "next/server";

const PARCEL_API = "https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json";
const APP_TOKEN = process.env.SOCRATA_APP_TOKEN || "";

interface ParcelResult {
  pin: string;
  property_address: string;
  property_city: string;
  property_zip: string;
  township_name: string;
}

// Simple in-memory cache to avoid hammering Socrata on every keystroke
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  
  if (!query || query.trim().length < 3) {
    return NextResponse.json({ results: [] });
  }
  
  try {
    const cleaned = query.trim().toUpperCase();
    // Sanitize for SoQL - remove all special characters except spaces, letters, numbers
    const sanitized = cleaned.replace(/[^a-zA-Z0-9\s]/g, '');
    
    // Check cache first
    const cacheKey = sanitized;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    // Build search query - match addresses starting with the input
    const whereClause = encodeURIComponent(`upper(property_address) like upper('${sanitized}%')`);
    let url = `${PARCEL_API}?$where=${whereClause}&$limit=8&$select=pin,property_address,property_city,property_zip,township_name`;
    
    // Add app token if available (raises rate limit from ~1K to ~10K/hr)
    const headers: Record<string, string> = {};
    if (APP_TOKEN) {
      headers["X-App-Token"] = APP_TOKEN;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      // If rate limited, try to return stale cache
      if (response.status === 429 && cached) {
        return NextResponse.json(cached.data);
      }
      return NextResponse.json({ results: [] });
    }
    
    const data: ParcelResult[] = await response.json();
    
    // Format results for autocomplete dropdown
    const results = data.map(p => ({
      pin: p.pin,
      address: p.property_address,
      city: p.property_city,
      zip: p.property_zip,
      township: p.township_name,
      display: `${p.property_address}, ${p.property_city}, IL ${p.property_zip.split('-')[0]}`,
    }));
    
    const responseData = { results };
    
    // Store in cache
    cache.set(cacheKey, { data: responseData, ts: Date.now() });
    
    // Evict old entries if cache grows too large
    if (cache.size > 500) {
      const now = Date.now();
      for (const [key, val] of cache) {
        if (now - val.ts > CACHE_TTL_MS) cache.delete(key);
      }
    }

    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ results: [] });
  }
}
