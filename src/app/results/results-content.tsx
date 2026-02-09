"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

  const address = searchParams.get("address");
  const pin = searchParams.get("pin");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Looking up your property...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              overtaxed
            </Link>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Property Not Found</h1>
          <p className="mt-4 text-gray-500">{error}</p>
          <Button asChild className="mt-8">
            <Link href="/">Try Again</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (multipleResults) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              overtaxed
            </Link>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <h1 className="text-2xl font-semibold text-gray-900">Multiple Properties Found</h1>
          <p className="mt-2 text-gray-500">Select your property from the list below:</p>
          <div className="mt-8 space-y-3">
            {multipleResults.map((result) => (
              <button
                key={result.pin}
                onClick={() => handleSelectProperty(result.pin)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{result.address}</div>
                <div className="text-sm text-gray-500">
                  {result.city}, IL {result.zip} • {result.township} Township
                </div>
                <div className="text-xs text-gray-400 mt-1">PIN: {result.pin}</div>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
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
  
  // Use precomputed analysis if available
  const hasAnalysis = analysis?.found && analysis.status === "over";
  const estimatedSavings = hasAnalysis ? analysis.estimated_savings! : 0;
  const fairAssessment = hasAnalysis ? analysis.fair_assessment! : currentAssessment;
  const compCount = analysis?.comp_count || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            overtaxed
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            ← New Search
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Property Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{property.address}</h1>
              <p className="text-gray-500">
                {property.city}, IL {property.zip}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                PIN: {property.pin} • {property.township} Township
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Assessment</div>
              <div className="text-3xl font-semibold text-gray-900">
                ${currentAssessment.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                ~${estimatedMarketValue.toLocaleString()} market value
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Result */}
        {analysis?.found && (
          <div className={`mt-6 rounded-xl border p-6 md:p-8 ${
            analysis.status === "over" 
              ? "bg-green-50 border-green-200" 
              : "bg-gray-50 border-gray-200"
          }`}>
            {analysis.status === "over" ? (
              <>
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You&apos;re Over-Assessed
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Current</div>
                    <div className="text-xl font-semibold text-gray-900">${currentAssessment.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Fair Value</div>
                    <div className="text-xl font-semibold text-green-700">${fairAssessment.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Potential Reduction</div>
                    <div className="text-xl font-semibold text-green-700">
                      ${(currentAssessment - fairAssessment).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Est. Tax Savings</div>
                    <div className="text-xl font-semibold text-green-700">${estimatedSavings.toLocaleString()}/yr</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Based on {compCount} comparable properties in your neighborhood, your assessment is higher than similar homes.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Fairly Assessed
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Based on {compCount} comparable properties, your assessment appears to be in line with similar homes in your area.
                </p>
              </>
            )}
          </div>
        )}

        {/* Not in analyzed area */}
        {analysis && !analysis.found && (
          <div className="mt-6 bg-yellow-50 rounded-xl border border-yellow-200 p-6 md:p-8">
            <div className="flex items-center gap-2 text-yellow-700 font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Analysis Coming Soon
            </div>
            <p className="mt-2 text-sm text-gray-600">
              We&apos;re still analyzing properties in your area. Check back soon or enter your email to be notified when your analysis is ready.
            </p>
          </div>
        )}

        {/* Property Details */}
        {property.characteristics && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {property.characteristics.buildingSqFt && (
                <div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {property.characteristics.buildingSqFt.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Square Feet</div>
                </div>
              )}
              {property.characteristics.bedrooms && (
                <div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {property.characteristics.bedrooms}
                  </div>
                  <div className="text-sm text-gray-500">Bedrooms</div>
                </div>
              )}
              {property.characteristics.fullBaths && (
                <div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {property.characteristics.fullBaths}
                    {property.characteristics.halfBaths ? `.${property.characteristics.halfBaths}` : ""}
                  </div>
                  <div className="text-sm text-gray-500">Bathrooms</div>
                </div>
              )}
              {property.characteristics.yearBuilt && (
                <div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {property.characteristics.yearBuilt}
                  </div>
                  <div className="text-sm text-gray-500">Year Built</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessment History */}
        {property.assessmentHistory.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessment History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Year</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Initial</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Final</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {property.assessmentHistory.map((year) => {
                    const finalValue = year.boardTotal || year.certifiedTotal || year.mailedTotal;
                    const savedAmount = year.mailedTotal - finalValue;
                    const savedPercent = savedAmount > 0 ? Math.round((savedAmount / year.mailedTotal) * 100) : 0;
                    
                    return (
                    <tr key={year.year} className="border-b border-gray-50">
                      <td className="py-3 font-medium">{year.year}</td>
                      <td className="py-3 text-right text-gray-600">
                        ${year.mailedTotal.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        ${finalValue.toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        {savedAmount > 0 ? (
                          <span className="text-green-600 font-medium">
                            -${savedAmount.toLocaleString()}
                            <span className="text-xs ml-1">
                              (-{savedPercent}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
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

        {/* CTA */}
        {hasAnalysis && (
          <div className="mt-8 bg-primary/5 rounded-xl border border-primary/20 p-6 md:p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Save ${estimatedSavings.toLocaleString()}/year on your property taxes
            </h2>
            <p className="mt-2 text-gray-500 max-w-lg mx-auto">
              Get your complete appeal package with comparable properties, pre-filled forms, and step-by-step instructions.
            </p>
            <Button size="lg" className="mt-6 h-12 px-8">
              Get Your Appeal Package — $49
            </Button>
            <p className="mt-3 text-sm text-gray-400">
              One-time fee • Delivered in 48 hours
            </p>
          </div>
        )}

        {analysis?.found && analysis.status === "fair" && (
          <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6 md:p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Good news — you&apos;re not overpaying
            </h2>
            <p className="mt-2 text-gray-500 max-w-lg mx-auto">
              Based on our analysis, your property is fairly assessed compared to similar homes. No action needed!
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-8 text-xs text-gray-400 text-center">
          Assessment data from Cook County Assessor&apos;s Office. Savings estimates based on 
          {analysis?.comp_count ? ` ${analysis.comp_count}` : ""} comparable properties and may vary. 
          Past results do not guarantee future outcomes.
        </p>
      </div>
    </div>
  );
}
