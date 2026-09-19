import type { Metadata } from "next";
import Link from "next/link";
import styles from "../../../../professional-home.module.css";

const catalog = "https://datacatalog.cookcountyil.gov";

const assessmentSource = (pin: string) =>
  `${catalog}/resource/uzyt-m557.json?${new URLSearchParams({ $where: `year=2024 AND pin='${pin}'` })}`;

const outcomeSource = `${catalog}/resource/7pny-nedm.json?${new URLSearchParams({
  $where: "tax_year=2024 AND pin='13071240590000'",
  $select: "pin,tax_year,appealid,appealtypedescription,assessor_totalvalue,bor_totalvalue,result,changereasondescription",
})}`;

const records = [
  { address: "6913 W Summerdale Ave (subject)", pin: "13071240590000", land: "$9,375", improvement: "$23,625", total: "$33,000", board: "$27,362", hie: "$0" },
  { address: "6917 W Summerdale Ave", pin: "13071240580000", land: "$9,375", improvement: "$23,625", total: "$33,000", board: "$33,000", hie: "$0" },
  { address: "6916 W Summerdale Ave", pin: "13071210530000", land: "$9,375", improvement: "$29,025", total: "$38,400", board: "$38,400", hie: "$2,400" },
  { address: "6920 W Summerdale Ave", pin: "13071210520000", land: "$9,375", improvement: "$23,625", total: "$33,000", board: "$33,000", hie: "$0" },
  { address: "6917 W Farragut Ave", pin: "13071320700000", land: "$9,375", improvement: "$24,625", total: "$34,000", board: "$32,005", hie: "$0" },
  { address: "6965 W Balmoral Ave", pin: "13071210010000", land: "$8,728", improvement: "$22,075", total: "$30,803", board: "$30,803", hie: "$0" },
] as const;

export const metadata: Metadata = {
  title: "Source Records — 6913 W Summerdale Case Review | Overtaxed",
  description: "A readable transcription of the official Cook County assessment and appeal records cited in the Overtaxed case review.",
  alternates: { canonical: "/cook-county/case-review/6913-w-summerdale/records" },
};

export default function CaseSourceRecords() {
  return (
    <div className={styles.siteShell}>
      <a className={styles.skipLink} href="#records">Skip to records</a>
      <div className={styles.researchBar}>Readable source record · official raw data remains available</div>

      <header className={`${styles.wrap} ${styles.masthead}`}>
        <Link className={styles.brand} href="/" aria-label="Overtaxed professional homepage">
          <svg viewBox="0 0 28 30" aria-hidden="true" fill="none">
            <path d="M2 9 14 2l12 7v18H2Z" stroke="currentColor" strokeWidth="2" />
            <path d="M8 14h12M8 19h12M8 24h7" stroke="currentColor" strokeWidth="2" className={styles.brandAccent} />
          </svg>
          overtaxed
        </Link>
        <nav className={styles.nav} aria-label="Source record navigation">
          <Link href="/#case-file">Back to case review</Link>
        </nav>
      </header>

      <main id="records" className={`${styles.wrap} ${styles.recordsPage}`}>
        <div className={styles.recordsIntro}>
          <p className={styles.eyebrow}>Cook County / 2024 public records</p>
          <h1>What the source records say.</h1>
          <p>
            This is a human-readable transcription of the government rows cited in the case review.
            Dollar figures below are <strong>assessed values</strong>, not market values or tax bills.
            Open the raw data only when you want to audit the transcription.
          </p>
          <p className={styles.finePrint}>Verified September 18–19, 2026. Public datasets can change.</p>
        </div>

        <section className={styles.outcomeRecord} id="appeal-outcome" aria-labelledby="outcome-title">
          <div>
            <p className={styles.microLabel}>Board of Review appeal decision history</p>
            <h2 id="outcome-title">6913 W Summerdale Ave — decision record</h2>
            <p>PIN 13-07-124-059-0000 · Tax year 2024 · Appeal 7130723.001 · Overvaluation</p>
          </div>
          <dl className={styles.recordFacts}>
            <div><dt>Assessor total AV</dt><dd>$33,000</dd></div>
            <div><dt>BOR total AV</dt><dd>$27,362</dd></div>
            <div><dt>Result</dt><dd>Decrease</dd></div>
            <div><dt>Published reason</dt><dd>Analysis of comparable properties, a recent sale, and/or an update of property characteristics.</dd></div>
          </dl>
          <p className={styles.recordCaution}>
            The published reason is generic. It does not identify which evidence caused the reduction.
          </p>
          <a className={styles.rawSourceLink} href={outcomeSource} target="_blank" rel="noreferrer">View raw Cook County API row ↗</a>
        </section>

        <section className={styles.assessmentRecords} aria-labelledby="assessment-title">
          <div className={styles.recordsSectionHeading}>
            <p className={styles.microLabel}>CCAO assessed values</p>
            <h2 id="assessment-title">Assessment records cited in the retained set</h2>
            <p>Certified values are the pre-Board-of-Review stage used for the comparison.</p>
          </div>
          {records.map((record) => (
            <article key={record.pin} id={`assessment-${record.pin}`} className={styles.sourceRecord}>
              <div className={styles.sourceRecordHeading}>
                <div>
                  <h3>{record.address}</h3>
                  <p>PIN {record.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5")} · Class 203 · Jefferson Township · Neighborhood 71430</p>
                </div>
                <a className={styles.rawSourceLink} href={assessmentSource(record.pin)} target="_blank" rel="noreferrer">View raw API row ↗</a>
              </div>
              <dl className={styles.recordFacts}>
                <div><dt>Certified land AV</dt><dd>{record.land}</dd></div>
                <div><dt>Certified improvement AV</dt><dd>{record.improvement}</dd></div>
                <div><dt>Certified total AV</dt><dd>{record.total}</dd></div>
                <div><dt>BOR total AV</dt><dd>{record.board}</dd></div>
                <div><dt>Certified HIE field</dt><dd>{record.hie}</dd></div>
              </dl>
            </article>
          ))}
        </section>

        <div className={styles.recordsFooter}>
          <Link className={styles.primaryButton} href="/#case-file">Return to the case review <span aria-hidden="true">←</span></Link>
          <p>No conclusion is added on this page; it only makes cited public records easier to inspect.</p>
        </div>
      </main>
    </div>
  );
}
