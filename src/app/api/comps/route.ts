import { NextRequest, NextResponse } from "next/server";
import { CosmosClient } from "@azure/cosmos";
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

// Cosmos client for fetching full comp details
let cosmosClient: CosmosClient | null = null;
function getCosmosClient() {
  if (!cosmosClient && process.env.COSMOS_CONNECTION_STRING) {
    cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  }
  return cosmosClient;
}

export async function GET(request: NextRequest) {
  const pin = request.nextUrl.searchParams.get("pin");
  const details = request.nextUrl.searchParams.get("details") === "true";

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

  // If details requested, fetch comp list from Cosmos
  let comps: any[] = [];
  if (details) {
    try {
      const client = getCosmosClient();
      if (client) {
        const container = client.database("overtaxed").container("properties");
        
        // First get the property to find its neighborhood
        const { resource: mainProp } = await container.item(pin, pin).read();
        
        if (mainProp && mainProp.nbhd) {
          // Query for comps in same neighborhood with lower assessment per sqft
          const mainPerSqft = mainProp.sqft > 0 ? mainProp.current_assessment / mainProp.sqft : 0;
          
          const { resources } = await container.items.query({
            query: `SELECT TOP 10 c.id, c.pin, c.sqft, c.beds, c.current_assessment, c.nbhd
                    FROM c 
                    WHERE c.nbhd = @nbhd 
                    AND c.id != @pin 
                    AND c.sqft > 0 
                    AND (c.current_assessment / c.sqft) < @perSqft`,
            parameters: [
              { name: "@nbhd", value: mainProp.nbhd },
              { name: "@pin", value: pin },
              { name: "@perSqft", value: mainPerSqft },
            ],
          }).fetchAll();
          
          // Sort by sqft similarity client-side
          const targetSqft = mainProp.sqft || 0;
          resources.sort((a: any, b: any) => Math.abs(a.sqft - targetSqft) - Math.abs(b.sqft - targetSqft));
          
          // Enrich with addresses from Cook County parcel API
          const compPins = resources.map((c: any) => c.id || c.pin).filter(Boolean);
          let addressMap: Record<string, string> = {};
          if (compPins.length > 0) {
            try {
              const pinList = compPins.map((p: string) => `'${p}'`).join(",");
              const addrUrl = `https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json?$where=pin in(${encodeURIComponent(pinList)})&$limit=${compPins.length}`;
              const addrRes = await fetch(addrUrl);
              if (addrRes.ok) {
                const addrData = await addrRes.json();
                for (const p of addrData) {
                  if (p.pin && p.property_address) {
                    addressMap[p.pin] = p.property_address;
                  }
                }
              }
            } catch {
              // Non-critical
            }
          }

          comps = resources.map((c: any) => {
            const compPin = c.id || c.pin;
            return {
              pin: compPin,
              address: addressMap[compPin] || `PIN ${compPin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5")}`,
              sqft: c.sqft || 0,
              beds: c.beds || 0,
              yearBuilt: 0,
              current_assessment: c.current_assessment || 0,
              perSqft: c.sqft > 0 ? c.current_assessment / c.sqft : 0,
            };
          });
        }
      }
    } catch (err) {
      console.error("[comps] Error fetching comp details:", err);
    }
  }

  return NextResponse.json({
    found: true,
    pin,
    ...property,
    ...(details ? { comps } : {}),
    neighborhood_stats: {
      total_properties: data.total_properties,
      over_assessed_count: data.over_assessed_count,
      total_potential_savings: data.total_potential_savings,
    }
  });
}
