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

interface CompsData {
  subject: {
    pin: string;
    sqFt: number;
    beds: number;
    assessedTot: number;
    assessedBldg: number;
    perSqFt: number;
    marketValue: number;
  };
  assessmentComps: {
    pin: string;
    sqFt: number;
    beds: number;
    yearBuilt: number;
    assessedBldg: number;
    perSqFt: number;
  }[];
  salesComps: {
    pin: string;
    sqFt: number;
    beds: number;
    salePrice: number;
    saleDate: string;
    perSqFt: number;
  }[];
  analysis: {
    estimatedSavings: number;
    method: "uniformity" | "sales" | "none";
    fairAssessment: number;
    medianCompPerSqFt: number;
  };
}

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [multipleResults, setMultipleResults] = useState<MultipleResults[] | null>(null);
  const [comps, setComps] = useState<CompsData | null>(null);
  const [compsLoading, setCompsLoading] = useState(false);

  const address = searchParams.get("address");
  const pin = searchParams.get("pin");

  const fetchComps = async (propertyPin: string) => {
    setCompsLoading(true);
    try {
      const response = await fetch(`/api/comps?pin=${propertyPin}`);
      if (response.ok) {
        const data = await response.json();
        setComps(data);
      }
    } catch {
      // Comps are optional, don't error
    } finally {
      setCompsLoading(false);
    }
  };

  const fetchProperty = async (searchPin?: string) => {
    setLoading(true);
    setError(null);
    setProperty(null);
    setMultipleResults(null);
    setComps(null);

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
        // Fetch comps after property loads
        fetchComps(data.property.pin);
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
  
  // Use real comps data if available, otherwise show placeholder
  const hasComps = comps && comps.analysis.method !== "none";
  const estimatedSavings = hasComps ? comps.analysis.estimatedSavings : Math.round(currentAssessment * 0.15);
  const savingsMethod = comps?.analysis.method;

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

        {/* Comparable Properties */}
        {compsLoading ? (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="text-gray-500">Finding comparable properties...</span>
            </div>
          </div>
        ) : comps && (comps.assessmentComps.length > 0 || comps.salesComps.length > 0) ? (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparable Properties</h2>
            
            {comps.assessmentComps.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Similar Assessments in Your Area
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    (Your assessment: ${comps.subject.perSqFt}/sqft)
                  </span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-medium">PIN</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Sq Ft</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Beds</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Assessment</th>
                        <th className="text-right py-2 text-gray-500 font-medium">$/SqFt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comps.assessmentComps.slice(0, 5).map((comp) => (
                        <tr key={comp.pin} className="border-b border-gray-50">
                          <td className="py-2 font-mono text-xs">{comp.pin}</td>
                          <td className="py-2 text-right">{comp.sqFt.toLocaleString()}</td>
                          <td className="py-2 text-right">{comp.beds}</td>
                          <td className="py-2 text-right">${comp.assessedBldg.toLocaleString()}</td>
                          <td className={`py-2 text-right font-medium ${comp.perSqFt < comps.subject.perSqFt ? "text-green-600" : ""}`}>
                            ${comp.perSqFt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {comps.salesComps.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Recent Sales
                  <span className="ml-2 text-xs text-gray-400 font-normal">
                    (Your implied value: ${comps.subject.marketValue.toLocaleString()})
                  </span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-medium">PIN</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Sq Ft</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Sale Price</th>
                        <th className="text-right py-2 text-gray-500 font-medium">Date</th>
                        <th className="text-right py-2 text-gray-500 font-medium">$/SqFt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comps.salesComps.slice(0, 5).map((comp) => (
                        <tr key={comp.pin} className="border-b border-gray-50">
                          <td className="py-2 font-mono text-xs">{comp.pin}</td>
                          <td className="py-2 text-right">{comp.sqFt.toLocaleString()}</td>
                          <td className="py-2 text-right">${comp.salePrice.toLocaleString()}</td>
                          <td className="py-2 text-right text-gray-500">{comp.saleDate}</td>
                          <td className="py-2 text-right font-medium">${comp.perSqFt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}

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
                    <th className="text-right py-2 text-gray-500 font-medium">Certified</th>
                    <th className="text-right py-2 text-gray-500 font-medium">After Appeal</th>
                  </tr>
                </thead>
                <tbody>
                  {property.assessmentHistory.map((year) => (
                    <tr key={year.year} className="border-b border-gray-50">
                      <td className="py-3 font-medium">{year.year}</td>
                      <td className="py-3 text-right text-gray-600">
                        ${year.mailedTotal.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {year.certifiedTotal ? `$${year.certifiedTotal.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 text-right">
                        {year.boardTotal ? (
                          <span className={year.boardTotal < year.mailedTotal ? "text-green-600 font-medium" : ""}>
                            ${year.boardTotal.toLocaleString()}
                            {year.boardTotal < year.mailedTotal && (
                              <span className="text-xs ml-1">
                                (-{Math.round((1 - year.boardTotal / year.mailedTotal) * 100)}%)
                              </span>
                            )}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 bg-primary/5 rounded-xl border border-primary/20 p-6 md:p-8 text-center">
          {hasComps ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900">
                Potential Savings: ${estimatedSavings.toLocaleString()}/year
              </h2>
              <p className="mt-2 text-gray-500 max-w-lg mx-auto">
                Based on {savingsMethod === "uniformity" ? "similar assessments" : "recent sales"} in your area, 
                your property appears to be over-assessed. Get a complete appeal package for just $99.
              </p>
            </>
          ) : compsLoading ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900">Analyzing your property...</h2>
              <p className="mt-2 text-gray-500">Finding comparable properties to estimate potential savings.</p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900">
                Potential Savings: ${estimatedSavings.toLocaleString()}/year
              </h2>
              <p className="mt-2 text-gray-500 max-w-lg mx-auto">
                Based on typical reductions in your area, you may be able to reduce your assessment.
                Get a full analysis with comparable properties for just $99.
              </p>
            </>
          )}
          <Button size="lg" className="mt-6 h-12 px-8">
            Get Your Appeal Package — $99
          </Button>
          <p className="mt-3 text-sm text-gray-400">
            Includes 5+ comparable properties, pre-filled forms, and filing instructions
          </p>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-xs text-gray-400 text-center">
          Assessment data from Cook County Assessor&apos;s Office. Potential savings are estimates 
          based on comparable properties and may vary. Past results do not guarantee future outcomes.
        </p>
      </div>
    </div>
  );
}
