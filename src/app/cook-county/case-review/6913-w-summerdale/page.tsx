import Link from "next/link";
import type { Metadata } from "next";
import styles from "../../../professional-home.module.css";

const catalog = "https://datacatalog.cookcountyil.gov";
const subjectPin = "13071240590000";
const readableRecord = (pin: string) =>
  `/cook-county/case-review/6913-w-summerdale/records#assessment-${pin}`;
const readableOutcome = "/cook-county/case-review/6913-w-summerdale/records#appeal-outcome";

const retainedComparables = [
  {
    address: "6917 W Summerdale Ave",
    pin: "13071240580000",
    distance: "0.007",
    year: "1953",
    area: "1,022",
    total: "$33,000",
    rate: "$23.116",
    note: "Adjacent; exact area, lot and age. Extra half bath and superior interior features disclosed.",
    tone: "mixed",
  },
  {
    address: "6916 W Summerdale Ave",
    pin: "13071210530000",
    distance: "0.033",
    year: "1954",
    area: "1,070",
    total: "$38,400",
    rate: "$27.126",
    note: "Same block; higher assessed value retained. Warm-air heat and a 48 sf size difference.",
    tone: "adverse",
  },
  {
    address: "6920 W Summerdale Ave",
    pin: "13071210520000",
    distance: "0.035",
    year: "1954",
    area: "1,070",
    total: "$33,000",
    rate: "$22.079",
    note: "Same block; no garage and a formal recreation room are offsetting differences.",
    tone: "mixed",
  },
  {
    address: "6917 W Farragut Ave",
    pin: "13071320700000",
    distance: "0.107",
    year: "1955",
    area: "1,056",
    total: "$34,000",
    rate: "$23.319",
    note: "Nearby; slightly newer and larger, with a smaller 1.5-car garage.",
    tone: "adverse",
  },
  {
    address: "6965 W Balmoral Ave",
    pin: "13071210010000",
    distance: "0.111",
    year: "1954",
    area: "1,022",
    total: "$30,803",
    rate: "$21.600",
    note: "Lower value retained; smaller lot and garage, partial attic and recreation room disclosed.",
    tone: "supporting",
  },
] as const;

const sources = [
  ["BOR Appeal Decision History", "7pny-nedm", "Appeal ID, type, generic reason and certified-to-final outcome"],
  ["CCAO Assessed Values", "uzyt-m557", "Mailed, certified and BOR land, improvement and total assessed values"],
  ["CCAO Improvement Characteristics", "x54s-btds", "Card-level physical characteristics and grain controls"],
  ["CCAO Parcel Universe", "nj4t-kc8j", "Neighborhood and parcel centroid"],
  ["CCAO Parcel Addresses", "3723-97qp", "Situs address"],
  ["CCAO Parcel Sales", "wvhk-k5uv", "The subject’s recorded 2018 sale"],
] as const;

export const metadata: Metadata = {
  title: "Worked Case Review — 6913 W Summerdale | Overtaxed",
  description: "A source-linked reconstruction of a 2024 Cook County residential appeal, including comparable screening, adverse evidence, exclusions and unresolved questions.",
  alternates: { canonical: "/cook-county/case-review/6913-w-summerdale" },
};

export default function SummerdaleCaseReview() {
  return (
    <div className={styles.siteShell}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <div className={styles.researchBar}>
        Professional workflow research · no live case actions
      </div>

      <header className={`${styles.wrap} ${styles.masthead}`}>
        <Link className={styles.brand} href="/" aria-label="Overtaxed professional homepage">
          <svg viewBox="0 0 28 30" aria-hidden="true" fill="none">
            <path d="M2 9 14 2l12 7v18H2Z" stroke="currentColor" strokeWidth="2" />
            <path d="M8 14h12M8 19h12M8 24h7" stroke="currentColor" strokeWidth="2" className={styles.brandAccent} />
          </svg>
          overtaxed
        </Link>
        <nav className={styles.nav} aria-label="Case review navigation">
          <Link href="/">Overview</Link>
          <a href="#case-file">Case evidence</a>
          <a className={styles.navContact} href="mailto:hello@getovertaxed.com?subject=Professional%20workflow%20conversation">
            Talk with us <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <main id="main-content">
        <section className={`${styles.wrap} ${styles.hero} ${styles.caseReviewHero}`} aria-labelledby="hero-title">
          <div className={styles.eyebrow}>Worked case / 2024 public records</div>
          <div className={styles.heroGrid}>
            <h1 id="hero-title">Inspect the evidence.<br /><span>Including what it cannot prove.</span></h1>
            <div className={styles.heroIntro}>
              <p>
                A source-linked reconstruction of one historical reduction: comparable screening,
                adverse evidence, exclusions and unresolved questions kept visible for professional review.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#case-file">Open the case <span aria-hidden="true">↓</span></a>
                <Link className={styles.textLink} href="/">Back to overview</Link>
              </div>
              <p className={styles.finePrint}>
                Historical public-data example. Not reviewed by counsel; not a recommendation, appraisal or explanation of the Board’s decision.
              </p>
            </div>
          </div>
          <ul className={styles.scopeList} aria-label="Case scope">
            <li>Jefferson Township</li>
            <li>Class 203 residence</li>
            <li>2024 certified values</li>
            <li>Board outcome shown only as context</li>
          </ul>
        </section>

        <section className={`${styles.wrap} ${styles.caseSection}`} id="case-file" aria-labelledby="case-title">
          <div className={styles.sectionKicker}>
            <span>01 / Inspect the work, including the answer “not established”</span>
            <span>Verified public records · researched September 18, 2026</span>
          </div>

          <article className={styles.caseFile}>
            <header className={styles.caseBar}>
              <div><strong>OVERTAXED</strong><span> / Public-data case review</span></div>
              <span className={styles.status}>Historical example · Unreviewed by counsel</span>
            </header>

            <div className={styles.caseHeader}>
              <div>
                <p className={styles.microLabel}>2024 residential / Jefferson Township</p>
                <h2 id="case-title">6913 W Summerdale Ave, Chicago</h2>
                <p>PIN 13-07-124-059-0000 · Class 203 · Neighborhood 71430</p>
              </div>
              <dl className={styles.caseMetrics}>
                <div>
                  <dt>CCAO certified AV</dt>
                  <dd>$33,000</dd>
                </div>
                <div>
                  <dt>BOR final AV</dt>
                  <dd>$27,362</dd>
                </div>
                <div>
                  <dt>Recorded change</dt>
                  <dd>−$5,638 <small>(−17.08%)</small></dd>
                </div>
              </dl>
            </div>

            <div className={styles.findingBand}>
              <div className={styles.findingMark} aria-hidden="true">≠</div>
              <div>
                <p className={styles.microLabel}>Finding from the reconstructed five-property set</p>
                <h3>The public comparable case does not independently support the historical reduction.</h3>
                <p>
                  The subject’s certified improvement AV per building square foot was <strong>$23.116</strong>.
                  The retained-comparable median was also <strong>$23.116</strong>. Both the subject and
                  comparable median had a certified total assessed value of <strong>$33,000</strong>.
                </p>
              </div>
            </div>

            <div className={styles.caseWorkspace}>
              <div className={styles.evidencePanel}>
                <div className={styles.tableHeading}>
                  <div>
                    <p className={styles.microLabel}>Retained set / five properties</p>
                    <h3>Value-blind screening, then feature review</h3>
                  </div>
                  <p>Certified improvement AV / building sf</p>
                </div>
                <p className={styles.scrollHint}>Scroll horizontally to inspect every field <span aria-hidden="true">→</span></p>
                <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Retained comparable property table; scroll horizontally on small screens">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Property</th>
                        <th scope="col">Distance</th>
                        <th scope="col">Year</th>
                        <th scope="col">Building sf</th>
                        <th scope="col">Certified total AV</th>
                        <th scope="col">Improvement AV/sf</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={styles.subjectRow}>
                        <th scope="row"><Link href={readableRecord(subjectPin)} target="_blank" rel="noreferrer" aria-label="Readable subject 2024 assessment source record (opens in a new tab)">Subject ↗</Link></th>
                        <td>—</td><td>1953</td><td>1,022</td><td>$33,000</td><td>$23.116</td>
                      </tr>
                      {retainedComparables.map((comp) => (
                        <tr key={comp.address}>
                          <th scope="row"><Link href={readableRecord(comp.pin)} target="_blank" rel="noreferrer" aria-label={`${comp.address}: readable 2024 assessment source record (opens in a new tab)`}>{comp.address} ↗</Link><span className={styles.mobileNote}>{comp.note}</span></th>
                          <td>{comp.distance} mi</td>
                          <td>{comp.year}</td>
                          <td>{comp.area}</td>
                          <td>{comp.total}</td>
                          <td><span className={`${styles.valueTag} ${styles[comp.tone]}`}>{comp.rate}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.rowNotes} aria-label="Comparable review notes">
                  {retainedComparables.map((comp) => (
                    <p key={comp.address}><strong>{comp.address}</strong> — {comp.note}</p>
                  ))}
                </div>
              </div>

              <aside className={styles.reviewPanel} aria-labelledby="review-title">
                <p className={styles.microLabel}>Review conclusion</p>
                <h3 id="review-title">Route for documentary review.</h3>
                <span className={styles.warningFlag}>Public-data case not established</span>
                <p>
                  Official records confirm the reduction, but not what caused it. The BOR’s generic
                  “comparable properties, a recent sale, and/or an update of property characteristics”
                  language does not identify the deciding evidence.
                </p>
                <dl className={styles.reviewStats}>
                  <div><dt>Broad screen</dt><dd>1,625</dd></div>
                  <div><dt>Eligible after controls</dt><dd>162</dd></div>
                  <div><dt>Retained for review</dt><dd>5</dd></div>
                </dl>
                <Link className={styles.textLink} href={readableOutcome} target="_blank" rel="noreferrer">Read the decision record ↗</Link>
                <p className={styles.ruleNote}>
                  The historical outcome is context—not evidence that Overtaxed participated, that this
                  shortlist produced the result, or that a similar case should receive a reduction.
                </p>
              </aside>
            </div>

            <details className={styles.methodology}>
              <summary>Inspect the selection method and its limits</summary>
              <div>
                <p><strong>Screen:</strong> Same 2024 year, neighborhood and class; within one mile and ±25% building area. Then single-card, non-multiland (one land line), whole-tieback parcels with matching use, story, quality, basement and A/C; building and land area within ±15%, age within ten years.</p>
                <p><strong>Rank:</strong> Distance in miles + proportional building-area difference + year-built difference / 30 + proportional land-area difference. Lower is closer. Assessment level was not an input. Manual feature review excluded the fourth-ranked, two-full-bath property before retaining five.</p>
                <p><strong>Important limit:</strong> This case was deliberately selected from historical reductions. It is not random, representative or a success-rate estimate. The analysis is retrospective, not preregistered; no physical-feature adjustments or market-value appraisal were performed.</p>
                <p><strong>Stages stay separate:</strong> The comparison uses certified, pre-BOR assessments. Final BOR values are shown only as historical outcomes. The higher-assessed candidate’s home-improvement-exemption field remains unresolved; the displayed figures are gross certified values, not exemption-adjusted taxable amounts.</p>
              </div>
            </details>

            <div className={styles.auditGrid}>
              <section aria-labelledby="exclusions-title">
                <p className={styles.microLabel}>Exclusions stay visible</p>
                <h3 id="exclusions-title">A low number is not enough.</h3>
                <ul className={styles.auditList}>
                  <li><strong>$11,200 total AV</strong><span>6905 W Balmoral: hard excluded—0.2 tieback, smaller site, slab, no A/C and different room count.</span></li>
                  <li><strong>$11,400 total AV</strong><span>6911 W Berwyn: hard excluded—0.2 tieback and land area outside tolerance.</span></li>
                  <li><strong>$37,000 total AV</strong><span>6913 W Farragut: excluded after manual review—two full baths versus the subject’s one.</span></li>
                  <li><strong>$32,000 total AV</strong><span>6755 W Higgins: disclosed, not cherry-picked—larger home and lot, no garage and materially lower similarity rank.</span></li>
                </ul>
              </section>
              <section aria-labelledby="unknowns-title">
                <p className={styles.microLabel}>Open questions before professional use</p>
                <h3 id="unknowns-title">The missing evidence matters.</h3>
                <ol className={styles.numberedList}>
                  <li><span>01</span><p><strong>Actual appeal file</strong>The public outcome omits submitted exhibits, hearing notes and decision detail.</p></li>
                  <li><span>02</span><p><strong>Record cards and photos</strong>Public characteristics can be stale; physical facts and condition need confirmation.</p></li>
                  <li><span>03</span><p><strong>Sale qualification</strong>The 2018 trustee-deed sale needs deed, closing and market context before use.</p></li>
                  <li><span>04</span><p><strong>Exemption context</strong>The source reports a $2,400 certified HIE field for 6916 W Summerdale; its treatment needs confirmation.</p></li>
                  <li><span>05</span><p><strong>Method sensitivity</strong>Analyst-set distance and feature tolerances need replication and robustness review.</p></li>
                </ol>
              </section>
            </div>

            <footer className={styles.caseFooter}>
              <span>Assessed values—not market values or tax dollars</span>
              <span>No requested value calculated · No appeal recommendation</span>
            </footer>
          </article>
        </section>

        <section className={`${styles.wrap} ${styles.provenance}`} aria-labelledby="sources-title">
          <div className={styles.provenanceIntro}>
            <p className={styles.eyebrow}>02 / Source provenance</p>
            <h2 id="sources-title">A trail to inspect,<br />not a score to trust.</h2>
            <p>
              All values shown above were reconstructed from official public datasets retrieved September 18, 2026.
              Public datasets are mutable; this is a worked research example, not a frozen agency record.
            </p>
            <a className={styles.textLink} href="https://datacatalog.cookcountyil.gov/" target="_blank" rel="noreferrer">Open the Cook County Data Catalog <span aria-hidden="true">↗</span></a>
          </div>
          <div className={styles.sourceTable}>
            {sources.map(([name, id, use]) => (
              <div key={id}>
                <div><strong><a href={`${catalog}/d/${id}`} target="_blank" rel="noreferrer">{name} ↗</a></strong><code>{id}</code></div>
                <p>{use}</p>
              </div>
            ))}
            <div>
              <div><strong>Agency guidance</strong><code>BOR / CCAO</code></div>
              <p><a href="https://www.cookcountyboardofreview.com/how-present-case-based-lack-uniformity" target="_blank" rel="noreferrer">BOR uniformity guidance ↗</a> · <a href="https://www.cookcountyassessoril.gov/residential-appeals" target="_blank" rel="noreferrer">CCAO residential guidance ↗</a>. Direction for comparable selection—not endorsement of this screen or ranking.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.wrap} ${styles.conversation}`} aria-labelledby="conversation-title">
          <div>
            <p className={styles.eyebrow}>After inspecting the case</p>
            <h2 id="conversation-title">Where would your review<br />need more context?</h2>
            <p>We’re looking for candid practitioner feedback on the evidence, omissions and handoff—not validation of a predetermined product.</p>
          </div>
          <div className={styles.contactBox}>
            <strong>A 20-minute practitioner conversation.</strong>
            <p>No sales deck. No client names, credentials, documents or live case data.</p>
            <a className={styles.primaryButton} href="mailto:hello@getovertaxed.com?subject=Summerdale%20case%20review%20feedback">Discuss the case <span aria-hidden="true">↗</span></a>
            <p className={styles.finePrint}>Research-stage workflow. Overtaxed does not file appeals, provide legal advice, represent taxpayers or make automated reduction recommendations.</p>
          </div>
        </section>
      </main>

      <footer className={`${styles.wrap} ${styles.footer}`}>
        <div><strong>overtaxed</strong> / Worked public-data case review</div>
        <div>Evidence preparation concept. Not legal advice, representation or a claim of tax savings.</div>
        <Link href="/homeowners">Homeowner product</Link>
      </footer>
    </div>
  );
}
