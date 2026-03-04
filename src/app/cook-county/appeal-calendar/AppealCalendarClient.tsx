"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ALL_TOWNSHIPS,
  getTownshipsByTriad,
  getAppealStatus2026,
  type Triad,
  type TownshipCalendar,
} from "@/lib/cook-township-calendar";

const TRIAD_COLORS: Record<Triad, { bg: string; text: string; badge: string }> = {
  'South/West': { bg: 'bg-emerald-50', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-800' },
  'North': { bg: 'bg-blue-50', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' },
  'City': { bg: 'bg-amber-50', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800' },
};

function StatusBadge({ status }: { status: 'open' | 'upcoming' | 'closed' }) {
  const styles = {
    open: 'bg-green-100 text-green-800 border-green-200',
    upcoming: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    closed: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const labels = { open: '🟢 Open', upcoming: '🟡 Upcoming', closed: '⚪ Closed' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function TownshipRow({ township }: { township: TownshipCalendar }) {
  const [expanded, setExpanded] = useState(false);
  const stages = getAppealStatus2026(township);
  const colors = TRIAD_COLORS[township.triad];
  
  return (
    <div className="border-b border-black/[0.06]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-4 px-4 sm:px-6 text-left hover:bg-[#fafaf8] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium text-[#1a1a1a]">{township.name}</span>
          <span className={`text-[11px] font-medium rounded-md px-2 py-0.5 ${colors.badge}`}>
            {township.triad}
          </span>
          {township.isReassessmentYear2026 && (
            <span className="text-[11px] font-semibold rounded-md px-2 py-0.5 bg-emerald-600 text-white">
              2026 Reassessment
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {stages.map(s => <StatusBadge key={s.stage} status={s.status} />)}
          <span className={`ml-2 text-[#999] transition-transform duration-200 ${expanded ? 'rotate-45' : ''}`}>+</span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 sm:px-6 pb-4 space-y-3">
          {stages.map(s => (
            <div key={s.stage} className="flex items-start gap-3">
              <div className="min-w-[120px]">
                <span className="text-sm font-medium text-[#555]">{s.stage}</span>
              </div>
              <div>
                <StatusBadge status={s.status} />
                <p className="text-sm text-[#666] mt-1">{s.description}</p>
              </div>
            </div>
          ))}
          {township.isReassessmentYear2026 && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800">
                <strong>💰 Biggest savings opportunity!</strong> Your township is being reassessed in 2026. 
                A successful appeal locks in savings for 3 years. Get notified when the window opens.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmailSignup() {
  const [email, setEmail] = useState('');
  const [township, setTownship] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, township: township || undefined, source: 'appeal-calendar' }),
      });
      setSubmitted(true);
    } catch {
      // silent fail
    }
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
        <p className="text-emerald-800 font-medium">✅ You&apos;re on the list! We&apos;ll notify you when your appeal window opens.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-[#f7f6f3] border border-black/[0.06] rounded-xl space-y-4">
      <h3 className="text-lg font-semibold text-[#1a1a1a]">📬 Get Notified When Your Window Opens</h3>
      <p className="text-sm text-[#666]">
        We&apos;ll email you as soon as your township&apos;s appeal period starts — so you don&apos;t miss the deadline.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Your email"
          className="flex-1 px-4 py-3 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b5a]/30"
        />
        <select
          value={township}
          onChange={e => setTownship(e.target.value)}
          className="px-4 py-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a6b5a]/30"
        >
          <option value="">All townships</option>
          {ALL_TOWNSHIPS.map(t => (
            <option key={t.name} value={t.name}>{t.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#1a6b5a] text-white rounded-lg text-sm font-medium hover:bg-[#155a4a] transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Notify Me'}
        </button>
      </div>
    </form>
  );
}

export default function AppealCalendarClient() {
  const [filter, setFilter] = useState<'all' | Triad>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = filter === 'all' ? ALL_TOWNSHIPS : getTownshipsByTriad(filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [filter, search]);

  const southWestCount = getTownshipsByTriad('South/West').length;

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      {/* Header */}
      <header className="bg-white border-b border-black/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[#1a6b5a] font-[family-name:var(--font-display)]">
            Overtaxed
          </Link>
          <Link
            href="/"
            className="text-sm text-[#1a6b5a] hover:underline"
          >
            ← Look up your property
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] font-[family-name:var(--font-display)]">
            Cook County Property Tax Appeal Calendar 2026
          </h1>
          <p className="text-lg text-[#555] leading-relaxed">
            Every Cook County property owner can appeal their assessment — but only during specific windows. 
            Find your township below to see when you can file.
          </p>
        </div>

        {/* Key info banner */}
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <h2 className="font-semibold text-emerald-900 text-lg">🔥 2026: South &amp; West Suburbs Being Reassessed</h2>
          <p className="text-sm text-emerald-800 leading-relaxed">
            <strong>{southWestCount} townships</strong> in the south and west suburbs are getting new assessments in 2026. 
            Reassessment notices will mail starting spring 2026. This is when the biggest reductions happen — 
            a successful appeal now <strong>locks in savings for 3 years</strong>.
          </p>
          <p className="text-sm text-emerald-800">
            Not in a reassessment township? You can still appeal at the Board of Review later this year.
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-[#1a1a1a]">How Cook County Appeals Work</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-black/[0.06]">
              <div className="text-2xl mb-2">1️⃣</div>
              <h3 className="font-semibold text-[#1a1a1a] mb-1">Assessor Appeal</h3>
              <p className="text-sm text-[#666]">
                Opens ~30 days after reassessment notices mail. Free to file. 
                Best chance for large reductions in reassessment years.
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-black/[0.06]">
              <div className="text-2xl mb-2">2️⃣</div>
              <h3 className="font-semibold text-[#1a1a1a] mb-1">Board of Review</h3>
              <p className="text-sm text-[#666]">
                Second chance to appeal — even if you missed the Assessor window. 
                Available to ALL townships every year (reassessment or not).
              </p>
            </div>
          </div>
          <p className="text-sm text-[#888]">
            This &quot;two-bite&quot; system means you get two chances to lower your assessment every cycle. 
            Most counties only give you one.
          </p>
        </div>

        {/* Triennial cycle explainer */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-[#1a1a1a]">The Triennial Cycle</h2>
          <p className="text-sm text-[#555]">
            Cook County reassesses property values on a 3-year rotation by geographic area:
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {([
              { triad: 'North' as Triad, years: '2025, 2028, 2031', count: 14, emoji: '🔵' },
              { triad: 'City' as Triad, years: '2024, 2027, 2030', count: 8, emoji: '🟡' },
              { triad: 'South/West' as Triad, years: '2023, 2026, 2029', count: 16, emoji: '🟢' },
            ]).map(({ triad, years, count, emoji }) => (
              <div 
                key={triad} 
                className={`p-4 rounded-xl border ${
                  triad === 'South/West' ? 'border-emerald-300 bg-emerald-50' : 'bg-white border-black/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{emoji}</span>
                  <span className="font-semibold text-sm">{triad} Suburbs</span>
                </div>
                <p className="text-xs text-[#666]">{count} townships</p>
                <p className="text-xs text-[#888] mt-1">Reassessed: {years}</p>
                {triad === 'South/West' && (
                  <p className="text-xs font-semibold text-emerald-700 mt-1">← Being reassessed NOW</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Email signup */}
        <EmailSignup />

        {/* Township list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1a1a1a]">All 38 Townships</h2>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search township..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-black/10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a6b5a]/30"
            />
            <div className="flex gap-2">
              {(['all', 'South/West', 'North', 'City'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f 
                      ? 'bg-[#1a6b5a] text-white' 
                      : 'bg-white border border-black/10 text-[#555] hover:bg-[#f0f0ee]'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Township rows */}
          <div className="bg-white rounded-xl border border-black/[0.06] overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-[#888] text-sm">No townships match your search.</div>
            ) : (
              filtered.map(t => <TownshipRow key={t.name} township={t} />)
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="p-6 bg-white rounded-xl border border-black/[0.06] text-center space-y-3">
          <h2 className="text-xl font-semibold text-[#1a1a1a]">Ready to Appeal?</h2>
          <p className="text-sm text-[#666] max-w-md mx-auto">
            Look up your property to see how your assessment compares to similar homes. 
            If you&apos;re over-assessed, get a complete appeal package for just $49.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-[#1a6b5a] text-white rounded-lg font-medium hover:bg-[#155a4a] transition-colors"
          >
            Look Up Your Property
          </Link>
        </div>

        {/* Sources */}
        <div className="text-xs text-[#999] space-y-1">
          <p><strong>Sources:</strong></p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Cook County Assessor&apos;s Office — Assessment Calendar &amp; Deadlines (updated 1/27/2026)</li>
            <li>Cook County Board of Review — Township Open/Close Schedule</li>
            <li>Board of Review Appeals Portal — appeals.cookcountyboardofreview.com</li>
          </ul>
          <p className="mt-2">
            Dates are approximate. Official windows are announced by the Assessor and Board of Review 
            as each township&apos;s period approaches. Sign up above to get notified.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-[#999]">
          © 2026 Overtaxed · <Link href="/" className="text-[#1a6b5a] hover:underline">getovertaxed.com</Link>
        </div>
      </footer>
    </div>
  );
}
