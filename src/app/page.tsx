"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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

  // Load theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) setTheme(saved);
  }, []);

  // Save theme to localStorage
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Debounced autocomplete search
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

  // Close suggestions when clicking outside
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

  // Theme-based styles
  const isDark = theme === "dark";
  
  const styles = {
    bg: isDark 
      ? "bg-[#0c0a14]" 
      : "bg-[#f7f4ef]",
    navBg: isDark 
      ? "bg-[#0c0a14]/80 border-white/5" 
      : "bg-[#f7f4ef]/80 border-[#e5e0d8]",
    text: isDark ? "text-white" : "text-[#1a1a1a]",
    textMuted: isDark ? "text-gray-400" : "text-[#6b6560]",
    textSubtle: isDark ? "text-gray-500" : "text-[#8a857f]",
    card: isDark 
      ? "bg-[#1a1625]/60 border-white/5" 
      : "bg-[#ebe6df] border-[#ddd7cf]",
    cardHover: isDark 
      ? "hover:bg-[#1f1a2e]/80" 
      : "hover:bg-[#e5e0d8]",
    input: isDark 
      ? "bg-white/10 text-white placeholder-gray-500" 
      : "bg-white text-[#1a1a1a] placeholder-[#a09a94] border border-[#ddd7cf]",
    dropdown: isDark 
      ? "bg-[#1a1625] border-white/10" 
      : "bg-white border-[#ddd7cf]",
    dropdownHover: isDark ? "hover:bg-white/5" : "hover:bg-[#f7f4ef]",
    dropdownBorder: isDark ? "border-white/5" : "border-[#ebe6df]",
  };

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} transition-colors duration-300`}>
      {/* Background gradients - only in dark mode */}
      {isDark && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-bl from-purple-600/20 via-violet-600/10 to-transparent blur-3xl" />
          <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-gradient-to-t from-violet-600/10 to-transparent blur-3xl" />
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${styles.navBg} backdrop-blur-xl border-b transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-display font-bold tracking-tight bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            overtaxed
          </div>
          <div className={`hidden md:flex items-center gap-8 text-sm ${styles.textMuted}`}>
            <button onClick={() => scrollToSection("how-it-works")} className={`${isDark ? "hover:text-white" : "hover:text-[#1a1a1a]"} transition-colors`}>
              How it Works
            </button>
            <button onClick={() => scrollToSection("pricing")} className={`${isDark ? "hover:text-white" : "hover:text-[#1a1a1a]"} transition-colors`}>
              Pricing
            </button>
            <button onClick={() => scrollToSection("faq")} className={`${isDark ? "hover:text-white" : "hover:text-[#1a1a1a]"} transition-colors`}>
              FAQ
            </button>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-[#e5e0d8]"} transition-colors`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Button 
              size="sm" 
              className={`${isDark ? "bg-white text-black hover:bg-gray-100" : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"} text-sm font-medium transition-colors`}
              onClick={() => scrollToSection("pricing")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="relative max-w-4xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? "bg-white/5 border-white/10" : "bg-[#ebe6df] border-[#ddd7cf]"} border text-sm font-medium mb-8 backdrop-blur-sm`}>
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
            <span className={styles.textMuted}>Cook County, IL</span>
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent font-semibold">$355M+ in savings found</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            Stop overpaying
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              property tax
            </span>
          </h1>
          
          <p className={`mt-8 text-xl md:text-2xl ${styles.textMuted} max-w-2xl mx-auto leading-relaxed`}>
            We analyze your home against similar properties and build your appeal case. 
            <span className={styles.text}> Takes 30 seconds.</span>
          </p>
          
          <form onSubmit={handleSearch} className="mt-12 max-w-2xl mx-auto">
            <div className="relative">
              <div className={`flex flex-col sm:flex-row gap-3 p-2 rounded-2xl ${isDark ? "bg-white/5 border-white/10" : "bg-[#ebe6df] border-[#ddd7cf]"} border backdrop-blur-sm`}>
                <div className="relative flex-1">
                  <input 
                    ref={inputRef}
                    type="text"
                    placeholder="Enter your property address..."
                    className={`w-full h-14 px-6 rounded-xl ${styles.input} text-lg focus:outline-none focus:ring-2 focus:ring-violet-400/50 transition-all`}
                    value={address}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    disabled={loading}
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div 
                      ref={suggestionsRef}
                      className={`absolute top-full left-0 right-0 mt-2 ${styles.dropdown} border rounded-xl shadow-2xl z-50 overflow-hidden`}
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.pin}
                          type="button"
                          className={`w-full px-5 py-4 text-left ${styles.dropdownHover} transition-colors ${
                            index !== suggestions.length - 1 ? `border-b ${styles.dropdownBorder}` : ""
                          }`}
                          onClick={() => handleSelectSuggestion(suggestion)}
                        >
                          <div className={`font-medium ${styles.text}`}>{suggestion.address}</div>
                          <div className={`text-sm ${styles.textSubtle}`}>{suggestion.city}, IL {suggestion.zip.split('-')[0]} • {suggestion.township}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="h-14 px-8 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 hover:from-violet-400 hover:via-purple-400 hover:to-indigo-400 text-white font-semibold text-base shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]"
                  disabled={loading || !address.trim()}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </span>
                  ) : "Check My Property"}
                </Button>
              </div>
            </div>
            <p className={`mt-4 text-sm ${styles.textSubtle}`}>
              Free instant analysis • No signup required
            </p>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-24 px-6 border-t ${isDark ? "border-white/5" : "border-[#e5e0d8]"}`}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: "$847", label: "Average annual savings" },
              { value: "21%", label: "Average reduction" },
              { value: "72%", label: "Success rate" },
            ].map((stat) => (
              <div key={stat.label} className={`text-center p-8 rounded-2xl ${styles.card} border transition-colors duration-300`}>
                <div className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className={`mt-3 ${styles.textMuted}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              How it works
            </h2>
            <p className={`mt-4 text-xl ${styles.textMuted} max-w-2xl mx-auto`}>
              We do the research. You file the appeal.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "1", title: "Enter your address", desc: "We pull your property data from Cook County's records instantly." },
              { num: "2", title: "We find your comps", desc: "Our system identifies similar homes assessed lower than yours." },
              { num: "3", title: "File your appeal", desc: "Get your complete appeal package with forms and instructions." },
            ].map((step) => (
              <div key={step.num} className={`relative p-8 rounded-2xl ${styles.card} border ${styles.cardHover} transition-all duration-300`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mb-6 text-violet-400 font-display font-bold text-xl">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className={`${styles.textMuted} leading-relaxed`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-xl mx-auto">
          <div className={`relative p-10 md:p-12 rounded-3xl ${isDark ? "bg-gradient-to-b from-[#1f1a2e]/80 to-[#15121f]/80 border-white/10" : "bg-gradient-to-b from-[#ebe6df] to-[#e5e0d8] border-[#ddd7cf]"} border`}>
            {/* Glow effect - dark mode only */}
            {isDark && (
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500/10 via-transparent to-indigo-500/10 blur-xl" />
            )}
            
            <div className="relative text-center">
              <div className="text-sm font-medium bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">One-time payment</div>
              <div className="font-display text-7xl md:text-8xl font-bold">$49</div>
              
              <ul className="mt-10 space-y-4 text-left">
                {[
                  "Complete appeal package with 5+ comparable properties",
                  "Pre-filled appeal forms ready to submit",
                  "Step-by-step filing instructions",
                  "Delivered in 48 hours",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={styles.textMuted}>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                size="lg" 
                className="mt-10 w-full h-14 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 hover:from-violet-400 hover:via-purple-400 hover:to-indigo-400 text-white font-semibold text-lg shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Get Your Appeal Package
              </Button>
              
              <p className={`mt-4 text-sm ${styles.textSubtle}`}>
                Compare to attorneys who charge 30% of savings (~$250+)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`py-24 px-6 border-t ${isDark ? "border-white/5" : "border-[#e5e0d8]"}`}>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16">
            Questions & Answers
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: "Do I need a lawyer to appeal?",
                a: "No. Individual homeowners can file appeals themselves (called \"pro se\") at both the Assessor's Office and Board of Review. We give you everything you need."
              },
              {
                q: "What if my appeal doesn't work?",
                a: "Appeals have a high success rate when you have good comparable properties. If your assessment isn't reduced, you've lost nothing but the filing time — there's no penalty for appealing."
              },
              {
                q: "When can I file an appeal?",
                a: "Cook County opens appeals by township on a rotating schedule. We'll tell you if your township is currently open or when it will be."
              },
              {
                q: "Why is this so much cheaper than attorneys?",
                a: "Attorneys charge a percentage of savings because they can. We use technology to automate the research that used to take hours. You get the same comparable property analysis at a fraction of the cost."
              },
              {
                q: "What properties do you support?",
                a: "Currently we support single-family homes and small multi-family buildings (2-4 units) in Cook County, IL. Condos and commercial properties require different approaches — contact us if you need help with those."
              }
            ].map((item, i) => (
              <div key={i} className={`p-6 rounded-2xl ${styles.card} border transition-colors duration-300`}>
                <h3 className="text-lg font-semibold">{item.q}</h3>
                <p className={`mt-3 ${styles.textMuted} leading-relaxed`}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-6xl font-bold">
            See if you have a case
          </h2>
          <p className={`mt-6 text-xl ${styles.textMuted}`}>
            Check your property in 30 seconds — it&apos;s free.
          </p>
          <Button 
            size="lg" 
            className={`mt-10 h-14 px-12 rounded-xl ${isDark ? "bg-white text-black hover:bg-gray-100" : "bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"} font-semibold text-lg transition-all hover:scale-[1.02]`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Check My Property
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t ${isDark ? "border-white/5" : "border-[#e5e0d8]"}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className={`text-sm ${styles.textSubtle}`}>
            © 2026 Overtaxed. Cook County property tax appeals made simple.
          </div>
          <div className={`flex items-center gap-6 text-sm ${styles.textSubtle}`}>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-[#1a1a1a]"} transition-colors`}>Privacy</a>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-[#1a1a1a]"} transition-colors`}>Terms</a>
            <a href="#" className={`${isDark ? "hover:text-white" : "hover:text-[#1a1a1a]"} transition-colors`}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
