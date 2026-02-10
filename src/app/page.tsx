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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
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

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#000000] text-white" : "bg-[#fafafa] text-[#111]"}`}>
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${isDark ? "bg-black/50" : "bg-white/50"} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className={`text-lg font-semibold tracking-tight ${isDark ? "text-white" : "text-black"}`}>
            overtaxed
          </div>
          <div className="flex items-center gap-6">
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
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
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

      {/* Hero Section - Asymmetric */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Text */}
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 ${
                isDark ? "bg-white/5 text-gray-400" : "bg-black/5 text-gray-600"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Cook County, IL
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
                Stop overpaying
                <br />
                property tax
              </h1>
              
              <p className={`mt-6 text-lg md:text-xl leading-relaxed max-w-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                We analyze your home against similar properties and build your appeal case. Takes 30 seconds.
              </p>
              
              <form onSubmit={handleSearch} className="mt-10">
                <div className="relative max-w-md">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <input 
                        ref={inputRef}
                        type="text"
                        placeholder="Enter your address..."
                        className={`w-full h-12 px-4 rounded-lg text-base transition-all ${
                          isDark 
                            ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/30" 
                            : "bg-white border border-black/10 text-black placeholder-gray-400 focus:border-black/30"
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
                          className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-2xl z-50 overflow-hidden ${
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
                      className="h-12 px-6 rounded-lg bg-white text-black font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {loading ? "..." : "Check"}
                    </button>
                  </div>
                  <p className={`mt-3 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    Free instant analysis • No signup required
                  </p>
                </div>
              </form>
            </div>
            
            {/* Right side - Visual */}
            <div className="hidden lg:block">
              <div className={`rounded-2xl p-8 ${isDark ? "bg-white/[0.02] border border-white/5" : "bg-black/[0.02] border border-black/5"}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Your Assessment</span>
                    <span className="text-2xl font-semibold">$68,700</span>
                  </div>
                  <div className={`h-px ${isDark ? "bg-white/10" : "bg-black/10"}`}></div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Fair Assessment</span>
                    <span className="text-2xl font-semibold text-emerald-400">$48,074</span>
                  </div>
                  <div className={`h-px ${isDark ? "bg-white/10" : "bg-black/10"}`}></div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Potential Savings</span>
                    <span className="text-3xl font-bold text-emerald-400">$4,125/yr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Gradient Cards */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-rose-500/80 to-orange-400/80 text-white">
              <div className="text-5xl font-bold">$847</div>
              <div className="mt-2 text-white/80 text-sm">Average annual savings</div>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-500/80 to-purple-400/80 text-white">
              <div className="text-5xl font-bold">21%</div>
              <div className="mt-2 text-white/80 text-sm">Average reduction</div>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/80 to-teal-400/80 text-white">
              <div className="text-5xl font-bold">72%</div>
              <div className="mt-2 text-white/80 text-sm">Success rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">How it works</h2>
          <p className={`text-lg mb-16 max-w-xl ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            We do the research. You file the appeal.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Enter your address", desc: "We pull your property data from Cook County's records instantly." },
              { num: "02", title: "We find your comps", desc: "Our system identifies similar homes assessed lower than yours." },
              { num: "03", title: "File your appeal", desc: "Get your complete appeal package with forms and instructions." },
            ].map((step) => (
              <div key={step.num} className={`p-6 rounded-xl ${isDark ? "bg-white/[0.02] border border-white/5" : "bg-black/[0.02] border border-black/5"}`}>
                <div className={`text-xs font-mono mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{step.num}</div>
                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Simple pricing</h2>
              <p className={`text-lg mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                No percentage of savings. No hidden fees. Just a flat rate.
              </p>
              
              <div className="text-6xl md:text-7xl font-bold mb-8">$49</div>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Complete appeal package with 5+ comparable properties",
                  "Pre-filled appeal forms ready to submit",
                  "Step-by-step filing instructions",
                  "Delivered in 48 hours",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>{item}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-8 py-4 rounded-lg bg-white text-black font-medium hover:bg-gray-100 transition-colors"
              >
                Get Your Appeal Package
              </button>
              
              <p className={`mt-4 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Compare to attorneys who charge 30% of savings (~$250+)
              </p>
            </div>
            
            <div className="hidden lg:block">
              <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20">
                <div className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>What you get</div>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isDark ? "bg-black/30" : "bg-white/50"}`}>
                    <div className="font-medium">Comparable Properties Report</div>
                    <div className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>5-8 similar homes with lower assessments</div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? "bg-black/30" : "bg-white/50"}`}>
                    <div className="font-medium">Pre-filled Appeal Forms</div>
                    <div className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Ready to print and submit</div>
                  </div>
                  <div className={`p-4 rounded-lg ${isDark ? "bg-black/30" : "bg-white/50"}`}>
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
      <section id="faq" className={`py-20 px-8 ${isDark ? "bg-white/[0.01]" : "bg-black/[0.01]"}`}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12">Questions & Answers</h2>
          
          <div className="space-y-8">
            {[
              { q: "Do I need a lawyer to appeal?", a: "No. Individual homeowners can file appeals themselves (called \"pro se\") at both the Assessor's Office and Board of Review. We give you everything you need." },
              { q: "What if my appeal doesn't work?", a: "Appeals have a high success rate when you have good comparable properties. If your assessment isn't reduced, you've lost nothing but the filing time — there's no penalty for appealing." },
              { q: "When can I file an appeal?", a: "Cook County opens appeals by township on a rotating schedule. We'll tell you if your township is currently open or when it will be." },
              { q: "Why is this so much cheaper than attorneys?", a: "Attorneys charge a percentage of savings because they can. We use technology to automate the research that used to take hours. You get the same comparable property analysis at a fraction of the cost." },
              { q: "What properties do you support?", a: "Currently we support single-family homes and small multi-family buildings (2-4 units) in Cook County, IL. Condos and commercial properties require different approaches — contact us if you need help with those." },
            ].map((item, i) => (
              <div key={i}>
                <h3 className="text-lg font-medium mb-2">{item.q}</h3>
                <p className={`leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold mb-6">See if you have a case</h2>
        <p className={`text-lg mb-10 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Check your property in 30 seconds — it&apos;s free.
        </p>
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`px-8 py-4 rounded-lg font-medium transition-colors ${
            isDark 
              ? "bg-white text-black hover:bg-gray-100" 
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          Check My Property
        </button>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-8 border-t ${isDark ? "border-white/5" : "border-black/5"}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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
