"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface AutocompleteResult {
  pin: string;
  address: string;
  city: string;
  zip: string;
  township: string;
  display: string;
}

export default function Home() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);
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
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(address)}`);
        const data = await response.json();
        setSuggestions(data.results || []);
        setShowSuggestions(true);
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
    setAddress(suggestion.display);
    setSelectedPin(suggestion.pin);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setSelectedPin(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    if (selectedPin) {
      router.push(`/results?pin=${selectedPin}`);
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

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div className="min-h-screen bg-[#fafafa]" />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-[#fafafa] text-[#111]"}`}>

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${isDark ? "bg-[#0a0a0a]/80" : "bg-[#fafafa]/80"} backdrop-blur-xl border-b ${isDark ? "border-white/5" : "border-black/5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo icon */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isDark ? "bg-emerald-500 text-black" : "bg-emerald-500 text-white"}`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 4L12 14M12 14L8 10M12 14L16 10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 20H19" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={`text-lg font-semibold tracking-tight ${isDark ? "text-white" : "text-black"}`}>
              overtaxed
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className={`hidden md:flex items-center gap-6 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
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
              className={`hidden sm:block px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
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
      <section className="pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Text */}
            <div>
              {/* Cook County badge - integrated into hero */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 ${
                isDark 
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400" 
                  : "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-700"
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Cook County, IL</span>
                <span className={isDark ? "text-gray-500" : "text-gray-400"}>•</span>
                <span className={isDark ? "text-gray-400" : "text-gray-500"}>More markets soon</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
                Stop overpaying
                <br />
                property tax
              </h1>
              
              <p className={`mt-5 sm:mt-6 text-lg sm:text-xl leading-relaxed max-w-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                We analyze your home against similar properties and build your appeal case. Takes 30 seconds.
              </p>
              
              {/* Big social proof stat */}
              <div className={`mt-6 inline-flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? "bg-white/5 border border-white/10" : "bg-emerald-50 border border-emerald-100"}`}>
                <div className={`text-2xl sm:text-3xl font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>$355M</div>
                <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  in potential savings found<br />
                  <span className={isDark ? "text-gray-500" : "text-gray-400"}>across Cook County homeowners</span>
                </div>
              </div>
              
              <form onSubmit={handleSearch} className="mt-8 sm:mt-10">
                <div className="relative max-w-md">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input 
                        ref={inputRef}
                        type="text"
                        placeholder="Enter your Cook County address..."
                        className={`w-full h-12 sm:h-14 px-4 rounded-xl text-base transition-all ${
                          isDark 
                            ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/30" 
                            : "bg-white border border-black/10 text-black placeholder-gray-400 focus:border-black/30 shadow-sm"
                        } focus:outline-none`}
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
                            isDark ? "bg-[#111] border border-white/10" : "bg-white border border-black/10"
                          }`}
                        >
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={suggestion.pin}
                              type="button"
                              className={`w-full px-4 py-3 text-left transition-colors ${
                                isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                              } ${index !== suggestions.length - 1 ? `border-b ${isDark ? "border-white/5" : "border-black/5"}` : ""}`}
                              onClick={() => handleSelectSuggestion(suggestion)}
                            >
                              <div className="font-medium text-sm">{suggestion.address}</div>
                              <div className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {suggestion.city}, IL {suggestion.zip.split('-')[0]}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      type="submit"
                      disabled={loading || !address.trim()}
                      className={`h-12 sm:h-14 px-6 sm:px-8 rounded-xl font-medium text-base transition-all disabled:opacity-50 ${
                        isDark 
                          ? "bg-white text-black hover:bg-gray-100" 
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      {loading ? "..." : "Check Now"}
                    </button>
                  </div>
                  <p className={`mt-3 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Free instant analysis • No signup required
                  </p>
                </div>
              </form>
            </div>
            
            {/* Right side - Empty for cleaner hero */}
            <div className="hidden lg:block">
              {/* Intentionally empty - let the stats below speak */}
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Clean Cards with Emerald Accent */}
      <section className="py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className={`p-6 sm:p-8 rounded-2xl border ${isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100"}`}>
              <div className={`text-4xl sm:text-5xl font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>$1,136</div>
              <div className={`mt-1 sm:mt-2 text-sm ${isDark ? "text-emerald-300/70" : "text-emerald-600/70"}`}>Average annual savings</div>
            </div>
            <div className={`p-6 sm:p-8 rounded-2xl border ${isDark ? "bg-gray-500/10 border-gray-500/20" : "bg-gray-100 border-gray-200"}`}>
              <div className={`text-4xl sm:text-5xl font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}>32%</div>
              <div className={`mt-1 sm:mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Of homes are over-assessed</div>
            </div>
            <div className={`p-6 sm:p-8 rounded-2xl border ${isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100"}`}>
              <div className={`text-4xl sm:text-5xl font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>72%</div>
              <div className={`mt-1 sm:mt-2 text-sm ${isDark ? "text-emerald-300/70" : "text-emerald-600/70"}`}>Appeal success rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 sm:mb-4">How it works</h2>
          <p className={`text-base sm:text-lg mb-10 sm:mb-12 max-w-xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            We do the research. You file the appeal.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { num: "01", title: "Enter your address", desc: "We pull your property data from Cook County's records instantly." },
              { num: "02", title: "We find your comps", desc: "Our system identifies similar homes assessed lower than yours." },
              { num: "03", title: "File your appeal", desc: "Get your complete appeal package with forms and instructions." },
            ].map((step) => (
              <div key={step.num} className={`p-5 sm:p-6 rounded-xl ${isDark ? "bg-white/[0.02] border border-white/10" : "bg-white border border-black/5 shadow-sm"}`}>
                <div className={`text-xs font-mono mb-3 sm:mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{step.num}</div>
                <h3 className="text-base sm:text-lg font-medium mb-2">{step.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 sm:mb-4">Simple pricing</h2>
              <p className={`text-base sm:text-lg mb-6 sm:mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                No percentage of savings. No hidden fees. Just a flat rate.
              </p>
              
              <div className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 sm:mb-8">$49</div>
              
              <ul className="space-y-3 sm:space-y-4 mb-8">
                {[
                  "Complete appeal package with 5+ comparable properties",
                  "Pre-filled appeal forms ready to submit",
                  "Step-by-step filing instructions",
                  "Delivered in 48 hours",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`text-sm sm:text-base ${isDark ? "text-gray-300" : "text-gray-700"}`}>{item}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-medium transition-colors ${
                  isDark 
                    ? "bg-white text-black hover:bg-gray-100" 
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                Get Your Appeal Package
              </button>
              
              <p className={`mt-4 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Compare to attorneys who charge 30% of savings (~$250+)
              </p>
            </div>
            
            <div className="hidden lg:block">
              <div className={`p-8 rounded-2xl border ${isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-black/5 shadow-lg"}`}>
                <div className={`text-sm font-medium mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>What you get</div>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-black/5"}`}>
                    <div className="font-medium">Comparable Properties Report</div>
                    <div className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>5-8 similar homes with lower assessments</div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-black/5"}`}>
                    <div className="font-medium">Pre-filled Appeal Forms</div>
                    <div className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Ready to print and submit</div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? "bg-white/5 border border-white/5" : "bg-gray-50 border border-black/5"}`}>
                    <div className="font-medium">Filing Instructions</div>
                    <div className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Step-by-step guide with deadlines</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`py-16 sm:py-20 px-4 sm:px-8 ${isDark ? "bg-white/[0.02]" : "bg-black/[0.02]"}`}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-8 sm:mb-12">Questions & Answers</h2>
          
          <div className="space-y-6 sm:space-y-8">
            {[
              { q: "Do I need a lawyer to appeal?", a: "No. Individual homeowners can file appeals themselves (called \"pro se\") at both the Assessor's Office and Board of Review. We give you everything you need." },
              { q: "What if my appeal doesn't work?", a: "Appeals have a high success rate when you have good comparable properties. If your assessment isn't reduced, you've lost nothing but the filing time — there's no penalty for appealing." },
              { q: "When can I file an appeal?", a: "Cook County opens appeals by township on a rotating schedule. We'll tell you if your township is currently open or when it will be." },
              { q: "Why is this so much cheaper than attorneys?", a: "Attorneys charge a percentage of savings because they can. We use technology to automate the research that used to take hours. You get the same comparable property analysis at a fraction of the cost." },
              { q: "What properties do you support?", a: "Currently we support single-family homes and small multi-family buildings (2-4 units) in Cook County, IL. Condos and commercial properties require different approaches." },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="text-base sm:text-lg font-medium mb-2">{item.q}</h3>
                <p className={`text-sm sm:text-base leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24 px-4 sm:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 sm:mb-6">See if you have a case</h2>
        <p className={`text-base sm:text-lg mb-8 sm:mb-10 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Check your property in 30 seconds — it&apos;s free.
        </p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`w-full sm:w-auto px-8 py-4 rounded-xl font-medium transition-colors ${
            isDark 
              ? "bg-white text-black hover:bg-gray-100" 
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          Check My Property
        </button>
      </section>

      {/* Footer */}
      <footer className={`py-8 sm:py-12 px-4 sm:px-8 border-t ${isDark ? "border-white/5" : "border-black/5"}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            © 2026 Overtaxed
          </div>
          <div className={`flex items-center gap-6 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-black"} transition-colors`}>Privacy</a>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-black"} transition-colors`}>Terms</a>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-black"} transition-colors`}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
