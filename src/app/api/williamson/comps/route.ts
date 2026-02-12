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
  const details = searchParams.get("details") === "true";

  if (!acct) {
    return NextResponse.json({ error: "Missing acct parameter" }, { status: 400 });
  }

  try {
    const client = getCosmosClient();
    if (!client) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const container = client.database("overtaxed").container("williamson-properties");

    // Get the subject property
    const { resources: mainResults } = await container.items.query({
      query: `SELECT * FROM c WHERE c.id = @acct`,
      parameters: [{ name: "@acct", value: acct.trim() }],
    }).fetchAll();

    if (mainResults.length === 0) {
      return NextResponse.json({ found: false, error: "Property not found" }, { status: 404 });
    }

    const mainProp = mainResults[0];
    const perSqft = mainProp.sqft > 0 ? mainProp.current_assessment / mainProp.sqft : 0;

    if (!details) {
      return NextResponse.json({
        found: true,
        acct: mainProp.id,
        status: mainProp.potential_reduction > 0 ? "over" : "fair",
        sqft: mainProp.sqft,
        current_assessment: mainProp.current_assessment,
        fair_assessment: mainProp.fair_assessment,
        estimated_savings: mainProp.estimated_savings,
        comp_count: (mainProp.comps || []).length,
      });
    }

    // For detailed view, get more comps from the same neighborhood
    // Williamson: similar sqft (±30%), similar year (±15 years)
    const targetSqft = mainProp.sqft || 0;
    const sqftLow = Math.round(targetSqft * 0.7);
    const sqftHigh = Math.round(targetSqft * 1.3);
    const targetYear = mainProp.year_built || 0;
    const yearLow = targetYear > 0 ? targetYear - 15 : 0;
    const yearHigh = targetYear > 0 ? targetYear + 15 : 9999;

    const { resources: neighborhoodComps } = await container.items.query({
      query: `SELECT TOP 20 c.id, c.address, c.city, c.sqft, c.year_built,
                     c.current_assessment, c.fair_assessment, c.neighborhood_code
              FROM c 
              WHERE c.neighborhood_code = @nbhd 
              AND c.id != @acct 
              AND c.sqft >= @sqftLow
              AND c.sqft <= @sqftHigh
              AND c.current_assessment > 0`,
      parameters: [
        { name: "@nbhd", value: mainProp.neighborhood_code },
        { name: "@acct", value: acct.trim() },
        { name: "@sqftLow", value: sqftLow },
        { name: "@sqftHigh", value: sqftHigh },
      ],
    }).fetchAll();

    // Sort by $/sqft, take lowest (best for appeal)
    const enrichedComps = neighborhoodComps
      .map((c: any) => ({
        acct: c.id,
        address: c.address || "N/A",
        city: c.city || "GEORGETOWN",
        sqft: c.sqft,
        yearBuilt: c.year_built || 0,
        assessedVal: c.current_assessment,
        perSqft: c.sqft > 0 ? Math.round((c.current_assessment / c.sqft) * 100) / 100 : 0,
        sqftDiff: Math.abs(c.sqft - targetSqft),
      }))
      .filter((c: any) => c.perSqft > 0 && c.perSqft < perSqft) // Only lower $/sqft
      .sort((a: any, b: any) => a.perSqft - b.perSqft) // Lowest $/sqft first
      .slice(0, 10);

    // Neighborhood stats
    const compPerSqfts = enrichedComps.map((c: any) => c.perSqft);
    const medianPerSqft = compPerSqfts.length > 0
      ? compPerSqfts[Math.floor(compPerSqfts.length / 2)]
      : 0;
    const avgPerSqft = compPerSqfts.length > 0
      ? Math.round((compPerSqfts.reduce((a: number, b: number) => a + b, 0) / compPerSqfts.length) * 100) / 100
      : 0;

    return NextResponse.json({
      found: true,
      acct: mainProp.id,
      address: mainProp.address,
      city: mainProp.city || "GEORGETOWN",
      status: mainProp.potential_reduction > 0 ? "over" : "fair",
      sqft: mainProp.sqft,
      yearBuilt: mainProp.year_built,
      current_assessment: mainProp.current_assessment,
      fair_assessment: mainProp.fair_assessment,
      estimated_savings: mainProp.estimated_savings,
      potential_reduction: mainProp.potential_reduction,
      neighborhood_code: mainProp.neighborhood_code,
      per_sqft: Math.round(perSqft * 100) / 100,
      comp_count: enrichedComps.length,
      comps: enrichedComps,
      neighborhood_stats: {
        median_per_sqft: medianPerSqft,
        avg_per_sqft: avgPerSqft,
      },
    });
  } catch (error) {
    console.error("[williamson/comps] Error:", error);
    return NextResponse.json({ error: "Comps lookup failed" }, { status: 500 });
  }
}
