import { NextRequest, NextResponse } from "next/server";
import { CosmosClient } from "@azure/cosmos";

// Cosmos client
let cosmosClient: CosmosClient | null = null;
function getCosmosClient() {
  if (!cosmosClient && process.env.COSMOS_CONNECTION_STRING) {
    cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  }
  return cosmosClient;
}

export async function GET(request: NextRequest) {
  const pin = request.nextUrl.searchParams.get("pin");

  if (!pin) {
    return NextResponse.json({ error: "PIN required" }, { status: 400 });
  }

  try {
    const client = getCosmosClient();
    if (!client) {
      return NextResponse.json({ found: false, message: "Database not configured" });
    }

    const container = client.database("overtaxed").container("properties");
    const { resource: property } = await container.item(pin, pin).read();

    if (!property || property.county !== "Cook") {
      return NextResponse.json({
        found: false,
        message: "Property not found in Cook County data.",
      });
    }

    // V2 data has comps pre-computed — just return them
    const comps = (property.comps || []).map((c: {
      pin: string;
      address: string;
      sqft: number;
      beds: number;
      baths: number;
      year_built: number;
      assessment: number;
      per_sqft: number;
      quality: string;
    }) => ({
      pin: c.pin,
      address: c.address || `PIN ${c.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5")}`,
      sqft: c.sqft || 0,
      beds: c.beds || 0,
      yearBuilt: c.year_built || 0,
      current_assessment: c.assessment || 0,
      perSqft: c.per_sqft || (c.sqft && c.assessment ? c.assessment / c.sqft : 0),
      quality: c.quality || "",
    }));

    return NextResponse.json({
      found: true,
      pin,
      status: property.savings_estimate > 0 ? "over" : "fair",
      sqft: property.total_sqft,
      beds: property.total_beds,
      current_assessment: property.current_assessment,
      fair_assessment: comps.length > 0
        ? Math.round((comps.reduce((s: number, c: { perSqft: number }) => s + c.perSqft, 0) / comps.length) * property.total_sqft)
        : property.current_assessment,
      estimated_savings: property.savings_estimate || 0,
      comp_count: comps.length,
      comps,
      neighborhood_stats: {
        total_properties: 0, // Will be populated by neighborhood stats if needed
        over_assessed_count: 0,
        total_potential_savings: 0,
      },
    });
  } catch (error) {
    console.error("[comps] Error:", error);
    return NextResponse.json({
      found: false,
      message: "Error looking up property.",
    });
  }
}
