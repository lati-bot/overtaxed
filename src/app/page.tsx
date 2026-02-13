"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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
  jurisdiction: "cook_county_il" | "harris_county_tx" | "dallas_county_tx" | "travis_county_tx" | "collin_county_tx" | "tarrant_county_tx" | "denton_county_tx" | "williamson_county_tx" | "fortbend_county_tx";
}

const JURISDICTION_LABELS: Record<string, string> = {
  harris_county_tx: "Houston, TX",
  dallas_county_tx: "Dallas, TX",
  travis_county_tx: "Austin, TX",
  collin_county_tx: "Collin County, TX",
  tarrant_county_tx: "Tarrant County, TX",
  denton_county_tx: "Denton County, TX",
  williamson_county_tx: "Williamson County, TX",
  fortbend_county_tx: "Fort Bend County, TX",
  cook_county_il: "Cook County, IL",
};

const JURISDICTION_COLORS: Record<string, string> = {
  harris_county_tx: "bg-blue-100 text-blue-700",
  dallas_county_tx: "bg-orange-100 text-orange-700",
  travis_county_tx: "bg-teal-100 text-teal-700",
  collin_county_tx: "bg-cyan-100 text-cyan-700",
  tarrant_county_tx: "bg-rose-100 text-rose-700",
  denton_county_tx: "bg-amber-100 text-amber-700",
  williamson_county_tx: "bg-lime-100 text-lime-700",
  fortbend_county_tx: "bg-emerald-100 text-emerald-700",
  cook_county_il: "bg-purple-100 text-purple-700",
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
  cook_county_il: { param: "", field: "pin" },
};

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
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // ── Autocomplete ──
  useEffect(() => {
    if (address.length < 3 || selectedPin) {
      setSuggestions([]);
      setNoMatch(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const [cookRes, houstonRes, dallasRes, austinRes, collinRes, tarrantRes, dentonRes, williamsonRes, fortbendRes] = await Promise.all([
          fetch(`/api/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/houston/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/dallas/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/austin/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/collin/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/tarrant/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/denton/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/williamson/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/fortbend/autocomplete?q=${encodeURIComponent(address)}`).then(r => r.json()).catch(() => ({ results: [] })),
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
        ].slice(0, 8);
        setSuggestions(combined);
        setShowSuggestions(true);
        setNoMatch(combined.length === 0 && address.trim().length >= 5);
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
    setAddress(s.display || s.address);
    setSelectedPin(s.pin || s.acct || null);
    setSelectedJurisdiction(s.jurisdiction);
    setSuggestions([]);
    setShowSuggestions(false);
    setNoMatch(false);
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
        const [cookRes, houstonRes, dallasRes, austinRes, collinRes, tarrantRes, dentonRes, williamsonRes, fortbendRes] = await Promise.all([
          fetch(`/api/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/houston/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/dallas/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/austin/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/collin/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/tarrant/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/denton/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/williamson/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
          fetch(`/api/fortbend/autocomplete?q=${q}`).then(r => r.json()).catch(() => ({ results: [] })),
        ]);
        const markets = [
          { res: fortbendRes, j: "fortbend_county_tx" }, { res: dentonRes, j: "denton_county_tx" },
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

  if (!mounted) return <div className="min-h-screen bg-[#f7f6f3]" />;

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-[#1a1a1a]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#f7f6f3]/90 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl tracking-[-0.03em] font-light text-[#1a1a1a]">
            overtaxed
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-[13px] text-[#666] tracking-wide">
              <button onClick={() => scrollToSection("how-it-works")} className="hover:text-[#1a1a1a] transition-colors">How it Works</button>
              <button onClick={() => scrollToSection("pricing")} className="hover:text-[#1a1a1a] transition-colors">Pricing</button>
              <button onClick={() => scrollToSection("faq")} className="hover:text-[#1a1a1a] transition-colors">FAQ</button>
            </div>
            <button 
              onClick={() => scrollToSection("pricing")}
              className="hidden sm:block px-5 py-2.5 rounded-full text-[13px] font-medium bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 sm:pt-24 pb-10 sm:pb-14 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Left-aligned editorial headline */}
          <div className="max-w-3xl">
            <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-6">
              4.9 million properties analyzed
            </p>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#1a1a1a]">
              Find out if you&apos;re<br />
              overpaying property tax
            </h1>
            <p className="mt-6 text-lg text-[#666] leading-relaxed max-w-xl font-light">
              We analyze your home against comparable properties and build your appeal case. Free, instant, no signup.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-10 max-w-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input 
                  ref={inputRef}
                  type="text"
                  placeholder="Enter your property address..."
                  className="w-full h-14 px-5 rounded-2xl text-base bg-white border border-black/[0.08] text-[#1a1a1a] placeholder-[#aaa] focus:border-[#6b4fbb]/30 focus:outline-none focus:ring-2 focus:ring-[#6b4fbb]/10 shadow-sm transition-all"
                  value={address}
                  onChange={handleInputChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  disabled={loading}
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden bg-white border border-black/[0.08]"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.pin || suggestion.acct || index}
                        type="button"
                        className={`w-full px-5 py-4 text-left transition-colors hover:bg-[#f7f6f3] ${index !== suggestions.length - 1 ? "border-b border-black/[0.04]" : ""}`}
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-[#1a1a1a]">{suggestion.address}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${JURISDICTION_COLORS[suggestion.jurisdiction] || "bg-gray-100 text-gray-700"}`}>
                            {JURISDICTION_LABELS[suggestion.jurisdiction] || suggestion.jurisdiction}
                          </span>
                        </div>
                        <div className="text-sm mt-0.5 text-[#999]">
                          {suggestion.city}, {suggestion.jurisdiction === "cook_county_il" ? `IL ${(suggestion.zip || "").split('-')[0]}` : "TX"}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                type="submit"
                disabled={loading || !address.trim()}
                className="h-14 px-8 rounded-2xl font-medium text-base transition-all disabled:opacity-40 bg-[#6b4fbb] text-white hover:bg-[#5a3fa8] shadow-lg shadow-[#6b4fbb]/20"
              >
                {loading ? "..." : "Check My Property"}
              </button>
            </div>
          </form>

          {/* Coverage line */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#999]">
            <span>DFW</span>
            <span className="text-[#ddd]">·</span>
            <span>Houston</span>
            <span className="text-[#ddd]">·</span>
            <span>Austin</span>
            <span className="text-[#ddd]">·</span>
            <span>Chicago</span>
            <span className="text-[#ddd]">·</span>
            <span className="text-[#bbb]">9 counties, growing</span>
          </div>

          {/* No-match email capture */}
          {noMatch && (
            <div className="mt-8 max-w-xl rounded-2xl p-6 bg-white border border-black/[0.08] text-left">
              {notifySubmitted ? (
                <div className="text-center py-2">
                  <p className="font-medium text-[#1a1a1a]">You&apos;re on the list</p>
                  <p className="text-sm mt-1 text-[#999]">We&apos;ll email you as soon as your area is covered.</p>
                </div>
              ) : (
                <>
                  <p className="font-medium mb-1 text-[#1a1a1a]">We don&apos;t cover that area yet</p>
                  <p className="text-sm mb-4 text-[#999]">We&apos;re expanding fast. Leave your email and we&apos;ll notify you when we launch in your area.</p>
                  <form onSubmit={handleNotifySubmit} className="flex gap-2">
                    <input type="email" placeholder="you@email.com" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} required
                      className="flex-1 h-11 px-4 rounded-xl text-sm bg-[#f7f6f3] border border-black/[0.06] text-[#1a1a1a] placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]/5"
                    />
                    <button type="submit" disabled={notifyLoading} className="h-11 px-5 rounded-xl text-sm font-medium bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors disabled:opacity-50">
                      {notifyLoading ? "..." : "Notify Me"}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 sm:gap-16">
            {[
              { value: "$1,136", label: "Avg. annual savings" },
              { value: "32%", label: "Homes over-assessed" },
              { value: "72%", label: "Appeal success rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-5xl font-light tracking-[-0.03em] text-[#1a1a1a]">{stat.value}</div>
                <div className="mt-2 text-[11px] sm:text-[13px] tracking-[0.05em] uppercase text-[#999]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-light tracking-[-0.02em] mb-16">Three steps to your appeal</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16">
            {[
              { num: "01", title: "Enter your address", desc: "We pull your property data from public records automatically. Covers the DFW, Houston, and Austin metros plus Cook County, IL." },
              { num: "02", title: "We find your comps", desc: "Our system identifies similar properties assessed lower than yours — the foundation of your appeal." },
              { num: "03", title: "File your appeal", desc: "Download your complete appeal package and file it yourself. We show you exactly how, step by step." },
            ].map((step) => (
              <div key={step.num}>
                <div className="text-[13px] tracking-[0.15em] text-[#ccc] mb-4">{step.num}</div>
                <h3 className="text-lg font-medium mb-3 text-[#1a1a1a]">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-[#666] font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-light tracking-[-0.02em] mb-4">One price. No surprises.</h2>
          <p className="text-lg text-[#666] font-light mb-12">No percentage of savings. No hidden fees.</p>
          
          <div className="rounded-3xl p-8 sm:p-12 bg-[#f7f6f3] border border-black/[0.04]">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
              <div>
                <div className="text-6xl sm:text-7xl font-light tracking-[-0.03em] text-[#1a1a1a]">$49</div>
                <div className="mt-2 text-[15px] text-[#999]">One-time per property</div>
              </div>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="h-14 px-8 rounded-2xl font-medium text-base bg-[#6b4fbb] text-white hover:bg-[#5a3fa8] shadow-lg shadow-[#6b4fbb]/20 transition-colors"
              >
                Start Your Filing
              </button>
            </div>
            
            <div className="border-t border-black/[0.06] pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Complete filing package with 5+ comparable properties",
                  "Professional evidence brief ready to submit",
                  "Step-by-step filing instructions",
                  "Delivered to your email instantly",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] mt-2 flex-shrink-0" />
                    <span className="text-[15px] text-[#444] font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className="mt-8 text-[13px] text-[#999]">
              Compare to attorneys who charge 30% of savings (~$250+)
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-light tracking-[-0.02em] mb-16">Common questions</h2>
          
          <div className="space-y-10">
            {[
              { q: "Do I need a lawyer to appeal?", a: "No. Individual homeowners can file appeals themselves. We give you everything you need — comparable properties, evidence brief, and step-by-step instructions." },
              { q: "What if my appeal doesn't work?", a: "There's no penalty for appealing. If your assessment isn't reduced, you've lost nothing but the filing time." },
              { q: "When can I file?", a: "In Texas, protest after receiving your appraisal notice (usually late March). Deadline is May 15 or 30 days after your notice. In Cook County, IL, appeals open by township on a rotating schedule." },
              { q: "Why is this so much cheaper?", a: "Attorneys charge a percentage of savings because they can. We automate the research that used to take hours. Same analysis, fraction of the cost." },
              { q: "What areas do you cover?", a: "4.9M+ properties across DFW (Dallas, Tarrant, Collin, Denton), Houston (Harris, Fort Bend), Austin (Travis, Williamson), and Cook County, IL. More coming." },
            ].map((item, i) => (
              <div key={i} className="border-b border-black/[0.06] pb-10">
                <h3 className="text-lg font-medium mb-3 text-[#1a1a1a]">{item.q}</h3>
                <p className="text-[15px] leading-relaxed text-[#666] font-light">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 px-6 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.02em] mb-6 text-[#1a1a1a]">See if you have a case</h2>
          <p className="text-lg text-[#666] font-light mb-10">
            Check your property in 30 seconds — it&apos;s free.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="h-14 px-10 rounded-2xl font-medium text-base bg-[#6b4fbb] text-white hover:bg-[#5a3fa8] shadow-lg shadow-[#6b4fbb]/20 transition-colors"
          >
            Check My Property
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-black/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[13px] text-[#999]">© 2026 Overtaxed</div>
          <a href="mailto:hello@getovertaxed.com" className="text-[13px] text-[#999] hover:text-[#1a1a1a] transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
