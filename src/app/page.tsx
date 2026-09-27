import Link from "next/link";
import styles from "./professional-home-v2.module.css";

const sampleCase = "/cook-county/case-review/6913-w-summerdale";
const conversation = "mailto:hello@getovertaxed.com?subject=Professional%20workflow%20conversation";

const SourceMark = ({ index }: { index: string }) => (
  <span className={styles.sourceMark} aria-hidden="true">{index}</span>
);

export default function ProfessionalHome() {
  return (
    <div className={styles.siteShell}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <div className={styles.researchBar}>
        <span>Professional workflow research</span>
        <span>No live case actions</span>
      </div>

      <header className={`${styles.wrap} ${styles.masthead}`}>
        <a className={styles.brand} href="#main-content" aria-label="Overtaxed home">
          <svg viewBox="0 0 28 30" aria-hidden="true" fill="none">
            <path d="M2 9 14 2l12 7v18H2Z" stroke="currentColor" strokeWidth="2" />
            <path d="M8 14h12M8 19h12M8 24h7" stroke="currentColor" strokeWidth="2" className={styles.brandAccent} />
          </svg>
          overtaxed
        </a>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#workflow">How it works</a>
          <Link href={sampleCase}>Sample case</Link>
          <a className={styles.navContact} href={conversation}>Talk with us <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main id="main-content">
        <section className={`${styles.wrap} ${styles.hero}`} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>For Cook County appeal professionals</p>
            <h1 id="hero-title">Cook County appeal evidence, <em>organized for review.</em></h1>
            <p className={styles.heroSummary}>
              We rebuild public records and assemble comparable, supporting, adverse and unresolved evidence into one inspectable case file.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryButton} href={sampleCase}>View sample case file <span aria-hidden="true">↗</span></Link>
            </div>
            <p className={styles.boundaryLine}>
              Research-stage workflow. No filing, legal advice, representation or automated reduction recommendation.
            </p>
          </div>

          <div className={styles.heroProof} aria-label="Compact preview of the 6913 West Summerdale public-data case file">
            <div className={styles.proofUnderlay} aria-hidden="true" />
            <article className={styles.casePreview}>
              <header className={styles.caseTopbar}>
                <div><strong>CASE FILE</strong><span> / PUBLIC-DATA REVIEW</span></div>
                <span className={styles.reviewState}>For professional review</span>
              </header>

              <div className={styles.caseIdentity}>
                <div>
                  <span className={styles.microLabel}>Subject property / 2024</span>
                  <h2>6913 W Summerdale Ave</h2>
                  <p>PIN 13-07-124-059-0000 · Jefferson Township</p>
                </div>
                <div className={styles.sourceCount}><strong>6</strong><span>official<br />datasets</span></div>
              </div>

              <div className={styles.caseFinding}>
                <div className={styles.notEqual} aria-hidden="true">≠</div>
                <div>
                  <span className={styles.microLabel}>Reconstructed finding</span>
                  <strong>Public comparable case not established.</strong>
                  <p>Subject and retained-set median: $23.116 improvement AV / building sf.</p>
                </div>
              </div>

              <div className={styles.caseBody}>
                <section className={styles.compPanel} aria-label="Comparable candidate preview">
                  <div className={styles.panelHeading}><span>Comparable review</span><strong>5 retained</strong></div>
                  <div className={styles.compHeader}><span>Candidate</span><span>Evidence</span><span>AV / sf</span></div>
                  <div className={styles.compRow}><span>6917 W Summerdale</span><span className={styles.mixed}>Mixed</span><strong>$23.116</strong></div>
                  <div className={styles.compRow}><span>6916 W Summerdale</span><span className={styles.adverse}>Adverse</span><strong>$27.126</strong></div>
                  <div className={styles.compRow}><span>6965 W Balmoral</span><span className={styles.supporting}>Supporting</span><strong>$21.600</strong></div>
                  <div className={styles.moreRows}>+ 2 retained candidates · 4 exclusions preserved</div>
                </section>

                <aside className={styles.reviewRail} aria-label="Review state preview">
                  <div><SourceMark index="01" /><span>Sources linked</span><strong>6</strong></div>
                  <div><SourceMark index="02" /><span>Exclusions visible</span><strong>4</strong></div>
                  <div><SourceMark index="03" /><span>Open questions</span><strong>5</strong></div>
                  <div className={styles.railStop}><span>Human review gate</span><strong>Required</strong></div>
                </aside>
              </div>

              <footer className={styles.caseFooter}>
                <span>Historical example · Unreviewed by counsel</span>
                <span>No appeal recommendation</span>
              </footer>
            </article>
            <p className={styles.proofCaption}><span>Preview 01</span> Real case facts. Full sources, exclusions and limits remain inspectable.</p>
          </div>
        </section>

        <section className={`${styles.wrap} ${styles.workflowSection}`} id="workflow" aria-labelledby="workflow-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>A narrower, more useful role</p>
              <h2 id="workflow-title">From scattered records to a review-ready file.</h2>
            </div>
            <p>Overtaxed prepares the evidence trail. The professional verifies the facts, chooses the argument and decides what happens next.</p>
          </div>

          <div className={styles.workflow}>
            <article>
              <span className={styles.stepNumber}>01</span>
              <div className={styles.stepGlyph} aria-hidden="true"><i /><i /><i /></div>
              <h3>Reconstruct</h3>
              <p>Bring assessment stages, parcel records, property characteristics and appeal history into one source-linked view.</p>
              <dl><div><dt>Overtaxed</dt><dd>Assembles and flags</dd></div><div><dt>Professional</dt><dd>Verifies case context</dd></div></dl>
            </article>
            <article>
              <span className={styles.stepNumber}>02</span>
              <div className={`${styles.stepGlyph} ${styles.examineGlyph}`} aria-hidden="true"><i /><i /><i /></div>
              <h3>Examine</h3>
              <p>Screen comparable candidates without hiding higher values, exclusions, conflicting features or ranking assumptions.</p>
              <dl><div><dt>Overtaxed</dt><dd>Shows the alternatives</dd></div><div><dt>Professional</dt><dd>Selects the evidence</dd></div></dl>
            </article>
            <article>
              <span className={styles.stepNumber}>03</span>
              <div className={`${styles.stepGlyph} ${styles.prepareGlyph}`} aria-hidden="true"><i /><i /><i /></div>
              <h3>Prepare</h3>
              <p>Organize a draft case file around source references, review notes and questions that still require judgment.</p>
              <dl><div><dt>Overtaxed</dt><dd>Structures the draft</dd></div><div><dt>Professional</dt><dd>Approves, files, represents</dd></div></dl>
            </article>
          </div>
        </section>

        <section className={styles.inspectSection} aria-labelledby="inspect-title">
          <div className={`${styles.wrap} ${styles.inspectGrid}`}>
            <div className={styles.inspectCopy}>
              <p className={styles.eyebrow}>Inspectable by design</p>
              <h2 id="inspect-title">A trail to examine, not a score to trust.</h2>
              <p>
                Every consequential screen should remain visible: where a fact came from, what was excluded,
                which evidence cuts the other way and what the public record cannot answer.
              </p>
              <Link className={styles.lightLink} href={sampleCase}>Inspect the worked case <span aria-hidden="true">↗</span></Link>
            </div>

            <div className={styles.inspectList}>
              <article><span>01</span><div><h3>Source-linked</h3><p>Trace values and characteristics back to the official public row.</p></div></article>
              <article><span>02</span><div><h3>Exclusions preserved</h3><p>See which candidate left the set and the rule or property fact that removed it.</p></div></article>
              <article><span>03</span><div><h3>Adverse evidence retained</h3><p>Higher assessments and conflicting facts stay in view instead of disappearing behind a favorable summary.</p></div></article>
              <article><span>04</span><div><h3>Uncertainty can stop the work</h3><p>“Not enough evidence” remains an acceptable professional handoff.</p></div></article>
            </div>
          </div>
        </section>

        <section className={`${styles.wrap} ${styles.sampleSection}`} aria-labelledby="sample-title">
          <div className={styles.sampleLead}>
            <p className={styles.eyebrow}>One case, shown honestly</p>
            <h2 id="sample-title">The historical reduction is real. Its cause is not public.</h2>
            <p>
              For 6913 W Summerdale, official records show a 17.08% Board of Review reduction. The reconstructed
              five-property set does not independently explain it. That conflict is the point of the sample.
            </p>
            <Link className={styles.primaryButton} href={sampleCase}>Open the complete case <span aria-hidden="true">↗</span></Link>
          </div>

          <div className={styles.sampleFacts}>
            <div><span>CCAO certified AV</span><strong>$33,000</strong></div>
            <div><span>BOR final AV</span><strong>$27,362</strong></div>
            <div className={styles.changeFact}><span>Recorded change</span><strong>−17.08%</strong></div>
            <div><span>Retained-set median</span><strong>$23.116 <small>improvement AV / sf</small></strong></div>
            <p>Historical outcome is context—not evidence that this shortlist produced the result or that a similar case should receive a reduction.</p>
          </div>
        </section>

        <section className={`${styles.wrap} ${styles.boundarySection}`} aria-labelledby="boundary-title">
          <div>
            <p className={styles.eyebrow}>The professional stays in control</p>
            <h2 id="boundary-title">Preparation is not judgment.</h2>
          </div>
          <div className={styles.boundaryPoints}>
            <p>Overtaxed is a research-stage evidence-preparation workflow. It does not represent taxpayers, file appeals, provide legal advice or make automated reduction recommendations.</p>
            <p>The case file is a draft for review. The firm controls client advice, evidence selection, requested value, filing and representation.</p>
          </div>
        </section>

        <section className={`${styles.wrap} ${styles.conversation}`} aria-labelledby="conversation-title">
          <div>
            <p className={styles.eyebrow}>Practitioner research</p>
            <h2 id="conversation-title">Where does evidence preparation slow your team down?</h2>
            <p>We’re looking for candid workflow feedback—especially what your current process already gets right.</p>
          </div>
          <div className={styles.contactBox}>
            <strong>A 20-minute professional conversation.</strong>
            <p>No sales deck. No client names, credentials, documents or live case data.</p>
            <a className={styles.primaryButton} href={conversation}>Talk with us <span aria-hidden="true">↗</span></a>
            <p className={styles.contactNote}>Email opens in your mail client. This page has no form, upload or live product action.</p>
          </div>
        </section>
      </main>

      <footer className={`${styles.wrap} ${styles.footer}`}>
        <div><strong>overtaxed</strong><span>Cook County professional workflow research</span></div>
        <p>Evidence preparation concept. Not legal advice, representation or a claim of tax savings.</p>
        <Link href="/homeowners">Homeowner product</Link>
      </footer>
    </div>
  );
}
