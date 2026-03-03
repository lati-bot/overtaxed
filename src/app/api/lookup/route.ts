import { NextRequest, NextResponse } from "next/server";
import { CosmosClient } from "@azure/cosmos";

const PARCEL_API = "https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json";

// Cosmos DB connection
const COSMOS_CONNECTION = process.env.COSMOS_CONNECTION_STRING || "";
const DATABASE_NAME = "overtaxed";
const CONTAINER_NAME = "properties";

let cosmosClient: CosmosClient | null = null;
function getCosmosClient() {
  if (!cosmosClient && COSMOS_CONNECTION) {
    cosmosClient = new CosmosClient(COSMOS_CONNECTION);
  }
  return cosmosClient;
}

interface ParcelResult {
  pin: string;
  property_address: string;
  property_city: string;
  property_zip: string;
  township_name: string;
  nbhd: string;
  latitude: string;
  longitude: string;
}

// V2 Cosmos data shape
interface CosmosPropertyV2 {
  pin: string;
  address: string;
  city: string;
  zip: string;
  state: string;
  county: string;
  lat: number;
  lon: number;
  class: string;
  nbhd: string;
  township: string;
  municipality: string;
  ward: string;
  community_area: string;
  buildings: Array<{
    card: number;
    sqft: number;
    beds: number;
    baths_full: number;
    year_built: number;
    stories: string;
    quality: string;
    condition: string;
    ext_wall: string;
    basement: string;
    heat: string;
    ac: string;
    fireplace: number;
    garage_size: string;
    apartments: string;
    use: string;
  }>;
  is_multicard: boolean;
  total_sqft: number;
  total_beds: number;
  total_baths: number;
  year_built: number;
  primary_quality: string;
  primary_condition: string;
  primary_ext_wall: string;
  primary_stories: string;
  assessments: Record<string, { mailed: number; certified: number; board: number }>;
  current_assessment: number;
  market_value: number;
  appeal_history: { times_reduced: number; has_appealed: boolean };
  recent_sales: Array<{ date: string; price: number }>;
  per_sqft: number;
  comps: Array<{
    pin: string;
    address: string;
    sqft: number;
    beds: number;
    baths: number;
    year_built: number;
    assessment: number;
    per_sqft: number;
    quality: string;
  }>;
  sales_comps: Array<{ pin: string; address: string; sale_date: string; sale_price: number; sqft: number; price_per_sqft: number }>;
  savings_estimate: number;
}

function parseAddress(input: string): { houseNum: string; street: string } | null {
  let cleaned = input.trim().toUpperCase();
  cleaned = cleaned.replace(/\s+\d{5}(-\d{4})?\s*$/, "");
  cleaned = cleaned
    .replace(/,?\s*\bCHICAGO\b\s*/gi, " ")
    .replace(/,?\s*\bILLINOIS\b\s*/gi, " ")
    .replace(/,\s*\bIL\b\s*/gi, " ")
    .replace(/\s+\bIL\b\s*$/gi, " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  const match = cleaned.match(/^(\d+)\s+(.+)$/);
  if (!match) return null;
  
  const houseNum = match[1];
  let street = match[2];
  street = street
    .replace(/\s+(STREET|ST|AVENUE|AVE|ROAD|RD|DRIVE|DR|BOULEVARD|BLVD|LANE|LN|COURT|CT|PLACE|PL|WAY|TERRACE|TER|CIRCLE|CIR)\.?$/i, "")
    .trim();
  
  return { houseNum, street };
}

async function searchByAddress(houseNum: string, street: string): Promise<ParcelResult[]> {
  const sanitizedHouseNum = houseNum.replace(/'/g, "''");
  const sanitizedStreet = street.replace(/'/g, "''");
  const query = `${sanitizedHouseNum}%${sanitizedStreet}%`;
  const whereClause = encodeURIComponent(`upper(property_address) like upper('${query}')`);
  const url = `${PARCEL_API}?$where=${whereClause}&$limit=20`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Parcel API error: ${response.status}`);
  }
  
  return response.json();
}

async function searchByPin(pin: string): Promise<ParcelResult[]> {
  const cleanPin = pin.replace(/-/g, "");
  const url = `${PARCEL_API}?pin=${cleanPin}&$limit=1`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Parcel API error: ${response.status}`);
  }
  
  return response.json();
}

async function getPropertyFromCosmos(pin: string): Promise<CosmosPropertyV2 | null> {
  const client = getCosmosClient();
  if (!client) return null;
  
  try {
    const database = client.database(DATABASE_NAME);
    const container = database.container(CONTAINER_NAME);
    
    const { resource } = await container.item(pin, pin).read();
    return resource || null;
  } catch (error) {
    console.error("Cosmos lookup error:", error);
    return null;
  }
}

async function getNeighborhoodStats(nbhd: string): Promise<{
  totalProperties: number;
  overAssessedCount: number;
  overAssessedPct: number;
  avgReduction: number;
  medianPerSqft: number;
} | null> {
  const client = getCosmosClient();
  if (!client || !nbhd) return null;

  try {
    const database = client.database(DATABASE_NAME);
    const container = database.container(CONTAINER_NAME);

    // V2 fields: savings_estimate, total_sqft, current_assessment
    const query = {
      query: "SELECT c.savings_estimate, c.total_sqft, c.current_assessment FROM c WHERE c.nbhd = @nbhd AND c.county = 'Cook'",
      parameters: [{ name: "@nbhd", value: nbhd }],
    };

    const { resources } = await container.items
      .query(query)
      .fetchAll();

    if (!resources || resources.length === 0) return null;

    const totalProperties = resources.length;
    const overAssessed = resources.filter((r: { savings_estimate: number }) => (r.savings_estimate || 0) > 0);
    const overAssessedCount = overAssessed.length;
    const overAssessedPct = Math.round((overAssessedCount / totalProperties) * 100);
    const avgReduction =
      overAssessedCount > 0
        ? Math.round(
            overAssessed.reduce((sum: number, r: { savings_estimate: number }) => sum + (r.savings_estimate || 0), 0) /
              overAssessedCount
          )
        : 0;

    // Calculate median $/sqft
    const perSqftValues = resources
      .filter((r: { total_sqft: number; current_assessment: number }) => r.total_sqft > 0 && r.current_assessment > 0)
      .map((r: { total_sqft: number; current_assessment: number }) => r.current_assessment / r.total_sqft)
      .sort((a: number, b: number) => a - b);
    const medianPerSqft = perSqftValues.length > 0
      ? Math.round(perSqftValues[Math.floor(perSqftValues.length / 2)] * 100) / 100
      : 0;

    return { totalProperties, overAssessedCount, overAssessedPct, avgReduction, medianPerSqft };
  } catch (error) {
    console.error("Neighborhood stats error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const pin = searchParams.get("pin");
  
  try {
    let parcels: ParcelResult[] = [];
    let targetPin: string | null = pin;
    
    if (pin) {
      parcels = await searchByPin(pin);
    } else if (address) {
      const pinPattern = /^\d{2}-?\d{2}-?\d{3}-?\d{3}-?\d{4}$/;
      if (pinPattern.test(address.replace(/\s/g, ""))) {
        parcels = await searchByPin(address);
        targetPin = address.replace(/-/g, "");
      } else {
        const parsed = parseAddress(address);
        if (!parsed) {
          return NextResponse.json(
            { error: "Could not parse address. Please enter a house number and street name." },
            { status: 400 }
          );
        }
        parcels = await searchByAddress(parsed.houseNum, parsed.street);
      }
    } else {
      return NextResponse.json(
        { error: "Please provide an address or PIN" },
        { status: 400 }
      );
    }
    
    if (parcels.length === 0) {
      return NextResponse.json(
        { error: "No properties found. Try a different address or enter your PIN directly." },
        { status: 404 }
      );
    }
    
    // If multiple results, return list for user to pick
    if (parcels.length > 1) {
      return NextResponse.json({
        multiple: true,
        count: parcels.length,
        results: parcels.map(p => ({
          pin: p.pin,
          address: p.property_address,
          city: p.property_city,
          zip: p.property_zip,
          township: p.township_name,
        })),
      });
    }
    
    // Single result - get full details
    const parcel = parcels[0];
    targetPin = parcel.pin;
    
    // Try to get V2 data from Cosmos DB
    const cosmosData = await getPropertyFromCosmos(targetPin);
    
    // If no Cosmos data found, return basic parcel info
    if (!cosmosData) {
      return NextResponse.json({
        multiple: false,
        analysisAvailable: false,
        property: {
          pin: parcel.pin,
          address: parcel.property_address,
          city: parcel.property_city,
          zip: parcel.property_zip,
          township: parcel.township_name,
          neighborhood: parcel.nbhd,
          latitude: parcel.latitude,
          longitude: parcel.longitude,
          characteristics: null,
          assessment: null,
        },
      });
    }
    
    // V2 data found — build response entirely from Cosmos
    const neighborhoodStats = await getNeighborhoodStats(cosmosData.nbhd);
    
    // Determine savings status
    const savingsEstimate = cosmosData.savings_estimate || 0;
    const isOverAssessed = savingsEstimate > 0;
    
    // Calculate fair assessment from comps median
    const compsMedianPerSqft = cosmosData.comps.length > 0
      ? cosmosData.comps.reduce((sum, c) => sum + c.per_sqft, 0) / cosmosData.comps.length
      : cosmosData.per_sqft;
    const fairAssessment = Math.round(compsMedianPerSqft * cosmosData.total_sqft);
    
    // Count half baths from buildings
    const halfBaths = cosmosData.buildings.reduce((sum, b) => sum + ((b as unknown as Record<string, number>).baths_half || 0), 0);
    
    // Assessment history from Cosmos V2
    const assessments = cosmosData.assessments || {};
    const assessmentEntries = Object.entries(assessments)
      .map(([year, a]: [string, any]) => ({
        year,
        mailedTotal: a.mailed || 0,
        certifiedTotal: a.certified || null,
        boardTotal: a.board || null,
      }))
      .filter(a => a.mailedTotal > 0)
      .sort((a, b) => parseInt(b.year) - parseInt(a.year));
    
    const latestAssessment = assessmentEntries[0] || null;
    
    return NextResponse.json({
      multiple: false,
      analysisAvailable: true,
      property: {
        pin: parcel.pin,
        address: parcel.property_address,
        city: parcel.property_city,
        zip: parcel.property_zip,
        township: parcel.township_name,
        neighborhood: cosmosData.nbhd,
        latitude: parcel.latitude,
        longitude: parcel.longitude,
        characteristics: {
          class: cosmosData.class,
          buildingSqFt: cosmosData.total_sqft,
          landSqFt: null,
          yearBuilt: cosmosData.year_built,
          bedrooms: cosmosData.total_beds,
          fullBaths: cosmosData.total_baths,
          halfBaths: halfBaths,
          exteriorWall: cosmosData.primary_ext_wall,
        },
        assessment: latestAssessment ? {
          year: latestAssessment.year,
          mailedTotal: latestAssessment.mailedTotal,
          certifiedTotal: latestAssessment.certifiedTotal,
          boardTotal: latestAssessment.boardTotal,
        } : null,
        assessmentHistory: assessmentEntries,
        analysis: {
          fairAssessment: isOverAssessed ? fairAssessment : cosmosData.current_assessment,
          potentialSavings: savingsEstimate,
          compCount: cosmosData.comps.length,
        },
        neighborhoodStats: neighborhoodStats || null,
        taxRate: cosmosData.tax_rate || null,
      },
    });
    
  } catch (error) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
