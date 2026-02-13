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

    const container = client.database("overtaxed").container("williamson-properties");

    // Cross-partition query by id
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

    // Fetch neighborhood stats
    let neighborhoodStats = null;
    try {
      const nbhd = prop.neighborhood_code;
      if (nbhd) {
        const { resources: nbhdProps } = await container.items.query({
          query: `SELECT c.current_assessment, c.fair_assessment, c.potential_reduction, c.sqft FROM c WHERE c.neighborhood_code = @nbhd`,
          parameters: [{ name: "@nbhd", value: nbhd }],
        }, { partitionKey: nbhd }).fetchAll();

        if (nbhdProps.length > 0) {
          const overAssessed = nbhdProps.filter((p: any) => p.potential_reduction > 0);
          const allPerSqft = nbhdProps
            .filter((p: any) => p.sqft > 0)
            .map((p: any) => p.current_assessment / p.sqft);
          const medianPerSqft = allPerSqft.length > 0
            ? allPerSqft.sort((a: number, b: number) => a - b)[Math.floor(allPerSqft.length / 2)]
            : 0;
          const avgReduction = overAssessed.length > 0
            ? Math.round(overAssessed.reduce((sum: number, p: any) => sum + p.potential_reduction, 0) / overAssessed.length)
            : 0;

          neighborhoodStats = {
            totalProperties: nbhdProps.length,
            overAssessedCount: overAssessed.length,
            overAssessedPct: Math.round((overAssessed.length / nbhdProps.length) * 100),
            medianPerSqft: Math.round(medianPerSqft * 100) / 100,
            avgReduction,
          };
        }
      }
    } catch (err) {
      console.error("[williamson/lookup] Neighborhood stats error:", err);
    }

    // Format comps — Williamson has NO beds, baths, or pool data
    const comps = (prop.comps || []).map((c: any) => ({
      acct: c.acct,
      address: c.address,
      sqft: c.sqft || 0,
      assessedVal: c.assessed_val || 0,
      perSqft: c.psf || 0,
      yearBuilt: c.year_built || 0,
    }));

    return NextResponse.json({
      found: true,
      jurisdiction: "williamson_county_tx",
      property: {
        acct: prop.id,
        address: prop.address,
        city: prop.city || "GEORGETOWN",
        state: "TX",
        zipcode: prop.zip || "",
        neighborhoodCode: prop.neighborhood_code,
        sqft: prop.sqft,
        yearBuilt: prop.year_built || 0,
        currentAssessment: prop.current_assessment,
        fairAssessment: prop.fair_assessment,
        potentialReduction: prop.potential_reduction,
        estimatedSavings: prop.estimated_savings,
        perSqft: Math.round(perSqft * 100) / 100,
        fairPerSqft: Math.round(fairPerSqft * 100) / 100,
        overAssessedPct,
        comps,
        status: prop.potential_reduction > 0 ? "over" : "fair",
        neighborhoodStats,
      },
    });
  } catch (error) {
    console.error("[williamson/lookup] Error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
