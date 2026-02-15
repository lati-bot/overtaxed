"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CerbyContent() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const [activeTab, setActiveTab] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (key === "cerby2026") {
      setAuthenticated(true);
    }
  }, [key]);

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a1a", color: "#999", fontFamily: "system-ui" }}>
        <p>Not found.</p>
      </div>
    );
  }

  const tabs = [
    { label: "1. Technical Analysis", id: "analysis" },
    { label: "2. 2.0 Blueprint", id: "blueprint" },
    { label: "3. Data Team Playbook", id: "playbook" },
    { label: "4. Data Platform Plan", id: "platform" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #30363d", padding: "16px 20px", position: "sticky", top: 0, background: "#0d1117", zIndex: 10 }}>
        <h1 style={{ fontSize: "18px", fontWeight: 600, margin: 0, color: "#f0f6fc" }}>Cerby Strategy Docs</h1>
        <p style={{ fontSize: "12px", color: "#7d8590", margin: "4px 0 12px" }}>Private — 4 documents</p>
        
        {/* Tab bar - scrollable on mobile */}
        <div style={{ display: "flex", gap: "4px", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "4px" }}>
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid " + (activeTab === i ? "#1a6b5a" : "#30363d"),
                background: activeTab === i ? "#1a6b5a22" : "transparent",
                color: activeTab === i ? "#4ade80" : "#7d8590",
                fontSize: "13px",
                fontWeight: activeTab === i ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 20px", maxWidth: "800px", margin: "0 auto" }}>
        <article
          className="cerby-doc"
          dangerouslySetInnerHTML={{
            __html: activeTab === 0 ? doc1Html : activeTab === 1 ? doc2Html : activeTab === 2 ? doc3Html : doc4Html,
          }}
        />
      </div>

      <style>{`
        .cerby-doc h1 { font-size: 24px; font-weight: 700; color: #f0f6fc; margin: 32px 0 16px; border-bottom: 1px solid #30363d; padding-bottom: 8px; }
        .cerby-doc h2 { font-size: 20px; font-weight: 600; color: #f0f6fc; margin: 28px 0 12px; }
        .cerby-doc h3 { font-size: 16px; font-weight: 600; color: #e6edf3; margin: 24px 0 8px; }
        .cerby-doc h4 { font-size: 14px; font-weight: 600; color: #e6edf3; margin: 20px 0 8px; }
        .cerby-doc p { font-size: 15px; line-height: 1.7; color: #c9d1d9; margin: 0 0 16px; }
        .cerby-doc strong { color: #f0f6fc; }
        .cerby-doc ul, .cerby-doc ol { padding-left: 24px; margin: 0 0 16px; }
        .cerby-doc li { font-size: 15px; line-height: 1.7; color: #c9d1d9; margin-bottom: 6px; }
        .cerby-doc blockquote { border-left: 3px solid #1a6b5a; padding: 8px 16px; margin: 16px 0; background: #1a6b5a11; border-radius: 0 8px 8px 0; }
        .cerby-doc blockquote p { color: #adbac7; margin: 0; }
        .cerby-doc code { background: #161b22; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #79c0ff; }
        .cerby-doc pre { background: #161b22; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 0 0 16px; border: 1px solid #30363d; }
        .cerby-doc pre code { padding: 0; background: none; font-size: 13px; line-height: 1.5; }
        .cerby-doc table { width: 100%; border-collapse: collapse; margin: 0 0 16px; font-size: 14px; display: block; overflow-x: auto; }
        .cerby-doc th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #30363d; color: #f0f6fc; font-weight: 600; white-space: nowrap; }
        .cerby-doc td { padding: 8px 12px; border-bottom: 1px solid #21262d; color: #c9d1d9; }
        .cerby-doc tr:hover td { background: #161b22; }
        .cerby-doc hr { border: none; border-top: 1px solid #30363d; margin: 32px 0; }
        .cerby-doc em { color: #8b949e; }
      `}</style>
    </div>
  );
}

export default function CerbyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0d1117" }} />}>
      <CerbyContent />
    </Suspense>
  );
}

// ============================================================
// Document HTML strings (converted from markdown)
// ============================================================

const doc1Html = `
<h1>Cerby 2.0 — Technical Architecture Analysis</h1>

<h2>What Cerby Does Today</h2>
<p>Cerby secures "disconnected apps" — the apps that don't support SSO (SAML/OIDC), SCIM, or APIs. Think: social media accounts, legacy web apps, shared logins, apps behind SSO paywalls. Their core: <strong>browser extension + RPA + access orchestration engine</strong>.</p>
<p><strong>Funding</strong>: $72.5M across 4 rounds (Seed → Series B). Investors include Founders Fund, Okta Ventures, Salesforce Ventures, Ridge Ventures, Two Sigma Ventures.</p>
<p><strong>Founded</strong>: 2020. CEO Belsasar Lepe (Stanford, ex-Google, co-founded Ooyala — sold to Telstra for $270M).</p>

<h2>The 7 Core Problems (Ranked by Severity)</h2>

<h3>1. FRAGILITY — The #1 Existential Threat</h3>
<p>Every app gets a hand-crafted automation script. When the app changes its UI (which happens constantly), the script breaks. This means:</p>
<ul>
<li>Dedicated QA monitoring for every supported app, every day</li>
<li>Customer incidents when an app updates overnight</li>
<li>Engineering time spent on maintenance instead of features</li>
<li><strong>Trust erosion</strong>: one broken login = IT admin questions the whole platform</li>
</ul>

<h3>2. COVERAGE SCALING — The Long Tail Problem</h3>
<p>Enterprises use 500-1000+ apps. Cerby can't write custom scripts for all of them. Every new customer brings apps Cerby hasn't seen. This creates:</p>
<ul>
<li>Sales friction ("do you support X?")</li>
<li>Onboarding delays (custom script development per customer)</li>
<li>A linear relationship between engineering hours and app coverage — doesn't scale</li>
</ul>

<h3>3. ANTI-BOT ARMS RACE</h3>
<p>Platforms actively fight automation: CAPTCHAs, device fingerprinting, behavioral analysis, rate limiting, IP reputation. Cerby is essentially building a "good bot" that has to evade the same defenses built to stop "bad bots."</p>

<h3>4. CREDENTIAL VAULT = HIGH-VALUE TARGET</h3>
<p>Cerby stores/manages credentials for apps that don't support SSO. That makes Cerby's infrastructure the single richest target. One breach exposes every customer's every managed account.</p>

<h3>5. MOBILE + NON-BROWSER GAP</h3>
<p>Browser extension works on desktop. But many "disconnected apps" are mobile-first or have native desktop clients. The extension can't intercept those flows.</p>

<h3>6. LATENCY & RELIABILITY</h3>
<p>RPA is inherently slower and less reliable than API calls. DOM parsing, element detection, network timing, CAPTCHAs — all add unpredictable latency. Users expect sub-second auth.</p>

<h3>7. PLATFORM TOS RISK</h3>
<p>Automating logins on platforms you don't own violates most ToS. At enterprise scale, this is a legal and business risk.</p>

<hr />

<h2>My Recommendation: Option A + Elements of C</h2>

<h3>The 2.0 Architecture</h3>
<ol>
<li><strong>AI-native browser agent as the default</strong> — solves coverage and fragility overnight</li>
<li><strong>Undocumented API discovery program</strong> — for top 100 apps, reverse-engineer their actual APIs. 10-100x more stable than UI automation</li>
<li><strong>SSO Bridge</strong> — game-changing value prop. "We make every app SSO-capable." Customer doesn't need to buy enterprise tier everywhere</li>
<li><strong>Deterministic scripts as premium tier</strong> — keep existing RPA for top 20 apps where 99.99% reliability is needed</li>
<li><strong>Ditch the proxy approach</strong> — too invasive, too many edge cases, bad enterprise optics</li>
</ol>

<h3>Three Architecture Options Evaluated</h3>

<table>
<tr><th>Option</th><th>Approach</th><th>Verdict</th></tr>
<tr><td><strong>A: AI-Native</strong></td><td>Vision-based + accessibility tree UI understanding. Fine-tuned 7B model plans actions. Self-healing when UIs change.</td><td>✅ Recommended (primary)</td></tr>
<tr><td><strong>B: Proxy/MITM</strong></td><td>Sit between browser and app as transparent proxy. Inject credentials server-side.</td><td>❌ Too invasive, cert pinning breaks it, regulatory issues</td></tr>
<tr><td><strong>C: Hybrid Platform</strong></td><td>Multi-strategy: API connectors + SSO Bridge + AI agent + community connectors</td><td>✅ Elements adopted into recommendation</td></tr>
</table>

<h3>Implementation Priority</h3>
<p><strong>Phase 1 (0-3 months)</strong>: Build AI action engine prototype, test on 20 apps. Target: 95%+ first-attempt success rate.</p>
<p><strong>Phase 2 (3-6 months)</strong>: Ship AI alongside existing RPA (shadow mode). Build first 10 API connectors. Prototype SSO Bridge for 5-10 apps.</p>
<p><strong>Phase 3 (6-12 months)</strong>: AI becomes default for long-tail apps. SSO Bridge GA. 50+ API connectors. Community connector SDK alpha.</p>

<h3>The Moat</h3>
<ol>
<li><strong>Data flywheel</strong>: Every action trains the AI to handle more apps better</li>
<li><strong>Undocumented API catalog</strong>: Proprietary knowledge of how apps actually work</li>
<li><strong>SSO Bridge network effects</strong>: More apps bridged = more value for every customer</li>
<li><strong>Enterprise trust</strong>: 4+ years of SOC 2, customer references — hard to replicate</li>
</ol>

<h3>Questions I'd Want Answered Before Building</h3>
<ol>
<li>What's the current app coverage number? How many are requested but not supported?</li>
<li>What's the script maintenance burden? Engineering hours/week fixing broken scripts?</li>
<li>What's the reliability SLA today and how often is it missed?</li>
<li>What % of "nonstandard" apps actually have undocumented APIs?</li>
<li>Does the sales cycle stall on "do you support X?"</li>
<li>How do enterprise security teams feel about AI processing login pages?</li>
<li>What's the mobile coverage gap?</li>
<li>Revenue model fit for SSO Bridge — separate line or included?</li>
</ol>
`;

const doc2Html = `
<h1>Cerby 2.0 — Technical Blueprint</h1>
<p><em>A Comprehensive Architecture for AI-Native Identity Automation</em></p>

<h2>Part 1: Current State Assessment</h2>

<h3>Architecture Today</h3>
<p>Cerby's production system is a three-tier architecture: a <strong>Manifest V3 Chrome extension</strong> deployed via MDM, a <strong>cloud-hosted orchestration engine</strong> integrated with identity providers (Okta, Azure AD, Google Workspace), and a <strong>library of hand-authored RPA scripts</strong> — one per supported application.</p>
<p>This architecture works. The 4.6/5 G2 rating, SOC 2 Type II certification, and $72.5M in funding confirm product-market fit. Customers love the Okta integration and auto-offboarding.</p>

<h3>Structural Weaknesses</h3>
<p><strong>Linear engineering cost.</strong> Every supported app requires a dedicated script + ongoing maintenance. Direct, non-scalable relationship between headcount and coverage.</p>
<p><strong>Fragility under change.</strong> CSS selectors and XPaths are brittle. A single <code>div</code> class rename breaks automation for all customers. Engineering spends 30-50% of time on maintenance.</p>
<p><strong>Anti-bot escalation.</strong> Platforms are in a continuous arms race against automation. CAPTCHAs, behavioral fingerprinting, device attestation all degrade reliability over time.</p>

<h3>Competitive Positioning</h3>
<table>
<tr><th>Competitor</th><th>Approach</th><th>Cerby's Edge</th></tr>
<tr><td>1Password EAM</td><td>Credential vault + device trust</td><td>Deeper IDP integration, automated provisioning/deprovisioning</td></tr>
<tr><td>Grip Security</td><td>SaaS discovery via API/email logs</td><td>Grip discovers but doesn't automate; Cerby acts</td></tr>
<tr><td>Nudge Security</td><td>Passive discovery + nudges</td><td>Cerby provides enforcement, not just nudges</td></tr>
<tr><td>Savvy Security</td><td>Just-in-time browser guardrails</td><td>Cerby covers full lifecycle (provisioning → offboarding)</td></tr>
<tr><td>Silverfort</td><td>Identity threat detection + adaptive MFA</td><td>Cerby addresses apps Silverfort can't reach</td></tr>
</table>
<p>Cerby's unique position: the only vendor that <strong>acts</strong> on disconnected apps — not just discovers or monitors.</p>

<hr />

<h2>Part 2: The 2.0 Architecture</h2>

<h3>Multi-Strategy Orchestration</h3>
<p>The 2.0 platform dynamically selects the optimal integration method per app: AI browser agent, undocumented API connector, SSO bridge, or deterministic RPA script.</p>

<pre><code>CERBY ORCHESTRATOR
├── AI Browser Agent (long tail, self-healing)
├── API Connector Engine (reverse-engineered APIs, 10-100x more stable)
├── SSO Bridge Proxy (SAML/OIDC proxy for SSO-taxed apps)
├── Legacy RPA Scripts (top 20 apps, deterministic)
└── Strategy Router + Fallback Chain
         │
    Credential Vault (HSM-backed, zero-knowledge)
         │
    IDP Integration Layer (Okta / Azure AD / Google)</code></pre>

<h3>A. AI Browser Agent</h3>

<h4>Hybrid DOM + Vision Model</h4>
<p><strong>Primary path</strong>: Extract the <strong>accessibility tree</strong> (~5-20 KB) — semantic, stable, what screen readers use. Apps rarely break accessibility without legal liability.</p>
<p><strong>Vision fallback</strong>: When accessibility tree is insufficient (Canvas UIs, custom components), screenshot + bounding box approach with vision-language model.</p>
<p><strong>Action planning</strong>: Fine-tuned 7-8B model generates action sequences from structured page state + goal.</p>

<table>
<tr><th>Component</th><th>Model</th><th>Reasoning</th></tr>
<tr><td>Action planner</td><td>Fine-tuned Qwen-2.5-7B or Llama-3.1-8B</td><td>Low latency (~200ms), trainable on Cerby's corpus, deployable on-prem</td></tr>
<tr><td>Vision fallback</td><td>Claude 3.5 Sonnet or GPT-4o</td><td>Best-in-class VLM. Used ~10-15% of actions.</td></tr>
<tr><td>Confidence scorer</td><td>Lightweight classifier</td><td>Sub-10ms binary: "is action plan likely correct?"</td></tr>
</table>

<h4>Latency Per Operation</h4>
<table>
<tr><th>Step</th><th>Latency</th></tr>
<tr><td>Page load + DOM stabilization</td><td>500-2000ms</td></tr>
<tr><td>Accessibility tree extraction</td><td>10-50ms</td></tr>
<tr><td>Serialization + upload</td><td>30-100ms</td></tr>
<tr><td>Action planning (fine-tuned 7B)</td><td>150-300ms</td></tr>
<tr><td>Action execution</td><td>50-200ms/step</td></tr>
<tr><td>Verification</td><td>200-500ms</td></tr>
<tr><td><strong>Total</strong></td><td><strong>1-3 seconds</strong></td></tr>
</table>

<h4>Reliability Engineering</h4>
<ul>
<li><strong>Confidence thresholds</strong>: ≥0.95 auto-execute, 0.80-0.95 execute + flag, &lt;0.80 pause for human</li>
<li><strong>Circuit breakers</strong>: Per-app. >20% failure rate in 1hr → halt + alert</li>
<li><strong>Deterministic fallback</strong>: Top 50 apps retain RPA scripts. AI fails twice → fallback to deterministic.</li>
<li><strong>Health monitoring</strong>: Canary operations against top 200 apps every 4 hours</li>
<li><strong>Target</strong>: 97% first-attempt success within 6 months. 99% with one retry.</li>
</ul>

<h4>Cost Modeling</h4>
<table>
<tr><th>Scale</th><th>Actions/Day</th><th>Est. Cost/Day</th><th>Cost/Action</th></tr>
<tr><td>Startup</td><td>1,000</td><td>$15-25</td><td>$0.015-0.025</td></tr>
<tr><td>Growth</td><td>10,000</td><td>$80-150</td><td>$0.008-0.015</td></tr>
<tr><td>Scale</td><td>100,000</td><td>$400-800</td><td>$0.004-0.008</td></tr>
</table>
<p>At $5-15/user/month with 500 users generating 200 actions/day, AI cost is $1.50-3.00/day — well under 1% of revenue.</p>

<h4>Credential Security</h4>
<p><strong>Credentials never sent to external AI APIs.</strong> Fine-tuned model runs on Cerby infrastructure. Action plans use <code>[CREDENTIAL_PLACEHOLDER]</code> — extension substitutes real password locally. Screenshots redacted before external vision API calls.</p>

<h3>B. Undocumented API Discovery</h3>
<p>Many "non-standard" apps actually have REST/GraphQL APIs under the hood — just undocumented. Intercepting and reverse-engineering these yields integrations <strong>10-100x more reliable and faster</strong> than UI automation.</p>

<h4>Methodology</h4>
<ol>
<li><strong>Traffic capture</strong> via browser extension <code>webRequest</code> API during manual operations</li>
<li><strong>API mapping</strong> — identify endpoints, auth mechanisms, schemas</li>
<li><strong>Replay validation</strong> — standalone API client replays without browser</li>
<li><strong>Stability assessment</strong> — 30-60 day monitoring before shipping</li>
<li><strong>Connector codification</strong> — versioned connector with automated health checks</li>
</ol>

<h4>Best Targets</h4>
<table>
<tr><th>Category</th><th>API Discoverability</th><th>Why</th></tr>
<tr><td>Modern SaaS (Notion, Airtable, Canva)</td><td>High</td><td>React/Vue SPAs with clean backends</td></tr>
<tr><td>Social media</td><td>High but adversarial</td><td>APIs exist but actively defended</td></tr>
<tr><td>Legacy enterprise (SAP, Oracle)</td><td>Low</td><td>Server-rendered HTML, session-based</td></tr>
<tr><td>SMB tools</td><td>High</td><td>Simple REST APIs, minimal anti-automation</td></tr>
</table>
<p>API connectors need updates ~5-10%/quarter vs 30-50% for UI scripts.</p>

<h3>C. SSO Bridge</h3>
<p>The "SSO tax" is real. Hundreds of SaaS vendors gate SSO behind enterprise tiers at 2-5x price premiums:</p>
<table>
<tr><th>App</th><th>Standard</th><th>With SSO</th><th>Increase</th></tr>
<tr><td>Airtable</td><td>$10/user/mo</td><td>$60/user/mo</td><td>500%</td></tr>
<tr><td>Canva</td><td>$10/user/mo</td><td>$40/user/mo</td><td>300%</td></tr>
<tr><td>Box</td><td>$5/user/mo</td><td>$15/user/mo</td><td>200%</td></tr>
<tr><td>Calendly</td><td>$12/user/mo</td><td>$25/user/mo</td><td>108%</td></tr>
</table>
<p>For 1,000 users across 20 SSO-taxed apps, the SSO tax exceeds <strong>$500K/year</strong>.</p>
<p><strong>How it works</strong>: Cerby acts as a SAML/OIDC proxy. Customer's IDP authenticates the user → Cerby validates assertion → maps to target app credentials → establishes authenticated session. User experiences standard SSO. Target app sees normal login.</p>
<p><strong>Pricing</strong>: 30-50% of SSO tax delta. Customer saves 50-70% vs paying the tax directly.</p>

<h3>D. Credential Security — Zero-Knowledge</h3>
<ul>
<li><strong>Customer-managed master key</strong> (RSA-4096 or AES-256). Cerby never possesses it.</li>
<li><strong>Envelope encryption</strong>: Each credential encrypted with unique DEK, DEK encrypted with master key.</li>
<li><strong>HSM-backed</strong> by default (AWS CloudHSM). Customer-managed KMS option for regulated industries.</li>
<li><strong>AI never sees plaintext</strong>: Placeholder tokens in action plans, extension substitutes locally.</li>
</ul>

<hr />

<h2>Part 3: Implementation Roadmap</h2>
<table>
<tr><th>Quarter</th><th>Milestones</th><th>Team Addition</th></tr>
<tr><td>Q1 2026</td><td>AI agent prototype, test 30 apps, 90%+ success rate, begin API reverse-engineering top 20, design zero-knowledge architecture</td><td>3 ML eng + 2 extension eng + 1 security architect + 1 PM</td></tr>
<tr><td>Q2 2026</td><td>Shadow mode with 10 beta customers, 10 API connectors live, SSO Bridge prototype (3 apps), HSM migration</td><td>+2 ML eng + 1 platform eng + 1 legal</td></tr>
<tr><td>Q3 2026</td><td>AI primary for long-tail, SSO Bridge GA (10 apps), 30+ API connectors, customer-managed KMS, connector SDK alpha</td><td>—</td></tr>
<tr><td>Q4 2026</td><td>500+ apps covered, SSO Bridge 30+ apps, 50+ API connectors, FedRAMP initiated, RPA deprecated except top 20</td><td>~16 people total on 2.0</td></tr>
</table>

<hr />

<h2>Part 4: Risk Analysis</h2>
<table>
<tr><th>Risk</th><th>Severity</th><th>Mitigation</th></tr>
<tr><td>AI reliability plateaus below 95%</td><td>Critical</td><td>Tiered fallback. Top 50 retain deterministic. Invest in training data quality.</td></tr>
<tr><td>Major platform blocks extension</td><td>High</td><td>Backup MDM distribution. Accelerate API connectors.</td></tr>
<tr><td>SSO Bridge vendor retaliation</td><td>Medium</td><td>Customer credentials — blocking Cerby = blocking customer. Diversify across apps.</td></tr>
<tr><td>Model inference cost overrun</td><td>Medium</td><td>Self-hosted fine-tuned model. Monitor cost/action weekly.</td></tr>
<tr><td>Anti-bot defeats AI agent</td><td>Medium</td><td>Realistic human-like actions (timing, mouse, keystrokes). API fallback.</td></tr>
</table>

<hr />

<h2>Part 5: Contrarian View</h2>

<h3>The Case Against AI-Native</h3>
<p><strong>AI browser automation is a science project, not a product.</strong> No one has achieved >99% reliability on diverse web UIs at scale. Replacing deterministic reliability with probabilistic AI is a hard sell to a CISO.</p>
<p><strong>The 80/20 solution is simpler.</strong> 50-100 curated API connectors + deterministic RPA for top 100 + manual-with-workflow for long tail. Serves 90% of use case with 10% of R&amp;D risk.</p>
<p><strong>When RPA is actually better.</strong> For top 20 apps (60%+ of actions), a well-maintained deterministic script will always be faster, cheaper, more reliable than AI.</p>

<h3>How a Competitor Beats Cerby 2.0</h3>
<ol>
<li><strong>1Password ships "SSO Everywhere" in 2027.</strong> They have the vault, extension, and distribution. Acquire a SSO bridge startup. Bundle free. "Good enough + free + trusted brand" beats "best-in-class + separate + startup risk."</li>
<li><strong>Grip/Nudge pivots to automation.</strong> They have customer relationships + discovery layer. Adding AI automation is a 6-12 month project.</li>
<li><strong>The category dissolves.</strong> If major SaaS vendors (pressured by EU NIS2) include SSO at all tiers, the "disconnected apps" TAM shrinks. 5-10 year trend, but argues for diversifying.</li>
</ol>

<p><em>This blueprint is opinionated by design. The SSO Bridge may ultimately be the more important revenue driver than the AI agent. The contrarian view exists to stress-test assumptions before committing $10M+ in R&amp;D.</em></p>
`;

const doc3Html = `
<h1>Building a Data Platform at a Series B Startup: The Cerby Playbook</h1>

<h2>Expert Panel Discussion</h2>
<p><strong>Panelists:</strong></p>
<ol>
<li><strong>Claire Hughes Johnson</strong> — Former Stripe COO, author of "Scaling People"</li>
<li><strong>Tristan Handy</strong> — Founder of dbt Labs, coined "analytics engineering"</li>
<li><strong>DJ Patil</strong> — Former US Chief Data Scientist, built LinkedIn's data team from zero</li>
<li><strong>Emilie Schario</strong> — Built data functions at GitLab, Netlify, Turbine</li>
<li><strong>Maxime Beauchemin</strong> — Creator of Apache Airflow &amp; Superset, former Airbnb</li>
</ol>

<hr />

<h2>Round 1 — Diagnosis</h2>

<h3>Claire Hughes Johnson</h3>
<p><strong>The real problem:</strong> "This isn't a data engineering problem — it's an organizational problem. For 4 years, every team built their own spreadsheets, their own definitions of 'active customer,' their own way of counting things. The data engineers inherited not just technical debt but <em>definitional debt</em>."</p>
<p><strong>Biggest mistake:</strong> "Trying to answer every question while simultaneously building infrastructure. You'll do both badly."</p>

<h3>Tristan Handy</h3>
<p><strong>The real problem:</strong> "There's no <em>analytical layer</em> between raw operational data and business questions. Someone asks 'how many active customers do we have?' and the data engineer has to write a SQL query against production Postgres. That's a 4-hour task that should be a 10-second dashboard lookup."</p>
<p><strong>Do NOT do:</strong> "Do not build a custom ETL framework. Do not write Airflow DAGs to extract from Salesforce. Buy Fivetran. Spend engineering time on the transformation layer where business logic lives."</p>

<h3>DJ Patil</h3>
<p><strong>The real problem:</strong> "Trust. The business teams don't trust any number right now. The first job is to produce ONE number that everyone trusts. Then build from there."</p>
<p><strong>Ratio:</strong> "70% building / 30% answering — not 100% either way."</p>

<h3>Emilie Schario</h3>
<p><strong>The real problem:</strong> "No intake process. Every request comes through Slack DMs, drive-by desk visits, and 'quick questions' in meetings. Without visibility into the queue, you can't prioritize."</p>
<p><strong>Do NOT do:</strong> "Do not build dashboards nobody asked for. Also — do not give people raw database access as 'self-serve.' That's a liability."</p>

<h3>Maxime Beauchemin</h3>
<p><strong>The real problem:</strong> "Architectural. The production database wasn't designed for analytics. Every request requires someone who understands the schema to write complex joins."</p>

<hr />

<h2>Round 2 — The Playbook</h2>

<h3>Week 1-4: Stop the Bleeding</h3>
<ol>
<li><strong>Set up intake system</strong> (Day 1-2) — Single channel for all data requests. No more Slack DMs.</li>
<li><strong>Audit the top 10 questions</strong> (Week 1) — Talk to sales, CS, support, exec. These 10 cover 80% of requests.</li>
<li><strong>Set up the warehouse</strong> (Week 1-2) — Snowflake or BigQuery. Don't overthink it.</li>
<li><strong>Connect the critical 3 sources</strong> (Week 2-3) — Production DB, Salesforce, Stripe via Fivetran.</li>
<li><strong>Build the first 5 dbt models</strong> (Week 3-4) — <code>dim_customers</code>, <code>fct_daily_usage</code>, <code>fct_mrr</code>, <code>dim_apps</code>, <code>fct_logins</code>.</li>
<li><strong>Ship one dashboard</strong> (Week 4) — Customer Health Dashboard. Ship it ugly. Ship it fast.</li>
</ol>

<h3>Month 2-3: Build the Foundation</h3>
<ul>
<li>Expand data sources (Intercom/Zendesk, telemetry, orchestration logs)</li>
<li>Build the semantic layer — define canonical metrics (ARR, NRR, DAU, MAU, health score)</li>
<li>Establish the 70/30 split — protect building time like a meeting with the CEO</li>
<li>Train 2-3 power users — one trained CS person has more ROI than any pipeline</li>
</ul>

<h3>Month 4-6: Self-Serve Becomes Real</h3>
<ul>
<li>Expand dashboards (sales pipeline, product usage, executive, app reliability)</li>
<li>AI/ML enablement — <code>fct_app_interactions</code> table for ML engineer's training dataset</li>
<li>Customer-facing data — build underlying models, hand to product engineering to expose</li>
</ul>

<hr />

<h2>The Minimum Viable Data Platform</h2>
<pre><code>Fivetran (extract)
    → Snowflake or BigQuery (warehouse)
        → dbt (transform + test + document)
            → Metabase or Preset (visualize)</code></pre>
<p><strong>Cost</strong>: ~$2-4K/month total. <strong>Setup</strong>: 2-3 weeks for v1. <strong>Maintenance</strong>: ~2 hours/week once stable.</p>

<h3>Stack Recommendations</h3>
<table>
<tr><th>Layer</th><th>Tool</th><th>Cost</th></tr>
<tr><td>Extract/Load</td><td>Fivetran</td><td>~$1-2K/mo</td></tr>
<tr><td>Warehouse</td><td>Snowflake (AWS) or BigQuery (GCP)</td><td>~$500-1K/mo</td></tr>
<tr><td>Transform</td><td>dbt Cloud or Core</td><td>Free–$100/mo</td></tr>
<tr><td>Orchestration</td><td>dbt Cloud scheduler or Dagster Cloud</td><td>Included–$200/mo</td></tr>
<tr><td>BI</td><td>Metabase (self-hosted) or Preset</td><td>Free–$500/mo</td></tr>
<tr><td>Catalog</td><td>dbt docs (built-in)</td><td>Free</td></tr>
<tr><td>Monitoring</td><td>Elementary (dbt-native)</td><td>Free–$1K/mo</td></tr>
</table>

<h3>Anti-Patterns</h3>
<ol>
<li><strong>Building custom ETL</strong> — Use Fivetran. Your time costs $15K/month.</li>
<li><strong>Querying production directly</strong> — Performance issues, wrong numbers. Never.</li>
<li><strong>Going dark for 3 months</strong> — Ship something visible every 2 weeks.</li>
<li><strong>Serving ML and business simultaneously from day 1</strong> — Business first.</li>
<li><strong>Building dashboards nobody asked for</strong> — Map every dashboard to a real question.</li>
<li><strong>Over-engineering for scale</strong> — You have ~100 customers. Batch is fine. Daily refresh is fine.</li>
<li><strong>No definitions</strong> — If "active customer" means different things, every number is wrong.</li>
</ol>

<h3>The "Say No" Framework</h3>
<ol>
<li>All requests go through the intake board. No exceptions.</li>
<li><strong>5-minute rule</strong>: Answerable in 5 min → just do it. Otherwise → queue.</li>
<li><strong>Weekly triage</strong>: Every Monday, review the queue. Top 3 get worked on.</li>
<li><strong>Quarterly roadmap</strong>: 1-page roadmap for stakeholders.</li>
<li><strong>Executive air cover</strong>: Get leadership to communicate the 70/30 split.</li>
</ol>

<h3>Hiring Plan</h3>
<table>
<tr><th>When</th><th>Who</th><th>Why</th></tr>
<tr><td>Month 8-10</td><td>Analytics Engineer</td><td>Owns stakeholder relationships, builds dbt models</td></tr>
<tr><td>Month 12-14</td><td>Head of Data</td><td>Strategic leadership, hiring plan, cross-functional alignment</td></tr>
<tr><td>Month 14-18</td><td>Data Analyst</td><td>Embedded with sales/CS for deeper analysis</td></tr>
</table>

<h3>Final Words</h3>
<blockquote><p><strong>Emilie</strong>: "The intake board is your single most important tool. Not Snowflake, not dbt — the intake board."</p></blockquote>
<blockquote><p><strong>Maxime</strong>: "Keep it simple. Fivetran + Snowflake + dbt + Metabase. Four tools. That's your stack for 18 months. Resist the shiny new thing."</p></blockquote>
`;

const doc4Html = `
<h1>Cerby Data Platform Plan — The Full Blueprint</h1>
<p><strong>Panel</strong>: Tristan Handy (dbt), Chad Sanderson (Data Contracts), Sarah Catanzaro (Amplify Partners), Zach Wilson (Data Engineer Handbook), Cody Peterson (Composable Data)</p>

<hr />

<h2>Topic 1: Databricks — Right or Wrong?</h2>
<h3>The Verdict: Right, but with guardrails.</h3>

<p><strong>Tristan</strong>: "Databricks is a defensible choice. The risk isn't Databricks itself — it's over-using it. Don't spin up clusters for things SQL Warehouses handle. Keep transformation logic in dbt where it's version-controlled, tested, documented."</p>
<p><strong>Zach</strong>: "Treat Databricks as a managed warehouse, not a data platform you're building on top of. Use SQL Warehouses (serverless), Unity Catalog for governance, Delta Lake for storage. Skip notebooks for production."</p>
<p><strong>Chad</strong>: "The real risk is cost. I've seen 5-person teams run up $20K/month bills because someone left a cluster running. Set budgets and alerts from day one."</p>
<p><strong>Sarah</strong>: "Databricks + dbt is the sweet spot. Databricks = compute, Delta Lake = storage, Unity Catalog = governance, dbt = transformation."</p>
<p><strong>Cody</strong>: "You already have Athena + S3. Databricks on AWS reads from S3 natively. You're upgrading your query engine, not starting over."</p>

<h3>Specific Databricks Setup</h3>
<pre><code>Databricks
├── SQL Warehouse (Serverless) — BI queries, dbt runs, ad-hoc SQL
├── Compute Clusters (ML only, later) — model training, heavy transforms
├── Unity Catalog — data discovery, access control, lineage
└── Delta Lake (on S3) — Bronze (raw) → Silver (cleaned) → Gold (business-ready)</code></pre>

<p><strong>Cost controls</strong>: Serverless SQL Warehouses (pay per query), budget alerts at $5K/$10K/$15K, auto-terminate clusters after 30 min idle. <strong>Estimated: $3-6K/month.</strong></p>

<hr />

<h2>Topic 2: The 5-Month Contractor Sprint</h2>
<h3>The Golden Rule: Everything contractors build must be maintainable by 2 DEs + 1 PM.</h3>

<h4>Team Split</h4>
<table>
<tr><th>Person</th><th>Focus</th></tr>
<tr><td>Staff DE (permanent)</td><td>Architecture lead, reviews ALL contractor work</td></tr>
<tr><td>Senior DE (permanent)</td><td>Customer-facing data ops + gold models</td></tr>
<tr><td>Contractor 1</td><td>Ingestion: Segment → Databricks, prod DB → Databricks, Salesforce → Databricks</td></tr>
<tr><td>Contractor 2</td><td>Bronze → Silver: cleaning, deduplication, joining, standardizing</td></tr>
<tr><td>Contractor 3</td><td>Silver → Gold: business models + BI dashboards</td></tr>
<tr><td>Tomi (PM)</td><td>Prioritization, stakeholder management, requirements, QA</td></tr>
</table>

<h4>Week-by-Week — Month 1</h4>
<p><strong>Week 1: Foundation</strong></p>
<ul>
<li>Databricks workspace configured (Unity Catalog, SQL Warehouse)</li>
<li>S3 buckets organized: raw, bronze, silver, gold</li>
<li>dbt project initialized with Databricks adapter</li>
<li>Git repo for data platform (separate from product repo)</li>
<li>CI/CD: PR → dbt test → merge → deploy (GitHub Actions)</li>
</ul>

<p><strong>Week 2: Ingestion</strong></p>
<ul>
<li>Segment → Databricks (native destination)</li>
<li>Production Postgres → Databricks via Fivetran or Auto Loader</li>
<li>Salesforce + Stripe → Databricks via Fivetran</li>
<li>All sources landing in Bronze as raw Delta tables</li>
</ul>

<p><strong>Week 3: First Silver Models</strong></p>
<ul>
<li><code>stg_segment__events</code>, <code>stg_postgres__customers</code>, <code>stg_salesforce__accounts</code>, <code>stg_salesforce__opportunities</code>, <code>stg_stripe__subscriptions</code></li>
<li>dbt tests on every staging model</li>
</ul>

<p><strong>Week 4: First Gold Models + Dashboard</strong></p>
<ul>
<li><code>dim_customers</code>, <code>fct_daily_usage</code>, <code>fct_mrr</code></li>
<li>First Customer Health dashboard — <strong>demo to stakeholders. This is your credibility moment.</strong></li>
</ul>

<h4>Month 2-3: Core Platform</h4>
<ul>
<li><code>dim_apps</code>, <code>fct_app_interactions</code>, <code>fct_support_tickets</code>, <code>fct_pipeline</code></li>
<li>Customer health score model (composite)</li>
<li>Self-serve dashboards: Sales Pipeline, Product Usage, Executive Summary</li>
<li>Alert pipeline migration to new data platform</li>
<li>Data quality monitoring: dbt tests + Elementary</li>
</ul>

<h4>Month 4-5: Hardening &amp; Handoff</h4>
<ul>
<li>Customer data feed automation (self-serve or 1-click)</li>
<li>Performance optimization (partitioning, Z-ordering)</li>
<li>Runbooks for every pipeline</li>
<li><strong>Pair programming weeks</strong> — contractors pair with permanent DEs on everything</li>
<li>On-call rotation documented</li>
<li>Final architecture review: permanent team signs off</li>
</ul>

<h4>Handoff Checklist (Non-Negotiable)</h4>
<ol>
<li>Every pipeline has a runbook</li>
<li>Every dbt model has documentation + tests</li>
<li>CI/CD runs without contractor credentials</li>
<li>No notebooks in production — all transforms in dbt</li>
<li>Permanent team has run every pipeline independently</li>
<li>Cost alerts and auto-scaling configured</li>
<li>On-call process documented</li>
<li>Architecture diagram up to date</li>
<li>Stakeholder-facing dashboards all working</li>
</ol>

<hr />

<h2>Topic 3: Customer-Facing Data</h2>
<p><strong>Short-term (Month 1-3)</strong>: Keep doing it manually but DOCUMENT every step. Track time spent — this is your business case for automation.</p>
<p><strong>Medium-term (Month 3-5)</strong>: Contractors build internal tooling — self-serve scripts so CS can trigger customer onboarding without data team. Parameterized dbt models that auto-generate per-customer views.</p>
<p><strong>Long-term (Month 6+)</strong>: Product engineering responsibility. Data team owns models and quality. Product owns UI and API.</p>
<blockquote><p><strong>Chad</strong>: "Data contracts are your friend. Define exactly what schema the customer-facing UI expects. The contract is the boundary."</p></blockquote>

<hr />

<h2>Topic 4: AI for the Data Team — What Actually Works</h2>

<table>
<tr><th>Use Case</th><th>Works?</th><th>Tool</th><th>Value</th></tr>
<tr><td>Writing dbt models from requirements</td><td>✅ Yes</td><td>Claude Code, Cursor</td><td>2-3x faster development</td></tr>
<tr><td>Generating dbt YAML docs</td><td>✅ Yes</td><td>Claude Code</td><td>Huge time-saver on boring but critical work</td></tr>
<tr><td>Writing dbt tests</td><td>✅ Yes</td><td>Claude Code</td><td>Generates not_null, unique, relationships, custom</td></tr>
<tr><td>SQL query assistance</td><td>✅ Yes</td><td>Claude, Gemini</td><td>Paste schema, ask question, get query</td></tr>
<tr><td>Code review on PRs</td><td>✅ Yes</td><td>Claude Code, Copilot</td><td>Catches logic errors, suggests optimizations</td></tr>
<tr><td>Natural language → SQL</td><td>⚠️ Partial</td><td>Databricks Genie</td><td>OK for simple queries on gold tables. Test it.</td></tr>
<tr><td>Anomaly detection</td><td>⚠️ Partial</td><td>Elementary + custom</td><td>AI configures rules, doesn't replace them</td></tr>
<tr><td>Autonomous debugging</td><td>❌ No</td><td>—</td><td>Can paste logs for suggestions, no auto-fix</td></tr>
<tr><td>Fully autonomous DE</td><td>❌ No</td><td>—</td><td>Anyone selling this is lying in 2026</td></tr>
</table>

<h3>Contractor + AI Workflow</h3>
<ol>
<li>Tomi writes business requirement in plain English</li>
<li>Contractor uses Claude Code to generate first draft dbt model</li>
<li>Contractor reviews, adjusts, adds tests</li>
<li>PR → Staff DE reviews (using Claude Code for review too)</li>
<li>Merge → CI → deploy</li>
</ol>
<p>Cuts model development time from ~4 hours to ~1.5 hours. Over 5 months with 3 contractors = roughly <strong>2x the output</strong>.</p>

<h3>What Doesn't Work (Ignore the Hype)</h3>
<ul>
<li><strong>"AI-generated pipelines in production"</strong> — AI writes code. Humans review, test, deploy.</li>
<li><strong>"AI replaces the data team"</strong> — Makes 3 people perform like 6. Doesn't make 0 perform like 3.</li>
<li><strong>"Natural language replaces SQL"</strong> — For simple lookups, maybe. For business logic and joins, SQL is king.</li>
</ul>

<hr />

<h2>Topic 5: Operating Model</h2>

<h3>Tomi's Role — The Shield</h3>
<p><strong>Daily</strong>: 15-min standup. Monitor Jira. Answer stakeholder questions yourself with AI-written SQL.</p>
<p><strong>Weekly</strong>: Monday sprint prioritization (top 3 platform + top 2 ad-hoc). Wednesday 30-min office hours. Friday: ship something visible.</p>
<p><strong>Monthly</strong>: Data team update to leadership. Review Databricks costs. Stakeholder satisfaction check.</p>

<h3>Time Allocation</h3>
<table>
<tr><th>Activity</th><th>% of Team</th><th>Who</th></tr>
<tr><td>Platform building</td><td>50%</td><td>Contractors + Staff DE</td></tr>
<tr><td>Customer-facing data ops</td><td>15%</td><td>Senior DE</td></tr>
<tr><td>Ad-hoc requests</td><td>15%</td><td>Rotating</td></tr>
<tr><td>Documentation &amp; knowledge transfer</td><td>10%</td><td>Everyone (especially months 4-5)</td></tr>
<tr><td>AI/ML data enablement</td><td>10%</td><td>Staff DE</td></tr>
</table>

<h3>SLAs</h3>
<table>
<tr><th>Request Type</th><th>SLA</th></tr>
<tr><td>Production data issue (customer-facing broken)</td><td>4 hours</td></tr>
<tr><td>Urgent business question (exec/board)</td><td>24 hours</td></tr>
<tr><td>Standard ad-hoc request</td><td>5 business days</td></tr>
<tr><td>New dashboard</td><td>2-3 weeks</td></tr>
<tr><td>New data source integration</td><td>4-6 weeks</td></tr>
</table>

<h3>How to Say No</h3>
<ol>
<li>Every request logged with requester, urgency, effort, business impact</li>
<li>Weekly triage: rank by (impact × urgency) / effort</li>
<li>Top 2 get worked on. Others get ETA.</li>
<li>If someone escalates: "Which existing item should we deprioritize for yours?"</li>
<li>Monthly report: received, completed, in queue, avg time-to-resolve = proof of value + argument for headcount</li>
</ol>

<hr />

<h2>Topic 6: 12-Month Vision</h2>

<h3>Month 1-5 (Contractor Period)</h3>
<p>Medallion architecture, 20+ dbt models, 5+ dashboards, customer data ops partially automated, ML training tables available, full documentation.</p>

<h3>Month 6-8 (Stabilization)</h3>
<p>Fix gaps, extend models, optimize costs, build data culture, train power users.</p>

<h3>Month 9-12 (Maturity)</h3>
<p>Governance policies, automated quality monitoring, 50%+ reduction in ad-hoc, customer data as product feature, ML data flowing on demand.</p>

<h3>Hiring Plan</h3>
<table>
<tr><th>When</th><th>Who</th><th>Why</th></tr>
<tr><td>Month 8</td><td>Analytics Engineer</td><td>Business-facing models, stakeholder relationships</td></tr>
<tr><td>Month 12</td><td>Data Analyst (or 2nd AE)</td><td>Churn modeling, cohort analysis, embedded with CS/product</td></tr>
<tr><td>Month 12+</td><td>Consider Head of Data</td><td>If function grows to 5+, need strategic leadership</td></tr>
</table>

<hr />

<h2>Anti-Patterns — What Will Fail</h2>
<ol>
<li><strong>Contractors build notebooks instead of dbt models.</strong> Notebooks = great for exploration, terrible for production.</li>
<li><strong>No code review on contractor work.</strong> If you don't understand it, you can't maintain it.</li>
<li><strong>Building perfect before shipping anything.</strong> Ship a dashboard in week 4.</li>
<li><strong>Customer data ops eats all the Senior DE's time.</strong> Track hours. Escalate if >30%.</li>
<li><strong>Not setting Databricks cost alerts.</strong> Set alerts. Review weekly in month 1.</li>
<li><strong>Skipping the handoff.</strong> Month 5 = pairing + documenting. Not building new things.</li>
<li><strong>Building dashboards nobody uses.</strong> Track views. Kill unused ones after 2 weeks.</li>
<li><strong>Serving ML engineer before the business.</strong> Business stakeholders first. ML engineer can work with raw data for now.</li>
</ol>

<hr />

<h2>Success Metrics</h2>
<table>
<tr><th>Metric</th><th>Month 3</th><th>Month 6</th><th>Month 12</th></tr>
<tr><td>dbt models (tested + documented)</td><td>15</td><td>30</td><td>50+</td></tr>
<tr><td>Data sources ingested</td><td>4</td><td>7</td><td>10+</td></tr>
<tr><td>Self-serve dashboards</td><td>3</td><td>6</td><td>10+</td></tr>
<tr><td>Dashboard weekly views</td><td>>100</td><td>>300</td><td>>500</td></tr>
<tr><td>Ad-hoc requests/week</td><td>-30%</td><td>-60%</td><td>-80%</td></tr>
<tr><td>Customer data ops time</td><td>Baseline</td><td>-50%</td><td>-80% (automated)</td></tr>
<tr><td>Databricks monthly cost</td><td>&lt;$5K</td><td>&lt;$6K</td><td>&lt;$8K</td></tr>
<tr><td>Time to answer standard request</td><td>5 days</td><td>2 days</td><td>&lt;1 day (self-serve)</td></tr>
<tr><td>Pipeline incidents/month</td><td>Baseline</td><td>&lt;3</td><td>&lt;1</td></tr>
</table>

<hr />

<h2>Bottom Line</h2>
<blockquote><p><strong>Tristan</strong>: "Use managed services for everything. Your engineers should write dbt models and SQL, not infrastructure code."</p></blockquote>
<blockquote><p><strong>Chad</strong>: "The handoff is everything. Dedicate month 5 entirely to knowledge transfer."</p></blockquote>
<blockquote><p><strong>Sarah</strong>: "Claude Code + Databricks Genie + Elementary make your 2+1 team perform like 4-5. But they're accelerants, not replacements."</p></blockquote>
<blockquote><p><strong>Zach</strong>: "Databricks + dbt + Fivetran + BI tool. Four components. Resist adding tools."</p></blockquote>
<blockquote><p><strong>Cody</strong>: "The biggest risk isn't technical — it's organizational. Ship a dashboard in week 4. Send weekly updates to leadership. When you ask for headcount in month 8, you need evidence."</p></blockquote>
`;
