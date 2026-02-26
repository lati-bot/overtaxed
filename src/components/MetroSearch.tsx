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
  bexar_county_tx: "Bexar Co.",
  cook_county_il: "Cook Co.",
};

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

const API_ENDPOINTS: Record<string, string> = {
  cook_county_il: "/api/autocomplete",
  harris_county_tx: "/api/houston/autocomplete",
  dallas_county_tx: "/api/dallas/autocomplete",
  travis_county_tx: "/api/austin/autocomplete",
  collin_county_tx: "/api/collin/autocomplete",
  tarrant_county_tx: "/api/tarrant/autocomplete",
  denton_county_tx: "/api/denton/autocomplete",
  williamson_county_tx: "/api/williamson/autocomplete",
  fortbend_county_tx: "/api/fortbend/autocomplete",
  rockwall_county_tx: "/api/rockwall/autocomplete",
  bexar_county_tx: "/api/bexar/autocomplete",
};

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => {
      if (/^\d/.test(word)) return word.toUpperCase();
      if (word.length <= 2 && /^[a-z]+$/.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export default function MetroSearch({ jurisdictions, placeholder }: { jurisdictions: string[]; placeholder?: string }) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (address.length < 3 || selectedPin) {
      setSuggestions([]);
      setNoMatch(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const q = encodeURIComponent(address);
        const results = await Promise.all(
          jurisdictions.map(j =>
            fetch(`${API_ENDPOINTS[j]}?q=${q}`)
              .then(r => r.json())
              .then(res => (res.results || []).map((r: any) => ({ ...r, jurisdiction: j, display: r.display || r.address })))
              .catch(() => [])
          )
        );
        const combined = results.flat().slice(0, 8);
        setSuggestions(combined);
        setShowSuggestions(true);
        const isNoMatch = combined.length === 0 && address.trim().length >= 5;
        setNoMatch(isNoMatch);
        if (isNoMatch) setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [address, selectedPin, jurisdictions]);

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
    setSuggestions([]);
    setShowSuggestions(false);
    setNoMatch(false);
    const pin = s.pin || s.acct;
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    if (!selectedPin && suggestions.length > 0) {
      const best = suggestions[0];
      const pin = best.pin || best.acct;
      const route = JURISDICTION_ROUTES[best.jurisdiction];
      if (route && pin) {
        router.push(route.param ? `/results?acct=${pin}&jurisdiction=${route.param}` : `/results?pin=${pin}`);
        return;
      }
    }
    if (!selectedPin) {
      try {
        const q = encodeURIComponent(address.trim());
        const results = await Promise.all(
          jurisdictions.map(j =>
            fetch(`${API_ENDPOINTS[j]}?q=${q}`)
              .then(r => r.json())
              .then(res => (res.results || []).map((r: any) => ({ ...r, jurisdiction: j })))
              .catch(() => [])
          )
        );
        const combined = results.flat();
        if (combined.length > 0) {
          const best = combined[0];
          const pin = best.pin || best.acct;
          const route = JURISDICTION_ROUTES[best.jurisdiction];
          if (route && pin) {
            router.push(route.param ? `/results?acct=${pin}&jurisdiction=${route.param}` : `/results?pin=${pin}`);
            return;
          }
        }
      } catch { /* */ }
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSearch}>
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-black/[0.06]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
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
              />
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden bg-white border border-black/[0.08]">
                  {suggestions.map((s, i) => (
                    <button
                      key={s.pin || s.acct || i}
                      type="button"
                      className={`w-full px-5 py-3.5 text-left transition-colors hover:bg-[#f7f6f3] ${i !== suggestions.length - 1 ? "border-b border-black/[0.04]" : ""}`}
                      onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s); }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-[#1a1a1a]">{toTitleCase(s.address)}</div>
                        <span className={`${JURISDICTION_BADGE} whitespace-nowrap flex-shrink-0`}>
                          {JURISDICTION_LABELS[s.jurisdiction] || s.jurisdiction}
                        </span>
                      </div>
                      <div className="text-sm mt-0.5 text-[#777]">
                        {toTitleCase(s.city)}, {s.jurisdiction === "cook_county_il" ? `IL ${(s.zip || "").split('-')[0]}` : "TX"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {noMatch && showSuggestions && (
                <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 bg-white border border-black/[0.08] p-5">
                  {notifySubmitted ? (
                    <div className="text-center py-2">
                      <div className="text-[#1a6b5a] mb-2">
                        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="font-medium text-[#1a1a1a] text-sm">Got it! We&apos;ll email you when we add your area.</p>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-[#1a1a1a] text-sm">We don&apos;t cover that address yet</p>
                      <p className="text-xs text-[#999] mt-1 mb-3">Want us to notify you when we expand?</p>
                      <div className="flex gap-2" onMouseDown={(e) => e.preventDefault()}>
                        <input
                          type="email"
                          placeholder="you@email.com"
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleNotifySubmit(e); } }}
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
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="h-14 px-8 rounded-xl font-medium text-base transition-all disabled:opacity-40 bg-[#1a6b5a] text-white hover:bg-[#155a4c] shadow-lg shadow-[#1a6b5a]/20 whitespace-nowrap"
            >
              {loading ? "..." : "See My Savings"}
            </button>
          </div>
          <p className="text-[12px] text-[#999] mt-3 flex items-center justify-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Free lookup · No signup · We never store your address
          </p>
        </div>
      </form>
    </div>
  );
}
