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
  } | null;
  assessment: {
    year: string;
    mailedTotal: number;
    mailedBuilding: number;
    mailedLand: number;
    certifiedTotal: number | null;
    boardTotal: number | null;
  } | null;
  assessmentHistory: {
    year: string;
    mailedTotal: number;
    certifiedTotal: number | null;
    boardTotal: number | null;
  }[];
}

interface MultipleResults {
  pin: string;
  address: string;
  city: string;
  zip: string;
  township: string;
}

interface AnalysisData {
  found: boolean;
  status?: "over" | "fair";
  current_assessment?: number;
  fair_assessment?: number;
  estimated_savings?: number;
  comp_count?: number;
  neighborhood_stats?: {
    total_properties: number;
    over_assessed_count: number;
    total_potential_savings: number;
  };
  message?: string;
}

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [multipleResults, setMultipleResults] = useState<MultipleResults[] | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);

  const address = searchParams.get("address");
  const pin = searchParams.get("pin");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const isDark = theme === "dark";

  const fetchAnalysis = async (propertyPin: string) => {
    try {
      const response = await fetch(`/api/comps?pin=${propertyPin}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch {
      // Analysis is optional
    }
  };

  const fetchProperty = async (searchPin?: string) => {
    setLoading(true);
    setError(null);
    setProperty(null);
    setMultipleResults(null);
    setAnalysis(null);

    try {
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
        fetchAnalysis(data.property.pin);
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
    if (!address && !pin) {
      router.push("/");
      return;
    }

    fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, pin]);

  // Shared styles
  const bgMain = isDark ? "bg-[#0a0a0a]" : "bg-[#fafafa]";
  const bgCard = isDark ? "bg-[#111]" : "bg-white";
  const borderColor = isDark ? "border-white/10" : "border-black/5";
  const textPrimary = isDark ? "text-white" : "text-[#111]";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const textMuted = isDark ? "text-gray-500" : "text-gray-400";

  // Prevent flash
  if (!mounted) {
    return <div className="min-h-screen bg-[#fafafa]" />;
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} ${textPrimary} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-10 w-10 border-2 ${isDark ? "border-white/20 border-t-white" : "border-black/20 border-t-black"} mx-auto`}></div>
          <p className={`mt-4 ${textSecondary}`}>Looking up your property...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bgMain} ${textPrimary} transition-colors duration-300`}>
        <nav className={`sticky top-0 z-50 ${isDark ? "bg-[#0a0a0a]/80" : "bg-[#fafafa]/80"} backdrop-blur-xl border-b ${borderColor}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              overtaxed
            </Link>
            <button onClick={toggleTheme} className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-black/5 text-gray-600"}`}>
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h1 className="text-2xl font-semibold">Property Not Found</h1>
          <p className={`mt-4 ${textSecondary}`}>{error}</p>
          <Link 
            href="/" 
            className={`inline-block mt-8 px-6 py-3 rounded-xl font-medium transition-colors ${isDark ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"}`}
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (multipleResults) {
    return (
      <div className={`min-h-screen ${bgMain} ${textPrimary} transition-colors duration-300`}>
        <nav className={`sticky top-0 z-50 ${isDark ? "bg-[#0a0a0a]/80" : "bg-[#fafafa]/80"} backdrop-blur-xl border-b ${borderColor}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              overtaxed
            </Link>
            <button onClick={toggleTheme} className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-black/5 text-gray-600"}`}>
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="text-xl sm:text-2xl font-semibold">Multiple Properties Found</h1>
          <p className={`mt-2 ${textSecondary}`}>Select your property:</p>
          <div className="mt-6 space-y-3">
            {multipleResults.map((result) => (
              <button
                key={result.pin}
                onClick={() => handleSelectProperty(result.pin)}
                className={`w-full text-left p-4 rounded-xl border ${borderColor} ${bgCard} hover:border-emerald-500/50 transition-all ${isDark ? "" : "shadow-sm"}`}
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
  
  const estimatedMarketValue = currentAssessment * 10;
  
  const hasAnalysis = analysis?.found && analysis.status === "over";
  const estimatedSavings = hasAnalysis ? analysis.estimated_savings! : 0;
  const fairAssessment = hasAnalysis ? analysis.fair_assessment! : currentAssessment;
  const compCount = analysis?.comp_count || 0;

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary} transition-colors duration-300`}>
      <nav className={`sticky top-0 z-50 ${isDark ? "bg-[#0a0a0a]/80" : "bg-[#fafafa]/80"} backdrop-blur-xl border-b ${borderColor}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            overtaxed
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={toggleTheme} className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-black/5 text-gray-600"}`}>
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <Link href="/" className={`text-sm ${textSecondary} ${isDark ? "hover:text-white" : "hover:text-black"}`}>
              ← New Search
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Property Header */}
        <div className={`rounded-xl border ${borderColor} ${bgCard} p-5 sm:p-6 md:p-8 ${isDark ? "" : "shadow-sm"}`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">{property.address}</h1>
              <p className={textSecondary}>
                {property.city}, IL {property.zip}
              </p>
              <p className={`text-sm ${textMuted} mt-1`}>
                PIN: {property.pin} • {property.township} Township
              </p>
            </div>
            <div className="md:text-right">
              <div className={`text-sm ${textSecondary}`}>Current Assessment</div>
              <div className="text-2xl sm:text-3xl font-semibold">
                ${currentAssessment.toLocaleString()}
              </div>
              <div className={`text-sm ${textMuted}`}>
                ~${estimatedMarketValue.toLocaleString()} market value
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Result - Over Assessed */}
        {analysis?.found && analysis.status === "over" && (
          <div className={`mt-4 sm:mt-6 rounded-xl p-5 sm:p-6 md:p-8 ${isDark ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30" : "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200"}`}>
            <div className={`flex items-center gap-2 font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              You&apos;re Over-Assessed
            </div>
            <div className="mt-5 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <div className={`text-sm ${textSecondary}`}>Current</div>
                <div className="text-lg sm:text-xl font-semibold">${currentAssessment.toLocaleString()}</div>
              </div>
              <div>
                <div className={`text-sm ${textSecondary}`}>Fair Value</div>
                <div className={`text-lg sm:text-xl font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>${fairAssessment.toLocaleString()}</div>
              </div>
              <div>
                <div className={`text-sm ${textSecondary}`}>Reduction</div>
                <div className={`text-lg sm:text-xl font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  ${(currentAssessment - fairAssessment).toLocaleString()}
                </div>
              </div>
              <div>
                <div className={`text-sm ${textSecondary}`}>Tax Savings</div>
                <div className={`text-lg sm:text-xl font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>${estimatedSavings.toLocaleString()}/yr</div>
              </div>
            </div>
            <p className={`mt-4 text-sm ${textSecondary}`}>
              Based on {compCount} comparable properties in your neighborhood.
            </p>
          </div>
        )}

        {/* Analysis Result - Fairly Assessed */}
        {analysis?.found && analysis.status === "fair" && (
          <div className={`mt-4 sm:mt-6 rounded-xl p-5 sm:p-6 md:p-8 border ${borderColor} ${bgCard} ${isDark ? "" : "shadow-sm"}`}>
            <div className={`flex items-center gap-2 font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Fairly Assessed
            </div>
            <p className={`mt-2 text-sm ${textSecondary}`}>
              Based on {compCount} comparable properties, your assessment appears to be in line with similar homes.
            </p>
          </div>
        )}

        {/* Not in analyzed area */}
        {analysis && !analysis.found && (
          <div className={`mt-4 sm:mt-6 rounded-xl p-5 sm:p-6 md:p-8 ${isDark ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30" : "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200"}`}>
            <div className={`flex items-center gap-2 font-medium ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Analysis Coming Soon
            </div>
            <p className={`mt-2 text-sm ${textSecondary}`}>
              We&apos;re still analyzing properties in your area. Check back soon or enter your email to be notified.
            </p>
          </div>
        )}

        {/* Property Details */}
        {property.characteristics && (
          <div className={`mt-4 sm:mt-6 rounded-xl border ${borderColor} ${bgCard} p-5 sm:p-6 md:p-8 ${isDark ? "" : "shadow-sm"}`}>
            <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {property.characteristics.buildingSqFt && (
                <div>
                  <div className="text-xl sm:text-2xl font-semibold">
                    {property.characteristics.buildingSqFt.toLocaleString()}
                  </div>
                  <div className={`text-sm ${textSecondary}`}>Square Feet</div>
                </div>
              )}
              {property.characteristics.bedrooms && (
                <div>
                  <div className="text-xl sm:text-2xl font-semibold">
                    {property.characteristics.bedrooms}
                  </div>
                  <div className={`text-sm ${textSecondary}`}>Bedrooms</div>
                </div>
              )}
              {property.characteristics.fullBaths && (
                <div>
                  <div className="text-xl sm:text-2xl font-semibold">
                    {property.characteristics.fullBaths}
                    {property.characteristics.halfBaths ? `.${property.characteristics.halfBaths}` : ""}
                  </div>
                  <div className={`text-sm ${textSecondary}`}>Bathrooms</div>
                </div>
              )}
              {property.characteristics.yearBuilt && (
                <div>
                  <div className="text-xl sm:text-2xl font-semibold">
                    {property.characteristics.yearBuilt}
                  </div>
                  <div className={`text-sm ${textSecondary}`}>Year Built</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessment History */}
        {property.assessmentHistory.length > 0 && (
          <div className={`mt-4 sm:mt-6 rounded-xl border ${borderColor} ${bgCard} p-5 sm:p-6 md:p-8 ${isDark ? "" : "shadow-sm"}`}>
            <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Assessment History</h2>
            <div className="overflow-x-auto -mx-5 sm:-mx-6 md:-mx-8 px-5 sm:px-6 md:px-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${borderColor}`}>
                    <th className={`text-left py-2 ${textSecondary} font-medium`}>Year</th>
                    <th className={`text-right py-2 ${textSecondary} font-medium`}>Initial</th>
                    <th className={`text-right py-2 ${textSecondary} font-medium`}>Final</th>
                    <th className={`text-right py-2 ${textSecondary} font-medium`}>Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {property.assessmentHistory.map((year) => {
                    const finalValue = year.boardTotal || year.certifiedTotal || year.mailedTotal;
                    const savedAmount = year.mailedTotal - finalValue;
                    const savedPercent = savedAmount > 0 ? Math.round((savedAmount / year.mailedTotal) * 100) : 0;
                    
                    return (
                      <tr key={year.year} className={`border-b ${isDark ? "border-white/5" : "border-black/5"}`}>
                        <td className="py-3 font-medium">{year.year}</td>
                        <td className={`py-3 text-right ${textSecondary}`}>
                          ${year.mailedTotal.toLocaleString()}
                        </td>
                        <td className={`py-3 text-right ${textSecondary}`}>
                          ${finalValue.toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          {savedAmount > 0 ? (
                            <span className={`font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                              -${savedAmount.toLocaleString()}
                              <span className="text-xs ml-1 opacity-70">
                                (-{savedPercent}%)
                              </span>
                            </span>
                          ) : (
                            <span className={textMuted}>—</span>
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

        {/* CTA - Over Assessed */}
        {hasAnalysis && (
          <div className={`mt-6 sm:mt-8 rounded-xl p-5 sm:p-6 md:p-8 text-center ${isDark ? "bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30" : "bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200"}`}>
            <h2 className="text-lg sm:text-xl font-semibold">
              Save ${estimatedSavings.toLocaleString()}/year on your property taxes
            </h2>
            <p className={`mt-2 text-sm sm:text-base ${textSecondary} max-w-lg mx-auto`}>
              Get your complete appeal package with comparable properties, pre-filled forms, and step-by-step instructions.
            </p>
            <a 
              href={`https://buy.stripe.com/7sY28t78c4Rj1ZyaVm57W00?client_reference_id=${property.pin}&prefilled_email=`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`inline-block mt-5 sm:mt-6 w-full sm:w-auto px-8 py-4 rounded-xl font-medium transition-colors ${isDark ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"}`}
            >
              Get Your Appeal Package — $49
            </a>
            <p className={`mt-3 text-sm ${textMuted}`}>
              One-time fee • Delivered in 48 hours
            </p>
          </div>
        )}

        {/* CTA - Fairly Assessed */}
        {analysis?.found && analysis.status === "fair" && (
          <div className={`mt-6 sm:mt-8 rounded-xl border ${borderColor} ${bgCard} p-5 sm:p-6 md:p-8 text-center ${isDark ? "" : "shadow-sm"}`}>
            <h2 className="text-lg sm:text-xl font-semibold">
              Good news — you&apos;re not overpaying
            </h2>
            <p className={`mt-2 text-sm sm:text-base ${textSecondary} max-w-lg mx-auto`}>
              Based on our analysis, your property is fairly assessed compared to similar homes. No action needed!
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <p className={`mt-6 sm:mt-8 text-xs ${textMuted} text-center`}>
          Assessment data from Cook County Assessor&apos;s Office. Savings estimates based on 
          {analysis?.comp_count ? ` ${analysis.comp_count}` : ""} comparable properties and may vary. 
          Past results do not guarantee future outcomes.
        </p>
      </div>
    </div>
  );
}
