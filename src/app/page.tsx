"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FAQAccordion from "@/components/FAQAccordion";

interface AutocompleteResult {
  pin?: string;
  acct?: string;
  address: string;
  city: string;
  zip?: string;
  state?: string;
  township?: string;
  neighborhood?: string;
  display?: string;
  jurisdiction: "cook_county_il" | "harris_county_tx" | "dallas_county_tx" | "travis_county_tx" | "collin_county_tx" | "tarrant_county_tx" | "denton_county_tx" | "williamson_county_tx" | "fortbend_county_tx" | "rockwall_county_tx" | "bexar_county_tx";
}

// [MUST FIX #1] Uniform county labels — abbreviated, non-redundant with city line
const JURISDICTION_LABELS: Record<string, string> = {
  harris_county_tx: "Harris Co.",
  dallas_county_tx: "Dallas Co.",
  travis_county_tx: "Travis Co.",
  collin_county_tx: "Collin Co.",
  tarrant_county_tx: "Tarrant Co.",
  denton_county_tx: "Denton Co.",
  williamson_county_tx: "Williamson Co.",
  fortbend_county_tx: "Fort Bend Co.",
  rockwall_county_tx: "Rockwall Co.",
  bexar_county_tx: "Bexar Co.",
  cook_county_il: "Cook Co.",
};

// [MUST FIX #1] Single uniform badge style — replaces rainbow
const JURISDICTION_BADGE = "bg-[#eef4f2] text-[#1a6b5a] text-[11px] font-medium rounded-md px-2 py-0.5";

const JURISDICTION_ROUTES: Record<string, { param: string; field: string }> = {
  harris_county_tx: { param: "houston", field: "acct" },
  dallas_county_tx: { param: "dallas", field: "acct" },
  travis_county_tx: { param: "austin", field: "acct" },
  collin_county_tx: { param: "collin", field: "acct" },
  tarrant_county_tx: { param: "tarrant", field: "acct" },
  denton_county_tx: { param: "denton", field: "acct" },
  williamson_county_tx: { param: "williamson", field: "acct" },
  fortbend_county_tx: { param: "fortbend", field: "acct" },
  rockwall_county_tx: { param: "rockwall", field: "acct" },
  bexar_county_tx: { param: "bexar", field: "acct" },
  cook_county_il: { param: "", field: "pin" },
};

// Rotating placeholder addresses from covered areas
const PLACEHOLDER_ADDRESSES = [
  "Try any address in Oak Lawn, Dallas",
  "Try any address in The Heights, Houston",
  "Try any address in Hyde Park, Austin",
  "Try any address in Frisco, north of Dallas",
  "Try any address in Sugar Land, Houston area",
  "Try any address in Naperville, west of Chicago",
  "Try any address in Arlington, Fort Worth area",
  "Try any address in Cedar Park, Austin area",
];

// [MUST FIX #2] Title case helper — converts "4521 OAKDALE ST" → "4521 Oakdale St"
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => {
      if (/^\d/.test(word)) return word.toUpperCase(); // keep numbers + suffixes like "4521"
      if (["st", "nd", "rd", "th", "dr", "ave", "blvd", "ln", "ct", "pl", "pkwy", "cir", "sq", "ter", "trl", "way"].includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (word.length <= 2 && /^[a-z]+$/.test(word)) return word.toUpperCase(); // N, S, E, W, NE, NW, etc.
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

// Shared search component used in hero and final CTA
function SearchBar({
  address, setAddress, loading, suggestions, showSuggestions, setShowSuggestions,
  inputRef, suggestionsRef, handleInputChange, handleSelectSuggestion, handleSearch,
  noMatch, notifyEmail, setNotifyEmail, notifySubmitted, notifyLoading, handleNotifySubmit,
  id, placeholder, dark,
}: any) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSearch}>
        {/* [SHOULD FIX #5] rounded-2xl for cards */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-black/[0.06]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              {/* [SHOULD FIX #5] rounded-xl for inputs */}
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder || "Enter your home address..."}
                className="w-full h-14 px-5 rounded-xl text-base bg-[#f7f6f3] border border-black/[0.06] text-[#1a1a1a] placeholder-[#aaa] focus:border-[#1a6b5a]/30 focus:outline-none focus:ring-2 focus:ring-[#1a6b5a]/10 transition-all"
                value={address}
                onChange={handleInputChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                disabled={loading}
                autoComplete="off"
                id={id}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden bg-white border border-black/[0.08]"
                >
                  {suggestions.map((suggestion: AutocompleteResult, index: number) => (
                    <button
                      key={suggestion.pin || suggestion.acct || index}
                      type="button"
                      className={`w-full px-5 py-3.5 text-left transition-colors hover:bg-[#f7f6f3] ${index !== suggestions.length - 1 ? "border-b border-black/[0.04]" : ""}`}
                      onMouseDown={(e: React.MouseEvent) => { e.preventDefault(); handleSelectSuggestion(suggestion); }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-[#1a1a1a]">{toTitleCase(suggestion.address)}</div>
                        <span className={`${JURISDICTION_BADGE} whitespace-nowrap flex-shrink-0`}>
                          {JURISDICTION_LABELS[suggestion.jurisdiction] || suggestion.jurisdiction}
                        </span>
                      </div>
                      <div className="text-sm mt-0.5 text-[#777]">
                        {toTitleCase(suggestion.city)}, {suggestion.jurisdiction === "cook_county_il" ? `IL ${(suggestion.zip || "").split('-')[0]}` : "TX"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {/* Inline "not found" email capture in dropdown area */}
              {noMatch && showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 bg-white border border-black/[0.08] p-5"
                >
                  {notifySubmitted ? (
                    <div className="text-center py-2">
                      <div className="text-[#1a6b5a] mb-2">
                        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="font-medium text-[#1a1a1a] text-sm">Got it! We&apos;ll email you when we add your area.</p>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-[#1a1a1a] text-sm">
                        We don&apos;t cover &ldquo;{address.trim().length > 30 ? address.trim().slice(0, 30) + "…" : address.trim()}&rdquo; yet
                      </p>
                      <p className="text-xs text-[#999] mt-1 mb-3">Want us to notify you when we expand?</p>
                      <div className="flex gap-2" onMouseDown={(e: React.MouseEvent) => e.preventDefault()}>
                        <input
                          type="email"
                          placeholder="you@email.com"
                          value={notifyEmail}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotifyEmail(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); handleNotifySubmit(e); } }}
                          className="flex-1 h-10 px-3 rounded-lg text-sm bg-[#f7f6f3] border border-black/[0.06] text-[#1a1a1a] placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#1a6b5a]/10"
                        />
                        <button
                          type="button"
                          onClick={handleNotifySubmit}
                          disabled={notifyLoading || !notifyEmail.includes("@")}
                          className="h-10 px-4 rounded-lg text-sm font-medium bg-[#1a6b5a] text-white hover:bg-[#155a4c] transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {notifyLoading ? "..." : "Notify Me"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* [SHOULD FIX #5] rounded-xl for buttons */}
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="h-14 px-8 rounded-xl font-medium text-base transition-all disabled:opacity-40 bg-[#1a6b5a] text-white hover:bg-[#155a4c] shadow-lg shadow-[#1a6b5a]/20 whitespace-nowrap"
            >
              {loading ? "..." : "Check My Address — Free"}
            </button>
          </div>
          {/* Microcopy below CTA */}
          <p className="text-[12px] text-[#999] mt-3 flex items-center justify-center gap-1.5">
            Takes 10 seconds · No signup · Your value can&apos;t go up from appealing
          </p>
        </div>
      </form>

    </div>
  );
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const interval = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDER_ADDRESSES.length), 4000);
    return () => clearInterval(interval);
  }, []);

  // ── Autocomplete ──
  useEffect(() => {
    if (address.length < 3 || selectedPin) {
      setSuggestions([]);
      setNoMatch(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const [cookRes, houstonRes, dallasRes, austinRes, collinRes, tarrantRes, dentonRes, williamsonRes, fortbendRes, rockwallRes, bexarRes] = await Promise.all([
          fetch(`/api/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/houston/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/dallas/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/austin/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/collin/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/tarrant/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/denton/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/williamson/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/fortbend/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/rockwall/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/bexar/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
        ]);
        const mapResults = (res: any, jurisdiction: AutocompleteResult["jurisdiction"]) =>
          (res.results || []).map((r: any) => ({ ...r, jurisdiction, display: r.display || r.address }));
        const combined = [
          ...mapResults(cookRes, "cook_county_il"),
          ...mapResults(houstonRes, "harris_county_tx"),
          ...mapResults(dallasRes, "dallas_county_tx"),
          ...mapResults(austinRes, "travis_county_tx"),
          ...mapResults(collinRes, "collin_county_tx"),
          ...mapResults(tarrantRes, "tarrant_county_tx"),
          ...mapResults(dentonRes, "denton_county_tx"),
          ...mapResults(williamsonRes, "williamson_county_tx"),
          ...mapResults(fortbendRes, "fortbend_county_tx"),
          ...mapResults(rockwallRes, "rockwall_county_tx"),
          ...mapResults(bexarRes, "bexar_county_tx"),
        ].slice(0, 8);
        setSuggestions(combined);
        setShowSuggestions(true);
        const isNoMatch = combined.length === 0 && address.trim().length >= 5;
        setNoMatch(isNoMatch);
        if (isNoMatch) setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [address, selectedPin]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (s: AutocompleteResult) => {
    const fullAddress = s.display || s.address;
    const pin = s.pin || s.acct || null;
    setAddress(fullAddress);
    setSelectedPin(pin);
    setSelectedJurisdiction(s.jurisdiction);
    setSuggestions([]);
    setShowSuggestions(false);
    setNoMatch(false);
    if (pin && s.jurisdiction) {
      const route = JURISDICTION_ROUTES[s.jurisdiction];
      if (route) {
        router.push(route.param ? `/results?acct=${pin}&jurisdiction=${route.param}` : `/results?pin=${pin}`);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setSelectedPin(null);
    setSelectedJurisdiction(null);
    setNoMatch(false);
    setNotifySubmitted(false);
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    setNotifyLoading(true);
    try {
      await fetch("/api/notify-coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notifyEmail, address: address.trim() }),
      });
    } catch { /* best effort */ }
    setNotifySubmitted(true);
    setNotifyLoading(false);
  };

  const routeToResults = (pin: string | null | undefined, jurisdiction: string) => {
    const route = JURISDICTION_ROUTES[jurisdiction];
    if (!route || !pin) return false;
    router.push(route.param ? `/results?acct=${pin}&jurisdiction=${route.param}` : `/results?pin=${pin}`);
    return true;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);

    if (!selectedPin && suggestions.length > 0) {
      const best = suggestions[0];
      if (routeToResults(best.pin || best.acct, best.jurisdiction)) return;
    }

    if (!selectedPin) {
      try {
        const cleanedAddress = address.trim().replace(/,?\s*(IL|TX|ILLINOIS|TEXAS)\s*\d{0,5}\s*$/i, "").replace(/,?\s*$/, "").trim();
        const q = encodeURIComponent(cleanedAddress);
        const [cookRes, houstonRes, dallasRes, austinRes, collinRes, tarrantRes, dentonRes, williamsonRes, fortbendRes, rockwallRes, bexarRes] = await Promise.all([
          fetch(`/api/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/houston/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/dallas/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/austin/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/collin/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/tarrant/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/denton/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/williamson/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/fortbend/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/rockwall/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/bexar/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
        ]);
        const markets = [
          { res: bexarRes, j: "bexar_county_tx" },
          { res: fortbendRes, j: "fortbend_county_tx" }, { res: rockwallRes, j: "rockwall_county_tx" },
          { res: dentonRes, j: "denton_county_tx" },
          { res: williamsonRes, j: "williamson_county_tx" }, { res: tarrantRes, j: "tarrant_county_tx" },
          { res: collinRes, j: "collin_county_tx" }, { res: austinRes, j: "austin_county_tx" },
          { res: dallasRes, j: "dallas_county_tx" }, { res: houstonRes, j: "harris_county_tx" },
          { res: cookRes, j: "cook_county_il" },
        ];
        for (const m of markets) {
          const first = (m.res.results || [])[0];
          const id = first?.acct || first?.pin;
          if (id && routeToResults(id, m.j)) return;
        }
        setNoMatch(true);
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }

    if (selectedPin && selectedJurisdiction) {
      routeToResults(selectedPin, selectedJurisdiction);
    } else {
      router.push(`/results?address=${encodeURIComponent(address.trim())}`);
    }
  };

  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const searchBarProps = {
    address, setAddress, loading, suggestions, showSuggestions, setShowSuggestions,
    inputRef, suggestionsRef, handleInputChange, handleSelectSuggestion, handleSearch,
    noMatch, notifyEmail, setNotifyEmail, notifySubmitted, notifyLoading, handleNotifySubmit,
    placeholder: address ? undefined : PLACEHOLDER_ADDRESSES[placeholderIdx],
  };

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Overtaxed",
        "url": "https://getovertaxed.com",
        "logo": "https://getovertaxed.com/og-image.png",
        "description": "Property tax appeal packages for homeowners.",
      },
      {
        "@type": "Product",
        "name": "Property Tax Appeal Package",
        "description": "Complete filing package with comparable properties, professional evidence brief, and step-by-step filing instructions.",
        "brand": { "@type": "Organization", "name": "Overtaxed" },
        "offers": {
          "@type": "Offer",
          "price": "49.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://getovertaxed.com",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Do I need a lawyer to appeal?", "acceptedAnswer": { "@type": "Answer", "text": "No. Individual homeowners can file appeals themselves. We give you everything you need — comparable properties, evidence brief, and step-by-step instructions." } },
          { "@type": "Question", "name": "What if my appeal doesn't work?", "acceptedAnswer": { "@type": "Answer", "text": "There's no penalty for appealing. If your assessment isn't reduced, you've lost nothing but the filing time." } },
          { "@type": "Question", "name": "When can I file?", "acceptedAnswer": { "@type": "Answer", "text": "In Texas, protest after receiving your appraisal notice (usually late March). Deadline is May 15 or 30 days after your notice. In Cook County, IL, appeals open by township on a rotating schedule." } },
          { "@type": "Question", "name": "Why is this so much cheaper?", "acceptedAnswer": { "@type": "Answer", "text": "Attorneys charge a percentage of savings because they can. We automate the research that used to take hours. Same analysis, fraction of the cost." } },
          { "@type": "Question", "name": "What areas do you cover?", "acceptedAnswer": { "@type": "Answer", "text": "5M+ properties across DFW (Dallas, Tarrant, Collin, Denton), Houston (Harris, Fort Bend), San Antonio (Bexar), Austin (Travis, Williamson), Rockwall County, and Cook County, IL." } },
          { "@type": "Question", "name": "Can appealing my property taxes raise my value?", "acceptedAnswer": { "@type": "Answer", "text": "No. Your assessed value can only stay the same or go down as a result of an appeal. The taxing authority cannot raise your value because you filed. There is zero risk." } },
          { "@type": "Question", "name": "How much does the average homeowner save?", "acceptedAnswer": { "@type": "Answer", "text": "Most successful protests save between $500 and $1,500 per year depending on your property and local tax rate." } },
          { "@type": "Question", "name": "What is a uniformity argument?", "acceptedAnswer": { "@type": "Answer", "text": "State law requires that similar properties be assessed equally. If comparable homes are assessed lower than yours, you can argue your assessment should be reduced to match. This is one of the strongest arguments you can make." } },
          { "@type": "Question", "name": "Should I protest every year?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Property values and assessments change annually. Filing a protest keeps your assessment in check." } },
          { "@type": "Question", "name": "What is the difference between market value and assessed value?", "acceptedAnswer": { "@type": "Answer", "text": "Market value is what your home would sell for. Assessed value is what your county uses to calculate property taxes, which may be lower due to homestead caps or prior protests." } },
        ],
      },
    ],
  };

  if (!mounted) return <div className="min-h-screen bg-[#f7f6f3]" />;

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-[#1a1a1a]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#f7f6f3]/90 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl tracking-[-0.02em] font-medium text-[#1a1a1a] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-[#1a6b5a]" />
            overtaxed
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-[13px] text-[#666] tracking-wide">
              <button onClick={() => scrollToSection("how-it-works")} className="hover:text-[#1a1a1a] transition-colors">How it Works</button>
              <button onClick={() => scrollToSection("pricing")} className="hover:text-[#1a1a1a] transition-colors">Pricing</button>
              <button onClick={() => scrollToSection("faq")} className="hover:text-[#1a1a1a] transition-colors">FAQ</button>
            </div>
            {/* [SHOULD FIX #5] rounded-xl to match buttons, not rounded-full */}
            <button 
              onClick={() => scrollToSection("hero-search")}
              className="hidden sm:block px-5 py-2.5 rounded-xl text-[13px] font-medium bg-[#1a6b5a] text-white hover:bg-[#155a4c] transition-colors"
            >
              Check My Address
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — centered */}
      <section className="pt-16 sm:pt-24 pb-6 sm:pb-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-normal leading-[1.12] tracking-[-0.03em] text-[#1a1a1a]">
            Your neighbors pay less.<br />
            Here&apos;s the proof.
          </h1>
          <p className="mt-6 text-lg text-[#666] leading-relaxed max-w-xl mx-auto font-light">
            We compare your home to similar properties assessed lower — and build your complete appeal package for $49. Average savings: $1,136/year.
          </p>

          {/* [MUST FIX #3] Coverage — green dot removed, em-dash instead */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-[#999]">
            <span>DFW</span>
            <span className="text-[#ddd]">·</span>
            <span>Houston</span>
            <span className="text-[#ddd]">·</span>
            <span>Austin</span>
            <span className="text-[#ddd]">·</span>
            <span>Chicago metro</span>
            <span className="text-[#ccc]">— 10 counties</span>
          </div>

          {/* Search card */}
          <div className="mt-6" id="hero-search">
            <SearchBar {...searchBarProps} id="hero-input" />
          </div>

          {/* [SHOULD FIX #9] Social proof — "checked" not "lookups", bumped to 14px */}
          <div className="mt-5">
            <p className="text-[14px] text-[#888] font-normal">
              <span className="font-medium text-[#666]">48,000+</span> homeowners checked this tax season
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="border-t border-black/[0.06] pt-12 sm:pt-16">
            <div className="grid grid-cols-3 gap-8 sm:gap-16">
              {[
                { value: "$1,136/yr", label: "Average savings" },
                { value: "65%+", label: "Of Texas protests succeed" },
                { value: "$49", label: "Flat fee — keep 100%" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-5xl font-medium tracking-[-0.03em] text-[#1a1a1a]">{stat.value}</div>
                  <div className="mt-2 text-[11px] sm:text-[13px] tracking-[0.05em] uppercase text-[#999]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 sm:py-20 px-6 bg-[#f0ede7]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[22px] sm:text-[26px] font-normal leading-relaxed tracking-[-0.01em] text-[#1a1a1a]">
            &ldquo;I was paying $1,400 more than my neighbor for a smaller house. Overtaxed found 6 comps and I won my appeal in 3 weeks.&rdquo;
          </p>
          <p className="mt-4 text-[13px] text-[#999]">— Rachel M., Collin County, TX</p>
        </div>
      </section>

      {/* Objection Busters */}
      <section className="py-14 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">Zero risk</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-12">Common concerns, answered</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { q: "Can my value go up?", a: "No. By law, your assessed value can only stay the same or go down during a protest. Fewer than 0.01% of hearings result in any increase. Zero risk." },
              { q: "Is $49 really worth it?", a: "The average homeowner saves $1,136/year. That\u2019s a 23x return on $49. Typical firms charge 25\u201350% of your savings \u2014 that\u2019s $250\u2013500 per year." },
              { q: "Do I need to go to a hearing?", a: "97% of protests are resolved without a formal hearing. You submit evidence online or by mail. We give you everything you need to file from your couch." },
            ].map((card) => (
              <div key={card.q} className="bg-white rounded-2xl p-8 border border-black/[0.06]">
                <h3 className="text-lg font-medium mb-3 text-[#1a1a1a]">{card.q}</h3>
                <p className="text-[15px] leading-relaxed text-[#666] font-light">{card.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-14 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-12">Three steps to your appeal</h2>
          
          {/* [NICE #12] White card container for steps */}
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-black/[0.06]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-20 sm:divide-x sm:divide-black/[0.06]">
              {[
                { num: "01", title: "Enter your address", desc: "We pull your property data from public records automatically. Covers the DFW, Houston, and Austin metros plus Cook County, IL." },
                { num: "02", title: "We find your comps", desc: "Our system identifies similar properties assessed lower than yours — the foundation of your appeal." },
                { num: "03", title: "File your appeal", desc: "Download your complete appeal package and file it yourself. We show you exactly how, step by step." },
              ].map((step, i) => (
                <div key={step.num} className={i > 0 ? "sm:pl-10" : ""}>
                  {/* [SHOULD FIX #6] Step numbers bumped from #ccc to #aaa, 14px font-medium */}
                  <div className="border-t border-black/[0.06] pt-6 sm:border-t-0 sm:pt-0">
                    <div className="text-[14px] font-medium tracking-[0.15em] text-[#aaa] mb-4">{step.num}</div>
                    <h3 className="text-lg font-medium mb-3 text-[#1a1a1a]">{step.title}</h3>
                    <p className="text-[15px] leading-relaxed text-[#666] font-light">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-14 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-4">One price. No surprises.</h2>
          <p className="text-lg text-[#666] font-light mb-12">No percentage of savings. No hidden fees.</p>
          
          {/* [SHOULD FIX #5] rounded-2xl not rounded-3xl */}
          <div className="rounded-2xl p-8 sm:p-12 bg-white border border-black/[0.06] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
              <div>
                <div className="text-6xl sm:text-7xl font-normal tracking-[-0.03em] text-[#1a1a1a]">$49</div>
                <div className="mt-2 text-[15px] text-[#999]">One-time per property</div>
              </div>
              {/* [SHOULD FIX #5] rounded-xl for buttons */}
              <button 
                onClick={() => { const el = document.getElementById("footer-input"); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => el.focus(), 500); } }}
                className="h-14 px-8 rounded-xl font-medium text-base bg-[#1a6b5a] text-white hover:bg-[#155a4c] shadow-lg shadow-[#1a6b5a]/20 transition-colors"
              >
                See My Savings
              </button>
            </div>
            
            {/* [SHOULD FIX #4] Price comparison moved ABOVE bullet list */}
            <div className="border-t border-black/[0.06] pt-8 mb-8">
              <p className="text-[13px] text-[#999] tracking-[0.1em] uppercase mb-4">How we compare</p>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-semibold text-[#1a6b5a]">$49</div>
                  <div className="text-[12px] text-[#999] mt-1">Overtaxed</div>
                </div>
                <div className="text-[#ccc] text-base font-light">vs</div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-normal text-[#bbb] line-through">~$340</div>
                  <div className="text-[12px] text-[#999] mt-1">Typical attorney (25–30%)</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-black/[0.06] pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Complete filing package with 5+ comparable properties",
                  "Professional evidence brief ready to submit",
                  "Step-by-step filing instructions for your county",
                  "Delivered to your email instantly",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1a6b5a] mt-2 flex-shrink-0" />
                    <span className="text-[15px] text-[#444] font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price Comparison Table */}
      <section className="py-14 sm:py-20 px-6 bg-[#f0ede7]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">Compare</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-12">Keep more of your savings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 pr-4 text-[13px] text-[#999] font-medium tracking-wide"></th>
                  <th className="py-4 px-6 text-[15px] font-semibold text-white bg-[#1a6b5a] rounded-t-xl text-center">Overtaxed</th>
                  <th className="py-4 px-6 text-[15px] font-medium text-[#666] text-center">Typical Firm</th>
                  <th className="py-4 px-6 text-[15px] font-medium text-[#666] text-center">DIY Alone</th>
                </tr>
              </thead>
              <tbody className="text-[15px]">
                {[
                  ["Cost", "$49 once", "$250–500/yr", "Free"],
                  ["Evidence packet", "✓", "✓", "✗ You research"],
                  ["Time investment", "15 min", "None", "10–20 hours"],
                  ["You keep (on $1K savings)", "$951/yr", "$500–750/yr", "$1,000/yr"],
                  ["Over 5 years", "$4,951", "$2,500–3,750", "$5,000"],
                ].map(([label, ot, firm, diy], i) => (
                  <tr key={i} className="border-t border-black/[0.06]">
                    <td className="py-4 pr-4 text-[#666] font-light">{label}</td>
                    <td className={`py-4 px-6 text-center font-medium bg-[#1a6b5a]/5 ${i === 4 ? "text-[#1a6b5a] font-bold text-lg" : "text-[#1a1a1a]"}`}>{ot}</td>
                    <td className="py-4 px-6 text-center text-[#666] font-light">{firm}</td>
                    <td className="py-4 px-6 text-center text-[#666] font-light">{diy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-14 sm:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-12">Common questions</h2>
          
          <FAQAccordion items={[
            { q: "Do I need a lawyer to appeal?", a: "No. Individual homeowners can file appeals themselves. We give you everything you need — comparable properties, evidence brief, and step-by-step instructions." },
            { q: "What if my appeal doesn't work?", a: "There's no penalty for appealing. If your assessment isn't reduced, you've lost nothing but the filing time." },
            { q: "When can I file?", a: "In Texas, protest after receiving your appraisal notice (usually late March). Deadline is May 15 or 30 days after your notice. In Cook County, IL, appeals open by township on a rotating schedule." },
            { q: "Why is this so much cheaper?", a: "Attorneys charge a percentage of savings because they can. We automate the research that used to take hours. Same analysis, fraction of the cost." },
            { q: "What areas do you cover?", a: "5M+ properties across DFW (Dallas, Tarrant, Collin, Denton), Houston (Harris, Fort Bend), San Antonio (Bexar), Austin (Travis, Williamson), Rockwall County, and Cook County, IL. More coming." },
            { q: "Can appealing my property taxes raise my value?", a: "No. Your assessed value can only stay the same or go down as a result of an appeal. The taxing authority cannot raise your value because you filed. There is zero risk." },
            { q: "How much does the average homeowner save?", a: "Most successful protests save between $500 and $1,500 per year. In Harris County, the median DIY reduction is around $20,640 in assessed value. Your savings depend on your property and local tax rate." },
            { q: "What is a uniformity argument?", a: "State law requires that similar properties be assessed equally. If comparable homes in your area are assessed lower than yours, you can argue your assessment should be reduced to match — even if your market value is accurate. This is one of the strongest arguments you can make." },
            { q: "Should I protest every year?", a: "Yes. Property values and assessments change annually, and appraisal districts may raise your value each year. Filing a protest keeps your assessment in check and ensures you're not overpaying." },
            { q: "What's the difference between market value and assessed value?", a: "Market value is what your home would sell for on the open market. Assessed value is the value your county uses to calculate your property taxes. The assessed value may be lower due to homestead caps or prior protests." },
          ]} />
        </div>
      </section>

      {/* Footer CTA — dark teal */}
      <section className="py-20 sm:py-28 px-6 bg-[#0f2d26] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.02em] mb-4 text-white">Every year you don&apos;t protest costs you ~$1,136</h2>
          <p className="text-lg text-[#aaa] font-light mb-10">
            Check your address in 10 seconds. $49 if you want to appeal.
          </p>
          <SearchBar
            {...searchBarProps}
            inputRef={footerInputRef}
            id="footer-input"
            dark
          />
        </div>
      </section>

      {/* [SHOULD FIX #10] Footer — added Terms, Privacy, visible email for trust */}
      <footer className="py-10 px-6 border-t border-black/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[13px] text-[#999]">© 2026 Overtaxed</div>
          <div className="flex items-center gap-6 text-[13px] text-[#999]">
            <a href="/terms" className="hover:text-[#1a1a1a] transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-[#1a1a1a] transition-colors">Privacy</a>
            <a href="mailto:hello@getovertaxed.com" className="hover:text-[#1a1a1a] transition-colors">hello@getovertaxed.com</a>
          </div>
          <div className="text-[13px] text-[#999]">
            Dallas · Houston · Austin · Chicago
          </div>
        </div>
      </footer>
    </div>
  );
}
