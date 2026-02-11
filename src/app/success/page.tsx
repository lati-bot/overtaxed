"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PropertyData {
  pin: string;
  address: string;
  city: string;
  zip: string;
  township: string;
  sqft: number;
  beds: number;
  yearBuilt: number;
  currentAssessment: number;
  fairAssessment: number;
  reduction: number;
  savings: number;
  perSqft: number;
  fairPerSqft: number;
  comps: Array<{
    pin: string;
    address: string;
    sqft: number;
    beds: number;
    year: number;
    perSqft: number;
  }>;
}

function SuccessPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [isHouston, setIsHouston] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const accessToken = searchParams.get("token");

    if (!sessionId && !accessToken) {
      setError("Missing session information");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Try Cook County endpoint first
        const url = sessionId 
          ? `/api/generate-appeal?session_id=${sessionId}`
          : `/api/generate-appeal?token=${accessToken}`;
        
        const res = await fetch(url);
        let cookError = "Unknown error";
        try {
          const data = await res.json();
          if (res.ok) {
            setProperty(data.property);
            setToken(data.token);
            setEmail(data.email || null);
            return;
          }
          cookError = data.error || "Cook County lookup failed";
        } catch {
          cookError = "Cook County lookup failed";
        }

        // If Cook County failed, try Houston endpoint
        const houstonUrl = sessionId
          ? `/api/houston/generate-appeal?session_id=${sessionId}`
          : `/api/houston/generate-appeal?token=${accessToken}`;
        
        const houstonRes = await fetch(houstonUrl);
        try {
          const houstonData = await houstonRes.json();
          if (houstonRes.ok) {
            // Map Houston property shape to our PropertyData interface
            const hp = houstonData.property;
            setProperty({
              pin: hp.acct,
              address: hp.address,
              city: hp.city || "HOUSTON",
              zip: "",
              township: "",
              sqft: hp.sqft || 0,
              beds: 0,
              yearBuilt: hp.yearBuilt || 0,
              currentAssessment: hp.currentAssessment,
              fairAssessment: hp.fairAssessment,
              reduction: hp.potentialReduction || 0,
              savings: hp.estimatedSavings || 0,
              perSqft: hp.perSqft || 0,
              fairPerSqft: hp.fairPerSqft || 0,
              comps: (hp.comps || []).map((c: any) => ({
                pin: c.acct || "",
                address: c.address || "",
                sqft: c.sqft || 0,
                beds: 0,
                year: c.yearBuilt || 0,
                perSqft: c.perSqft || c.assessedVal && c.sqft ? Math.round((c.assessedVal / c.sqft) * 100) / 100 : 0,
              })),
            });
            setToken(houstonData.token);
            setEmail(houstonData.email || null);
            setIsHouston(true);
            return;
          }
          // Both failed — show Houston error (more likely to be relevant)
          setError(houstonData.error || cookError || "Failed to load appeal package");
        } catch {
          setError(cookError || "Failed to load appeal package");
        }
      } catch (err) {
        setError("Failed to load appeal package. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleDownload = async () => {
    if (!token) return;
    
    setDownloading(true);
    try {
      const endpoint = isHouston ? "/api/houston/generate-appeal" : "/api/generate-appeal";
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
      a.download = isHouston 
        ? `protest-package-${property?.pin}.pdf`
        : `appeal-package-${property?.pin}.pdf`;
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
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="text-green-600 font-medium hover:underline">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const overAssessedPct = property.currentAssessment > 0 
    ? Math.round((property.reduction / property.currentAssessment) * 100) 
    : 0;

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
        {/* Success Banner */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isHouston ? "Your Protest Package is Ready!" : "Your Appeal Package is Ready!"}
          </h1>
          <p className="text-gray-600">
            {isHouston 
              ? "Everything you need to protest your property tax with Harris County"
              : "Everything you need to appeal your property tax assessment"
            }
          </p>
        </div>

        {/* Property Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{property.address}</h2>
              <p className="text-gray-500">
                {isHouston 
                  ? `${property.city}, TX · Harris County`
                  : `${property.city}, IL ${property.zip} · ${property.township} Township`
                }
              </p>
              <p className="text-sm text-gray-400 font-mono">
                {isHouston ? `Account: ${property.pin}` : `PIN: ${property.pin}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">${property.savings.toLocaleString()}</div>
              <div className="text-sm text-gray-500">estimated annual savings</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="text-sm text-gray-500">{isHouston ? "Current Appraised" : "Current Assessment"}</div>
              <div className="text-lg font-semibold text-red-600">${property.currentAssessment.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{isHouston ? "Fair Value" : "Fair Assessment"}</div>
              <div className="text-lg font-semibold text-green-600">${property.fairAssessment.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{isHouston ? "Over-Appraised By" : "Over-Assessed By"}</div>
              <div className="text-lg font-semibold text-amber-600">{overAssessedPct}%</div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isHouston ? "Download Your Protest Package" : "Download Your Appeal Package"}
          </h3>
          <p className="text-gray-600 mb-4">
            {isHouston 
              ? "Your complete protest package includes comparable properties, appraisal analysis, hearing script, and step-by-step filing instructions."
              : "Your complete appeal package includes comparable properties, assessment analysis, and step-by-step filing instructions."
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

          {email && (
            <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              We also sent a copy to {email}
            </p>
          )}
        </div>

        {/* Comparable Properties Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparable Properties</h3>
          <p className="text-gray-600 mb-4">These similar properties are {isHouston ? "appraised" : "assessed"} at lower values than yours:</p>
          
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
                        {isHouston ? `Acct: ${comp.pin || (comp as any).acct}` : comp.pin}
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 text-gray-600">{comp.sqft.toLocaleString()}</td>
                    <td className="text-right py-3 px-2 text-green-600 font-medium">${comp.perSqft.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">Your property: ${property.perSqft.toFixed(2)}/sqft</p>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Next</h3>
          
          {isHouston ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</div>
                <div>
                  <div className="font-medium text-gray-900">Wait for your appraisal notice</div>
                  <p className="text-sm text-gray-600">HCAD mails notices in late March/early April. Your protest package is ready to go once you receive it.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</div>
                <div>
                  <div className="font-medium text-gray-900">File your protest via iFile</div>
                  <p className="text-sm text-gray-600">Go to hcad.org and file using &quot;Unequal Appraisal&quot;. Upload this PDF as evidence.</p>
                  <a 
                    href="https://hcad.org/hcad-online-services/ifile-protest/"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline mt-1"
                  >
                    HCAD iFile Protest
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">3</div>
                <div>
                  <div className="font-medium text-gray-900">Check for an iSettle offer</div>
                  <p className="text-sm text-gray-600">HCAD may send a settlement offer. If it&apos;s fair, accept it. If not, proceed to your ARB hearing.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">4</div>
                <div>
                  <div className="font-medium text-gray-900">Attend your ARB hearing (if needed)</div>
                  <p className="text-sm text-gray-600">Bring this PDF and use the hearing script included in your package. Most protests are resolved before this step.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</div>
                <div>
                  <div className="font-medium text-gray-900">Review your appeal package</div>
                  <p className="text-sm text-gray-600">Make sure the comparable properties match your home type.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</div>
                <div>
                  <div className="font-medium text-gray-900">File your appeal online</div>
                  <p className="text-sm text-gray-600">Go to the Cook County Board of Review and file as a guest using &quot;Property Over-Assessed&quot;.</p>
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
                  <div className="font-medium text-gray-900">Upload this PDF as evidence</div>
                  <p className="text-sm text-gray-600">On the evidence upload page, select &quot;BOR Appraisal&quot; and upload this file.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">4</div>
                <div>
                  <div className="font-medium text-gray-900">Wait for your decision</div>
                  <p className="text-sm text-gray-600">You&apos;ll receive a decision by mail within 90 days after the filing period closes.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Support */}
        <div className="text-center text-gray-500 text-sm">
          <p>Questions? Contact us at <a href="mailto:hello@getovertaxed.com" className="text-green-600 hover:underline">hello@getovertaxed.com</a></p>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your appeal package...</p>
        </div>
      </div>
    }>
      <SuccessPage />
    </Suspense>
  );
}
