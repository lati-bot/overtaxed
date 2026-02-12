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

const METRO_GROUPS = [
  { label: "DFW Metro", detail: "Dallas · Tarrant · Collin · Denton", count: "1.9M+" },
  { label: "Houston Metro", detail: "Harris · Fort Bend", count: "1.4M+" },
  { label: "Austin Metro", detail: "Travis · Williamson", count: "610K+" },
  { label: "Chicago", detail: "Cook County", count: "970K+" },
];

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

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
          (res.results || []).map((r: any) => ({
            ...r,
            jurisdiction,
            display: r.display || r.address,
          }));

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
        // Show no-match if user typed 5+ chars and zero results across all markets
        setNoMatch(combined.length === 0 && address.trim().length >= 5);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [address, selectedPin]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: AutocompleteResult) => {
    setAddress(suggestion.display || suggestion.address);
    setSelectedPin(suggestion.pin || suggestion.acct || null);
    setSelectedJurisdiction(suggestion.jurisdiction);
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
      setNotifySubmitted(true);
    } catch {
      // Still show submitted — best effort
      setNotifySubmitted(true);
    } finally {
      setNotifyLoading(false);
    }
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

  const routeToResults = (pin: string | null | undefined, jurisdiction: string) => {
    const route = JURISDICTION_ROUTES[jurisdiction];
    if (!route || !pin) return false;
    if (route.param) {
      router.push(`/results?acct=${pin}&jurisdiction=${route.param}`);
    } else {
      router.push(`/results?pin=${pin}`);
    }
    return true;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);

    // If user typed but didn't select a suggestion, auto-select the best match
    if (!selectedPin && suggestions.length > 0) {
      const best = suggestions[0];
      const bestPin = best.pin || best.acct || null;
      if (bestPin && routeToResults(bestPin, best.jurisdiction)) return;
    }

    // If user typed but suggestions haven't loaded yet or are empty,
    // do a quick autocomplete search and use the top result
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
          { res: fortbendRes, jurisdiction: "fortbend_county_tx" },
          { res: dentonRes, jurisdiction: "denton_county_tx" },
          { res: williamsonRes, jurisdiction: "williamson_county_tx" },
          { res: tarrantRes, jurisdiction: "tarrant_county_tx" },
          { res: collinRes, jurisdiction: "collin_county_tx" },
          { res: austinRes, jurisdiction: "austin_county_tx" },
          { res: dallasRes, jurisdiction: "dallas_county_tx" },
          { res: houstonRes, jurisdiction: "harris_county_tx" },
          { res: cookRes, jurisdiction: "cook_county_il" },
        ];

        for (const m of markets) {
          const first = (m.res.results || [])[0];
          const id = first?.acct || first?.pin;
          if (id && routeToResults(id, m.jurisdiction)) return;
        }

        // No match — show email capture
        setNoMatch(true);
        setLoading(false);
        return;
      } catch {
        // Fall through
      }
    }

    if (selectedPin && selectedJurisdiction) {
      routeToResults(selectedPin, selectedJurisdiction);
    } else {
      router.push(`/results?address=${encodeURIComponent(address.trim())}`);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isDark = theme === "dark";

  if (!mounted) {
    return <div className="min-h-screen bg-[#f5f3f7]" />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f5f3f7] text-[#111]"}`}>

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${isDark ? "bg-[#0a0a0a]/90" : "bg-[#f5f3f7]/90"} backdrop-blur-xl border-b ${isDark ? "border-white/5" : "border-black/5"}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className={`text-xl font-semibold tracking-tight ${isDark ? "text-white" : "text-black"}`}>
            overtaxed
          </div>
          <div className="flex items-center gap-6">
            <div className={`hidden md:flex items-center gap-8 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <button onClick={() => scrollToSection("how-it-works")} className={`${isDark ? "hover:text-white" : "hover:text-black"} transition-colors`}>
                How it Works
              </button>
              <button onClick={() => scrollToSection("pricing")} className={`${isDark ? "hover:text-white" : "hover:text-black"} transition-colors`}>
                Pricing
              </button>
              <button onClick={() => scrollToSection("faq")} className={`${isDark ? "hover:text-white" : "hover:text-black"} transition-colors`}>
                FAQ
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-black/5 text-gray-600"} transition-colors`}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button 
              onClick={() => scrollToSection("pricing")}
              className={`hidden sm:block px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                isDark 
                  ? "border-white/20 text-white hover:bg-white hover:text-black" 
                  : "border-black/20 text-black hover:bg-black hover:text-white"
              }`}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 pb-16 sm:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Property count badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${
            isDark 
              ? "bg-white/5 border border-white/10 text-purple-400" 
              : "bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/50 text-purple-700"
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span>Serving 4.9M+ properties across Texas &amp; Illinois</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1]">
            Find out if you&apos;re
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              overpaying property tax
            </span>
          </h1>
          
          <p className={`mt-6 sm:mt-8 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            We analyze your home against similar properties and build your appeal case. Takes 30 seconds.
          </p>
          
          <form onSubmit={handleSearch} className="mt-10 sm:mt-12 max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input 
                  ref={inputRef}
                  type="text"
                  placeholder="Enter your property address..."
                  className={`w-full h-14 px-5 rounded-xl text-base transition-all ${
                    isDark 
                      ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50" 
                      : "bg-white border border-gray-200 text-black placeholder-gray-400 focus:border-purple-500 shadow-sm"
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  value={address}
                  onChange={handleInputChange}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  disabled={loading}
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-50 overflow-hidden ${
                      isDark ? "bg-[#1a1a1a] border border-white/10" : "bg-white border border-gray-200"
                    }`}
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.pin || suggestion.acct || index}
                        type="button"
                        className={`w-full px-5 py-4 text-left transition-colors ${
                          isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                        } ${index !== suggestions.length - 1 ? `border-b ${isDark ? "border-white/5" : "border-gray-100"}` : ""}`}
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{suggestion.address}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${JURISDICTION_COLORS[suggestion.jurisdiction] || "bg-gray-100 text-gray-700"}`}>
                            {JURISDICTION_LABELS[suggestion.jurisdiction] || suggestion.jurisdiction}
                          </span>
                        </div>
                        <div className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
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
                className="h-14 px-8 rounded-xl font-medium text-base transition-all disabled:opacity-50 bg-[#6b4fbb] text-white hover:bg-[#5a3fa8] shadow-lg shadow-purple-500/25"
              >
                {loading ? "..." : "Check My Property"}
              </button>
            </div>
            <p className={`mt-4 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Free instant analysis • No signup required
            </p>
          </form>

          {/* No-match email capture */}
          {noMatch && (
            <div className={`mt-6 max-w-xl mx-auto rounded-xl p-6 text-left ${
              isDark ? "bg-white/5 border border-white/10" : "bg-white border border-gray-200 shadow-sm"
            }`}>
              {notifySubmitted ? (
                <div className="text-center py-2">
                  <div className="text-2xl mb-2">✓</div>
                  <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>You&apos;re on the list!</p>
                  <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    We&apos;ll email you as soon as your area is covered.
                  </p>
                </div>
              ) : (
                <>
                  <p className={`font-medium mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    We don&apos;t cover that area yet
                  </p>
                  <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    We&apos;re expanding fast. Leave your email and we&apos;ll notify you when we launch in your area.
                  </p>
                  <form onSubmit={handleNotifySubmit} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      required
                      className={`flex-1 h-11 px-4 rounded-lg text-sm ${
                        isDark
                          ? "bg-white/5 border border-white/10 text-white placeholder-gray-500"
                          : "bg-gray-50 border border-gray-200 text-black placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                    <button
                      type="submit"
                      disabled={notifyLoading}
                      className="h-11 px-5 rounded-lg text-sm font-medium bg-[#6b4fbb] text-white hover:bg-[#5a3fa8] transition-colors disabled:opacity-50"
                    >
                      {notifyLoading ? "..." : "Notify Me"}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* Metro coverage chips */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {METRO_GROUPS.map((metro) => (
              <div
                key={metro.label}
                className={`group relative px-4 py-2.5 rounded-xl text-sm cursor-default transition-all ${
                  isDark
                    ? "bg-white/5 border border-white/10 hover:border-white/20"
                    : "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{metro.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                    isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"
                  }`}>
                    {metro.count}
                  </span>
                </div>
                <div className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  {metro.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={`py-16 sm:py-20 ${isDark ? "bg-white/[0.02]" : "bg-gradient-to-r from-purple-100/50 to-pink-100/50"}`}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div>
              <div className={`text-4xl sm:text-5xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>$1,136</div>
              <div className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Average annual savings</div>
            </div>
            <div>
              <div className={`text-4xl sm:text-5xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>32%</div>
              <div className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Of homes are over-assessed</div>
            </div>
            <div>
              <div className={`text-4xl sm:text-5xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>72%</div>
              <div className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Appeal success rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">How it works</h2>
          <p className={`text-lg mb-12 sm:mb-16 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            We analyze your property against thousands of comparable homes to build your case.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              { num: 1, title: "Enter your address", desc: "We pull your property data from public records automatically. Covers the DFW, Houston, and Austin metros in Texas, plus Cook County, Illinois." },
              { num: 2, title: "We find your comps", desc: "Our system identifies similar properties that sold for less or are assessed lower than yours." },
              { num: 3, title: "File your appeal", desc: "Download your complete appeal package and file it yourself — we show you exactly how." },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 text-lg font-semibold ${
                  isDark ? "bg-[#6b4fbb]/20 text-purple-400" : "bg-purple-100 text-purple-600"
                }`}>
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={`py-16 sm:py-24 px-6 ${isDark ? "bg-white/[0.02]" : "bg-gradient-to-r from-purple-100/30 to-pink-100/30"}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Simple pricing</h2>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              No percentage of savings. No hidden fees. Just a flat rate.
            </p>
          </div>
          
          <div className={`rounded-2xl p-8 sm:p-12 ${isDark ? "bg-[#111] border border-white/10" : "bg-white border border-gray-200 shadow-xl"}`}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
              <div>
                <div className="text-5xl sm:text-6xl font-bold">$49</div>
                <div className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>One-time filing fee</div>
              </div>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="h-14 px-8 rounded-xl font-medium text-base transition-all bg-[#6b4fbb] text-white hover:bg-[#5a3fa8] shadow-lg shadow-purple-500/25"
              >
                Start Your Filing
              </button>
            </div>
            
            <div className={`border-t pt-8 ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Complete filing package with 5+ comparable properties",
                  "Professional evidence brief ready to submit",
                  "Step-by-step filing instructions",
                  "Delivered to your email instantly",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <p className={`mt-8 text-sm text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Compare to attorneys who charge 30% of savings (~$250+)
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-12 text-center">Questions &amp; Answers</h2>
          
          <div className="space-y-8">
            {[
              { q: "Do I need a lawyer to appeal?", a: "No. Individual homeowners can file appeals themselves (called \"pro se\") at both the Assessor's Office and Board of Review. We give you everything you need." },
              { q: "What if my appeal doesn't work?", a: "Appeals have a high success rate when you have good comparable properties. If your assessment isn't reduced, you've lost nothing but the filing time — there's no penalty for appealing." },
              { q: "When can I file an appeal?", a: "In Texas, you can protest after receiving your appraisal notice (usually late March/early April). The deadline is May 15 or 30 days after your notice — whichever is later. In Cook County, IL, appeals open by township on a rotating schedule. We currently have 2025 data — 2026 protest season opens soon." },
              { q: "Why is this so much cheaper than attorneys?", a: "Attorneys charge a percentage of savings because they can. We use technology to automate the research that used to take hours. You get the same comparable property analysis at a fraction of the cost." },
              { q: "What areas do you cover?", a: "We cover 4.9M+ properties across the DFW metro (Dallas, Tarrant, Collin, Denton counties), Houston metro (Harris, Fort Bend counties), Austin metro (Travis, Williamson counties), and Cook County, IL (Chicago area). More markets coming soon." },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="text-lg font-semibold mb-2">{item.q}</h3>
                <p className={`leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`py-20 sm:py-28 px-6 text-center ${isDark ? "bg-white/[0.02]" : "bg-gradient-to-r from-purple-100/40 to-pink-100/40"}`}>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">See if you have a case</h2>
        <p className={`text-lg mb-10 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Check your property in 30 seconds — it&apos;s free.
        </p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="h-14 px-10 rounded-xl font-medium text-base transition-all bg-[#6b4fbb] text-white hover:bg-[#5a3fa8] shadow-lg shadow-purple-500/25"
        >
          Check My Property
        </button>
      </section>

      {/* Footer */}
      <footer className={`py-8 sm:py-12 px-6 border-t ${isDark ? "border-white/5" : "border-gray-200"}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            © 2026 Overtaxed
          </div>
          <div className={`flex items-center gap-6 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            <a href="mailto:hello@getovertaxed.com" className={`${isDark ? "hover:text-white" : "hover:text-black"} transition-colors`}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
