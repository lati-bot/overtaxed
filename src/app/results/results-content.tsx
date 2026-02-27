"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getReassessmentStatus } from "@/lib/cook-township-reassessment";

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

interface CompProperty {
  acct: string;
  address: string;
  sqft: number;
  assessedVal: number;
  perSqft: number;
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
  const [comps, setComps] = useState<CompProperty[]>([]);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const address = searchParams.get("address");
  const pin = searchParams.get("pin");
  const acct = searchParams.get("acct");
  const jurisdiction = searchParams.get("jurisdiction");
  const isHouston = jurisdiction === "houston" || (!!acct && jurisdiction !== "dallas" && jurisdiction !== "austin" && jurisdiction !== "collin" && jurisdiction !== "tarrant" && jurisdiction !== "denton" && jurisdiction !== "williamson" && jurisdiction !== "fortbend" && jurisdiction !== "rockwall" && jurisdiction !== "bexar");
  const isDallas = jurisdiction === "dallas";
  const isAustin = jurisdiction === "austin";
  const isCollin = jurisdiction === "collin";
  const isTarrant = jurisdiction === "tarrant";
  const isDenton = jurisdiction === "denton";
  const isWilliamson = jurisdiction === "williamson";
  const isFortBend = jurisdiction === "fortbend";
  const isBexar = jurisdiction === "bexar";
  const isRockwall = jurisdiction === "rockwall";
  const isTexas = isHouston || isDallas || isAustin || isCollin || isTarrant || isDenton || isWilliamson || isFortBend || isRockwall || isBexar;
  const cadName = isBexar ? "BCAD" : isRockwall ? "Rockwall CAD" : isFortBend ? "FBCAD" : isWilliamson ? "WCAD" : isDenton ? "Denton CAD" : isTarrant ? "TAD" : isCollin ? "CCAD" : isAustin ? "TCAD" : isDallas ? "DCAD" : isHouston ? "HCAD" : "Cook County Assessor";
  const countyName = isBexar ? "Bexar County" : isRockwall ? "Rockwall County" : isFortBend ? "Fort Bend County" : isWilliamson ? "Williamson County" : isDenton ? "Denton County" : isTarrant ? "Tarrant County" : isCollin ? "Collin County" : isAustin ? "Travis County" : isDallas ? "Dallas County" : isHouston ? "Harris County" : "Cook County";
  const avgTaxRate = isBexar ? "2.1" : isWilliamson ? "2.1" : "2.2";
  const jurisdictionValue = isBexar ? "bexar" : isRockwall ? "rockwall" : isFortBend ? "fortbend" : isWilliamson ? "williamson" : isDenton ? "denton" : isTarrant ? "tarrant" : isCollin ? "collin" : isAustin ? "austin" : isDallas ? "dallas" : isTexas ? "houston" : "cook";

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = false;

  const handleWaitlistSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (waitlistSubmitting || waitlistSubmitted || !waitlistEmail) return;
    setWaitlistSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: waitlistEmail,
          pin: property?.pin || pin || acct || "",
          jurisdiction: jurisdictionValue,
        }),
      });
      if (res.ok) {
        setWaitlistSubmitted(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setWaitlistSubmitting(false);
    }
  };

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
        setComps(cp.comps || []);
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
        setComps(dp.comps || []);
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
        setComps(wp.comps || []);
      } else if (isRockwall) {
        // Rockwall County flow — use Rockwall lookup API
        const rockwallAcct = searchPin || acct;
        if (!rockwallAcct) {
          setError("Missing account number");
          return;
        }
        const response = await fetch(`/api/rockwall/lookup?acct=${rockwallAcct}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Property not found");
          return;
        }
        
        const rp = data.property;
        setProperty({
          pin: rp.acct,
          address: rp.address,
          city: rp.city || "ROCKWALL",
          zip: rp.zipcode || "",
          township: "",
          neighborhood: rp.neighborhoodCode || "",
          characteristics: {
            class: "",
            buildingSqFt: rp.sqft && rp.sqft > 0 ? rp.sqft : null,
            landSqFt: null,
            yearBuilt: rp.yearBuilt && rp.yearBuilt > 0 ? rp.yearBuilt : null,
            bedrooms: rp.beds && rp.beds > 0 ? rp.beds : null,
            fullBaths: rp.fullBaths && rp.fullBaths > 0 ? rp.fullBaths : null,
            halfBaths: rp.halfBaths && rp.halfBaths > 0 ? rp.halfBaths : null,
          },
          assessment: {
            year: "2025",
            mailedTotal: rp.currentAssessment,
            mailedBuilding: rp.improvementVal || 0,
            mailedLand: rp.landVal || 0,
            certifiedTotal: null,
            boardTotal: null,
          },
          analysis: {
            fairAssessment: rp.status === "over" ? rp.fairAssessment : rp.currentAssessment,
            potentialSavings: rp.status === "over" ? rp.estimatedSavings : 0,
            compCount: (rp.comps || []).length,
          },
          neighborhoodStats: rp.neighborhoodStats || null,
        });
        setAnalysisAvailable(true);
        setComps(rp.comps || []);
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
        setComps(fp.comps || []);
      } else if (isBexar) {
        // Bexar County flow — use Bexar lookup API
        const bexarAcct = searchPin || acct;
        if (!bexarAcct) {
          setError("Missing account number");
          return;
        }
        const response = await fetch(`/api/bexar/lookup?acct=${bexarAcct}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || "Property not found");
          return;
        }
        
        const bp = data.property;
        setProperty({
          pin: bp.acct,
          address: bp.address,
          city: bp.city || "SAN ANTONIO",
          zip: bp.zipcode || "",
          township: "",
          neighborhood: bp.neighborhoodCode || "",
          characteristics: {
            class: "",
            buildingSqFt: bp.sqft,
            landSqFt: null,
            yearBuilt: bp.yearBuilt && bp.yearBuilt > 0 ? bp.yearBuilt : null,
            bedrooms: null,
            fullBaths: null,
            halfBaths: null,
          },
          assessment: {
            year: "2025",
            mailedTotal: bp.currentAssessment,
            mailedBuilding: bp.improvementVal || 0,
            mailedLand: bp.landVal || 0,
            certifiedTotal: null,
            boardTotal: null,
          },
          analysis: {
            fairAssessment: bp.status === "over" ? bp.fairAssessment : bp.currentAssessment,
            potentialSavings: bp.status === "over" ? bp.estimatedSavings : 0,
            compCount: (bp.comps || []).length,
          },
          neighborhoodStats: bp.neighborhoodStats || null,
        });
        setAnalysisAvailable(true);
        setComps(bp.comps || []);
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
        setComps(tp.comps || []);
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
        setComps(ap.comps || []);
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
        setComps(dp.comps || []);
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
        setComps(hp.comps || []);
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

          // Fetch comps for Cook County if analysis is available
          if (data.analysisAvailable && data.property?.pin) {
            try {
              const compsRes = await fetch(`/api/comps?pin=${data.property.pin}&details=true`);
              const compsData = await compsRes.json();
              if (compsData.found && compsData.comps && compsData.comps.length > 0) {
                setComps(compsData.comps.map((c: { pin: string; address?: string; sqft: number; current_assessment?: number; perSqft?: number }) => ({
                  acct: c.pin,
                  address: c.address && c.address !== "N/A" ? c.address : `PIN ${c.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5")}`,
                  sqft: c.sqft || 0,
                  assessedVal: c.current_assessment || 0,
                  perSqft: c.perSqft || (c.sqft && c.current_assessment ? c.current_assessment / c.sqft : 0),
                })));
              }
            } catch {
              // Non-critical — comps are optional preview
            }
          }
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

  // Error / not-found page
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
        
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
            {/* Header stripe */}
            <div className="bg-gradient-to-r from-[#f59e0b]/10 to-[#f59e0b]/5 px-8 py-6 border-b border-[#f59e0b]/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#f59e0b]/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#b45309]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-[#1a1a1a]">
                    Property not found
                  </h1>
                  <p className="text-sm text-[#666] mt-0.5">
                    We searched but couldn&apos;t match that address
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <p className="text-[13px] tracking-[0.1em] uppercase text-[#999] font-medium mb-4">Common reasons</p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#e8f4f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#1a6b5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">Outside our coverage area</p>
                    <p className="text-sm text-[#666] mt-0.5">We cover 10 TX counties (Harris, Dallas, Travis, Collin, Tarrant, Denton, Williamson, Fort Bend, Bexar, Rockwall) + Cook County IL.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#e8f4f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#1a6b5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">Typo in the address</p>
                    <p className="text-sm text-[#666] mt-0.5">Try using the autocomplete suggestions as you type — it pulls directly from county records.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#e8f4f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#1a6b5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">Condo, commercial, or new build</p>
                    <p className="text-sm text-[#666] mt-0.5">We specialize in single-family homes and 2-4 unit properties.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-black/[0.06]">
                <Link 
                  href="/" 
                  className="block w-full text-center px-6 py-3.5 rounded-xl font-medium transition-colors bg-[#1a6b5a] hover:bg-[#155a4c] text-white"
                >
                  Try Another Address
                </Link>
                
                <p className="mt-4 text-center text-sm text-[#999]">
                  Still stuck? Email us at{" "}
                  <a href="mailto:hello@getovertaxed.com" className="text-[#1a6b5a] hover:underline">
                    hello@getovertaxed.com
                  </a>
                </p>
              </div>
            </div>
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
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a]">We found a few matches</h1>
            <p className="mt-2 text-[#666]">Which one is yours?</p>
          </div>
          <div className="space-y-3">
            {multipleResults.map((result) => (
              <button
                key={result.pin}
                onClick={() => handleSelectProperty(result.pin)}
                className="w-full text-left p-4 rounded-2xl border border-black/[0.06] bg-white hover:border-[#1a6b5a]/50 transition-all"
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

  // Per-sqft calculations for neighbor comparison
  const buildingSqFt = property.characteristics?.buildingSqFt || 0;
  const yourPerSqft = buildingSqFt > 0 ? Math.round(currentAssessment / buildingSqFt) : 0;
  const neighborPerSqft = Math.round(property.neighborhoodStats?.medianPerSqft || (buildingSqFt > 0 && fairAssessment > 0 ? fairAssessment / buildingSqFt : 0));
  const maxPerSqft = Math.max(yourPerSqft, neighborPerSqft, 1);
  const assessmentGap = reduction; // currentAssessment - fairAssessment
  const overAssessedCount = property.neighborhoodStats?.overAssessedCount || 0;

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
                  {isBexar
                    ? `Account: ${property.pin} • Bexar County`
                    : isRockwall
                    ? `Account: ${property.pin} • Rockwall County`
                    : isFortBend
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
                <div className={`text-xs ${textMuted} mt-1`}>
                  Based on 2025 certified appraisal data from {cadName}
                </div>
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
                {!isTarrant && !isDenton && !isWilliamson && !isRockwall && property.characteristics.bedrooms && (
                  <div>
                    <div className={`text-sm ${textMuted}`}>Beds</div>
                    <div className="font-semibold">{property.characteristics.bedrooms}</div>
                  </div>
                )}
                {!isTarrant && !isDenton && !isWilliamson && !isRockwall && property.characteristics.fullBaths && (
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

          {/* Over-assessed hero — unfairness/loss framing */}
          {hasAnalysis && estimatedSavings > 0 && (
            <div className={`p-5 sm:p-6 md:p-8 bg-[#f7f6f3] border-t border-black/[0.06]`}>
              {/* 1. HERO — The Error Frame */}
              <div className="inline-flex items-center gap-2 bg-[#fef3c7] text-[#b45309] font-medium px-4 py-2 rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                {isTexas ? "Over-Appraised" : "Over-Assessed"}
              </div>

              <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                Your home is {isTexas ? "over-appraised" : "over-assessed"} by{" "}
                <span className="text-[#b45309]">${assessmentGap.toLocaleString()}</span>
              </h2>

              {yourPerSqft > 0 && neighborPerSqft > 0 && (
                <p className="mt-2 text-base sm:text-lg text-[#666]">
                  {cadName} values your home at <strong>${yourPerSqft}/sqft</strong>.{" "}
                  {isTexas && overAssessedCount > compCount
                    ? <>Best {compCount} of {overAssessedCount} comparable properties average <strong>${neighborPerSqft}/sqft</strong>.</>
                    : <>{compCount} comparable homes average <strong>${neighborPerSqft}/sqft</strong>.</>
                  }
                </p>
              )}

              {/* 2. THE MONEY — Cumulative */}
              <div className="mt-6 rounded-xl bg-white border border-black/[0.06] p-5">
                <div className="text-sm text-[#666] font-medium">You&apos;re overpaying</div>
                <div className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mt-1">
                  ~${estimatedSavings.toLocaleString()}<span className="text-lg sm:text-xl font-semibold text-[#666]">/year</span>
                </div>
                <div className="mt-2 text-base sm:text-lg text-[#b45309] font-semibold">
                  That&apos;s ${multiYearSavings.toLocaleString()} over {multiYearLabel} if you don&apos;t {isTexas ? "protest" : "appeal"}
                </div>
                <div className="mt-3 flex items-center gap-4 flex-wrap text-sm text-[#666]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1a6b5a]"></span>
                    Est. tax bill: ${estimatedTaxBill.toLocaleString()}/yr
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#e8f4f0] border border-[#1a6b5a]"></span>
                    After {isTexas ? "protest" : "appeal"}: ${estimatedTaxBillAfter.toLocaleString()}/yr
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-[#1a6b5a]">↓ {taxBillReductionPct}% reduction</span>
                  </div>
                </div>
              </div>

              {/* 3. NEIGHBOR COMPARISON — the dagger */}
              {yourPerSqft > 0 && neighborPerSqft > 0 && (
                <div className="mt-4 rounded-xl bg-white border border-black/[0.06] p-5">
                  <div className="text-[13px] tracking-[0.15em] text-[#999] uppercase font-medium mb-4">YOUR HOME VS. YOUR NEIGHBORS</div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Your home bar */}
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-sm font-medium text-[#1a1a1a]">Your home</span>
                        <span className="text-lg font-bold text-[#b45309]">${yourPerSqft}/sqft</span>
                      </div>
                      <div className="w-full bg-[#f7f6f3] rounded-full h-4 overflow-hidden">
                        <div 
                          className="h-full bg-[#b45309] rounded-full transition-all duration-700"
                          style={{ width: `${Math.round((yourPerSqft / maxPerSqft) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Neighbors bar */}
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-sm font-medium text-[#1a1a1a]">Your neighbors</span>
                        <span className="text-lg font-bold text-[#1a6b5a]">${neighborPerSqft}/sqft</span>
                      </div>
                      <div className="w-full bg-[#f7f6f3] rounded-full h-4 overflow-hidden">
                        <div 
                          className="h-full bg-[#1a6b5a] rounded-full transition-all duration-700"
                          style={{ width: `${Math.round((neighborPerSqft / maxPerSqft) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  {overAssessedCount > 0 && (
                    <p className="mt-3 text-sm text-[#b45309] font-medium">
                      {overAssessedCount} comparable homes in your neighborhood are assessed lower than yours.
                    </p>
                  )}
                  {overAssessedCount === 0 && compCount > 0 && (
                    <p className="mt-3 text-sm text-[#b45309] font-medium">
                      {compCount} comparable homes in your area are assessed lower than yours.
                    </p>
                  )}
                </div>
              )}

              <p className={`mt-4 text-sm text-[#666]`}>
                Based on {compCount} comparable properties.
                {isTexas 
                  ? " A successful protest this year establishes a lower baseline for future years."
                  : " Cook County reassesses every 3 years — a reduction now saves you each year until the next reassessment."
                }
              </p>

              {/* Deadline urgency banner */}
              <div className={`mt-5 rounded-xl p-3.5 flex items-start gap-3 bg-[#faf3e0] border border-[#e8d5a8]`}>
                <span className="text-lg flex-shrink-0">⏰</span>
                <div className="text-sm font-medium text-[#8a7d6b]">
                  {isHouston 
                    ? "HCAD is mailing 2026 notices now. Protest deadline: May 15, 2026 (or 30 days after your notice)."
                    : isTexas
                    ? "Appraisal notices typically mail mid-April. Protest deadline: May 15, 2026 (or 30 days after your notice)."
                    : (() => {
                        const reassessment = property.township ? getReassessmentStatus(property.township) : null;
                        const twp = property.township || "Your";
                        if (reassessment?.isReassessmentYear) {
                          return (
                            <>
                              <span>{twp} Township is being reassessed this year — this is your best window to appeal. Check the <a href="https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines" target="_blank" rel="noopener noreferrer" className="underline text-[#1a6b5a]">Assessor&apos;s filing calendar</a> for your exact deadline.</span>
                              <span className="block mt-1.5">After the Assessor&apos;s review, you can appeal again at the <a href="https://www.cookcountyboardofreview.com/dates-and-deadlines" target="_blank" rel="noopener noreferrer" className="underline text-[#1a6b5a]">Board of Review</a> — two chances to win.</span>
                            </>
                          );
                        }
                        return (
                          <>
                            <span>{twp} Township&apos;s filing window opens on a rolling schedule — get your appeal packet ready now so you&apos;re prepared the day it opens. Check the <a href="https://www.cookcountyassessoril.gov/assessment-calendar-and-deadlines" target="_blank" rel="noopener noreferrer" className="underline text-[#1a6b5a]">Assessor&apos;s filing calendar</a> for dates.</span>
                            <span className="block mt-1.5">After the Assessor&apos;s review, you can appeal again at the <a href="https://www.cookcountyboardofreview.com/dates-and-deadlines" target="_blank" rel="noopener noreferrer" className="underline text-[#1a6b5a]">Board of Review</a> — two chances to win.</span>
                          </>
                        );
                      })()
                  }
                </div>
              </div>

              {/* Social proof */}
              <p className="mt-4 text-center text-xs text-[#999]">
                Exposed over $355M in potential savings across 4.5M+ properties analyzed
              </p>

              {/* 4. CTA */}
              <div className={`mt-5 pt-5 border-t border-black/[0.06]`}>
                {isTexas ? (
                  <div id="waitlist-form">
                    <p className="text-sm text-[#666] mb-3">
                      Texas 2026 appraisal notices arrive March–April. We&apos;ll email you when your updated appeal package is ready — just $49.
                    </p>
                    {waitlistSubmitted ? (
                      <div className="bg-[#e8f4f0] rounded-xl p-4 text-center">
                        <span className="text-[#1a6b5a] font-medium">✓ You&apos;re on the list!</span>
                        <p className="text-sm text-[#666] mt-1">We&apos;ll notify you as soon as {countyName} 2026 data is live.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          required
                          className="flex-1 px-4 py-3 rounded-xl border border-black/10 text-base focus:outline-none focus:ring-2 focus:ring-[#1a6b5a]/30 focus:border-[#1a6b5a]"
                        />
                        <button
                          type="submit"
                          disabled={waitlistSubmitting}
                          className={`px-6 py-3 rounded-xl font-semibold text-base transition-all bg-[#1a6b5a] text-white whitespace-nowrap ${waitlistSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#155a4c] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'}`}
                        >
                          {waitlistSubmitting ? "Submitting..." : "Notify Me When 2026 Data Is Ready"}
                        </button>
                      </form>
                    )}
                    <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                      <div className="inline-flex items-center gap-1.5 bg-[#faf3e0] border border-[#e8d5a8] text-[#8a7d6b] px-3 py-1.5 rounded-full text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        100% Money-Back Guarantee
                      </div>
                    </div>
                  </div>
                ) : (
                <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className={`font-semibold text-lg text-gray-900`}>
                      Get everything you need to fix this — $49
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
                        <span>Step-by-step {isBexar ? "BCAD Online Protest" : isRockwall ? "RCAD Online Protest" : isFortBend ? "FBCAD Online Protest" : isWilliamson ? "WCAD Online Protest" : isDenton ? "DCAD E-File" : isTarrant ? "TAD Online Protest" : isCollin ? "CCAD Online Portal" : isAustin ? "TCAD Portal" : isDallas ? "DCAD uFile" : isHouston ? "HCAD iFile" : "filing"} instructions</span>
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
                      `Fix This Now — $49`
                    )}
                  </button>
                </div>
                <p className={`mt-3 text-xs text-[#999]`}>
                  🔒 One-time filing fee • Delivered instantly to your email
                  {estimatedSavings >= 49 && (
                    <span> • Pays for itself in {estimatedSavings >= 588 ? "1 month" : estimatedSavings >= 98 ? `${Math.ceil(49 / (estimatedSavings / 12))} months` : "under a year"}</span>
                  )}
                </p>
                <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                  <div className="inline-flex items-center gap-1.5 bg-[#faf3e0] border border-[#e8d5a8] text-[#8a7d6b] px-3 py-1.5 rounded-full text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    100% Money-Back Guarantee
                  </div>
                </div>
                </div>
                )}
              </div>
            </div>
          )}

          {/* Fairly assessed */}
          {hasAnalysis && estimatedSavings === 0 && (
            <div className="p-5 sm:p-6 md:p-8 border-t border-black/[0.06]">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a6b5a] to-[#22856f] flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#e8f4f0] text-[#1a6b5a] font-medium px-4 py-2 rounded-full text-sm mb-3">
                  ✓ {isTexas ? "Fairly Appraised" : "Fairly Assessed"}
                </div>
                <h3 className="text-xl font-semibold text-[#1a1a1a]">
                  Good news — your home looks fairly {isTexas ? "appraised" : "assessed"}
                </h3>
                <p className="mt-2 text-[#666] max-w-md mx-auto">
                  Based on {property.analysis?.compCount || "comparable"} similar properties in your area, your {isTexas ? "appraised value" : "assessment"} is in line with the market. We don&apos;t recommend filing a {isTexas ? "protest" : "appeal"} at this time.
                </p>
              </div>
              
              <div className="mt-6 bg-[#f7f6f3] rounded-xl p-5">
                <p className="text-[13px] tracking-[0.1em] uppercase text-[#999] font-medium mb-3">What to do next</p>
                <div className="space-y-3 text-sm text-[#555]">
                  {isTexas ? (
                    <>
                      <div className="flex items-start gap-2.5">
                        <span className="text-[#1a6b5a] mt-0.5 flex-shrink-0">📋</span>
                        <span>Make sure your <strong className="text-[#1a1a1a]">homestead exemption</strong> is filed — it caps annual increases at 10%</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="text-[#1a6b5a] mt-0.5 flex-shrink-0">📅</span>
                        <span>Check back after your <strong className="text-[#1a1a1a]">2026 appraisal notice</strong> arrives (typically March–April)</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="text-[#1a6b5a] mt-0.5 flex-shrink-0">🔔</span>
                        <span>Values can jump year to year — we&apos;ll have fresh data as soon as counties release 2026 numbers</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2.5">
                        <span className="text-[#1a6b5a] mt-0.5 flex-shrink-0">📋</span>
                        <span>Verify your <strong className="text-[#1a1a1a]">exemptions</strong> are current (homeowner, senior, disability)</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="text-[#1a6b5a] mt-0.5 flex-shrink-0">📅</span>
                        <span>Reassessment notices typically arrive in <strong className="text-[#1a1a1a]">January–February</strong> — check back then</span>
                      </div>
                    </>
                  )}
                </div>
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

        {/* Comparable Properties Preview — before Assessment History for Cook County */}
        {comps.length > 0 && hasAnalysis && estimatedSavings > 0 && (
          <div className="mt-3 rounded-2xl bg-white border border-black/[0.06] overflow-hidden">
            <div className="p-5 sm:p-6 md:p-8 pb-0 sm:pb-0 md:pb-0">
              <div className="text-[13px] tracking-[0.15em] text-[#999] uppercase font-medium mb-1">COMPARABLE PROPERTIES</div>
              <p className="text-sm text-[#666] mb-4">
                These nearby homes support a lower {isTexas ? "appraised value" : "assessment"} for your property.
              </p>
            </div>
            <div className="px-5 sm:px-6 md:px-8 pb-5 sm:pb-6 md:pb-8">
              {/* Comp cards */}
              <div className="space-y-3">
                {comps.slice(0, 1).map((comp, i) => (
                  <div key={comp.acct || i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-[#f7f6f3] border border-black/[0.04]">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#1a1a1a] text-sm truncate">{comp.address}</div>
                      <div className="text-xs text-[#999] mt-0.5">
                        {comp.sqft > 0 && <span>{comp.sqft.toLocaleString()} sq ft</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-[#999]">{isTexas ? "Appraised" : "Assessed"}</div>
                        <div className="font-semibold text-sm text-[#1a1a1a]">${comp.assessedVal.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#999]">$/sq ft</div>
                        <div className="font-semibold text-sm text-[#1a6b5a]">${comp.perSqft.toFixed(0)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Blurred teaser rows — real comp data */}
              {comps.length > 1 && (
                <div className="relative mt-3">
                  <div className="space-y-3 select-none pointer-events-none" style={{ filter: "blur(6px)" }} aria-hidden="true">
                    {comps.slice(1, 4).map((comp, i) => (
                      <div key={`blur-${i}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-[#f7f6f3] border border-black/[0.04]">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#1a1a1a] text-sm">{comp.address}</div>
                          <div className="text-xs text-[#999] mt-0.5">{comp.sqft > 0 ? `${comp.sqft.toLocaleString()} sq ft` : ''}</div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="text-right">
                            <div className="text-xs text-[#999]">{isTexas ? "Appraised" : "Assessed"}</div>
                            <div className="font-semibold text-sm text-[#1a1a1a]">${comp.assessedVal.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-[#999]">$/sq ft</div>
                            <div className="font-semibold text-sm text-[#1a6b5a]">$167</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3 shadow-sm border border-black/[0.06] text-center">
                      <div className="text-sm font-medium text-[#1a1a1a]">
                        {Math.max(comps.length - 1, 2)} more comparables in your appeal packet
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              {isTexas ? (
                <div className="mt-5 text-center">
                  <p className="text-sm text-[#666]">
                    We&apos;ll notify you when 2026 data is ready.{" "}
                    <a href="#waitlist-form" className="text-[#1a6b5a] font-medium underline underline-offset-2">Sign up above</a> if you haven&apos;t already.
                  </p>
                </div>
              ) : (
              <>
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
                className={`mt-5 w-full px-6 py-3.5 rounded-xl font-semibold text-base transition-all bg-[#1a6b5a] text-white ${checkoutLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#155a4c] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'}`}
              >
                {checkoutLoading ? "Processing..." : `Get Your Full Appeal Packet — $49`}
              </button>
              <p className="mt-3 text-center text-xs text-[#999]">
                🛡️ 100% money-back guarantee if you&apos;re not satisfied
              </p>
              </>
              )}
            </div>
          </div>
        )}

        {/* Assessment History — after comps for Cook County */}
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

        {/* Neighborhood Stats */}
        {property.neighborhoodStats && (
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
              Based on {property.neighborhoodStats.totalProperties.toLocaleString()} residential properties in your neighborhood. Source: {cadName} {isTexas ? "2025 certified" : "assessment"} data.
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
                    Delivered instantly to your email: a professional evidence brief, comparable properties analysis, and {isTexas ? "a step-by-step filing guide with hearing script" : "a complete appeal guide covering both Assessor and Board of Review filings"}.
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
                    Follow our guide to file {isBexar ? "your protest with BCAD" : isFortBend ? "your protest with FBCAD" : isWilliamson ? "your protest with WCAD" : isDenton ? "your protest with DCAD" : isTarrant ? "your protest with TAD" : isCollin ? "your protest with CCAD" : isAustin ? "your protest with TCAD" : isDallas ? "your protest with DCAD" : isHouston ? "your protest with HCAD" : "with the Assessor or Board of Review"}. Most homeowners complete it in under 30 minutes.
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
              <div className={`rounded-2xl p-4 border border-black/[0.06]`}>
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
              <div className={`rounded-2xl p-4 border-2 border-[#1a6b5a] bg-[#e8f4f0]/30 relative`}>
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
                  <div className="flex items-start gap-2">
                    <span className={`text-[#1a6b5a]`}>✓</span>
                    <span className={`font-medium text-[#1a6b5a]`}>100% money-back guarantee</span>
                  </div>
                </div>
              </div>

              {/* Tax Attorney */}
              <div className={`rounded-2xl p-4 border border-black/[0.06]`}>
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
          <div className="mt-3 rounded-2xl border border-black/[0.06] bg-white overflow-hidden">
            <div className="p-5 sm:p-6 md:p-8 pb-0 sm:pb-0 md:pb-0">
              <div className="text-[13px] tracking-[0.15em] text-[#999] uppercase font-medium mb-2">COMMON QUESTIONS</div>
            </div>
            <div>
              <div className="border-b border-black/[0.04]">
                <div className="text-base font-medium text-[#1a1a1a] py-4 px-6">Is this legitimate?</div>
                <div className="text-sm text-[#666] px-6 pb-4">
                  {isTexas 
                    ? "Absolutely. Protesting your property tax appraisal is a formal right under Texas law. Hundreds of thousands of Texas homeowners protest every year — it's one of the most common things homeowners do."
                    : "Yes. Appealing your property tax assessment is a formal right in Illinois. The Cook County Assessor's Office and Board of Review process hundreds of thousands of appeals every year."
                  }
                </div>
              </div>
              <div className="border-b border-black/[0.04]">
                <div className="text-base font-medium text-[#1a1a1a] py-4 px-6">Can I do this myself for free?</div>
                <div className="text-sm text-[#666] px-6 pb-4">
                  Yes, but it typically takes 10+ hours of research — finding comparable properties, calculating assessment ratios, understanding the filing process, and preparing evidence. We do all that for you in minutes.
                </div>
              </div>
              <div className="border-b border-black/[0.04]">
                <div className="text-base font-medium text-[#1a1a1a] py-4 px-6">What if my {isTexas ? "protest" : "appeal"} isn&apos;t successful?</div>
                <div className="text-sm text-[#666] px-6 pb-4">
                  {isTexas 
                    ? "There's no penalty for protesting. If the appraisal review board doesn't lower your value, your taxes stay the same — you don't lose anything. Most homeowners who protest with evidence get some reduction."
                    : "There's no penalty for appealing. If the Board of Review doesn't reduce your assessment, it stays the same — you never pay more for trying. Most appeals with proper comparable evidence receive some reduction."
                  }
                </div>
              </div>
              <div className="border-b border-black/[0.04]">
                <div className="text-base font-medium text-[#1a1a1a] py-4 px-6">When is the deadline?</div>
                <div className="text-sm text-[#666] px-6 pb-4">
                  {isTexas 
                    ? "Texas protest season typically opens in late March when appraisal notices are mailed. The deadline is usually May 15 (or 30 days after your notice date, whichever is later). Filing early gives you the best shot at an informal settlement."
                    : "Deadlines vary by township and filing body. The Assessor accepts appeals during your township's reassessment year. Board of Review appeals typically open after the Assessor's decisions are final. Check your township's current status."
                  }
                </div>
              </div>
              <div className="last:border-b-0">
                <div className="text-base font-medium text-[#1a1a1a] py-4 px-6">What if I&apos;m not satisfied?</div>
                <div className="text-sm text-[#666] px-6 pb-4">
                  We offer a 100% money-back guarantee. If you&apos;re not happy with your filing package for any reason, email us at hello@getovertaxed.com and we&apos;ll refund your $49 — no questions asked.
                </div>
              </div>
              <div className="last:border-b-0">
                <div className="text-base font-medium text-[#1a1a1a] py-4 px-6">What&apos;s included in the $49 filing package?</div>
                <div className="text-sm text-[#666] px-6 pb-4">
                  A complete, ready-to-file package: {compCount} comparable properties with detailed analysis (addresses, values, $/sqft), a professional {isTexas ? "hearing script you can read word-for-word at your hearing" : "evidence brief for the Board of Review"}, and step-by-step instructions with screenshots showing exactly where to click. Everything is delivered instantly to your email as a downloadable PDF.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final CTA */}
        {hasAnalysis && estimatedSavings > 0 && (
          <div className="mt-3 rounded-2xl bg-[#e8f4f0] p-8 md:p-12">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#1a1a1a]">
                Don&apos;t overpay ${multiYearSavings.toLocaleString()} over {multiYearLabel}
              </div>
              <p className="text-sm text-[#666] mt-2">
                Your home is {isTexas ? "over-appraised" : "over-assessed"} by ${assessmentGap.toLocaleString()}. Get everything you need to fix it.
              </p>
              {isTexas ? (
                <div className="mt-4 max-w-lg mx-auto">
                  <p className="text-sm text-[#666] mb-3">
                    We&apos;ll notify you when 2026 data is ready.{" "}
                    <a href="#waitlist-form" className="text-[#1a6b5a] font-medium underline underline-offset-2">Sign up above</a> if you haven&apos;t already.
                  </p>
                  <p className="mt-3 text-xs text-[#666]">
                    🛡️ 100% money-back guarantee — not satisfied? We&apos;ll refund every penny.
                  </p>
                </div>
              ) : (
              <>
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
                  `File My Appeal — $49`
                )}
              </button>
              <p className="mt-3 text-xs text-[#666]">
                🔒 Secure payment • Instant delivery • One-time filing fee
              </p>
              <p className="mt-1 text-xs text-[#666]">
                🛡️ 100% money-back guarantee — not satisfied? We&apos;ll refund every penny.
              </p>
              </>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-4 text-xs text-[#999] text-center">
          {isBexar
            ? "Appraisal data from Bexar County Appraisal District (BCAD). Tax bill estimates use an average Bexar County rate of ~2.1% and may vary by taxing jurisdiction."
            : isFortBend
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
