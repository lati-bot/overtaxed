"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════
   OPTION C — Lavender/Purple CTA, Left-Aligned Hero
   Softer, approachable. Lavender warmth.
   ═══════════════════════════════════════════════ */

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
  jurisdiction: string;
}

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
  cook_county_il: "Cook Co.",
};

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
  cook_county_il: { param: "", field: "pin" },
};

const PLACEHOLDER_ADDRESSES = [
  "Try: 4521 Oak Lawn Ave, Dallas, TX",
  "Try: 1847 Maple Dr, Naperville, IL",
  "Try: 3210 Westheimer Rd, Houston, TX",
  "Try: 802 Barton Springs Rd, Austin, TX",
  "Try: 5100 Legacy Dr, Plano, TX",
];

function toTitleCase(str: string): string {
  return str.toLowerCase().split(" ").map(word => {
    if (/^\d/.test(word)) return word.toUpperCase();
    if (["st","nd","rd","th","dr","ave","blvd","ln","ct","pl","pkwy","cir","sq","ter","trl","way"].includes(word))
      return word.charAt(0).toUpperCase() + word.slice(1);
    if (word.length <= 2 && /^[a-z]+$/.test(word)) return word.toUpperCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(" ");
}

export default function OptionC() {
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
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const interval = setInterval(() => setPlaceholderIdx(i => (i + 1) % PLACEHOLDER_ADDRESSES.length), 4000);
    return () => clearInterval(interval);
  }, []);

  // Autocomplete
  useEffect(() => {
    if (address.length < 3 || selectedPin) { setSuggestions([]); setNoMatch(false); return; }
    const timer = setTimeout(async () => {
      try {
        const endpoints = ["","houston/","dallas/","austin/","collin/","tarrant/","denton/","williamson/","fortbend/","rockwall/"];
        const jurisdictions = ["cook_county_il","harris_county_tx","dallas_county_tx","travis_county_tx","collin_county_tx","tarrant_county_tx","denton_county_tx","williamson_county_tx","fortbend_county_tx","rockwall_county_tx"];
        const results = await Promise.all(
          endpoints.map(ep => fetch(`/api/${ep}autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })))
        );
        const combined = results.flatMap((res, i) =>
          (res.results || []).map((r: any) => ({ ...r, jurisdiction: jurisdictions[i], display: r.display || r.address }))
        ).slice(0, 8);
        setSuggestions(combined);
        setShowSuggestions(true);
        setNoMatch(combined.length === 0 && address.trim().length >= 5);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [address, selectedPin]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const routeToResults = (pin: string | null | undefined, jurisdiction: string) => {
    const route = JURISDICTION_ROUTES[jurisdiction];
    if (!route || !pin) return false;
    router.push(route.param ? `/results?acct=${pin}&jurisdiction=${route.param}` : `/results?pin=${pin}`);
    return true;
  };

  const handleSelectSuggestion = (s: AutocompleteResult) => {
    setAddress(s.display || s.address);
    setSelectedPin(s.pin || s.acct || null);
    setSelectedJurisdiction(s.jurisdiction);
    setSuggestions([]); setShowSuggestions(false); setNoMatch(false);
    const pin = s.pin || s.acct;
    if (pin && s.jurisdiction) routeToResults(pin, s.jurisdiction);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value); setSelectedPin(null); setSelectedJurisdiction(null); setNoMatch(false); setNotifySubmitted(false);
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    setNotifyLoading(true);
    try { await fetch("/api/notify-coverage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: notifyEmail, address: address.trim() }) }); } catch {}
    setNotifySubmitted(true); setNotifyLoading(false);
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
        const endpoints = ["","houston/","dallas/","austin/","collin/","tarrant/","denton/","williamson/","fortbend/","rockwall/"];
        const jurisdictions = ["cook_county_il","harris_county_tx","dallas_county_tx","travis_county_tx","collin_county_tx","tarrant_county_tx","denton_county_tx","williamson_county_tx","fortbend_county_tx","rockwall_county_tx"];
        const results = await Promise.all(
          endpoints.map(ep => fetch(`/api/${ep}autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })))
        );
        for (let i = 0; i < results.length; i++) {
          const first = (results[i].results || [])[0];
          const id = first?.acct || first?.pin;
          if (id && routeToResults(id, jurisdictions[i])) return;
        }
        setNoMatch(true); setLoading(false); return;
      } catch {}
    }
    if (selectedPin && selectedJurisdiction) routeToResults(selectedPin, selectedJurisdiction);
    else router.push(`/results?address=${encodeURIComponent(address.trim())}`);
  };

  const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // Lavender color tokens
  const lavender = "#b8a9d4";
  const lavenderHover = "#a898c4";
  const lavenderBg = "#f0ecf6";
  const lavenderLight = "#ece6f5";

  if (!mounted) return <div className="min-h-screen bg-[#f7f6f3]" />;

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-[#1a1a1a]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#f7f6f3]/90 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl tracking-[-0.02em] font-medium text-[#1a1a1a]">overtaxed</div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-[13px] text-[#666] tracking-wide">
              <button onClick={() => scrollToSection("how-it-works-c")} className="hover:text-[#1a1a1a] transition-colors">How it Works</button>
              <button onClick={() => scrollToSection("pricing-c")} className="hover:text-[#1a1a1a] transition-colors">Pricing</button>
              <button onClick={() => scrollToSection("faq-c")} className="hover:text-[#1a1a1a] transition-colors">FAQ</button>
            </div>
            <button 
              onClick={() => scrollToSection("hero-c")}
              className="hidden sm:block px-5 py-2.5 rounded-full text-[13px] font-medium text-white hover:opacity-90 transition-colors"
              style={{ background: lavender }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — LEFT-ALIGNED, lavender CTA */}
      <section className="pt-20 sm:pt-28 pb-8 sm:pb-12 px-6" id="hero-c">
        <div className="max-w-5xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-6">
            4.9 million properties analyzed
          </p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-normal leading-[1.08] tracking-[-0.03em] text-[#1a1a1a] max-w-3xl">
            Find out if you&apos;re overpaying property tax
          </h1>
          <p className="mt-6 text-lg text-[#666] leading-relaxed max-w-xl font-light">
            We analyze your home against comparable properties and build your appeal case. Free, instant, no signup.
          </p>

          {/* Search — left-aligned, inline */}
          <div className="mt-10 max-w-2xl">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={address ? undefined : PLACEHOLDER_ADDRESSES[placeholderIdx]}
                    className="w-full h-14 px-5 rounded-full text-base bg-white border border-black/[0.08] text-[#1a1a1a] placeholder-[#aaa] focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: "rgba(0,0,0,0.08)", boxShadow: "none" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = lavender; e.currentTarget.style.boxShadow = `0 0 0 3px ${lavenderLight}`; if (suggestions.length > 0) setShowSuggestions(true); }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                    value={address}
                    onChange={handleInputChange}
                    disabled={loading}
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden bg-white border border-black/[0.08]">
                      {suggestions.map((s, i) => (
                        <button key={s.pin || s.acct || i} type="button"
                          className={`w-full px-5 py-3.5 text-left transition-colors hover:bg-[#f7f6f3] ${i !== suggestions.length - 1 ? "border-b border-black/[0.04]" : ""}`}
                          onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s); }}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium text-[#1a1a1a]">{toTitleCase(s.address)}</div>
                            <span className="text-[11px] font-medium rounded-md px-2 py-0.5 whitespace-nowrap flex-shrink-0"
                              style={{ background: lavenderLight, color: "#7c6ba0" }}>
                              {JURISDICTION_LABELS[s.jurisdiction] || s.jurisdiction}
                            </span>
                          </div>
                          <div className="text-sm mt-0.5 text-[#777]">{toTitleCase(s.city)}, {s.jurisdiction === "cook_county_il" ? `IL ${(s.zip || "").split('-')[0]}` : "TX"}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading || !address.trim()}
                  className="h-14 px-8 rounded-full font-medium text-base transition-all disabled:opacity-40 text-white whitespace-nowrap"
                  style={{ background: lavender }}
                  onMouseEnter={(e) => e.currentTarget.style.background = lavenderHover}
                  onMouseLeave={(e) => e.currentTarget.style.background = lavender}>
                  {loading ? "..." : "Check My Property"}
                </button>
              </div>
            </form>

            {/* Coverage line */}
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#999]">
              <span>DFW</span><span className="text-[#ddd]">·</span>
              <span>Houston</span><span className="text-[#ddd]">·</span>
              <span>Austin</span><span className="text-[#ddd]">·</span>
              <span>Chicago</span><span className="text-[#ccc]">· 10 counties, growing</span>
            </div>

            {/* No-match email capture */}
            {noMatch && (
              <div className="mt-4 rounded-2xl p-6 bg-white border border-black/[0.08] text-left">
                {notifySubmitted ? (
                  <div className="text-center py-2">
                    <p className="font-medium text-[#1a1a1a]">You&apos;re on the list</p>
                    <p className="text-sm mt-1 text-[#999]">We&apos;ll email you as soon as your area is covered.</p>
                  </div>
                ) : (
                  <>
                    <p className="font-medium mb-1 text-[#1a1a1a]">We don&apos;t cover that area yet</p>
                    <p className="text-sm mb-4 text-[#999]">Leave your email and we&apos;ll notify you when we launch in your area.</p>
                    <form onSubmit={handleNotifySubmit} className="flex gap-2">
                      <input type="email" placeholder="you@email.com" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} required
                        className="flex-1 h-11 px-4 rounded-full text-sm bg-[#f7f6f3] border border-black/[0.06] text-[#1a1a1a] placeholder-[#aaa] focus:outline-none focus:ring-2"
                        style={{ focusRingColor: lavenderLight } as any} />
                      <button type="submit" disabled={notifyLoading}
                        className="h-11 px-5 rounded-full text-sm font-medium text-white transition-colors disabled:opacity-50"
                        style={{ background: lavender }}>
                        {notifyLoading ? "..." : "Notify Me"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="border-t border-black/[0.06] pt-12 sm:pt-16">
            <div className="grid grid-cols-3 gap-8 sm:gap-16">
              {[
                { value: "$1,136", label: "AVG. ANNUAL SAVINGS" },
                { value: "32%", label: "HOMES OVER-ASSESSED" },
                { value: "72%", label: "APPEAL SUCCESS RATE" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl sm:text-5xl font-light tracking-[-0.03em] text-[#1a1a1a]">{stat.value}</div>
                  <div className="mt-2 text-[11px] sm:text-[13px] tracking-[0.08em] uppercase text-[#999]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 sm:py-20 px-6" style={{ background: lavenderBg }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[22px] sm:text-[26px] font-normal leading-relaxed tracking-[-0.01em] text-[#1a1a1a]">
            &ldquo;I was paying $1,400 more than my neighbor for a smaller house. Overtaxed found 6 comps and I won my appeal in 3 weeks.&rdquo;
          </p>
          <p className="mt-4 text-[13px] text-[#999]">— Rachel M., Collin County, TX</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works-c" className="py-14 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-12">Three steps to your appeal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16">
            {[
              { num: "01", title: "Enter your address", desc: "We pull your property data from public records automatically. Covers the DFW, Houston, and Austin metros plus Cook County, IL." },
              { num: "02", title: "We find your comps", desc: "Our system identifies similar properties assessed lower than yours — the foundation of your appeal." },
              { num: "03", title: "File your appeal", desc: "Download your complete appeal package and file it yourself. We show you exactly how, step by step." },
            ].map((step) => (
              <div key={step.num}>
                <div className="text-[14px] font-medium tracking-[0.15em] mb-4" style={{ color: lavender }}>{step.num}</div>
                <h3 className="text-lg font-medium mb-3 text-[#1a1a1a]">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-[#666] font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing-c" className="py-14 sm:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-4">One price. No surprises.</h2>
          <p className="text-lg text-[#666] font-light mb-12">No percentage of savings. No hidden fees.</p>
          
          <div className="rounded-2xl p-8 sm:p-12 bg-white border border-black/[0.06]">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
              <div>
                <div className="text-6xl sm:text-7xl font-light tracking-[-0.03em] text-[#1a1a1a]">$49</div>
                <div className="mt-2 text-[15px] text-[#999]">One-time per property</div>
              </div>
              <button onClick={() => { const el = document.getElementById("hero-c"); if (el) { el.scrollIntoView({ behavior: "smooth" }); setTimeout(() => inputRef.current?.focus(), 500); } }}
                className="h-14 px-8 rounded-full font-medium text-base text-white transition-colors"
                style={{ background: lavender }}
                onMouseEnter={(e) => e.currentTarget.style.background = lavenderHover}
                onMouseLeave={(e) => e.currentTarget.style.background = lavender}>
                Get My Appeal Package
              </button>
            </div>
            
            <div className="border-t border-black/[0.06] pt-8 mb-8">
              <p className="text-[13px] text-[#999] tracking-[0.1em] uppercase mb-4">How we compare</p>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-semibold" style={{ color: "#7c6ba0" }}>$49</div>
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
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: lavender }} />
                    <span className="text-[15px] text-[#444] font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq-c" className="py-14 sm:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-12">Common questions</h2>
          <div className="space-y-8 sm:space-y-10">
            {[
              { q: "Do I need a lawyer to appeal?", a: "No. Individual homeowners can file appeals themselves. We give you everything you need — comparable properties, evidence brief, and step-by-step instructions." },
              { q: "What if my appeal doesn't work?", a: "There's no penalty for appealing. If your assessment isn't reduced, you've lost nothing but the filing time." },
              { q: "When can I file?", a: "In Texas, protest after receiving your appraisal notice (usually late March). Deadline is May 15 or 30 days after your notice. In Cook County, IL, appeals open by township on a rotating schedule." },
              { q: "Why is this so much cheaper?", a: "Attorneys charge a percentage of savings because they can. We automate the research that used to take hours. Same analysis, fraction of the cost." },
              { q: "What areas do you cover?", a: "4.9M+ properties across DFW (Dallas, Tarrant, Collin, Denton), Houston (Harris, Fort Bend), Austin (Travis, Williamson), Rockwall County, and Cook County, IL. More coming." },
            ].map((item, i) => (
              <div key={i} className="border-b border-black/[0.06] pb-8 sm:pb-10">
                <h3 className="text-lg font-medium mb-3 text-[#1a1a1a]">{item.q}</h3>
                <p className="text-[15px] leading-relaxed text-[#666] font-light">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA — deep lavender */}
      <section className="py-20 sm:py-28 px-6 text-center" style={{ background: "#2a2040" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.02em] mb-4 text-white">See if you have a case</h2>
          <p className="text-lg font-light mb-10" style={{ color: "#aaa0c0" }}>
            The average homeowner saves $1,136/year. At $49, that&apos;s a 23x return.
          </p>
          <button onClick={() => { const el = document.getElementById("hero-c"); if (el) { el.scrollIntoView({ behavior: "smooth" }); setTimeout(() => inputRef.current?.focus(), 500); } }}
            className="h-14 px-10 rounded-full font-medium text-base text-white transition-colors"
            style={{ background: lavender }}
            onMouseEnter={(e) => e.currentTarget.style.background = lavenderHover}
            onMouseLeave={(e) => e.currentTarget.style.background = lavender}>
            Check My Property
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-black/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[13px] text-[#999]">© 2026 Overtaxed</div>
          <div className="flex items-center gap-6 text-[13px] text-[#999]">
            <a href="/terms" className="hover:text-[#1a1a1a] transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-[#1a1a1a] transition-colors">Privacy</a>
            <a href="mailto:hello@getovertaxed.com" className="hover:text-[#1a1a1a] transition-colors">hello@getovertaxed.com</a>
          </div>
          <div className="text-[13px] text-[#999]">Dallas · Houston · Austin · Chicago</div>
        </div>
      </footer>
    </div>
  );
}
