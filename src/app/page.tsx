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
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-display font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
            overtaxed
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <button onClick={() => scrollToSection("how-it-works")} className="hover:text-white transition-colors">
              How it Works
            </button>
            <button onClick={() => scrollToSection("pricing")} className="hover:text-white transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-white transition-colors">
              FAQ
            </button>
          </div>
          <Button 
            size="sm" 
            className="bg-white text-black hover:bg-gray-100 text-sm font-medium"
            onClick={() => scrollToSection("pricing")}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-300">Cook County, IL</span>
            <span className="text-emerald-400 font-semibold">$355M+ in savings found</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            Stop overpaying
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent">
              property tax
            </span>
          </h1>
          
          <p className="mt-8 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We analyze your home against similar properties and build your appeal case. 
            <span className="text-white"> Takes 30 seconds.</span>
          </p>
          
          <form onSubmit={handleSearch} className="mt-12 max-w-2xl mx-auto">
            <div className="relative">
              <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="relative flex-1">
                  <input 
                    ref={inputRef}
                    type="text"
                    placeholder="Enter your property address..."
                    className="w-full h-14 px-6 rounded-xl bg-white/10 border-0 text-white placeholder-gray-500 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all"
                    value={address}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    disabled={loading}
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div 
                      ref={suggestionsRef}
                      className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.pin}
                          type="button"
                          className={`w-full px-5 py-4 text-left hover:bg-white/5 transition-colors ${
                            index !== suggestions.length - 1 ? "border-b border-white/5" : ""
                          }`}
                          onClick={() => handleSelectSuggestion(suggestion)}
                        >
                          <div className="font-medium text-white">{suggestion.address}</div>
                          <div className="text-sm text-gray-500">{suggestion.city}, IL {suggestion.zip.split('-')[0]} • {suggestion.township}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="h-14 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black font-semibold text-base shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02]"
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
            <p className="mt-4 text-sm text-gray-500">
              Free instant analysis • No signup required
            </p>
          </form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">$847</div>
              <div className="mt-3 text-gray-400">Average annual savings</div>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">21%</div>
              <div className="mt-3 text-gray-400">Average reduction</div>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="font-display text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">72%</div>
              <div className="mt-3 text-gray-400">Success rate</div>
            </div>
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
            <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
              We do the research. You file the appeal.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-400/20 flex items-center justify-center mb-6 text-emerald-400 font-display font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Enter your address</h3>
              <p className="text-gray-400 leading-relaxed">
                We pull your property data from Cook County&apos;s records instantly.
              </p>
            </div>
            
            <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-400/20 flex items-center justify-center mb-6 text-emerald-400 font-display font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">We find your comps</h3>
              <p className="text-gray-400 leading-relaxed">
                Our system identifies similar homes assessed lower than yours.
              </p>
            </div>
            
            <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-400/20 flex items-center justify-center mb-6 text-emerald-400 font-display font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">File your appeal</h3>
              <p className="text-gray-400 leading-relaxed">
                Get your complete appeal package with forms and instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-xl mx-auto">
          <div className="relative p-10 md:p-12 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-transparent to-green-400/10 blur-xl" />
            
            <div className="relative text-center">
              <div className="text-sm font-medium text-emerald-400 mb-2">One-time payment</div>
              <div className="font-display text-7xl md:text-8xl font-bold">$49</div>
              
              <ul className="mt-10 space-y-4 text-left">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Complete appeal package with 5+ comparable properties</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Pre-filled appeal forms ready to submit</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Step-by-step filing instructions</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Delivered in 48 hours</span>
                </li>
              </ul>
              
              <Button 
                size="lg" 
                className="mt-10 w-full h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black font-semibold text-lg shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02]"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Get Your Appeal Package
              </Button>
              
              <p className="mt-4 text-sm text-gray-500">
                Compare to attorneys who charge 30% of savings (~$250+)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 border-t border-white/5">
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
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h3 className="text-lg font-semibold text-white">{item.q}</h3>
                <p className="mt-3 text-gray-400 leading-relaxed">{item.a}</p>
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
          <p className="mt-6 text-xl text-gray-400">
            Check your property in 30 seconds — it&apos;s free.
          </p>
          <Button 
            size="lg" 
            className="mt-10 h-14 px-12 rounded-xl bg-white text-black hover:bg-gray-100 font-semibold text-lg transition-all hover:scale-[1.02]"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Check My Property
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            © 2026 Overtaxed. Cook County property tax appeals made simple.
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
