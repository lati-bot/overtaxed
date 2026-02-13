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

    const container = client.database("overtaxed").container("rockwall-properties");

    // Get the subject property
    const { resources: mainResults } = await container.items.query({
      query: `SELECT * FROM c WHERE c.id = @acct`,
      parameters: [{ name: "@acct", value: acct.trim() }],
    }).fetchAll();

    if (mainResults.length === 0) {
      return NextResponse.json({ found: false, error: "Property not found" }, { status: 404 });
    }

    const mainProp = mainResults[0];

    if (!details) {
      return NextResponse.json({
        found: true,
        acct: mainProp.acct,
        status: mainProp.potential_reduction > 0 ? "over" : "fair",
        sqft: mainProp.sqft || 0,
        current_assessment: mainProp.current_assessment,
        fair_assessment: mainProp.fair_assessment,
        estimated_savings: mainProp.estimated_savings,
        comp_count: (mainProp.comps || []).length,
      });
    }

    // For detailed view, get more comps from the same neighborhood
    // No sqft data — find comps by value similarity, not sqft similarity
    const { resources: neighborhoodComps } = await container.items.query({
      query: `SELECT TOP 20 c.id, c.acct, c.address, c.city, c.year_built, 
                     c.current_assessment, c.fair_assessment, c.neighborhood_code
              FROM c 
              WHERE c.neighborhood_code = @nbhd 
              AND c.id != @acct 
              AND c.current_assessment > 0`,
      parameters: [
        { name: "@nbhd", value: mainProp.neighborhood_code },
        { name: "@acct", value: acct.trim() },
      ],
    }).fetchAll();

    // Sort by appraised value (lowest first — best for protest)
    const targetValue = mainProp.current_assessment || 0;
    const enrichedComps = neighborhoodComps
      .map((c: any) => ({
        acct: c.acct,
        address: c.address || "N/A",
        city: c.city || "ROCKWALL",
        sqft: 0,
        yearBuilt: c.year_built || 0,
        assessedVal: c.current_assessment,
        perSqft: 0,
        valueDiff: Math.abs(c.current_assessment - targetValue),
      }))
      .filter((c: any) => c.assessedVal < targetValue) // Only lower assessed values
      .sort((a: any, b: any) => a.assessedVal - b.assessedVal) // Lowest value first
      .slice(0, 10);

    // Neighborhood stats — use appraised values (no sqft)
    const compValues = enrichedComps.map((c: any) => c.assessedVal);
    const medianValue = compValues.length > 0
      ? compValues.sort((a: number, b: number) => a - b)[Math.floor(compValues.length / 2)]
      : 0;
    const avgValue = compValues.length > 0
      ? Math.round(compValues.reduce((a: number, b: number) => a + b, 0) / compValues.length)
      : 0;

    return NextResponse.json({
      found: true,
      acct: mainProp.acct,
      address: mainProp.address,
      city: mainProp.city || "ROCKWALL",
      status: mainProp.potential_reduction > 0 ? "over" : "fair",
      sqft: mainProp.sqft || 0,
      yearBuilt: mainProp.year_built || 0,
      current_assessment: mainProp.current_assessment,
      fair_assessment: mainProp.fair_assessment,
      estimated_savings: mainProp.estimated_savings,
      potential_reduction: mainProp.potential_reduction,
      neighborhood_code: mainProp.neighborhood_code,
      per_sqft: 0,
      comp_count: enrichedComps.length,
      comps: enrichedComps,
      neighborhood_stats: {
        median_per_sqft: 0,
        avg_per_sqft: 0,
        median_value: medianValue,
        avg_value: avgValue,
      },
    });
  } catch (error) {
    console.error("[rockwall/comps] Error:", error);
    return NextResponse.json({ error: "Comps lookup failed" }, { status: 500 });
  }
}
