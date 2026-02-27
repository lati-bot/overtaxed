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
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error" | "cooldown">("idle");
  const [isHouston, setIsHouston] = useState(false);
  const [isDallas, setIsDallas] = useState(false);
  const [isAustin, setIsAustin] = useState(false);
  const [isCollin, setIsCollin] = useState(false);
  const [isTarrant, setIsTarrant] = useState(false);
  const [isDenton, setIsDenton] = useState(false);
  const [isWilliamson, setIsWilliamson] = useState(false);
  const [isFortBend, setIsFortBend] = useState(false);
  const [isBexar, setIsBexar] = useState(false);
  const [isRockwall, setIsRockwall] = useState(false);
  const isTexas = isHouston || isDallas || isAustin || isCollin || isTarrant || isDenton || isWilliamson || isFortBend || isRockwall || isBexar;

  // Detect jurisdiction from token or session to avoid waterfall requests
  function detectJurisdiction(accessToken: string | null): "cook" | "houston" | "dallas" | "austin" | "collin" | "tarrant" | "denton" | "williamson" | "fortbend" | "rockwall" | "bexar" | null {
    if (!accessToken) return null;
    try {
      const [encoded] = accessToken.split(".");
      if (!encoded) return null;
      const decoded = Buffer.from(encoded, "base64url").toString();
      if (decoded.startsWith("houston:")) return "houston";
      if (decoded.startsWith("dallas:")) return "dallas";
      if (decoded.startsWith("austin:")) return "austin";
      if (decoded.startsWith("collin:")) return "collin";
      if (decoded.startsWith("tarrant:")) return "tarrant";
      if (decoded.startsWith("denton:")) return "denton";
      if (decoded.startsWith("williamson:")) return "williamson";
      if (decoded.startsWith("fortbend:")) return "fortbend";
      if (decoded.startsWith("bexar:")) return "bexar";
      if (decoded.startsWith("rockwall:")) return "rockwall";
      return "cook";
    } catch {
      return null;
    }
  }

  function mapTexasProperty(p: any, jurisdiction: "houston" | "dallas" | "austin" | "collin" | "tarrant" | "denton"): PropertyData {
    return {
      pin: p.acct,
      address: p.address,
      city: p.city || (jurisdiction === "denton" ? "DENTON" : jurisdiction === "tarrant" ? "FORT WORTH" : jurisdiction === "collin" ? "PLANO" : jurisdiction === "austin" ? "AUSTIN" : jurisdiction === "dallas" ? "DALLAS" : "HOUSTON"),
      zip: p.zipcode || "",
      township: "",
      sqft: p.sqft || 0,
      beds: p.beds || 0,
      yearBuilt: p.yearBuilt || 0,
      currentAssessment: p.currentAssessment,
      fairAssessment: p.fairAssessment,
      reduction: p.potentialReduction || 0,
      savings: p.estimatedSavings || 0,
      perSqft: p.perSqft || 0,
      fairPerSqft: p.fairPerSqft || 0,
      comps: (p.comps || []).map((c: any) => ({
        pin: c.acct || "",
        address: c.address || "",
        sqft: c.sqft || 0,
        beds: c.beds || 0,
        year: c.yearBuilt || 0,
        perSqft: c.perSqft || (c.assessedVal && c.sqft ? Math.round((c.assessedVal / c.sqft) * 100) / 100 : 0),
      })),
    };
  }

  async function tryEndpoint(endpoint: string, sessionId: string | null, accessToken: string | null): Promise<{ ok: boolean; data?: any; error?: string }> {
    const url = sessionId
      ? `${endpoint}?session_id=${sessionId}`
      : `${endpoint}?token=${accessToken}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) return { ok: true, data };
      return { ok: false, error: data.error || "Lookup failed" };
    } catch {
      return { ok: false, error: "Request failed" };
    }
  }

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
        // Detect jurisdiction from token, URL param, or fall back to Cook County
        const urlJurisdiction = searchParams.get("jurisdiction");
        const detected = detectJurisdiction(accessToken) || urlJurisdiction;

        // Map jurisdiction to endpoint
        const jurisdictionEndpoints: Record<string, string> = {
          cook: "/api/generate-appeal",
          houston: "/api/houston/generate-appeal",
          dallas: "/api/dallas/generate-appeal",
          austin: "/api/austin/generate-appeal",
          collin: "/api/collin/generate-appeal",
          tarrant: "/api/tarrant/generate-appeal",
          denton: "/api/denton/generate-appeal",
          williamson: "/api/williamson/generate-appeal",
          fortbend: "/api/fortbend/generate-appeal",
          bexar: "/api/bexar/generate-appeal",
          rockwall: "/api/rockwall/generate-appeal",
        };

        // If we detected a jurisdiction, call that endpoint directly
        // If not detected, fall back to Cook County (legacy PINs)
        const targetJurisdiction = detected || "cook";
        const endpoint = jurisdictionEndpoints[targetJurisdiction];

        const result = await tryEndpoint(endpoint, sessionId, accessToken);
        if (result.ok && result.data) {
          const txJurisdictions = ["houston", "dallas", "austin", "collin", "tarrant", "denton", "williamson", "fortbend", "bexar", "rockwall"] as const;
          if (txJurisdictions.includes(targetJurisdiction as any)) {
            setProperty(mapTexasProperty(result.data.property, targetJurisdiction as any));
            if (targetJurisdiction === "houston") setIsHouston(true);
            else if (targetJurisdiction === "dallas") setIsDallas(true);
            else if (targetJurisdiction === "austin") setIsAustin(true);
            else if (targetJurisdiction === "collin") setIsCollin(true);
            else if (targetJurisdiction === "tarrant") setIsTarrant(true);
            else if (targetJurisdiction === "denton") setIsDenton(true);
            else if (targetJurisdiction === "williamson") setIsWilliamson(true);
            else if (targetJurisdiction === "fortbend") setIsFortBend(true);
            else if (targetJurisdiction === "bexar") setIsBexar(true);
            else if (targetJurisdiction === "rockwall") setIsRockwall(true);
          } else {
            setProperty(result.data.property);
          }
          setToken(result.data.token);
          setEmail(result.data.email || null);
        } else {
          setError(result.error || "Failed to load appeal package");
        }
      } catch {
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
      const endpoint = isBexar ? "/api/bexar/generate-appeal" : isRockwall ? "/api/rockwall/generate-appeal" : isFortBend ? "/api/fortbend/generate-appeal" : isWilliamson ? "/api/williamson/generate-appeal" : isDenton ? "/api/denton/generate-appeal" : isTarrant ? "/api/tarrant/generate-appeal" : isCollin ? "/api/collin/generate-appeal" : isAustin ? "/api/austin/generate-appeal" : isDallas ? "/api/dallas/generate-appeal" : isHouston ? "/api/houston/generate-appeal" : "/api/generate-appeal";
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
      a.download = isTexas
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

  const handleResendEmail = async () => {
    if (!token || resending) return;
    setResending(true);
    setResendStatus("idle");
    try {
      const res = await fetch("/api/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.status === 429) {
        setResendStatus("cooldown");
      } else if (res.ok) {
        setResendStatus("success");
      } else {
        setResendStatus("error");
      }
    } catch {
      setResendStatus("error");
    } finally {
      setResending(false);
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
    // Determine user-friendly message based on error type
    const isSessionError = error.includes("Not a") || error.includes("Session") || error.includes("Payment") || error.includes("not found") || error.includes("not completed");
    const friendlyTitle = isSessionError ? "We couldn't load your appeal package" : "Something went wrong";
    const friendlyMessage = isSessionError
      ? "This checkout link may have expired or already been used. Check your email for a direct link to your package, or contact us for help."
      : error;

    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{friendlyTitle}</h1>
          <p className="text-gray-600 mb-6">{friendlyMessage}</p>
          <div className="space-y-3">
            <a href="mailto:hello@getovertaxed.com" className="block text-[#1a6b5a] font-medium hover:underline">
              Contact support: hello@getovertaxed.com
            </a>
            <Link href="/" className="block text-gray-500 hover:underline">
              Return to homepage
            </Link>
          </div>
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
            {isTexas ? "Your Protest Package is Ready!" : "Your Appeal Package is Ready!"}
          </h1>
          <p className="text-gray-600">
            {isBexar
              ? "Everything you need to protest your property tax with Bexar County"
              : isRockwall
              ? "Everything you need to protest your property tax with Rockwall County"
              : isFortBend
              ? "Everything you need to protest your property tax with Fort Bend County"
              : isWilliamson
              ? "Everything you need to protest your property tax with Williamson County"
              : isDenton
              ? "Everything you need to protest your property tax with Denton County"
              : isTarrant
              ? "Everything you need to protest your property tax with Tarrant County"
              : isCollin
              ? "Everything you need to protest your property tax with Collin County"
              : isAustin
              ? "Everything you need to protest your property tax with Travis County"
              : isDallas
              ? "Everything you need to protest your property tax with Dallas County"
              : isTexas
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
                {isBexar
                  ? `${property.city}, TX · Bexar County`
                  : isRockwall
                  ? `${property.city}, TX · Rockwall County`
                  : isFortBend
                  ? `${property.city}, TX · Fort Bend County`
                  : isWilliamson
                  ? `${property.city}, TX · Williamson County`
                  : isDenton
                  ? `${property.city}, TX · Denton County`
                  : isTarrant
                  ? `${property.city}, TX · Tarrant County`
                  : isCollin
                  ? `${property.city}, TX · Collin County`
                  : isAustin
                  ? `${property.city}, TX · Travis County`
                  : isDallas
                  ? `${property.city}, TX · Dallas County`
                  : isTexas
                  ? `${property.city}, TX · Harris County`
                  : `${property.city}, IL ${property.zip} · ${property.township} Township`
                }
              </p>
              <p className="text-sm text-gray-400 font-mono">
                {isTexas ? `Account: ${property.pin}` : `PIN: ${property.pin}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">${property.savings.toLocaleString()}</div>
              <div className="text-sm text-gray-500">estimated annual savings</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="text-sm text-gray-500">{isTexas ? "Current Appraised" : "Current Assessment"}</div>
              <div className="text-lg font-semibold text-red-600">${property.currentAssessment.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{isTexas ? "Fair Value" : "Fair Assessment"}</div>
              <div className="text-lg font-semibold text-green-600">${property.fairAssessment.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{isTexas ? "Over-Appraised By" : "Over-Assessed By"}</div>
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
            {isTexas 
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
            <div className="mt-4">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                We also sent a copy to {email}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleResendEmail}
                  disabled={resending || resendStatus === "success"}
                  className="text-sm text-[#1a6b5a] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                >
                  {resending ? (
                    <>
                      <div className="w-3 h-3 border-2 border-gray-300 border-t-[#1a6b5a] rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : resendStatus === "success" ? (
                    <>
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Email sent!
                    </>
                  ) : (
                    "Didn't get your email? Resend it"
                  )}
                </button>
                {resendStatus === "cooldown" && (
                  <span className="text-xs text-amber-600">Please wait a minute before trying again</span>
                )}
                {resendStatus === "error" && (
                  <span className="text-xs text-red-500">Failed to send — try again or contact support</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Comparable Properties Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparable Properties</h3>
          <p className="text-gray-600 mb-4">These similar properties are {isTexas ? "appraised" : "assessed"} at lower values than yours:</p>
          
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
                        {isTexas ? `Acct: ${comp.pin || (comp as any).acct}` : comp.pin}
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
          
          {isTexas ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">1</div>
                <div>
                  <div className="font-medium text-gray-900">Wait for your appraisal notice</div>
                  <p className="text-sm text-gray-600">
                    {isBexar
                      ? "BCAD mails notices in April. Your protest package is ready to go once you receive it."
                      : isRockwall
                      ? "RCAD mails notices in late March/early April. Your protest package is ready to go once you receive it."
                      : isFortBend
                      ? "FBCAD mails notices in late March/early April. Your protest package is ready to go once you receive it."
                      : isWilliamson
                      ? "WCAD mails notices in late March/early April. Your protest package is ready to go once you receive it."
                      : isDenton
                      ? "DCAD mails notices in mid-April. Your protest package is ready to go once you receive it."
                      : isTarrant
                      ? "TAD mails notices in late March/early April. Your protest package is ready to go once you receive it."
                      : isCollin
                      ? "CCAD mails notices in mid-April. Your protest package is ready to go once you receive it."
                      : isAustin
                      ? "TCAD mails notices in late March/early April. Your protest package is ready to go once you receive it."
                      : isDallas 
                      ? "DCAD mails notices in late March/early April. Your protest package is ready to go once you receive it."
                      : "HCAD mails notices in late March/early April. Your protest package is ready to go once you receive it."
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">2</div>
                <div>
                  <div className="font-medium text-gray-900">
                    {isBexar ? "File your protest via BCAD Online" : isRockwall ? "File your protest via RCAD" : isFortBend ? "File your protest via FBCAD" : isWilliamson ? "File your protest via WCAD" : isDenton ? "File your protest via DCAD E-File" : isTarrant ? "File your protest via TAD.org" : isCollin ? "File your protest via CCAD Online Portal" : isAustin ? "File your protest via TCAD Portal" : isDallas ? "File your protest via DCAD uFile" : "File your protest via iFile"}
                  </div>
                  <p className="text-sm text-gray-600">
                    {isBexar
                      ? 'Go to bcadonline.org, log in with your account and PIN, select "Unequal Appraisal", and upload this PDF as evidence.'
                      : isRockwall
                      ? 'Go to rockwallcad.com, click "Online Protest", log in or create an account, select "Unequal Appraisal", and upload this PDF as evidence.'
                      : isFortBend
                      ? 'Go to fbcad.org, click "Online Protest", log in or create an account, select "Unequal Appraisal", and upload this PDF as evidence.'
                      : isWilliamson
                      ? 'Go to wcad.org, click "Online Protest", log in or create an account, select "Unequal Appraisal", and upload this PDF as evidence.'
                      : isDenton
                      ? 'Go to appeals.dentoncad.com, create an account or log in, file your protest online, select "Unequal Appraisal", and upload this PDF as evidence.'
                      : isTarrant
                      ? 'Go to tad.org, log in or create an account, file your protest online, select "Unequal Appraisal", and upload this PDF as evidence.'
                      : isCollin
                      ? 'Go to onlineportal.collincad.org, log in or create an account, select "Unequal Appraisal", and upload this PDF as evidence.'
                      : isAustin
                      ? 'Go to traviscad.org/portal, set up your account using your property owner ID and PIN from your appraisal notice, select "Unequal Appraisal", and upload this PDF as evidence.'
                      : isDallas
                      ? 'Go to dallascad.org and file using "Unequal Appraisal". Upload this PDF as evidence.'
                      : 'Go to hcad.org and file using "Unequal Appraisal". Upload this PDF as evidence.'
                    }
                  </p>
                  <a 
                    href={isBexar ? "https://bcadonline.org" : isRockwall ? "https://www.rockwallcad.com" : isFortBend ? "https://www.fbcad.org" : isWilliamson ? "https://www.wcad.org" : isDenton ? "https://appeals.dentoncad.com" : isTarrant ? "https://www.tad.org/login" : isCollin ? "https://onlineportal.collincad.org" : isAustin ? "https://www.traviscad.org/portal" : isDallas ? "https://www.dallascad.org" : "https://hcad.org/hcad-online-services/ifile-protest/"}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline mt-1"
                  >
                    {isBexar ? "BCAD Online Protest" : isRockwall ? "RCAD Online Protest" : isFortBend ? "FBCAD Online Protest" : isWilliamson ? "WCAD Online Protest" : isDenton ? "DCAD E-File Protest" : isTarrant ? "TAD Online Protest" : isCollin ? "CCAD Online Portal" : isAustin ? "TCAD Portal Protest" : isDallas ? "DCAD uFile Protest" : "HCAD iFile Protest"}
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
                    {isBexar
                      ? "BCAD may send a settlement offer. If it's fair, accept it. If not, proceed to your ARB hearing."
                      : isRockwall
                      ? "RCAD may send a settlement offer. If it's fair, accept it. If not, proceed to your ARB hearing."
                      : isFortBend
                      ? "FBCAD may send a settlement offer. If it's fair, accept it. If not, proceed to your ARB hearing."
                      : isWilliamson
                      ? "WCAD may send a settlement offer. If it's fair, accept it. If not, proceed to your ARB hearing."
                      : isDenton
                      ? "DCAD may offer to settle through their E-File system. If it's fair, accept it. If not, proceed to your ARB hearing."
                      : isTarrant
                      ? "TAD may offer to settle through their online value negotiation tool. If it's fair, accept it. If not, proceed to your ARB hearing."
                      : isCollin
                      ? "CCAD may send a settlement offer. If it's fair, accept it. If not, proceed to your ARB hearing."
                      : isAustin
                      ? "TCAD may send a settlement offer. If it's fair, accept it. If not, proceed to your ARB hearing."
                      : isDallas
                      ? "DCAD may send a settlement offer. If it's fair, accept it. If not, proceed to your ARB hearing."
                      : "HCAD may send a settlement offer. If it's fair, accept it. If not, proceed to your ARB hearing."
                    }
                  </p>
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
