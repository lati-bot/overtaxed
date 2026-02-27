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
  const query = searchParams.get("q");

  if (!query || query.trim().length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const client = getCosmosClient();
    if (!client) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const container = client.database("overtaxed").container("houston-properties");
    
    // Strip city, state, zip — our DB stores just street addresses
    let cleaned = query.trim().toUpperCase();
    // Remove common suffixes like ", HOUSTON, TX 77001" or ", TX"
    cleaned = cleaned.replace(/,?\s*(HOUSTON|KATY|SUGAR LAND|PASADENA|PEARLAND|LEAGUE CITY|BAYTOWN|MISSOURI CITY|CYPRESS|SPRING|HUMBLE|TOMBALL|BELLAIRE|FRIENDSWOOD|DEER PARK|LA PORTE|SEABROOK|WEBSTER|CLEAR LAKE|STAFFORD|RICHMOND)\b.*$/i, "");
    cleaned = cleaned.replace(/,?\s*TX\s*\d{0,5}\s*$/i, "").trim();

    // Token-based matching: first token prefix-matches (house number), rest use CONTAINS
    const tokens = cleaned.split(/\s+/).filter(t => t.length > 0);
    
    let whereConditions: string;
    const parameters: { name: string; value: string }[] = [];
    
    if (tokens.length === 0) {
      return NextResponse.json({ results: [] });
    } else if (tokens.length === 1) {
      whereConditions = `STARTSWITH(UPPER(c.address), @t0)`;
      parameters.push({ name: "@t0", value: tokens[0] });
    } else {
      const conditions = tokens.map((token, i) => {
        parameters.push({ name: `@t${i}`, value: token });
        return i === 0
          ? `STARTSWITH(UPPER(c.address), @t${i})`
          : `CONTAINS(UPPER(c.address), @t${i})`;
      });
      whereConditions = conditions.join(" AND ");
    }

    const { resources } = await container.items.query({
      query: `SELECT TOP 8 c.id, c.acct, c.address, c.city, c.neighborhood_code, c.sqft, c.current_assessment, c.estimated_savings
              FROM c 
              WHERE ${whereConditions}
              AND c.sqft > 0`,
      parameters,
    }).fetchAll();

    const results = resources.map((r: any) => ({
      acct: r.acct,
      address: r.address,
      city: r.city || "HOUSTON",
      state: "TX",
      neighborhood: r.neighborhood_code,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[houston/autocomplete] Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
