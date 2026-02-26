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

    const container = client.database("overtaxed").container("rockwall-properties");

    // Rockwall container is partitioned by neighborhood_code, so we need cross-partition query
    const { resources } = await container.items.query({
      query: `SELECT * FROM c WHERE c.id = @acct`,
      parameters: [{ name: "@acct", value: acct.trim() }],
    }).fetchAll();

    if (resources.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const prop = resources[0];

    // No sqft data — perSqft will be 0
    const sqft = prop.sqft || 0;
    const perSqft = sqft > 0 ? prop.current_assessment / sqft : 0;
    const fairPerSqft = sqft > 0 ? prop.fair_assessment / sqft : 0;
    const overAssessedPct = prop.current_assessment > 0 && prop.potential_reduction > 0
      ? Math.round((prop.potential_reduction / prop.current_assessment) * 100)
      : 0;

    // Fetch neighborhood stats
    let neighborhoodStats = null;
    try {
      const nbhd = prop.neighborhood_code;
      if (nbhd) {
        const { resources: nbhdProps } = await container.items.query({
          query: `SELECT c.current_assessment, c.fair_assessment, c.potential_reduction FROM c WHERE c.neighborhood_code = @nbhd`,
          parameters: [{ name: "@nbhd", value: nbhd }],
        }, { partitionKey: nbhd }).fetchAll();

        if (nbhdProps.length > 0) {
          const overAssessed = nbhdProps.filter((p: any) => p.potential_reduction > 0);
          // No sqft — use median appraised value instead
          const allValues = nbhdProps
            .filter((p: any) => p.current_assessment > 0)
            .map((p: any) => p.current_assessment);
          const medianValue = allValues.length > 0
            ? allValues.sort((a: number, b: number) => a - b)[Math.floor(allValues.length / 2)]
            : 0;
          const avgReduction = overAssessed.length > 0
            ? Math.round(overAssessed.reduce((sum: number, p: any) => sum + p.potential_reduction, 0) / overAssessed.length)
            : 0;

          neighborhoodStats = {
            totalProperties: nbhdProps.length,
            overAssessedCount: overAssessed.length,
            overAssessedPct: Math.round((overAssessed.length / nbhdProps.length) * 100),
            medianPerSqft: 0, // No sqft data
            medianValue,
            avgReduction,
          };
        }
      }
    } catch (err) {
      console.error("[rockwall/lookup] Neighborhood stats error:", err);
    }

    // Format comps — filter out bad data (zero value/sqft)
    const comps = (prop.comps || [])
      .filter((c: any) => (c.assessed_val || 0) > 0 && (c.sqft || 0) > 0 && (c.psf || 0) > 1)
      .map((c: any) => ({
      acct: c.acct,
      address: c.address,
      sqft: c.sqft || 0,
      assessedVal: c.assessed_val || 0,
      perSqft: c.psf || 0,
      yearBuilt: c.yearBuilt || 0,
    }));

    return NextResponse.json({
      found: true,
      jurisdiction: "rockwall_county_tx",
      property: {
        acct: prop.acct,
        address: prop.address,
        city: prop.city || "ROCKWALL",
        state: "TX",
        zipcode: prop.zipcode || "",
        neighborhoodCode: prop.neighborhood_code,
        neighborhoodDesc: prop.neighborhood_desc || "",
        sqft: sqft,
        yearBuilt: prop.year_built || 0,
        beds: prop.beds || 0,
        fullBaths: prop.full_baths || 0,
        halfBaths: prop.half_baths || 0,
        pool: prop.pool || false,
        fireplaces: prop.fireplaces || 0,
        currentAssessment: prop.current_assessment,
        landVal: prop.land_val || 0,
        improvementVal: prop.improvement_val || 0,
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
    console.error("[rockwall/lookup] Error:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
