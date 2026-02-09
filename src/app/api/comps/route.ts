import { NextRequest, NextResponse } from "next/server";
import precomputed from "@/data/precomputed.json";

interface PrecomputedProperty {
  status: "over" | "fair";
  sqft: number;
  beds: number;
  current_assessment: number;
  fair_assessment: number;
  estimated_savings: number;
  comp_count: number;
}

interface PrecomputedData {
  generated_at: string;
  neighborhood: string;
  total_properties: number;
  over_assessed_count: number;
  total_potential_savings: number;
  properties: Record<string, PrecomputedProperty>;
}

const data = precomputed as PrecomputedData;

export async function GET(request: NextRequest) {
  const pin = request.nextUrl.searchParams.get("pin");

  if (!pin) {
    return NextResponse.json({ error: "PIN required" }, { status: 400 });
  }

  const property = data.properties[pin];

  if (!property) {
    // Property not in precomputed data
    return NextResponse.json({ 
      found: false,
      message: "Property not in analyzed area. Full analysis coming soon.",
    });
  }

  return NextResponse.json({
    found: true,
    pin,
    ...property,
    neighborhood_stats: {
      total_properties: data.total_properties,
      over_assessed_count: data.over_assessed_count,
      total_potential_savings: data.total_potential_savings,
    }
  });
}
