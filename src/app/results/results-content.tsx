"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface PropertyData {
  pin: string;
  address: string;
  city: string;
  zip: string;
  township: string;
  neighborhood: string;
  characteristics: {
    class: string;
    buildingSqFt: number | null;
    landSqFt: number | null;
    yearBuilt: number | null;
    bedrooms: number | null;
    fullBaths: number | null;
    halfBaths: number | null;
    qualityGrade?: string | null;
    condition?: string | null;
  } | null;
  assessment: {
    year: string;
    mailedTotal: number;
    mailedBuilding: number;
    mailedLand: number;
    certifiedTotal: number | null;
    boardTotal: number | null;
  } | null;
  assessmentHistory?: {
    year: string;
    mailedTotal: number;
    certifiedTotal: number | null;
    boardTotal: number | null;
  }[];
  analysis?: {
    fairAssessment: number;
    potentialSavings: number;
    compCount: number;
  };
  neighborhoodStats?: {
    totalProperties: number;
    overAssessedCount: number;
    overAssessedPct: number;
    medianPerSqft: number;
    avgReduction: number;
  } | null;
}

interface MultipleResults {
  pin: string;
  address: string;
  city: string;
  zip: string;
  township: string;
}

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [multipleResults, setMultipleResults] = useState<MultipleResults[] | null>(null);
  const [analysisAvailable, setAnalysisAvailable] = useState<boolean>(true);
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const address = searchParams.get("address");
  const pin = searchParams.get("pin");
  const acct = searchParams.get("acct");
  const jurisdiction = searchParams.get("jurisdiction");
  const isHouston = jurisdiction === "houston" || (!!acct && jurisdiction !== "dallas" && jurisdiction !== "austin" && jurisdiction !== "collin" && jurisdiction !== "tarrant" && jurisdiction !== "denton" && jurisdiction !== "williamson" && jurisdiction !== "fortbend");
  const isDallas = jurisdiction === "dallas";
  const isAustin = jurisdiction === "austin";
  const isCollin = jurisdiction === "collin";
  const isTarrant = jurisdiction === "tarrant";
  const isDenton = jurisdiction === "denton";
  const isWilliamson = jurisdiction === "williamson";
  const isFortBend = jurisdiction === "fortbend";
  const isTexas = isHouston || isDallas || isAustin || isCollin || isTarrant || isDenton || isWilliamson || isFortBend;
  const marketLabel = isFortBend ? "FBCAD" : isWilliamson ? "WCAD" : isDenton ? "DCAD" : isTarrant ? "TAD" : isCollin ? "CCAD" : isAustin ? "TCAD" : isDallas ? "DCAD" : isTexas ? "HCAD" : "Cook County";
  const jurisdictionValue = isFortBend ? "fortbend" : isWilliamson ? "williamson" : isDenton ? "denton" : isTarrant ? "tarrant" : isCollin ? "collin" : isAustin ? "austin" : isDallas ? "dallas" : isTexas ? "houston" : "cook_county";

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = false;

  const fetchProperty = async (searchPin?: string) => {
    setLoading(true);
    setError(null);
    setProperty(null);
    setMultipleResults(null);

    try {
      if (isCollin) {
        // Collin County flow — use Collin lookup API
        const collinAcct = searchPin || acct;
        if (!collinAcct) {
          setError("Missing account number");
          return;
        }
        const response = await fetch(`/api/collin/lookup?acct=${collinAcct}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Property not found");
          return;
        }
        
        const cp = data.property;
        setProperty({
          pin: cp.acct,
          address: cp.address,
          city: cp.city || "PLANO",
          zip: cp.zipcode || "",
          township: "",
          neighborhood: cp.neighborhoodCode || "",
          characteristics: {
            class: cp.bldgClass || "",
            buildingSqFt: cp.sqft,
            landSqFt: null,
            yearBuilt: cp.yearBuilt || null,
            bedrooms: cp.beds || null,
            fullBaths: cp.fullBaths || null,
            halfBaths: cp.halfBaths || null,
          },
          assessment: {
            year: "2025",
            mailedTotal: cp.currentAssessment,
            mailedBuilding: cp.improvementVal || 0,
            mailedLand: cp.landVal || 0,
            certifiedTotal: null,
            boardTotal: null,
          },
          analysis: {
            fairAssessment: cp.status === "over" ? cp.fairAssessment : cp.currentAssessment,
            potentialSavings: cp.status === "over" ? cp.estimatedSavings : 0,
            compCount: (cp.comps || []).length,
          },
          neighborhoodStats: cp.neighborhoodStats || null,
        });
        setAnalysisAvailable(true);
      } else if (isDenton) {
        // Denton County flow — use Denton lookup API
        const dentonAcct = searchPin || acct;
        if (!dentonAcct) {
          setError("Missing account number");
          return;
        }
        const response = await fetch(`/api/denton/lookup?acct=${dentonAcct}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Property not found");
          return;
        }
        
        const dp = data.property;
        setProperty({
          pin: dp.acct,
          address: dp.address,
          city: dp.city || "DENTON",
          zip: dp.zipcode || "",
          township: "",
          neighborhood: dp.neighborhoodCode || "",
          characteristics: {
            class: "",
            buildingSqFt: dp.sqft,
            landSqFt: null,
            yearBuilt: dp.yearBuilt || null,
            bedrooms: null,
            fullBaths: null,
            halfBaths: null,
          },
          assessment: {
            year: "2025",
            mailedTotal: dp.currentAssessment,
            mailedBuilding: dp.improvementVal || 0,
            mailedLand: dp.landVal || 0,
            certifiedTotal: null,
            boardTotal: null,
          },
          analysis: {
            fairAssessment: dp.status === "over" ? dp.fairAssessment : dp.currentAssessment,
            potentialSavings: dp.status === "over" ? dp.estimatedSavings : 0,
            compCount: (dp.comps || []).length,
          },
          neighborhoodStats: dp.neighborhoodStats || null,
        });
        setAnalysisAvailable(true);
      } else if (isWilliamson) {
        // Williamson County flow — use Williamson lookup API
        const williamsonAcct = searchPin || acct;
        if (!williamsonAcct) {
          setError("Missing account number");
          return;
        }
        const response = await fetch(`/api/williamson/lookup?acct=${williamsonAcct}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Property not found");
          return;
        }
        
        const wp = data.property;
        setProperty({
          pin: wp.acct,
          address: wp.address,
          city: wp.city || "GEORGETOWN",
          zip: wp.zipcode || "",
          township: "",
          neighborhood: wp.neighborhoodCode || "",
          characteristics: {
            class: "",
            buildingSqFt: wp.sqft,
            landSqFt: null,
            yearBuilt: wp.yearBuilt && wp.yearBuilt > 0 ? wp.yearBuilt : null,
            bedrooms: null,
            fullBaths: null,
            halfBaths: null,
          },
          assessment: {
            year: "2025",
            mailedTotal: wp.currentAssessment,
            mailedBuilding: 0,
            mailedLand: 0,
            certifiedTotal: null,
            boardTotal: null,
          },
          analysis: {
            fairAssessment: wp.status === "over" ? wp.fairAssessment : wp.currentAssessment,
            potentialSavings: wp.status === "over" ? wp.estimatedSavings : 0,
            compCount: (wp.comps || []).length,
          },
          neighborhoodStats: wp.neighborhoodStats || null,
        });
        setAnalysisAvailable(true);
      } else if (isFortBend) {
        // Fort Bend County flow — use Fort Bend lookup API
        const fortbendAcct = searchPin || acct;
        if (!fortbendAcct) {
          setError("Missing account number");
          return;
        }
        const response = await fetch(`/api/fortbend/lookup?acct=${fortbendAcct}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Property not found");
          return;
        }
        
        const fp = data.property;
        setProperty({
          pin: fp.acct,
          address: fp.address,
          city: fp.city || "SUGAR LAND",
          zip: fp.zipcode || "",
          township: "",
          neighborhood: fp.neighborhoodCode || "",
          characteristics: {
            class: "",
            buildingSqFt: fp.sqft,
            landSqFt: null,
            yearBuilt: fp.yearBuilt && fp.yearBuilt > 0 ? fp.yearBuilt : null,
            bedrooms: fp.beds || null,
            fullBaths: fp.fullBaths || null,
            halfBaths: fp.halfBaths || null,
          },
          assessment: {
            year: "2025",
            mailedTotal: fp.currentAssessment,
            mailedBuilding: fp.improvementVal || 0,
            mailedLand: fp.landVal || 0,
            certifiedTotal: null,
            boardTotal: null,
          },
          analysis: {
            fairAssessment: fp.status === "over" ? fp.fairAssessment : fp.currentAssessment,
            potentialSavings: fp.status === "over" ? fp.estimatedSavings : 0,
            compCount: (fp.comps || []).length,
          },
          neighborhoodStats: fp.neighborhoodStats || null,
        });
        setAnalysisAvailable(true);
      } else if (isTarrant) {
        // Tarrant County flow — use Tarrant lookup API
        const tarrantAcct = searchPin || acct;
        if (!tarrantAcct) {
          setError("Missing account number");
          return;
        }
        const response = await fetch(`/api/tarrant/lookup?acct=${tarrantAcct}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Property not found");
          return;
        }
        
        const tp = data.property;
        setProperty({
          pin: tp.acct,
          address: tp.address,
          city: tp.city || "FORT WORTH",
          zip: tp.zipcode || "",
          township: "",
          neighborhood: tp.neighborhoodCode || "",
          characteristics: {
            class: tp.bldgClass || "",
            buildingSqFt: tp.sqft,
            landSqFt: null,
            yearBuilt: tp.yearBuilt || null,
            bedrooms: null,
            fullBaths: null,
            halfBaths: null,
            qualityGrade: tp.qualityGrade || null,
            condition: tp.condition || null,
          },
          assessment: {
            year: "2025",
            mailedTotal: tp.currentAssessment,
            mailedBuilding: tp.improvementVal || 0,
            mailedLand: tp.landVal || 0,
            certifiedTotal: null,
            boardTotal: null,
          },
          analysis: {
            fairAssessment: tp.status === "over" ? tp.fairAssessment : tp.currentAssessment,
            potentialSavings: tp.status === "over" ? tp.estimatedSavings : 0,
            compCount: (tp.comps || []).length,
          },
          neighborhoodStats: tp.neighborhoodStats || null,
        });
        setAnalysisAvailable(true);
      } else if (isAustin) {
        // Austin flow — use Austin lookup API
        const austinAcct = searchPin || acct;
        if (!austinAcct) {
          setError("Missing account number");
          return;
        }
        const response = await fetch(`/api/austin/lookup?acct=${austinAcct}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Property not found");
          return;
        }
        
        const ap = data.property;
        setProperty({
          pin: ap.acct,
          address: ap.address,
          city: ap.city || "AUSTIN",
          zip: ap.zipcode || "",
          township: "",
          neighborhood: ap.neighborhoodCode || "",
          characteristics: {
            class: ap.bldgClass || "",
            buildingSqFt: ap.sqft,
            landSqFt: null,
            yearBuilt: ap.yearBuilt || null,
            bedrooms: ap.beds || null,
            fullBaths: ap.fullBaths || null,
            halfBaths: ap.halfBaths || null,
          },
          assessment: {
            year: "2025",
            mailedTotal: ap.currentAssessment,
            mailedBuilding: ap.improvementVal || 0,
            mailedLand: ap.landVal || 0,
            certifiedTotal: null,
            boardTotal: null,
          },
          analysis: {
            fairAssessment: ap.status === "over" ? ap.fairAssessment : ap.currentAssessment,
            potentialSavings: ap.status === "over" ? ap.estimatedSavings : 0,
            compCount: (ap.comps || []).length,
          },
          neighborhoodStats: ap.neighborhoodStats || null,
        });
        setAnalysisAvailable(true);
      } else if (isDallas) {
        // Dallas flow — use Dallas lookup API
        const dallasAcct = searchPin || acct;
        if (!dallasAcct) {
          setError("Missing account number");
          return;
        }
        const response = await fetch(`/api/dallas/lookup?acct=${dallasAcct}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Property not found");
          return;
        }
        
        const dp = data.property;
        setProperty({
          pin: dp.acct,
          address: dp.address,
          city: dp.city || "DALLAS",
          zip: dp.zipcode || "",
          township: "",
          neighborhood: dp.neighborhoodCode || "",
          characteristics: {
            class: dp.bldgClass || "",
            buildingSqFt: dp.sqft,
            landSqFt: null,
            yearBuilt: dp.yearBuilt || null,
            bedrooms: dp.beds || null,
            fullBaths: dp.fullBaths || null,
            halfBaths: dp.halfBaths || null,
          },
          assessment: {
            year: "2025",
            mailedTotal: dp.currentAssessment,
            mailedBuilding: dp.improvementVal || 0,
            mailedLand: dp.landVal || 0,
            certifiedTotal: null,
            boardTotal: null,
          },
          analysis: {
            fairAssessment: dp.status === "over" ? dp.fairAssessment : dp.currentAssessment,
            potentialSavings: dp.status === "over" ? dp.estimatedSavings : 0,
            compCount: (dp.comps || []).length,
          },
          neighborhoodStats: dp.neighborhoodStats || null,
        });
        setAnalysisAvailable(true);
      } else if (isHouston) {
        // Houston flow — use Houston lookup API
        const houstonAcct = searchPin || acct;
        if (!houstonAcct) {
          setError("Missing account number");
          return;
        }
        const response = await fetch(`/api/houston/lookup?acct=${houstonAcct}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Property not found");
          return;
        }
        
        const hp = data.property;
        // Map Houston data to our PropertyData shape
        setProperty({
          pin: hp.acct,
          address: hp.address,
          city: hp.city || "HOUSTON",
          zip: "",
          township: "",
          neighborhood: hp.neighborhoodCode || "",
          characteristics: {
            class: "",
            buildingSqFt: hp.sqft,
            landSqFt: null,
            yearBuilt: hp.yearBuilt || null,
            bedrooms: null,
            fullBaths: null,
            halfBaths: null,
          },
          assessment: {
            year: "2025",
            mailedTotal: hp.currentAssessment,
            mailedBuilding: 0,
            mailedLand: 0,
            certifiedTotal: null,
            boardTotal: null,
          },
          analysis: {
            fairAssessment: hp.status === "over" ? hp.fairAssessment : hp.currentAssessment,
            potentialSavings: hp.status === "over" ? hp.estimatedSavings : 0,
            compCount: (hp.comps || []).length,
          },
          neighborhoodStats: hp.neighborhoodStats || null,
        });
        setAnalysisAvailable(true);
      } else {
        // Cook County flow — existing logic
        const params = new URLSearchParams();
        if (searchPin) {
          params.set("pin", searchPin);
        } else if (pin) {
          params.set("pin", pin);
        } else if (address) {
          params.set("address", address);
        }

        const response = await fetch(`/api/lookup?${params}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Something went wrong");
          return;
        }

        if (data.multiple) {
          setMultipleResults(data.results);
        } else {
          setProperty(data.property);
          setAnalysisAvailable(data.analysisAvailable !== false);
          setUploadInProgress(data.uploadInProgress === true);
        }
      }
    } catch {
      setError("Failed to fetch property data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = (selectedPin: string) => {
    router.push(`/results?pin=${selectedPin}`);
    fetchProperty(selectedPin);
  };

  useEffect(() => {
    if (!address && !pin && !acct) {
      router.push("/");
      return;
    }

    fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, pin, acct]);

  // Shared styles
  const bgMain = isDark ? "bg-[#0a0a0a]" : "bg-[#f7f6f3]";
  const bgCard = isDark ? "bg-white/[0.02]" : "bg-white";
  const borderColor = isDark ? "border-white/10" : "border-black/5";
  const textPrimary = isDark ? "text-white" : "text-[#111]";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const textMuted = isDark ? "text-gray-500" : "text-gray-400";

  // Prevent flash
  if (!mounted) {
    return <div className="min-h-screen bg-[#f7f6f3]" />;
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} ${textPrimary} flex items-center justify-center transition-colors duration-300 relative`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-10 w-10 border-2 ${isDark ? "border-white/20 border-t-white" : "border-black/20 border-t-black"} mx-auto`}></div>
          <p className={`mt-4 ${textSecondary}`}>Looking up your property...</p>
        </div>
      </div>
    );
  }

  // Fun, helpful error page
  if (error) {
    return (
      <div className={`min-h-screen ${bgMain} ${textPrimary} transition-colors duration-300 relative`}>
        <nav className={`sticky top-0 z-50 ${isDark ? "bg-[#0a0a0a]/80" : "bg-[#f7f6f3]/80"} backdrop-blur-xl border-b ${borderColor}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="7" fill="#1a6b5a"/>
                <circle cx="16" cy="15.5" r="7" stroke="white" strokeWidth="3.5" fill="none"/>
              </svg>
              <span className="text-lg font-normal text-[#1a1a1a]">overtaxed</span>
            </Link>
            <Link href="/" className="text-sm text-[#1a6b5a] hover:underline">
              ← New Search
            </Link>
          </div>
        </nav>
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-8">
            <div className="text-6xl sm:text-8xl mb-4">🏠❓</div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-semibold text-center">
            Hmm, we couldn&apos;t find that one
          </h1>
          
          <p className={`mt-3 text-center ${textSecondary} text-lg`}>
            We searched high and low, but no luck. Here&apos;s what might be going on:
          </p>
          
          <div className={`mt-8 rounded-2xl ${bgCard} border ${borderColor} p-6 ${isDark ? "" : "shadow-sm"}`}>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/10" : "bg-black/5"}`}>
                  <span className="text-sm">📍</span>
                </div>
                <div>
                  <div className="font-medium">Not in our coverage area?</div>
                  <p className={`text-sm ${textSecondary} mt-0.5`}>
                    We currently cover Cook County, IL, Houston, TX (Harris County), Dallas, TX (Dallas County), Austin, TX (Travis County), Collin County, TX, Tarrant County, TX, Denton County, TX, and Williamson County, TX. More markets coming soon!
                  </p>
                </div>
              </div>
              
              <div className={`border-t ${borderColor}`}></div>
              
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/10" : "bg-black/5"}`}>
                  <span className="text-sm">✏️</span>
                </div>
                <div>
                  <div className="font-medium">Typo in the address?</div>
                  <p className={`text-sm ${textSecondary} mt-0.5`}>
                    Double-check the spelling. Our autocomplete should help — start typing and pick from the list.
                  </p>
                </div>
              </div>
              
              <div className={`border-t ${borderColor}`}></div>
              
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? "bg-white/10" : "bg-black/5"}`}>
                  <span className="text-sm">🏢</span>
                </div>
                <div>
                  <div className="font-medium">Condo or commercial property?</div>
                  <p className={`text-sm ${textSecondary} mt-0.5`}>
                    We specialize in single-family homes and small multi-family (2-4 units).
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${isDark ? "bg-white text-black hover:bg-gray-100" : "bg-[#1a6b5a] text-white hover:bg-[#155a4c]"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Try another address
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (multipleResults) {
    return (
      <div className={`min-h-screen ${bgMain} ${textPrimary} transition-colors duration-300 relative`}>
        <nav className={`sticky top-0 z-50 ${isDark ? "bg-[#0a0a0a]/80" : "bg-[#f7f6f3]/80"} backdrop-blur-xl border-b ${borderColor}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="7" fill="#1a6b5a"/>
                <circle cx="16" cy="15.5" r="7" stroke="white" strokeWidth="3.5" fill="none"/>
              </svg>
              <span className="text-lg font-normal text-[#1a1a1a]">overtaxed</span>
            </Link>
            <Link href="/" className="text-sm text-[#1a6b5a] hover:underline">
              ← New Search
            </Link>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎯</div>
            <h1 className="text-xl sm:text-2xl font-semibold">We found a few matches</h1>
            <p className={`mt-2 ${textSecondary}`}>Which one is yours?</p>
          </div>
          <div className="space-y-3">
            {multipleResults.map((result) => (
              <button
                key={result.pin}
                onClick={() => handleSelectProperty(result.pin)}
                className={`w-full text-left p-4 rounded-xl border ${borderColor} ${bgCard} hover:border-[#1a6b5a]/50 transition-all ${isDark ? "" : "shadow-sm hover:shadow-md"}`}
              >
                <div className="font-medium">{result.address}</div>
                <div className={`text-sm ${textSecondary}`}>
                  {result.city}, IL {result.zip} • {result.township} Township
                </div>
                <div className={`text-xs ${textMuted} mt-1`}>PIN: {result.pin}</div>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/" className={`text-sm ${textSecondary} ${isDark ? "hover:text-white" : "hover:text-black"}`}>
              ← Search again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const currentAssessment = property.assessment?.boardTotal || 
                           property.assessment?.certifiedTotal || 
                           property.assessment?.mailedTotal || 0;
  
  const estimatedMarketValue = isTexas ? currentAssessment : currentAssessment * 10;
  
  const hasAnalysis = analysisAvailable && property.analysis;
  const fairAssessment = hasAnalysis ? property.analysis!.fairAssessment : currentAssessment;
  const reduction = currentAssessment - fairAssessment;
  // Houston uses ~2.2% tax rate; Cook County uses assessment reduction × 20%
  const rawSavings = reduction > 0 
    ? (isTexas ? Math.round(reduction * 0.022) : Math.round(reduction * 0.20))
    : 0;
  // Minimum threshold: don't show as over-assessed if savings are trivial
  const MIN_SAVINGS_THRESHOLD = 250;
  const estimatedSavings = rawSavings >= MIN_SAVINGS_THRESHOLD ? rawSavings : 0;
  const compCount = hasAnalysis ? property.analysis!.compCount : 0;

  // Tax bill calculations
  const estimatedTaxBill = isTexas 
    ? Math.round(currentAssessment * 0.022)
    : Math.round(currentAssessment * 0.20); // Cook County: ~2% of market value ≈ assessed × 0.20
  const estimatedTaxBillAfter = estimatedTaxBill - estimatedSavings;
  const taxBillReductionPct = estimatedTaxBill > 0 ? Math.round((estimatedSavings / estimatedTaxBill) * 100) : 0;

  // Multi-year impact
  const multiYearMultiplier = isTexas ? 5 : 3;
  const multiYearSavings = estimatedSavings * multiYearMultiplier;
  const multiYearLabel = isTexas ? "5 years" : "3 years";

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} transition-colors duration-300 relative`}>
      <nav className={`sticky top-0 z-50 ${isDark ? "bg-[#0a0a0a]/80" : "bg-[#f7f6f3]/80"} backdrop-blur-xl border-b ${borderColor}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="7" fill="#1a6b5a"/>
              <circle cx="16" cy="15.5" r="7" stroke="white" strokeWidth="3.5" fill="none"/>
            </svg>
            <span className="text-lg font-normal text-[#1a1a1a]">overtaxed</span>
          </Link>
          <Link href="/" className="text-sm text-[#1a6b5a] hover:underline">
            ← New Search
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Property Header + Analysis + CTA — unified hero section */}
        <div className={`rounded-2xl border ${borderColor} ${bgCard} overflow-hidden ${isDark ? "" : "shadow-sm"}`}>
          {/* Property info bar */}
          <div className="p-5 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold">{property.address}</h1>
                <p className={textSecondary}>
                  {property.city}, {isTexas ? "TX" : `IL ${property.zip}`}
                </p>
                <p className={`text-sm ${textMuted} mt-1`}>
                  {isFortBend
                    ? `Account: ${property.pin} • Fort Bend County`
                    : isWilliamson
                    ? `Account: ${property.pin} • Williamson County`
                    : isDenton
                    ? `Account: ${property.pin} • Denton County`
                    : isTarrant
                    ? `Account: ${property.pin} • Tarrant County`
                    : isCollin
                    ? `Account: ${property.pin} • Collin County`
                    : isAustin
                    ? `Account: ${property.pin} • Travis County`
                    : isDallas
                    ? `Account: ${property.pin} • Dallas County`
                    : isHouston
                    ? `Account: ${property.pin} • Harris County`
                    : `PIN: ${property.pin} • ${property.township} Township`
                  }
                </p>
              </div>
              <div className="md:text-right">
                <div className={`text-sm ${textSecondary}`}>{isTexas ? "Appraised Value" : "Current Assessment"}</div>
                <div className="text-2xl sm:text-3xl font-semibold">
                  ${currentAssessment.toLocaleString()}
                </div>
                {!isTexas && (
                  <div className={`text-sm ${textMuted}`}>
                    ~${estimatedMarketValue.toLocaleString()} market value
                  </div>
                )}
              </div>
            </div>
            
            {/* Property Details — inline with header */}
            {property.characteristics && (
              <div className={`mt-4 pt-4 border-t ${borderColor} grid grid-cols-2 md:grid-cols-4 gap-3`}>
                {property.characteristics.buildingSqFt && (
                  <div>
                    <div className={`text-sm ${textMuted}`}>Sq Ft</div>
                    <div className="font-semibold">{property.characteristics.buildingSqFt.toLocaleString()}</div>
                  </div>
                )}
                {!isTarrant && !isDenton && !isWilliamson && property.characteristics.bedrooms && (
                  <div>
                    <div className={`text-sm ${textMuted}`}>Beds</div>
                    <div className="font-semibold">{property.characteristics.bedrooms}</div>
                  </div>
                )}
                {!isTarrant && !isDenton && !isWilliamson && property.characteristics.fullBaths && (
                  <div>
                    <div className={`text-sm ${textMuted}`}>Baths</div>
                    <div className="font-semibold">
                      {property.characteristics.fullBaths}
                      {property.characteristics.halfBaths ? `.${property.characteristics.halfBaths}` : ""}
                    </div>
                  </div>
                )}
                {isTarrant && property.characteristics.qualityGrade && (
                  <div>
                    <div className={`text-sm ${textMuted}`}>Quality</div>
                    <div className="font-semibold">{property.characteristics.qualityGrade}</div>
                  </div>
                )}
                {isTarrant && property.characteristics.condition && (
                  <div>
                    <div className={`text-sm ${textMuted}`}>Condition</div>
                    <div className="font-semibold">{property.characteristics.condition}</div>
                  </div>
                )}
                {property.characteristics.yearBuilt && (
                  <div>
                    <div className={`text-sm ${textMuted}`}>Built</div>
                    <div className="font-semibold">{property.characteristics.yearBuilt}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Over-assessed hero + CTA */}
          {hasAnalysis && estimatedSavings > 0 && (
            <div className={`p-5 sm:p-6 md:p-8 bg-[#f7f6f3] border-t border-black/[0.06]`}>
              <div className="inline-flex items-center gap-2 bg-[#e8f4f0] text-[#1a6b5a] font-medium px-4 py-2 rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isTexas ? "You\u2019re Over-Appraised" : "You\u2019re Over-Assessed"}
              </div>

              {/* Tax bill comparison — the hero moment */}
              <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className={`flex-1 w-full rounded-xl p-4 bg-[#f5f0e8] border border-[#e8dcc8]`}>
                  <div className={`text-xs font-medium uppercase tracking-wide text-[#8a7d6b]`}>Est. Annual Tax Bill</div>
                  <div className={`text-2xl sm:text-3xl font-bold mt-1 text-[#1a1a1a]`}>${estimatedTaxBill.toLocaleString()}</div>
                </div>
                <div className="hidden sm:flex items-center">
                  <svg className={`w-6 h-6 text-[#999]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="flex sm:hidden items-center">
                  <svg className={`w-6 h-6 text-[#999]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <div className={`flex-1 w-full rounded-xl p-4 bg-[#e8f4f0] border border-[#1a6b5a]/15`}>
                  <div className={`text-xs font-medium uppercase tracking-wide text-[#1a6b5a]`}>After {isTexas ? "Protest" : "Appeal"}</div>
                  <div className={`text-2xl sm:text-3xl font-bold mt-1 text-[#1a6b5a]`}>${estimatedTaxBillAfter.toLocaleString()}</div>
                </div>
              </div>

              {/* Savings highlight bar */}
              <div className={`mt-4 rounded-xl p-4 ${isDark ? "bg-black/20" : "bg-white/70"} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <div className={`text-xs ${textMuted}`}>Annual Savings</div>
                    <div className={`text-xl font-bold text-[#1a6b5a]`}>${estimatedSavings.toLocaleString()}/yr</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textMuted}`}>Over {multiYearLabel}</div>
                    <div className={`text-xl font-bold text-[#1a6b5a]`}>${multiYearSavings.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textMuted}`}>Tax Bill Reduction</div>
                    <div className={`text-xl font-bold text-[#1a6b5a]`}>{taxBillReductionPct}%</div>
                  </div>
                </div>
              </div>

              <p className={`mt-3 text-sm text-[#666]`}>
                Based on {compCount} comparable properties in your neighborhood.
                {isTexas 
                  ? " A successful protest this year establishes a lower baseline for future years."
                  : " Cook County reassesses every 3 years — a reduction now saves you each year until the next reassessment."
                }
              </p>

              {/* Deadline urgency banner */}
              <div className={`mt-5 rounded-xl p-3.5 flex items-center gap-3 bg-[#faf3e0] border border-[#e8d5a8]`}>
                <span className="text-lg flex-shrink-0">⏰</span>
                <div>
                  <span className={`text-sm font-medium text-[#8a7d6b]`}>
                    {isTexas 
                      ? "2026 protest season opens soon — get your analysis ready now" 
                      : "Filing deadlines vary by township — check yours before it closes"
                    }
                  </span>
                  {isTexas && (
                    <span className={`text-sm text-[#8a7d6b]/60`}>
                      {" "}• Notices arrive late March — filing early gets the best results
                    </span>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className={`mt-5 pt-5 border-t border-black/[0.06]`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className={`font-semibold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                      Start Your {isTexas ? "Protest" : "Appeal"} — $49
                    </div>
                    <div className={`text-sm mt-2 space-y-1 text-[#666]`}>
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0">✓</span>
                        <span>Custom {isTexas ? "hearing script" : "evidence brief"} written for <strong>{property.address}</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0">✓</span>
                        <span>{compCount} comparable properties with detailed analysis</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0">✓</span>
                        <span>Step-by-step {isFortBend ? "FBCAD Online Protest" : isWilliamson ? "WCAD Online Protest" : isDenton ? "DCAD E-File" : isTarrant ? "TAD Online Protest" : isCollin ? "CCAD Online Portal" : isAustin ? "TCAD Portal" : isDallas ? "DCAD uFile" : isHouston ? "HCAD iFile" : "filing"} instructions</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      if (checkoutLoading) return;
                      setCheckoutLoading(true);
                      try {
                        const res = await fetch("/api/create-checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            propertyId: property.pin,
                            jurisdiction: jurisdictionValue,
                          }),
                        });
                        const data = await res.json();
                        if (data.url) {
                          window.location.href = data.url;
                        } else {
                          alert("Failed to start checkout. Please try again.");
                          setCheckoutLoading(false);
                        }
                      } catch {
                        alert("Failed to start checkout. Please try again.");
                        setCheckoutLoading(false);
                      }
                    }}
                    disabled={checkoutLoading}
                    className={`w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all bg-[#1a6b5a] text-white whitespace-nowrap flex-shrink-0 ${checkoutLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#155a4c] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'}`}
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `File My ${isTexas ? "Protest" : "Appeal"} — $49`
                    )}
                  </button>
                </div>
                <p className={`mt-3 text-xs text-[#999]`}>
                  🔒 One-time filing fee • Delivered instantly to your email
                  {estimatedSavings >= 49 && (
                    <span> • Pays for itself in {estimatedSavings >= 588 ? "1 month" : estimatedSavings >= 98 ? `${Math.ceil(49 / (estimatedSavings / 12))} months` : "under a year"}</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Fairly assessed */}
          {hasAnalysis && estimatedSavings === 0 && (
            <div className="p-5 sm:p-6 md:p-8 border-t border-black/[0.06]">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#1a6b5a] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#f5f0e8] text-[#8a7d6b] font-medium px-4 py-2 rounded-full text-sm mb-3">
                  🎉 {isTexas ? "Fairly Appraised" : "Fairly Assessed"}
                </div>
                <div className="text-lg font-medium text-[#1a1a1a]">
                  Good news — your {isTexas ? "appraised value" : "assessment"} is in line with similar homes
                </div>
                <p className="mt-2 text-[#666]">
                  Based on comparable properties, no appeal needed!
                </p>
                {isTexas && (
                  <p className="mt-3 text-sm text-[#999]">
                    Texas reassesses annually — check back after you receive your 2026 appraisal notice (typically March/April).
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Analysis Not Available Yet */}
          {!analysisAvailable && (
            <div className={`p-5 sm:p-6 md:p-8 border-t border-[#1a6b5a]/15 bg-[#e8f4f0]`}>
              <div className="text-center">
                <div className="text-4xl mb-3">⏳</div>
                <div className={`font-medium text-lg text-[#1a6b5a]`}>
                  {uploadInProgress 
                    ? "We're still processing property data"
                    : "Analysis not available for this property"
                  }
                </div>
                <p className={`mt-2 text-[#1a6b5a]/70`}>
                  {uploadInProgress
                    ? "We're crunching numbers for all properties in your area. Your property should be ready within a few hours."
                    : "This property type may not be supported, or we don't have enough comparable data."
                  }
                </p>
                {uploadInProgress && (
                  <>
                    <div className="mt-4 flex gap-2 max-w-sm mx-auto">
                      <input 
                        type="email" 
                        placeholder="your@email.com"
                        className={`flex-1 h-11 px-4 rounded-lg text-sm bg-white border-[#1a6b5a]/20 text-black placeholder-gray-400 border focus:outline-none focus:ring-2 focus:ring-[#1a6b5a]/50`}
                      />
                      <button className="px-4 h-11 rounded-lg font-medium text-sm bg-[#1a6b5a] text-white hover:bg-[#155a4c] transition-colors">
                        Notify Me
                      </button>
                    </div>
                    <p className={`mt-3 text-xs text-[#1a6b5a]/50`}>
                      We&apos;ll email you when your analysis is ready.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assessment History */}
        {property.assessmentHistory && property.assessmentHistory.length > 0 && (
          <div className="mt-3 rounded-2xl bg-white border border-black/[0.06] overflow-hidden">
            <div className="p-5 sm:p-6 md:p-8 pb-0 sm:pb-0 md:pb-0">
              <div className="text-[13px] tracking-[0.15em] text-[#999] uppercase font-medium mb-4">ASSESSMENT HISTORY</div>
            </div>
            <div className="overflow-x-auto px-5 sm:px-6 md:px-8 pb-5 sm:pb-6 md:pb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06]">
                    <th className="text-left py-2 text-[13px] tracking-[0.15em] uppercase text-[#999] font-medium">Year</th>
                    <th className="text-right py-2 text-[13px] tracking-[0.15em] uppercase text-[#999] font-medium">Initial</th>
                    <th className="text-right py-2 text-[13px] tracking-[0.15em] uppercase text-[#999] font-medium">Final</th>
                    <th className="text-right py-2 text-[13px] tracking-[0.15em] uppercase text-[#999] font-medium">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {property.assessmentHistory.map((year) => {
                    const finalValue = year.boardTotal || year.certifiedTotal || year.mailedTotal;
                    const savedAmount = year.mailedTotal - finalValue;
                    const savedPercent = savedAmount > 0 ? Math.round((savedAmount / year.mailedTotal) * 100) : 0;
                    
                    return (
                      <tr key={year.year} className="border-b border-black/[0.04] last:border-b-0">
                        <td className="py-3 font-medium text-[#1a1a1a]">{year.year}</td>
                        <td className="py-3 text-right text-[#1a1a1a] text-sm">
                          ${year.mailedTotal.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-[#1a1a1a] text-sm">
                          ${finalValue.toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          {savedAmount > 0 ? (
                            <span className="font-medium text-[#1a6b5a]">
                              -${savedAmount.toLocaleString()}
                              <span className="text-xs ml-1 opacity-70">
                                (-{savedPercent}%)
                              </span>
                            </span>
                          ) : (
                            <span className="text-[#999]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Neighborhood Stats (Houston) */}
        {isTexas && property.neighborhoodStats && (
          <div className="mt-3 rounded-2xl bg-white border border-black/[0.06] p-5 sm:p-6 md:p-8">
            <div className="text-[13px] tracking-[0.15em] text-[#999] uppercase font-medium mb-4">YOUR NEIGHBORHOOD</div>
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              <div>
                <div className="text-xl sm:text-2xl font-semibold text-[#1a1a1a]">
                  {property.neighborhoodStats.totalProperties.toLocaleString()}
                </div>
                <div className="text-sm text-[#666]">Properties</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-semibold text-[#1a6b5a]">
                  {property.neighborhoodStats.overAssessedPct}%
                </div>
                <div className="text-sm text-[#666]">Over-Appraised</div>
              </div>
              {property.neighborhoodStats.avgReduction > 0 && (
                <div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#1a6b5a]">
                    ${property.neighborhoodStats.avgReduction.toLocaleString()}
                  </div>
                  <div className="text-sm text-[#666]">Avg. Reduction</div>
                </div>
              )}
            </div>
            <p className="mt-3 text-sm text-[#999]">
              Based on {property.neighborhoodStats.overAssessedCount.toLocaleString()} over-appraised properties in your neighborhood. Median appraisal: ${property.neighborhoodStats.medianPerSqft}/sqft.
            </p>
          </div>
        )}

        {/* How It Works */}
        {hasAnalysis && estimatedSavings > 0 && (
          <div className={`mt-3 rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 md:p-8`}>
            <div className="text-[13px] tracking-[0.15em] text-[#999] uppercase font-medium mb-5">HOW IT WORKS</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              <div className="flex sm:flex-col items-start gap-4 sm:gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-semibold bg-[#1a6b5a] text-white`}>
                  1
                </div>
                <div>
                  <div className="font-semibold">We Build Your Case</div>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    We analyze your property, find the best comparable properties, and calculate exactly how much you&apos;re overpaying.
                  </p>
                </div>
              </div>
              <div className="flex sm:flex-col items-start gap-4 sm:gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-semibold bg-[#1a6b5a] text-white`}>
                  2
                </div>
                <div>
                  <div className="font-semibold">You Get Your Package</div>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    Delivered instantly to your email: a {isTexas ? "hearing script" : "written brief"}, comparable properties evidence, and a step-by-step filing guide.
                  </p>
                </div>
              </div>
              <div className="flex sm:flex-col items-start gap-4 sm:gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-semibold bg-[#1a6b5a] text-white`}>
                  3
                </div>
                <div>
                  <div className="font-semibold">File &amp; Save</div>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    Follow our guide to file {isFortBend ? "your protest with FBCAD" : isWilliamson ? "your protest with WCAD" : isDenton ? "your protest with DCAD" : isTarrant ? "your protest with TAD" : isCollin ? "your protest with CCAD" : isAustin ? "your protest with TCAD" : isDallas ? "your protest with DCAD" : isHouston ? "your protest with HCAD" : "with the Assessor or Board of Review"}. Most homeowners complete it in under 30 minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Chart */}
        {hasAnalysis && estimatedSavings > 0 && (
          <div className={`mt-3 rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 md:p-8`}>
            <div className="text-[13px] tracking-[0.15em] text-[#999] uppercase font-medium mb-5">YOUR OPTIONS</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* DIY */}
              <div className={`rounded-xl p-4 border ${borderColor} ${isDark ? "" : ""}`}>
                <div className={`text-sm font-medium ${textMuted} uppercase tracking-wide`}>Do It Yourself</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>Free</div>
                <div className={`text-sm ${textSecondary} mt-3 space-y-2`}>
                  <div className="flex items-start gap-2">
                    <span className={textMuted}>•</span>
                    <span>Research comparable properties yourself</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={textMuted}>•</span>
                    <span>Write your own evidence brief</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={textMuted}>•</span>
                    <span>Figure out the filing process</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={textMuted}>•</span>
                    <span className="font-medium text-[#b45309]">10+ hours of work</span>
                  </div>
                </div>
              </div>

              {/* Overtaxed — highlighted */}
              <div className={`rounded-xl p-4 border-2 border-[#1a6b5a] bg-[#e8f4f0]/30 relative`}>
                <div className={`absolute -top-3 left-4 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1a6b5a] text-white`}>
                  Best Value
                </div>
                <div className={`text-sm font-medium uppercase tracking-wide text-[#1a6b5a]`}>Overtaxed</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>$49</div>
                <div className={`text-sm ${textSecondary} mt-3 space-y-2`}>
                  <div className="flex items-start gap-2">
                    <span className={`text-[#1a6b5a]`}>✓</span>
                    <span>{compCount} comparable properties found for you</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={`text-[#1a6b5a]`}>✓</span>
                    <span>Professional {isTexas ? "hearing script" : "evidence brief"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={`text-[#1a6b5a]`}>✓</span>
                    <span>Step-by-step filing guide</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={`text-[#1a6b5a]`}>✓</span>
                    <span className={`font-medium text-[#1a6b5a]`}>Ready in 5 minutes</span>
                  </div>
                </div>
              </div>

              {/* Tax Attorney */}
              <div className={`rounded-xl p-4 border ${borderColor}`}>
                <div className={`text-sm font-medium ${textMuted} uppercase tracking-wide`}>Tax Attorney</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>$300–$500+</div>
                <div className={`text-sm ${textSecondary} mt-3 space-y-2`}>
                  <div className="flex items-start gap-2">
                    <span className={textMuted}>•</span>
                    <span>Full representation at hearings</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={textMuted}>•</span>
                    <span>Attorney handles everything</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={textMuted}>•</span>
                    <span>Often contingency-based</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className={textMuted}>•</span>
                    <span className="text-[#b45309]">Same data, higher cost</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {hasAnalysis && estimatedSavings > 0 && (
          <div className={`mt-3 rounded-2xl border border-black/[0.06] bg-white p-5 sm:p-6 md:p-8`}>
            <div className="text-[13px] tracking-[0.15em] text-[#999] uppercase font-medium mb-5">COMMON QUESTIONS</div>
            <div className="space-y-4">
              <div>
                <div className="font-medium">Is this legitimate?</div>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  {isTexas 
                    ? "Absolutely. Protesting your property tax appraisal is a formal right under Texas law. Hundreds of thousands of Texas homeowners protest every year — it's one of the most common things homeowners do."
                    : "Yes. Appealing your property tax assessment is a formal right in Illinois. The Cook County Assessor's Office and Board of Review process hundreds of thousands of appeals every year."
                  }
                </p>
              </div>
              <div className={`border-t ${borderColor}`}></div>
              <div>
                <div className="font-medium">Can I do this myself for free?</div>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  Yes, but it typically takes 10+ hours of research — finding comparable properties, calculating assessment ratios, understanding the filing process, and preparing evidence. We do all that for you in minutes.
                </p>
              </div>
              <div className={`border-t ${borderColor}`}></div>
              <div>
                <div className="font-medium">What if my {isTexas ? "protest" : "appeal"} isn&apos;t successful?</div>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  {isTexas 
                    ? "There's no penalty for protesting. If the appraisal review board doesn't lower your value, your taxes stay the same — you don't lose anything. Most homeowners who protest with evidence get some reduction."
                    : "There's no penalty for appealing. If the Board of Review doesn't reduce your assessment, it stays the same — you never pay more for trying. Most appeals with proper comparable evidence receive some reduction."
                  }
                </p>
              </div>
              <div className={`border-t ${borderColor}`}></div>
              <div>
                <div className="font-medium">When is the deadline?</div>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  {isTexas 
                    ? "Texas protest season typically opens in late March when appraisal notices are mailed. The deadline is usually May 15 (or 30 days after your notice date, whichever is later). Filing early gives you the best shot at an informal settlement."
                    : "Deadlines vary by township and filing body. The Assessor accepts appeals during your township's reassessment year. Board of Review appeals typically open after the Assessor's decisions are final. Check your township's current status."
                  }
                </p>
              </div>
              <div className={`border-t ${borderColor}`}></div>
              <div>
                <div className="font-medium">What&apos;s included in the $49 filing package?</div>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  A complete, ready-to-file package: {compCount} comparable properties with detailed analysis (addresses, values, $/sqft), a professional {isTexas ? "hearing script you can read word-for-word at your hearing" : "evidence brief for the Board of Review"}, and step-by-step instructions with screenshots showing exactly where to click. Everything is delivered instantly to your email as a downloadable PDF.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Final CTA */}
        {hasAnalysis && estimatedSavings > 0 && (
          <div className="mt-3 rounded-2xl bg-[#e8f4f0] p-8 md:p-12">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-normal text-[#1a1a1a]">
                You could be saving ${estimatedSavings.toLocaleString()}/year
              </div>
              <p className="text-sm text-[#666] mt-2">
                That&apos;s ${multiYearSavings.toLocaleString()} over {multiYearLabel}. Your filing package is ready — don&apos;t miss your window.
              </p>
              <button 
                onClick={async () => {
                  if (checkoutLoading) return;
                  setCheckoutLoading(true);
                  try {
                    const res = await fetch("/api/create-checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        propertyId: property.pin,
                        jurisdiction: jurisdictionValue,
                      }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    } else {
                      alert("Failed to start checkout. Please try again.");
                      setCheckoutLoading(false);
                    }
                  } catch {
                    alert("Failed to start checkout. Please try again.");
                    setCheckoutLoading(false);
                  }
                }}
                disabled={checkoutLoading}
                className={`mt-4 px-8 py-4 rounded-xl font-semibold text-lg transition-all bg-[#1a6b5a] text-white ${checkoutLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#155a4c] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'}`}
              >
                {checkoutLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `File My ${isTexas ? "Protest" : "Appeal"} — $49`
                )}
              </button>
              <p className="mt-3 text-xs text-[#666]">
                🔒 Secure payment • Instant delivery • One-time filing fee
              </p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-4 text-xs text-[#999] text-center">
          {isFortBend
            ? "Appraisal data from Fort Bend Central Appraisal District (FBCAD). Tax bill estimates use an average Fort Bend County rate of ~2.2% and may vary by taxing jurisdiction."
            : isWilliamson
            ? "Appraisal data from Williamson Central Appraisal District (WCAD). Tax bill estimates use an average Williamson County rate of ~2.1% and may vary by taxing jurisdiction."
            : isDenton
            ? "Appraisal data from Denton Central Appraisal District (DCAD). Tax bill estimates use an average Denton County rate of ~2.2% and may vary by taxing jurisdiction."
            : isTarrant
            ? "Appraisal data from Tarrant Appraisal District (TAD). Tax bill estimates use an average Tarrant County rate of ~2.2% and may vary by taxing jurisdiction."
            : isCollin
            ? "Appraisal data from Collin Central Appraisal District (CCAD). Tax bill estimates use an average Collin County rate of ~2.2% and may vary by taxing jurisdiction."
            : isAustin
            ? "Appraisal data from Travis Central Appraisal District (TCAD). Tax bill estimates use an average Travis County rate of ~2.2% and may vary by taxing jurisdiction."
            : isDallas
            ? "Appraisal data from Dallas Central Appraisal District (DCAD). Tax bill estimates use an average Dallas County rate of ~2.2% and may vary by taxing jurisdiction."
            : isHouston
            ? "Appraisal data from Harris County Appraisal District (HCAD). Tax bill estimates use an average Harris County rate of ~2.2% and may vary by taxing jurisdiction."
            : "Assessment data from Cook County Assessor\u2019s Office. Tax bill estimates are approximate and vary by municipality and taxing district."
          } Savings estimates based on comparable properties. Past results do not guarantee future outcomes.
          {!isTexas && " Cook County reassesses every 3 years; multi-year savings assume the reduction holds through the current cycle."}
          {isTexas && " Multi-year projections assume similar assessment levels; Texas reassesses annually."}
        </p>
      </div>
    </div>
  );
}
