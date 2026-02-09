import { NextRequest, NextResponse } from "next/server";

const PARCEL_API = "https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json";

interface ParcelResult {
  pin: string;
  property_address: string;
  property_city: string;
  property_zip: string;
  township_name: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  
  if (!query || query.trim().length < 3) {
    return NextResponse.json({ results: [] });
  }
  
  try {
    const cleaned = query.trim().toUpperCase();
    
    // Build search query - match addresses starting with the input
    const whereClause = encodeURIComponent(`upper(property_address) like upper('${cleaned}%')`);
    const url = `${PARCEL_API}?$where=${whereClause}&$limit=8&$select=pin,property_address,property_city,property_zip,township_name`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
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
    
    return NextResponse.json({ results });
    
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ results: [] });
  }
}
