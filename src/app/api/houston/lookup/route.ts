import { NextRequest, NextResponse } from "next/server";
import { CosmosClient } from "@azure/cosmos";

let cosmosClient: CosmosClient | null = null;
function getCosmosClient() {
  if (!cosmosClient && process.env.COSMOS_CONNECTION_STRING) {
    cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  }
  return cosmosClient;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const acct = searchParams.get("acct");

  if (!acct) {
    return NextResponse.json({ error: "Missing acct parameter" }, { status: 400 });
  }

  try {
    const client = getCosmosClient();
    if (!client) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const container = client.database("overtaxed").container("houston-properties");

    // Houston container is partitioned by neighborhood_code, so we need cross-partition query
    const { resources } = await container.items.query({
      query: `SELECT * FROM c WHERE c.id = @acct`,
      parameters: [{ name: "@acct", value: acct.trim() }],
    }).fetchAll();

    if (resources.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const prop = resources[0];

    // Calculate per sqft
    const perSqft = prop.sqft > 0 ? prop.current_assessment / prop.sqft : 0;
    const fairPerSqft = prop.sqft > 0 ? prop.fair_assessment / prop.sqft : 0;
    const overAssessedPct = prop.current_assessment > 0 && prop.potential_reduction > 0
      ? Math.round((prop.potential_reduction / prop.current_assessment) * 100)
      : 0;

    // Format comps
    const comps = (prop.comps || []).map((c: any) => ({
      acct: c.acct,
      address: c.address,
      sqft: c.sqft || 0,
      assessedVal: c.assessed_val || 0,
      perSqft: c.psf || 0,
    }));

    return NextResponse.json({
      found: true,
      jurisdiction: "harris_county_tx",
      property: {
        acct: prop.acct,
        address: prop.address,
        city: prop.city || "HOUSTON",
        state: "TX",
        neighborhoodCode: prop.neighborhood_code,
        neighborhoodGroup: prop.neighborhood_grp,
        sqft: prop.sqft,
        yearBuilt: prop.year_built,
        currentAssessment: prop.current_assessment,
        fairAssessment: prop.fair_assessment,
        potentialReduction: prop.potential_reduction,
        estimatedSavings: prop.estimated_savings,
        perSqft: Math.round(perSqft * 100) / 100,
        fairPerSqft: Math.round(fairPerSqft * 100) / 100,
        overAssessedPct,
        comps,
        status: prop.potential_reduction > 0 ? "over" : "fair",
      },
    });
  } catch (error) {
    console.error("[houston/lookup] Error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
