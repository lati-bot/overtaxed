"use client";

import Link from "next/link";
import type { MetroConfig } from "@/lib/metros";
import MetroSearch from "@/components/MetroSearch";
import FAQAccordion from "@/components/FAQAccordion";

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-[#1a6b5a] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function MetroPageClient({ metro }: { metro: MetroConfig }) {
  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      {/* Nav */}
      <nav className="border-b border-black/[0.06] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#1a6b5a] tracking-tight">
            Overtaxed
          </Link>
          <span className="text-sm text-[#999]">{metro.name}, {metro.state}</span>
        </div>
      </nav>

      {/* 2026 Data Live Banner */}
      {(metro.slug === "austin" || metro.slug === "dallas") && (
        <div className="bg-[#1a6b5a] text-white text-center py-2.5 px-4 text-sm font-medium">
          🔥 2026 preliminary appraisal values are live for {metro.slug === "austin" ? "Travis County" : "Denton County"}. {metro.slug === "austin" && "Fresh data updated March 2026."} Check your property now — deadline May 15.
        </div>
      )}

      {/* Austin 2026 Changes Banner */}
      {metro.slug === "austin" && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 rounded-full p-1.5 flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-1">What's New in Austin 2026</h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  <strong>Average Travis County values increased 8-12%</strong> from 2025. Central Austin (78701-78705) saw the largest jumps. 
                  East Austin (78702, 78721) and South Austin (78704, 78745) had moderate 6-8% increases. 
                  Properties in Cedar Park and Round Rock areas showed more conservative 4-6% growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="bg-white border-b border-black/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] tracking-tight leading-tight">
            Protest Your Property Taxes in {metro.name}
          </h1>
          <p className="mt-4 text-lg text-[#666] max-w-2xl mx-auto">
            Get your $49 evidence packet with comparable properties, cover letter, and step-by-step filing guide
          </p>
          <div className="mt-8">
            <MetroSearch jurisdictions={metro.jurisdictions} placeholder={metro.placeholder} />
          </div>
          <p className="mt-4 text-sm text-[#999]">{metro.trustLine}</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-[#1a1a1a] text-center mb-10">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Search your address", desc: "Enter your home address to look up your property's assessed value." },
            { step: "2", title: "See if you're over-assessed", desc: "We compare your property to similar homes — free, instant results." },
            { step: "3", title: "Get your protest package", desc: "Download your $49 evidence packet with comps, cover letter, and filing guide." },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-6 border border-black/[0.06]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div className="w-10 h-10 rounded-full bg-[#eef4f2] text-[#1a6b5a] font-bold text-lg flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-[#1a1a1a] text-lg mb-2">{item.title}</h3>
              <p className="text-[#666] text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Local Stats */}
      <section className="bg-white border-y border-black/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid sm:grid-cols-2 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#1a6b5a]">{metro.propertyCount}</div>
              <p className="mt-2 text-[#666]">properties analyzed in {metro.name}</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#1a6b5a]">${metro.avgSavings}/yr</div>
              <p className="mt-2 text-[#666]">average potential savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2026 Changes for Austin */}
      {metro.slug === "austin" && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-[#1a1a1a] text-center mb-8">What Changed in Austin for 2026</h2>
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/[0.06]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3">Travis County (TCAD) Updates</h3>
                <div className="flex items-start gap-3">
                  <CheckIcon />
                  <div className="text-[#666] text-sm">
                    <span className="font-medium text-[#1a1a1a]">2026 Values Released:</span> March 2026 preliminary assessments available online
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckIcon />
                  <div className="text-[#666] text-sm">
                    <span className="font-medium text-[#1a1a1a]">Market Trends:</span> Central Austin values up 8-12%, suburban areas more stable (+3-6%)
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckIcon />
                  <div className="text-[#666] text-sm">
                    <span className="font-medium text-[#1a1a1a]">New Construction:</span> Significant new builds affecting comparable property analysis
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-3">Filing Guidance</h3>
                <div className="flex items-start gap-3">
                  <CheckIcon />
                  <div className="text-[#666] text-sm">
                    <span className="font-medium text-[#1a1a1a]">Best Time to File:</span> Early filing (March-April) gets better hearing slots
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckIcon />
                  <div className="text-[#666] text-sm">
                    <span className="font-medium text-[#1a1a1a]">Strong Cases:</span> Properties with 15%+ over-assessment vs recent sales
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckIcon />
                  <div className="text-[#666] text-sm">
                    <span className="font-medium text-[#1a1a1a]">Success Rate:</span> 78% of protested properties get reductions in Travis County
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filing Info */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-[#1a1a1a] text-center mb-8">Filing Information for {metro.name}</h2>
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/[0.06]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckIcon />
              <div>
                <span className="font-medium text-[#1a1a1a]">Deadline:</span>{" "}
                <span className="text-[#666]">{metro.deadline}</span>
                {metro.slug === "austin" && (
                  <span className="block text-[#666] text-sm mt-1">File by May 15 or 30 days after receiving your notice of appraised value, whichever is later</span>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon />
              <div>
                <span className="font-medium text-[#1a1a1a]">Protest type:</span>{" "}
                <span className="text-[#666]">{metro.protestType}</span>
                {metro.slug === "austin" && (
                  <span className="block text-[#666] text-sm mt-1">Most successful argument: "Market value is excessive" with comparable property evidence</span>
                )}
              </div>
            </div>
            {metro.slug === "austin" && (
              <div className="flex items-start gap-3">
                <CheckIcon />
                <div>
                  <span className="font-medium text-[#1a1a1a]">TCAD Online Filing:</span>{" "}
                  <span className="text-[#666]">File protests instantly at </span>
                  <a href="https://www.traviscad.org" target="_blank" rel="noopener noreferrer" className="text-[#1a6b5a] underline underline-offset-2 hover:text-[#155a4c]">
                    traviscad.org
                  </a>
                  <span className="block text-[#666] text-sm mt-1">Upload your Overtaxed evidence packet as supporting documentation</span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <CheckIcon />
              <div>
                <span className="font-medium text-[#1a1a1a]">Filing portals:</span>
                <div className="mt-1 space-y-1">
                  {metro.portalInfo.map((p) => (
                    <div key={p.county}>
                      <span className="text-[#666]">{p.county}: </span>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[#1a6b5a] underline underline-offset-2 hover:text-[#155a4c]">
                        {p.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {metro.slug === "austin" && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  TCAD-Specific Tips
                </h4>
                <ul className="text-sm text-blue-800 space-y-1.5">
                  <li>• TCAD requires <strong>evidence of market value</strong> — comparable sales are strongest</li>
                  <li>• File online at <strong>traviscad.org</strong> using account number from your notice</li>
                  <li>• Upload your evidence packet (comps, photos) directly in the portal</li>
                  <li>• Request an <strong>informal hearing first</strong> — many issues resolve without ARB</li>
                  <li>• If informal doesn't work, your case automatically goes to ARB (formal hearing)</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white border-y border-black/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-[#1a1a1a] text-center mb-8">Frequently Asked Questions</h2>
          <FAQAccordion items={metro.faqs.map(faq => ({ q: faq.question, a: faq.answer }))} />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-4">
          Search your address to see if you&apos;re over-assessed — it&apos;s free
        </h2>
        <div className="mt-8">
          <MetroSearch jurisdictions={metro.jurisdictions} placeholder={metro.placeholder} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-[#999]">
          © {new Date().getFullYear()} Overtaxed. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
