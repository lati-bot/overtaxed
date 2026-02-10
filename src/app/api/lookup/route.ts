import { NextRequest, NextResponse } from "next/server";
import { CosmosClient } from "@azure/cosmos";

const PARCEL_API = "https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json";
const CHARACTERISTICS_API = "https://datacatalog.cookcountyil.gov/resource/bcnq-qi2z.json";
const ASSESSMENTS_API = "https://datacatalog.cookcountyil.gov/resource/uzyt-m557.json";

// Cosmos DB connection
const COSMOS_CONNECTION = process.env.COSMOS_CONNECTION_STRING || "";
const DATABASE_NAME = "overtaxed";
const CONTAINER_NAME = "properties";

// Flag to show "still processing" message - set to false once upload is complete
const UPLOAD_IN_PROGRESS = false;

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

interface PropertyCharacteristics {
  pin: string;
  class: string;
  township_code: string;
  nbhd: string;
  char_bldg_sf?: string;
  char_land_sf?: string;
  char_yrblt?: string;
  char_beds?: string;
  char_fbath?: string;
  char_hbath?: string;
  char_ext_wall?: string;
}

interface Assessment {
  pin: string;
  year: string;
  mailed_bldg: string;
  mailed_land: string;
  mailed_tot: string;
  certified_bldg?: string;
  certified_land?: string;
  certified_tot?: string;
  board_bldg?: string;
  board_land?: string;
  board_tot?: string;
}

interface CosmosProperty {
  pin: string;
  status: string;
  nbhd: string;
  sqft: number;
  beds: number;
  current_assessment: number;
  fair_assessment: number;
  estimated_savings: number;
  comp_count: number;
  median_per_sqft: number;
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
  const query = `${houseNum}%${street}%`;
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

async function getCharacteristics(pin: string): Promise<PropertyCharacteristics | null> {
  const url = `${CHARACTERISTICS_API}?pin=${pin}&$order=year DESC&$limit=1`;
  
  const response = await fetch(url);
  if (!response.ok) return null;
  
  const data = await response.json();
  return data[0] || null;
}

async function getAssessments(pin: string): Promise<Assessment[]> {
  const url = `${ASSESSMENTS_API}?pin=${pin}&$order=year DESC&$limit=5`;
  
  const response = await fetch(url);
  if (!response.ok) return [];
  
  return response.json();
}

async function getAnalysisFromCosmos(pin: string): Promise<CosmosProperty | null> {
  const client = getCosmosClient();
  if (!client) return null;
  
  try {
    const database = client.database(DATABASE_NAME);
    const container = database.container(CONTAINER_NAME);
    
    const { resource } = await container.item(pin, pin).read();
    return resource || null;
  } catch (error) {
    // Item not found or other error
    console.error("Cosmos lookup error:", error);
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
    
    // Try to get analysis from Cosmos DB
    const analysis = await getAnalysisFromCosmos(targetPin);
    
    // If no analysis found, return property info with a flag
    if (!analysis) {
      // Still get basic property info from Cook County
      const [characteristics, assessments] = await Promise.all([
        getCharacteristics(parcel.pin),
        getAssessments(parcel.pin),
      ]);
      
      const latestAssessment = assessments.find(a => a.mailed_tot) || null;
      
      return NextResponse.json({
        multiple: false,
        analysisAvailable: false,
        uploadInProgress: UPLOAD_IN_PROGRESS,
        property: {
          pin: parcel.pin,
          address: parcel.property_address,
          city: parcel.property_city,
          zip: parcel.property_zip,
          township: parcel.township_name,
          neighborhood: parcel.nbhd,
          latitude: parcel.latitude,
          longitude: parcel.longitude,
          characteristics: characteristics ? {
            class: characteristics.class,
            buildingSqFt: characteristics.char_bldg_sf ? parseInt(characteristics.char_bldg_sf) : null,
            landSqFt: characteristics.char_land_sf ? parseInt(characteristics.char_land_sf) : null,
            yearBuilt: characteristics.char_yrblt ? parseInt(characteristics.char_yrblt) : null,
            bedrooms: characteristics.char_beds ? parseInt(characteristics.char_beds) : null,
            fullBaths: characteristics.char_fbath ? parseInt(characteristics.char_fbath) : null,
            halfBaths: characteristics.char_hbath ? parseInt(characteristics.char_hbath) : null,
            exteriorWall: characteristics.char_ext_wall,
          } : null,
          assessment: latestAssessment && latestAssessment.mailed_tot ? {
            year: latestAssessment.year,
            mailedTotal: parseInt(latestAssessment.mailed_tot) || 0,
            mailedBuilding: parseInt(latestAssessment.mailed_bldg) || 0,
            mailedLand: parseInt(latestAssessment.mailed_land) || 0,
          } : null,
        },
      });
    }
    
    // Analysis found - return full data
    const [characteristics, assessments] = await Promise.all([
      getCharacteristics(parcel.pin),
      getAssessments(parcel.pin),
    ]);
    
    const latestAssessment = assessments.find(a => a.mailed_tot) || null;
    
    return NextResponse.json({
      multiple: false,
      analysisAvailable: true,
      property: {
        pin: parcel.pin,
        address: parcel.property_address,
        city: parcel.property_city,
        zip: parcel.property_zip,
        township: parcel.township_name,
        neighborhood: parcel.nbhd,
        latitude: parcel.latitude,
        longitude: parcel.longitude,
        characteristics: characteristics ? {
          class: characteristics.class,
          buildingSqFt: characteristics.char_bldg_sf ? parseInt(characteristics.char_bldg_sf) : null,
          landSqFt: characteristics.char_land_sf ? parseInt(characteristics.char_land_sf) : null,
          yearBuilt: characteristics.char_yrblt ? parseInt(characteristics.char_yrblt) : null,
          bedrooms: characteristics.char_beds ? parseInt(characteristics.char_beds) : null,
          fullBaths: characteristics.char_fbath ? parseInt(characteristics.char_fbath) : null,
          halfBaths: characteristics.char_hbath ? parseInt(characteristics.char_hbath) : null,
          exteriorWall: characteristics.char_ext_wall,
        } : null,
        assessment: latestAssessment && latestAssessment.mailed_tot ? {
          year: latestAssessment.year,
          mailedTotal: parseInt(latestAssessment.mailed_tot) || 0,
          mailedBuilding: parseInt(latestAssessment.mailed_bldg) || 0,
          mailedLand: parseInt(latestAssessment.mailed_land) || 0,
          certifiedTotal: latestAssessment.certified_tot ? parseInt(latestAssessment.certified_tot) : null,
          boardTotal: latestAssessment.board_tot ? parseInt(latestAssessment.board_tot) : null,
        } : null,
        assessmentHistory: assessments
          .filter(a => a.mailed_tot)
          .map(a => ({
            year: a.year,
            mailedTotal: parseInt(a.mailed_tot) || 0,
            certifiedTotal: a.certified_tot ? parseInt(a.certified_tot) : null,
            boardTotal: a.board_tot ? parseInt(a.board_tot) : null,
          })),
        // Analysis data from Cosmos
        analysis: {
          fairAssessment: analysis.fair_assessment,
          potentialSavings: analysis.estimated_savings || 0,
          compCount: analysis.comp_count || 0,
        },
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
