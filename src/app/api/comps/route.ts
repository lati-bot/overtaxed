import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://datacatalog.cookcountyil.gov/resource";
const CHARACTERISTICS = `${BASE_URL}/x54s-btds.json`;
const SALES = `${BASE_URL}/wvhk-k5uv.json`;
const ASSESSMENTS = `${BASE_URL}/uzyt-m557.json`;

interface SubjectProperty {
  pin: string;
  township: string;
  nbhd: string;
  sqFt: number;
  beds: number;
  baths: number;
  yearBuilt: number;
  assessedTot: number;
  assessedBldg: number;
  perSqFt: number;
  marketValue: number;
}

interface AssessmentComp {
  pin: string;
  sqFt: number;
  beds: number;
  yearBuilt: number;
  assessedBldg: number;
  perSqFt: number;
}

interface SaleComp {
  pin: string;
  sqFt: number;
  beds: number;
  salePrice: number;
  saleDate: string;
  perSqFt: number;
}

async function getSubjectProperty(pin: string): Promise<SubjectProperty | null> {
  // Get characteristics
  const charUrl = `${CHARACTERISTICS}?pin=${pin}&$limit=1&$order=year DESC`;
  const charRes = await fetch(charUrl);
  if (!charRes.ok) return null;
  const charData = await charRes.json();
  if (!charData.length) return null;
  const char = charData[0];

  // Get assessed values
  const assUrl = `${ASSESSMENTS}?pin=${pin}&$order=year DESC&$limit=1`;
  const assRes = await fetch(assUrl);
  let assessedTot = 0, assessedBldg = 0;
  if (assRes.ok) {
    const assData = await assRes.json();
    if (assData.length) {
      const av = assData[0];
      assessedTot = parseInt(av.board_tot || av.certified_tot || av.mailed_tot || "0");
      assessedBldg = parseInt(av.board_bldg || av.certified_bldg || av.mailed_bldg || "0");
    }
  }

  const sqFt = parseInt(char.char_bldg_sf || "0");
  
  return {
    pin,
    township: char.township_code || "",
    nbhd: char.nbhd || "",
    sqFt,
    beds: parseInt(char.char_beds || "0"),
    baths: parseFloat(char.char_fbath || "0") + parseFloat(char.char_hbath || "0") * 0.5,
    yearBuilt: parseInt(char.char_yrblt || "0"),
    assessedTot,
    assessedBldg,
    perSqFt: sqFt > 0 ? Math.round(assessedBldg / sqFt * 100) / 100 : 0,
    marketValue: assessedTot * 10,
  };
}

async function findAssessmentComps(subject: SubjectProperty, limit = 8): Promise<AssessmentComp[]> {
  const params = new URLSearchParams({
    township_code: subject.township,
    "$limit": "150",
    "$order": "year DESC",
  });
  
  if (subject.beds) {
    params.set("char_beds", `${subject.beds}.0`);
  }

  const res = await fetch(`${CHARACTERISTICS}?${params}`);
  if (!res.ok) return [];
  const data = await res.json();

  const comps: AssessmentComp[] = [];
  
  for (const c of data) {
    if (c.pin === subject.pin) continue;
    if (comps.length >= limit) break;

    const sqFt = parseInt(c.char_bldg_sf || "0");
    if (!sqFt || !subject.sqFt) continue;

    // Within 25% sq ft
    if (Math.abs(sqFt - subject.sqFt) / subject.sqFt > 0.25) continue;

    // Get assessed value
    const assUrl = `${ASSESSMENTS}?pin=${c.pin}&$order=year DESC&$limit=1`;
    const assRes = await fetch(assUrl);
    if (!assRes.ok) continue;
    const assData = await assRes.json();
    if (!assData.length) continue;

    const av = assData[0];
    const assessedBldg = parseInt(av.board_bldg || av.certified_bldg || av.mailed_bldg || "0");
    if (assessedBldg === 0) continue;

    comps.push({
      pin: c.pin,
      sqFt,
      beds: parseInt(c.char_beds || "0"),
      yearBuilt: parseInt(c.char_yrblt || "0"),
      assessedBldg,
      perSqFt: Math.round(assessedBldg / sqFt * 100) / 100,
    });
  }

  return comps;
}

async function findSalesComps(subject: SubjectProperty, limit = 6): Promise<SaleComp[]> {
  const comps: SaleComp[] = [];
  const years = [2024, 2023, 2022];

  for (const year of years) {
    if (comps.length >= limit) break;

    const params = new URLSearchParams({
      township_code: subject.township,
      year: String(year),
      deed_type: "Warranty",
      "$limit": "80",
    });

    const res = await fetch(`${SALES}?${params}`);
    if (!res.ok) continue;
    const sales = await res.json();

    for (const sale of sales) {
      if (comps.length >= limit) break;

      const price = parseInt(sale.sale_price || "0");
      if (price < 75000) continue; // Skip non-market sales

      const pin = sale.pin;

      // Get characteristics
      const charUrl = `${CHARACTERISTICS}?pin=${pin}&$limit=1&$order=year DESC`;
      const charRes = await fetch(charUrl);
      if (!charRes.ok) continue;
      const charData = await charRes.json();
      if (!charData.length) continue;

      const c = charData[0];
      const sqFt = parseInt(c.char_bldg_sf || "0");
      const beds = parseInt(c.char_beds || "0");

      if (!sqFt) continue;

      // Within 25% sq ft
      if (subject.sqFt && Math.abs(sqFt - subject.sqFt) / subject.sqFt > 0.25) continue;
      // Within 1 bed
      if (subject.beds && Math.abs(beds - subject.beds) > 1) continue;

      comps.push({
        pin,
        sqFt,
        beds,
        salePrice: price,
        saleDate: (sale.sale_date || "").slice(0, 10),
        perSqFt: Math.round(price / sqFt * 100) / 100,
      });
    }
  }

  return comps;
}

function calculateSavings(
  subject: SubjectProperty,
  assessmentComps: AssessmentComp[],
  salesComps: SaleComp[]
): { 
  estimatedSavings: number; 
  method: "uniformity" | "sales" | "none";
  fairAssessment: number;
  medianCompPerSqFt: number;
} {
  let uniformitySavings = 0;
  let salesSavings = 0;
  let uniformityFair = subject.assessedTot;
  let salesFair = subject.assessedTot;
  let uniformityMedian = subject.perSqFt;
  let salesMedian = 0;

  // Uniformity argument
  if (assessmentComps.length >= 3) {
    const perSqFts = assessmentComps.map(c => c.perSqFt).sort((a, b) => a - b);
    const medianPerSqFt = perSqFts[Math.floor(perSqFts.length / 2)];
    uniformityMedian = medianPerSqFt;

    if (subject.perSqFt > medianPerSqFt * 1.05) {
      const fairBldg = medianPerSqFt * subject.sqFt;
      const reduction = subject.assessedBldg - fairBldg;
      uniformitySavings = reduction * 10 * 0.02; // Convert to market value, apply ~2% tax rate
      uniformityFair = subject.assessedTot - reduction;
    }
  }

  // Sales argument
  if (salesComps.length >= 3) {
    const perSqFts = salesComps.map(c => c.perSqFt).sort((a, b) => a - b);
    const medianPerSqFt = perSqFts[Math.floor(perSqFts.length / 2)];
    salesMedian = medianPerSqFt;
    const impliedValue = medianPerSqFt * subject.sqFt;

    if (impliedValue < subject.marketValue) {
      const reduction = subject.marketValue - impliedValue;
      salesSavings = reduction * 0.02;
      salesFair = Math.round(impliedValue / 10); // Convert back to assessment
    }
  }

  // Use the better argument
  if (uniformitySavings > salesSavings && uniformitySavings > 0) {
    return {
      estimatedSavings: Math.round(uniformitySavings),
      method: "uniformity",
      fairAssessment: Math.round(uniformityFair),
      medianCompPerSqFt: uniformityMedian,
    };
  } else if (salesSavings > 0) {
    return {
      estimatedSavings: Math.round(salesSavings),
      method: "sales",
      fairAssessment: salesFair,
      medianCompPerSqFt: salesMedian,
    };
  }

  return {
    estimatedSavings: 0,
    method: "none",
    fairAssessment: subject.assessedTot,
    medianCompPerSqFt: subject.perSqFt,
  };
}

export async function GET(request: NextRequest) {
  const pin = request.nextUrl.searchParams.get("pin");

  if (!pin) {
    return NextResponse.json({ error: "PIN required" }, { status: 400 });
  }

  try {
    const subject = await getSubjectProperty(pin);
    if (!subject) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Run both comp searches in parallel
    const [assessmentComps, salesComps] = await Promise.all([
      findAssessmentComps(subject, 8),
      findSalesComps(subject, 6),
    ]);

    const savings = calculateSavings(subject, assessmentComps, salesComps);

    return NextResponse.json({
      subject,
      assessmentComps,
      salesComps,
      analysis: savings,
    });
  } catch (error) {
    console.error("Comps error:", error);
    return NextResponse.json({ error: "Failed to find comparables" }, { status: 500 });
  }
}
