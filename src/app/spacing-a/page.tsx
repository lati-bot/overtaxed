// VARIANT A: Original spacing (before any spacing changes)
// Stats: py-12 sm:py-16 | Testimonial: py-16 sm:py-20 | HowItWorks: py-16 sm:py-24 mb-20
// Pricing: py-16 sm:py-24 mb-12 | FAQ: py-16 sm:py-24 mb-16 | Footer CTA: py-20 sm:py-28
export default function SpacingA() {
  return (
    <div className="min-h-screen bg-[#f7f6f3] text-[#1a1a1a]" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <nav className="sticky top-0 z-50 bg-[#f7f6f3]/90 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl tracking-[-0.02em] font-medium text-[#1a1a1a] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[3px] bg-[#1a6b5a]" />
            overtaxed
          </div>
          <div className="px-4 py-2 rounded-lg bg-[#1a6b5a] text-white text-sm font-medium">
            A — Original Spacing
          </div>
        </div>
      </nav>

      {/* Hero placeholder */}
      <section className="pt-16 sm:pt-24 pb-6 sm:pb-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-6">4.9 million properties analyzed</p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-normal leading-[1.12] tracking-[-0.03em]">Find out if you&apos;re<br />overpaying property tax</h1>
          <p className="mt-6 text-lg text-[#666] leading-relaxed max-w-xl mx-auto font-light">We compare your home to similar properties assessed lower — and build your appeal case in minutes. Free to check, no signup.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-[#999]">
            <span>DFW</span><span className="text-[#ddd]">·</span><span>Houston</span><span className="text-[#ddd]">·</span><span>Austin</span><span className="text-[#ddd]">·</span><span>Chicago metro</span><span className="text-[#ccc]">— 9 counties</span>
          </div>
          <div className="mt-6 w-full max-w-xl mx-auto">
            <div className="rounded-2xl bg-white p-4 sm:p-5 border border-black/[0.06]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Enter your home address..." className="w-full h-14 px-5 rounded-xl text-base bg-[#f7f6f3] border border-black/[0.06] text-[#1a1a1a] placeholder-[#aaa]" disabled />
                <button className="h-14 px-8 rounded-xl font-medium text-base bg-[#1a6b5a] text-white whitespace-nowrap">See My Savings</button>
              </div>
              <p className="text-[12px] text-[#999] mt-3 text-center">Free lookup · No signup · We never store your address</p>
            </div>
          </div>
          <div className="mt-5"><p className="text-[14px] text-[#888]"><span className="font-medium text-[#666]">48,000+</span> homeowners checked this tax season</p></div>
        </div>
      </section>

      {/* Stats — ORIGINAL: py-12 sm:py-16 */}
      <section className="py-12 sm:py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="border-t border-black/[0.06] pt-12 sm:pt-16">
            <div className="grid grid-cols-3 gap-8 sm:gap-16">
              {[{ value: "$1,136", label: "Avg. annual savings" },{ value: "32%", label: "Homes over-assessed" },{ value: "72%", label: "Appeal success rate" }].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-5xl font-medium tracking-[-0.03em] text-[#1a1a1a]">{stat.value}</div>
                  <div className="mt-2 text-[11px] sm:text-[13px] tracking-[0.05em] uppercase text-[#999]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial — ORIGINAL: py-16 sm:py-20 */}
      <section className="py-16 sm:py-20 px-6 bg-[#f0ede7]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[22px] sm:text-[26px] font-normal leading-relaxed tracking-[-0.01em]">&ldquo;I was paying $1,400 more than my neighbor for a smaller house. Overtaxed found 6 comps and I won my appeal in 3 weeks.&rdquo;</p>
          <p className="mt-4 text-[13px] text-[#999]">— Rachel M., Collin County, TX</p>
        </div>
      </section>

      {/* How it Works — ORIGINAL: py-16 sm:py-24, mb-20 */}
      <section className="py-16 sm:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-20">Three steps to your appeal</h2>
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-black/[0.06]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-20 sm:divide-x sm:divide-black/[0.06]">
              {[{ num: "01", title: "Enter your address", desc: "We pull your property data from public records automatically. Covers the DFW, Houston, and Austin metros plus Cook County, IL." },{ num: "02", title: "We find your comps", desc: "Our system identifies similar properties assessed lower than yours — the foundation of your appeal." },{ num: "03", title: "File your appeal", desc: "Download your complete appeal package and file it yourself. We show you exactly how, step by step." }].map((step, i) => (
                <div key={step.num} className={i > 0 ? "sm:pl-10" : ""}>
                  <div className="border-t border-black/[0.06] pt-6 sm:border-t-0 sm:pt-0">
                    <div className="text-[14px] font-medium tracking-[0.15em] text-[#aaa] mb-4">{step.num}</div>
                    <h3 className="text-lg font-medium mb-3 text-[#1a1a1a]">{step.title}</h3>
                    <p className="text-[15px] leading-relaxed text-[#666] font-light">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing — ORIGINAL: py-16 sm:py-24, mb-12 */}
      <section className="py-16 sm:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-4">One price. No surprises.</h2>
          <p className="text-lg text-[#666] font-light mb-12">No percentage of savings. No hidden fees.</p>
          <div className="rounded-2xl p-8 sm:p-12 bg-white border border-black/[0.06] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
              <div>
                <div className="text-6xl sm:text-7xl font-normal tracking-[-0.03em]">$49</div>
                <div className="mt-2 text-[15px] text-[#999]">One-time per property</div>
              </div>
              <button className="h-14 px-8 rounded-xl font-medium text-base bg-[#1a6b5a] text-white">See My Savings</button>
            </div>
            <div className="border-t border-black/[0.06] pt-8 mb-8">
              <p className="text-[13px] text-[#999] tracking-[0.1em] uppercase mb-4">How we compare</p>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center"><div className="text-2xl sm:text-3xl font-semibold text-[#1a6b5a]">$49</div><div className="text-[12px] text-[#999] mt-1">Overtaxed</div></div>
                <div className="text-[#ccc] text-base font-light">vs</div>
                <div className="text-center"><div className="text-2xl sm:text-3xl font-normal text-[#bbb] line-through">~$340</div><div className="text-[12px] text-[#999] mt-1">Typical attorney (25–30%)</div></div>
              </div>
            </div>
            <div className="border-t border-black/[0.06] pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["Complete filing package with 5+ comparable properties","Professional evidence brief ready to submit","Step-by-step filing instructions for your county","Delivered to your email instantly"].map((item) => (
                  <div key={item} className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#1a6b5a] mt-2 flex-shrink-0" /><span className="text-[15px] text-[#444] font-light">{item}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — ORIGINAL: py-16 sm:py-24, mb-16 */}
      <section className="py-16 sm:py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] tracking-[0.15em] uppercase text-[#999] mb-4">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.02em] mb-16">Common questions</h2>
          <div className="space-y-8 sm:space-y-10">
            {[{ q: "Do I need a lawyer to appeal?", a: "No. Individual homeowners can file appeals themselves. We give you everything you need — comparable properties, evidence brief, and step-by-step instructions." },{ q: "What if my appeal doesn't work?", a: "There's no penalty for appealing. If your assessment isn't reduced, you've lost nothing but the filing time." },{ q: "When can I file?", a: "In Texas, protest after receiving your appraisal notice (usually late March). Deadline is May 15 or 30 days after your notice. In Cook County, IL, appeals open by township on a rotating schedule." },{ q: "Why is this so much cheaper?", a: "Attorneys charge a percentage of savings because they can. We automate the research that used to take hours. Same analysis, fraction of the cost." },{ q: "What areas do you cover?", a: "4.9M+ properties across DFW (Dallas, Tarrant, Collin, Denton), Houston (Harris, Fort Bend), Austin (Travis, Williamson), and Cook County, IL. More coming." }].map((item, i) => (
              <div key={i} className="border-b border-black/[0.06] pb-8 sm:pb-10"><h3 className="text-lg font-medium mb-3 text-[#1a1a1a]">{item.q}</h3><p className="text-[15px] leading-relaxed text-[#666] font-light">{item.a}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA — ORIGINAL: py-20 sm:py-28 */}
      <section className="py-20 sm:py-28 px-6 bg-[#0f2d26] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.02em] mb-4 text-white">See if you have a case</h2>
          <p className="text-lg text-[#aaa] font-light mb-10">The average homeowner saves $1,136/year. At $49, that&apos;s a 23x return.</p>
        </div>
      </section>

      <footer className="py-10 px-6 border-t border-black/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[13px] text-[#999]">© 2026 Overtaxed</div>
          <div className="flex items-center gap-6 text-[13px] text-[#999]"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><span>hello@getovertaxed.com</span></div>
          <div className="text-[13px] text-[#999]">Dallas · Houston · Austin · Chicago</div>
        </div>
      </footer>
    </div>
  );
}
