"use client";

import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

interface PropertyData {
  pin?: string;
  acct?: string;
  address: string;
  city: string;
  zip?: string;
  township?: string;
  sqft: number;
  beds?: number;
  yearBuilt?: number;
  currentAssessment: number;
  fairAssessment: number;
  reduction?: number;
  potentialReduction?: number;
  savings?: number;
  estimatedSavings?: number;
  perSqft: number;
  fairPerSqft: number;
  overAssessedPct?: number;
  comps: Array<{
    pin?: string;
    acct?: string;
    address: string;
    sqft: number;
    beds?: number;
    year?: number;
    perSqft?: number;
    assessedVal?: number;
  }>;
}

function AppealPage() {
  const params = useParams();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [isHouston, setIsHouston] = useState(false);
  const [isDallas, setIsDallas] = useState(false);
  const isTexas = isHouston || isDallas;

  useEffect(() => {
    if (!token) {
      setError("Invalid access link");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Try Cook County first
        const res = await fetch(`/api/generate-appeal?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setProperty(data.property);
          return;
        }

        // Try Houston endpoint
        const houstonRes = await fetch(`/api/houston/generate-appeal?token=${token}`);
        const houstonData = await houstonRes.json();

        if (houstonRes.ok) {
          setProperty(houstonData.property);
          setIsHouston(true);
          return;
        }

        // Try Dallas endpoint
        const dallasRes = await fetch(`/api/dallas/generate-appeal?token=${token}`);
        const dallasData = await dallasRes.json();

        if (dallasRes.ok) {
          setProperty(dallasData.property);
          setIsDallas(true);
          return;
        }

        setError(data.error || houstonData.error || dallasData.error || "Failed to load appeal package");
      } catch (err) {
        setError("Failed to load appeal package. This link may have expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleDownload = async () => {
    if (!token) return;
    
    setDownloading(true);
    try {
      const endpoint = isDallas ? "/api/dallas/generate-appeal" : isHouston ? "/api/houston/generate-appeal" : "/api/generate-appeal";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const id = isTexas ? property?.acct : property?.pin;
      a.download = isTexas 
        ? `protest-package-${id}.pdf`
        : `appeal-package-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your appeal package...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Link expired or invalid</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500 mb-4">If you filed an appeal or protest with us, check your email for the PDF attachment or contact us for help.</p>
          <Link href="/" className="text-green-600 font-medium hover:underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const reduction = property.reduction || property.potentialReduction || 0;
  const savings = property.savings || property.estimatedSavings || 0;
  const overAssessedPct = property.overAssessedPct || 
    (property.currentAssessment > 0 ? Math.round((reduction / property.currentAssessment) * 100) : 0);
  const propertyId = isTexas ? property.acct : property.pin;

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold italic text-gray-900">
            overtaxed
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Access Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isTexas ? "Your Protest Package" : "Your Appeal Package"}
          </h1>
          <p className="text-gray-600">
            {isTexas 
              ? "Access your property tax protest evidence and filing instructions"
              : "Access your property tax appeal evidence and filing instructions"
            }
          </p>
        </div>

        {/* Property Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{property.address}</h2>
              <p className="text-gray-500">
                {isDallas 
                  ? `${property.city}, TX · Dallas County`
                  : isHouston 
                  ? `${property.city}, TX · Harris County`
                  : `${property.city}, IL ${property.zip || ""} · ${property.township || ""} Township`
                }
              </p>
              <p className="text-sm text-gray-400 font-mono">
                {isTexas ? `Account: ${propertyId}` : `PIN: ${propertyId}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">${savings.toLocaleString()}</div>
              <div className="text-sm text-gray-500">estimated annual savings</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="text-sm text-gray-500">
                {isTexas ? "Current Appraised" : "Current Assessment"}
              </div>
              <div className="text-lg font-semibold text-red-600">${property.currentAssessment.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {isTexas ? "Fair Value" : "Fair Assessment"}
              </div>
              <div className="text-lg font-semibold text-green-600">${property.fairAssessment.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {isTexas ? "Over-Appraised By" : "Over-Assessed By"}
              </div>
              <div className="text-lg font-semibold text-amber-600">{overAssessedPct}%</div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isTexas ? "Download Your Protest Package" : "Download Your Appeal Package"}
          </h3>
          <p className="text-gray-600 mb-4">
            {isDallas
              ? "Your complete protest package includes comparable properties, appraisal analysis, hearing script, and step-by-step DCAD eFile instructions."
              : isTexas
              ? "Your complete protest package includes comparable properties, appraisal analysis, hearing script, and step-by-step iFile instructions."
              : "Your complete appeal package includes comparable properties, assessment analysis, and step-by-step Board of Review filing instructions."
            }
          </p>
          
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Comparable Properties Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparable Properties</h3>
          <p className="text-gray-600 mb-4">
            {isTexas 
              ? "These similar properties are appraised at lower values than yours:"
              : "These similar properties are assessed at lower values than yours:"
            }
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Address</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">Sqft</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">$/Sqft</th>
                </tr>
              </thead>
              <tbody>
                {property.comps.map((comp, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 px-2">
                      <div className="font-medium text-gray-900">{comp.address}</div>
                      <div className="text-xs text-gray-400 font-mono">
                        {isTexas ? `Acct: ${comp.acct || comp.pin}` : comp.pin}
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 text-gray-600">{comp.sqft.toLocaleString()}</td>
                    <td className="text-right py-3 px-2 text-green-600 font-medium">
                      ${(comp.perSqft || (comp.assessedVal && comp.sqft ? comp.assessedVal / comp.sqft : 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">Your property: ${property.perSqft.toFixed(2)}/sqft</p>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to File</h3>
          
          {isTexas ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</div>
                <div>
                  <div className="font-medium text-gray-900">Download your protest package above</div>
                  <p className="text-sm text-gray-600">Review the comparable properties, hearing script, and filing instructions in the PDF.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</div>
                <div>
                  <div className="font-medium text-gray-900">File your protest online</div>
                  <p className="text-sm text-gray-600">
                    {isDallas
                      ? 'Go to dallascad.org, select "Unequal Appraisal", and upload this PDF as evidence.'
                      : 'Go to hcad.org, select "Unequal Appraisal", and upload this PDF as evidence.'
                    }
                  </p>
                  <a 
                    href={isDallas ? "https://www.dallascad.org/eFile.aspx" : "https://hcad.org/hcad-online-services/ifile-protest/"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline mt-1"
                  >
                    {isDallas ? "DCAD eFile Protest" : "HCAD iFile Protest"}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">3</div>
                <div>
                  <div className="font-medium text-gray-900">Check for a settlement offer</div>
                  <p className="text-sm text-gray-600">
                    {isDallas
                      ? "DCAD may offer to settle without a hearing. If the offer is fair, accept it!"
                      : "HCAD may offer to settle without a hearing. If the offer is fair, accept it!"
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">4</div>
                <div>
                  <div className="font-medium text-gray-900">Attend your ARB hearing (if needed)</div>
                  <p className="text-sm text-gray-600">Bring this PDF and use the hearing script included. Most protests resolve before this step.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</div>
                <div>
                  <div className="font-medium text-gray-900">Download your appeal package above</div>
                  <p className="text-sm text-gray-600">Review the comparable properties and filing instructions in the PDF.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</div>
                <div>
                  <div className="font-medium text-gray-900">File with the Board of Review</div>
                  <p className="text-sm text-gray-600">Follow the step-by-step instructions in your PDF. No account needed — file as a guest.</p>
                  <a 
                    href="https://appeals.cookcountyboardofreview.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline mt-1"
                  >
                    cookcountyboardofreview.com
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">3</div>
                <div>
                  <div className="font-medium text-gray-900">Take a photo of your property</div>
                  <p className="text-sm text-gray-600">The Board of Review requires a clear photo of the front of your building (Rule #17). Upload it with your appeal.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">4</div>
                <div>
                  <div className="font-medium text-gray-900">Wait for your decision</div>
                  <p className="text-sm text-gray-600">The Board typically responds within 90 days after your township&apos;s filing period closes.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Support */}
        <div className="text-center text-gray-500 text-sm py-4">
          <p>Questions? Contact us at <a href="mailto:hello@getovertaxed.com" className="text-green-600 hover:underline">hello@getovertaxed.com</a></p>
        </div>
      </main>
    </div>
  );
}

export default function AppealPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your appeal package...</p>
        </div>
      </div>
    }>
      <AppealPage />
    </Suspense>
  );
}
