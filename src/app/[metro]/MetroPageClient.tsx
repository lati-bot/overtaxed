"use client";

import Link from "next/link";
import type { MetroConfig } from "@/lib/metros";
import MetroSearch from "@/components/MetroSearch";

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
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon />
              <div>
                <span className="font-medium text-[#1a1a1a]">Protest type:</span>{" "}
                <span className="text-[#666]">{metro.protestType}</span>
              </div>
            </div>
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
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-white border-y border-black/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-[#1a1a1a] text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {metro.faqs.map((faq, i) => (
              <div key={i} className="border-b border-black/[0.06] pb-6 last:border-0 last:pb-0">
                <h3 className="font-semibold text-[#1a1a1a] text-lg mb-2">{faq.question}</h3>
                <p className="text-[#666] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
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
