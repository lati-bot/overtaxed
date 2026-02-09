import { NextRequest, NextResponse } from "next/server";

const PARCEL_API = "https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json";
const CHARACTERISTICS_API = "https://datacatalog.cookcountyil.gov/resource/bcnq-qi2z.json";
const ASSESSMENTS_API = "https://datacatalog.cookcountyil.gov/resource/uzyt-m557.json";

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

function parseAddress(input: string): { houseNum: string; street: string } | null {
  // Clean up the input
  let cleaned = input.trim().toUpperCase();
  
  // Remove city, state, zip first (before parsing house number)
  cleaned = cleaned
    .replace(/,?\s*(CHICAGO|IL|ILLINOIS)\s*/gi, " ")
    .replace(/\s+\d{5}(-\d{4})?\s*$/, "") // Remove zip code
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  // Match pattern: number + optional direction + street name
  const match = cleaned.match(/^(\d+)\s+(.+)$/);
  if (!match) return null;
  
  const houseNum = match[1];
  let street = match[2];
  
  // Remove common suffixes for better matching
  street = street
    .replace(/\s+(STREET|ST|AVENUE|AVE|ROAD|RD|DRIVE|DR|BOULEVARD|BLVD|LANE|LN|COURT|CT|PLACE|PL|WAY|TERRACE|TER|CIRCLE|CIR)\.?$/i, "")
    .trim();
  
  return { houseNum, street };
}

async function searchByAddress(houseNum: string, street: string): Promise<ParcelResult[]> {
  // Build query with wildcards for fuzzy matching
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
  // Clean PIN - remove dashes if present
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const pin = searchParams.get("pin");
  
  try {
    let parcels: ParcelResult[] = [];
    
    if (pin) {
      // Direct PIN lookup
      parcels = await searchByPin(pin);
    } else if (address) {
      // Check if input looks like a PIN (14 digits, possibly with dashes)
      const pinPattern = /^\d{2}-?\d{2}-?\d{3}-?\d{3}-?\d{4}$/;
      if (pinPattern.test(address.replace(/\s/g, ""))) {
        parcels = await searchByPin(address);
      } else {
        // Parse as address
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
    const [characteristics, assessments] = await Promise.all([
      getCharacteristics(parcel.pin),
      getAssessments(parcel.pin),
    ]);
    
    // Find the most recent assessment with actual data
    const latestAssessment = assessments.find(a => a.mailed_tot) || null;
    
    return NextResponse.json({
      multiple: false,
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
          .filter(a => a.mailed_tot) // Filter out years with no data
          .map(a => ({
            year: a.year,
            mailedTotal: parseInt(a.mailed_tot) || 0,
            certifiedTotal: a.certified_tot ? parseInt(a.certified_tot) : null,
            boardTotal: a.board_tot ? parseInt(a.board_tot) : null,
          })),
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
