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
  propertyClass: string;
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
  // Get characteristics - fetch multiple to handle multi-card properties
  const charUrl = `${CHARACTERISTICS}?pin=${pin}&$limit=10&$order=year DESC,char_bldg_sf DESC`;
  const charRes = await fetch(charUrl);
  if (!charRes.ok) return null;
  const charData = await charRes.json();
  if (!charData.length) return null;
  
  // Pick the largest building (main structure, not ADU/garage)
  // Group by year, take most recent, then pick largest sqft
  const mostRecentYear = charData[0]?.year;
  const currentYearCards = charData.filter((c: Record<string, string>) => c.year === mostRecentYear);
  const char = currentYearCards.reduce((best: Record<string, string>, curr: Record<string, string>) => {
    const bestSqFt = parseInt(best?.char_bldg_sf || "0");
    const currSqFt = parseInt(curr?.char_bldg_sf || "0");
    return currSqFt > bestSqFt ? curr : best;
  }, currentYearCards[0]);

  // Get assessed values - filter for rows with actual data
  const assUrl = `${ASSESSMENTS}?pin=${pin}&$where=mailed_tot IS NOT NULL&$order=year DESC&$limit=1`;
  const assRes = await fetch(assUrl);
  let assessedTot = 0, assessedBldg = 0, nbhd = "";
  if (assRes.ok) {
    const assData = await assRes.json();
    if (assData.length) {
      const av = assData[0];
      assessedTot = parseFloat(av.board_tot || av.certified_tot || av.mailed_tot || "0");
      assessedBldg = parseFloat(av.board_bldg || av.certified_bldg || av.mailed_bldg || "0");
      nbhd = av.nbhd || "";
    }
  }

  const sqFt = parseInt(char.char_bldg_sf || "0");
  
  return {
    pin,
    township: char.township_code || "",
    nbhd: nbhd || char.nbhd || "",
    sqFt,
    beds: parseInt(char.char_beds || "0"),
    baths: parseFloat(char.char_fbath || "0") + parseFloat(char.char_hbath || "0") * 0.5,
    yearBuilt: parseInt(char.char_yrblt || "0"),
    assessedTot,
    assessedBldg,
    perSqFt: sqFt > 0 ? Math.round(assessedBldg / sqFt * 100) / 100 : 0,
    marketValue: assessedTot * 10,
    propertyClass: char.class || "",
  };
}

async function findAssessmentComps(subject: SubjectProperty, limit = 8): Promise<AssessmentComp[]> {
  // Use neighborhood for tighter comps, fall back to township
  const locationFilter = subject.nbhd 
    ? `nbhd='${subject.nbhd}'`
    : `township_code='${subject.township}'`;
  
  // Filter for properties with actual assessment data
  const whereClause = encodeURIComponent(
    `${locationFilter} AND mailed_tot IS NOT NULL AND mailed_bldg > 0`
  );
  
  const url = `${ASSESSMENTS}?$where=${whereClause}&$order=year DESC&$limit=100`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();

  // Dedupe by PIN (keep most recent year)
  const seenPins = new Set<string>();
  const uniqueAssessments = data.filter((a: Record<string, string>) => {
    if (a.pin === subject.pin || seenPins.has(a.pin)) return false;
    seenPins.add(a.pin);
    return true;
  });

  const comps: AssessmentComp[] = [];
  
  for (const a of uniqueAssessments) {
    if (comps.length >= limit) break;

    // Get characteristics for this property
    const charUrl = `${CHARACTERISTICS}?pin=${a.pin}&$order=year DESC,char_bldg_sf DESC&$limit=1`;
    const charRes = await fetch(charUrl);
    if (!charRes.ok) continue;
    const charData = await charRes.json();
    if (!charData.length) continue;
    
    const c = charData[0];
    const sqFt = parseInt(c.char_bldg_sf || "0");
    const beds = parseInt(c.char_beds || "0");
    
    if (!sqFt) continue;

    // Within 30% sq ft
    if (subject.sqFt && Math.abs(sqFt - subject.sqFt) / subject.sqFt > 0.30) continue;
    
    // Within 1 bed
    if (subject.beds && Math.abs(beds - subject.beds) > 1) continue;

    const assessedBldg = parseFloat(a.board_bldg || a.certified_bldg || a.mailed_bldg || "0");
    if (assessedBldg === 0) continue;

    comps.push({
      pin: a.pin,
      sqFt,
      beds,
      yearBuilt: parseInt(c.char_yrblt || "0"),
      assessedBldg,
      perSqFt: Math.round(assessedBldg / sqFt * 100) / 100,
    });
  }

  return comps;
}

async function findSalesComps(subject: SubjectProperty, limit = 6): Promise<SaleComp[]> {
  const comps: SaleComp[] = [];
  
  // Use neighborhood code in township filter
  const townshipCode = subject.township;
  
  for (const year of [2024, 2023, 2022]) {
    if (comps.length >= limit) break;

    const whereClause = encodeURIComponent(
      `township_code='${townshipCode}' AND year='${year}' AND deed_type='Warranty' AND sale_price > 75000`
    );
    const url = `${SALES}?$where=${whereClause}&$limit=50`;
    
    const res = await fetch(url);
    if (!res.ok) continue;
    const sales = await res.json();

    for (const sale of sales) {
      if (comps.length >= limit) break;

      const price = parseInt(sale.sale_price || "0");
      const salePin = sale.pin;

      // Get characteristics
      const charUrl = `${CHARACTERISTICS}?pin=${salePin}&$order=year DESC,char_bldg_sf DESC&$limit=1`;
      const charRes = await fetch(charUrl);
      if (!charRes.ok) continue;
      const charData = await charRes.json();
      if (!charData.length) continue;

      const c = charData[0];
      const sqFt = parseInt(c.char_bldg_sf || "0");
      const beds = parseInt(c.char_beds || "0");

      if (!sqFt) continue;

      // Within 30% sq ft
      if (subject.sqFt && Math.abs(sqFt - subject.sqFt) / subject.sqFt > 0.30) continue;
      // Within 1 bed
      if (subject.beds && Math.abs(beds - subject.beds) > 1) continue;

      comps.push({
        pin: salePin,
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

  // Uniformity argument (need at least 3 comps)
  if (assessmentComps.length >= 3) {
    const perSqFts = assessmentComps.map(c => c.perSqFt).sort((a, b) => a - b);
    const medianPerSqFt = perSqFts[Math.floor(perSqFts.length / 2)];
    uniformityMedian = medianPerSqFt;

    if (subject.perSqFt > medianPerSqFt * 1.05) {
      const fairBldg = medianPerSqFt * subject.sqFt;
      const reduction = subject.assessedBldg - fairBldg;
      // Tax savings: assessment reduction * 10 (to market value) * ~2% tax rate
      uniformitySavings = Math.round(reduction * 10 * 0.02);
      uniformityFair = Math.round(subject.assessedTot - reduction);
    }
  }

  // Sales argument (need at least 3 comps)
  if (salesComps.length >= 3) {
    const perSqFts = salesComps.map(c => c.perSqFt).sort((a, b) => a - b);
    const medianPerSqFt = perSqFts[Math.floor(perSqFts.length / 2)];
    salesMedian = medianPerSqFt;
    const impliedValue = medianPerSqFt * subject.sqFt;

    if (impliedValue < subject.marketValue) {
      const reduction = subject.marketValue - impliedValue;
      salesSavings = Math.round(reduction * 0.02);
      salesFair = Math.round(impliedValue / 10);
    }
  }

  // Use the better argument
  if (uniformitySavings > salesSavings && uniformitySavings > 0) {
    return {
      estimatedSavings: uniformitySavings,
      method: "uniformity",
      fairAssessment: uniformityFair,
      medianCompPerSqFt: uniformityMedian,
    };
  } else if (salesSavings > 0) {
    return {
      estimatedSavings: salesSavings,
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
