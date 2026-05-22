/* eslint-disable @next/next/no-img-element */
export const dynamic = "force-static";

const SERIF = "var(--font-manuel-serif), 'Times New Roman', serif";
const SANS = "var(--font-manuel-sans), system-ui, -apple-system, sans-serif";

const CREAM = "#f3ede3";
const INK = "#1a1410";
const OXBLOOD = "#6b1a1a";
const BRASS = "#a4844a";

const ADDRESS_LINE1 = "The Luxury Cut";
const ADDRESS_LINE2 = "5555 Saint Charles Rd";
const ADDRESS_LINE3 = "Berkeley, IL 60163";
const MAPS_URL = "https://maps.google.com/?q=The+Luxury+Cut+5555+Saint+Charles+Rd+Berkeley+IL";

const services: { name: string; price: string; time: string; note?: string }[] = [
  { name: "The Cut", price: "$45", time: "45 min", note: "Wash, cut, style. The standard." },
  { name: "Skin Fade", price: "$50", time: "50 min", note: "Bald to blend. Razor finish." },
  { name: "Fade + Line Design", price: "$65", time: "60 min", note: "The signature. Custom lines, freehand." },
  { name: "Beard Sculpt", price: "$30", time: "30 min", note: "Hot towel, oil, lineup." },
  { name: "The Works", price: "$80", time: "75 min", note: "Cut + beard + hot towel." },
  { name: "Lineup", price: "$20", time: "15 min", note: "Edge cleanup between visits." },
  { name: "Kids (under 12)", price: "$30", time: "30 min", note: "Patient with the squirmy ones." },
];

const hours: { day: string; time: string }[] = [
  { day: "Monday", time: "3:45p — 9:45p" },
  { day: "Tuesday", time: "3:45p — 9:45p" },
  { day: "Wednesday", time: "3:45p — 9:45p" },
  { day: "Thursday", time: "3:45p — 9:45p" },
  { day: "Friday", time: "3:45p — 9:45p" },
  { day: "Saturday", time: "9:45a — 6p" },
  { day: "Sunday", time: "12:45p — 5p" },
];

export default function ManuelPage() {
  return (
    <main style={{ background: CREAM, color: INK, fontFamily: SANS, minHeight: "100vh" }}>
      {/* Top bar */}
      <header
        style={{
          padding: "18px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${INK}1a`,
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 20, fontStyle: "italic", letterSpacing: -0.5 }}>
          Manuel <span style={{ color: OXBLOOD }}>·</span> Barbero
        </div>
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7 }}>
          The <span style={{ fontFamily: SERIF, fontStyle: "italic", letterSpacing: 0 }}>Luxury</span> Cut
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: "72px 28px 56px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: OXBLOOD, fontWeight: 600 }}>
            Berkeley, IL · West of Chicago
          </div>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(54px, 11vw, 148px)",
              lineHeight: 0.92,
              letterSpacing: -3,
              margin: 0,
            }}
          >
            Manuel
            <br />
            <span style={{ fontStyle: "italic", color: OXBLOOD }}>Gutiérrez.</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(17px, 1.6vw, 22px)",
              lineHeight: 1.5,
              maxWidth: 620,
              margin: "12px 0 0",
              fontWeight: 400,
            }}
          >
            Skin fades, sharp lines, freehand designs. Working out of <em>The Luxury Cut</em> on
            Saint Charles Rd. Five stars across the board — eight people deep and counting.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 20 }}>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                background: INK,
                color: CREAM,
                padding: "16px 28px",
                fontSize: 13,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: 2,
              }}
            >
              Get Directions
            </a>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "transparent",
                color: INK,
                padding: "16px 28px",
                fontSize: 13,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: 2,
                border: `1px solid ${INK}`,
              }}
            >
              5555 Saint Charles Rd
            </a>
          </div>

          {/* rating mark */}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              fontSize: 13,
              opacity: 0.75,
            }}
          >
            <span style={{ color: BRASS, fontSize: 16, letterSpacing: 2 }}>★★★★★</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic" }}>5.0</span>
            <span>· every review, no exceptions</span>
          </div>
        </div>
      </section>

      {/* Quote strip */}
      <section
        style={{
          background: INK,
          color: CREAM,
          padding: "44px 28px",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "clamp(22px, 3vw, 34px)",
              lineHeight: 1.3,
              margin: 0,
              fontWeight: 300,
            }}
          >
            “A haircut is forty minutes you owe yourself. I'll take the time. You sit down,
            we talk or we don't, and you walk out feeling like the person you meant to be
            this morning.”
          </p>
          <div
            style={{
              marginTop: 22,
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: BRASS,
            }}
          >
            — Manuel
          </div>
        </div>
      </section>

      {/* Services — editorial table */}
      <section style={{ padding: "88px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2.2fr)",
            gap: 48,
            alignItems: "start",
          }}
        >
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: OXBLOOD, fontWeight: 600 }}>
              The Menu
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(36px, 5vw, 56px)",
                lineHeight: 1,
                letterSpacing: -1.5,
                margin: "12px 0 16px",
              }}
            >
              No fluff,
              <br />
              <span style={{ fontStyle: "italic" }}>just the work.</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.55, opacity: 0.75, margin: 0 }}>
              Cash, card, or Venmo. Tipping is appreciated, never expected. First-time clients
              add 10 minutes — I want to know what you actually want.
            </p>
          </div>

          <div>
            {services.map((s, i) => (
              <div
                key={s.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 24,
                  padding: "26px 0",
                  borderTop: i === 0 ? `1px solid ${INK}26` : "none",
                  borderBottom: `1px solid ${INK}26`,
                  alignItems: "baseline",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 26,
                      fontWeight: 400,
                      letterSpacing: -0.5,
                    }}
                  >
                    {s.name}
                  </div>
                  {s.note && (
                    <div style={{ fontSize: 14, opacity: 0.65, marginTop: 4 }}>{s.note}</div>
                  )}
                </div>
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400 }}>{s.price}</div>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", opacity: 0.55, marginTop: 2 }}>
                    {s.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Story — full bleed split */}
      <section
        style={{
          background: "#ebe3d4",
          padding: "88px 28px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
            gap: 56,
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: OXBLOOD,
                fontWeight: 600,
              }}
            >
              The Chair
            </div>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: "clamp(34px, 4.5vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: -1.2,
                margin: "12px 0 24px",
              }}
            >
              Specialty: skin fades.
              <br />
              <span style={{ fontStyle: "italic", color: OXBLOOD }}>Signature: the line design.</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.85, margin: "0 0 16px" }}>
              Bring me a reference, bring me a vibe, or just sit down and trust me. I freehand the
              designs — no stencils. Every line is yours, cut once.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.85, margin: 0 }}>
              I work out of <em>The Luxury Cut</em> in Berkeley — easy off the I-290.
              Evenings mostly, weekends earlier. One chair, one barber, one appointment at a time.
              You get me for the full session.
            </p>
          </div>
          <div
            aria-hidden
            style={{
              aspectRatio: "4 / 5",
              background: `linear-gradient(135deg, ${OXBLOOD} 0%, ${INK} 100%)`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "flex-end",
                padding: 28,
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 92,
                  lineHeight: 0.9,
                  color: CREAM,
                  letterSpacing: -3,
                }}
              >
                M.G.
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                fontSize: 10,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: BRASS,
                fontWeight: 600,
              }}
            >
              Berkeley · IL
            </div>
          </div>
        </div>
      </section>

      {/* Hours + Location */}
      <section style={{ padding: "88px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 64,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: OXBLOOD,
                fontWeight: 600,
              }}
            >
              Hours
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 36,
                fontWeight: 400,
                margin: "10px 0 24px",
                letterSpacing: -1,
              }}
            >
              When I'm in.
            </h3>
            <div>
              {hours.map((h, i) => (
                <div
                  key={h.day}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderTop: i === 0 ? `1px solid ${INK}26` : "none",
                    borderBottom: `1px solid ${INK}26`,
                    fontSize: 15,
                  }}
                >
                  <span style={{ fontFamily: SERIF, fontStyle: "italic" }}>{h.day}</span>
                  <span style={{ opacity: 0.7 }}>{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: OXBLOOD,
                fontWeight: 600,
              }}
            >
              Find Me
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 36,
                fontWeight: 400,
                margin: "10px 0 24px",
                letterSpacing: -1,
              }}
            >
              The shop.
            </h3>
            <p style={{ fontSize: 19, lineHeight: 1.4, margin: "0 0 4px", fontFamily: SERIF, fontStyle: "italic" }}>
              {ADDRESS_LINE1}
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.5, margin: "0 0 4px", fontFamily: SERIF }}>
              {ADDRESS_LINE2}
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.5, margin: "0 0 20px", fontFamily: SERIF }}>
              {ADDRESS_LINE3}
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.7, margin: "0 0 24px" }}>
              Just off I-290 in Berkeley, west of Chicago. Easy parking out front. If the door's
              locked I'm finishing someone up — give it five.
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: OXBLOOD,
                fontWeight: 600,
                textDecoration: "none",
                borderBottom: `1px solid ${OXBLOOD}`,
                paddingBottom: 2,
              }}
            >
              Open in Maps →
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          background: OXBLOOD,
          color: CREAM,
          padding: "96px 28px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: BRASS,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            Pull up
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(40px, 6vw, 72px)",
              lineHeight: 1,
              letterSpacing: -2,
              margin: "0 0 28px",
            }}
          >
            Let's get you <span style={{ fontStyle: "italic" }}>right.</span>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, opacity: 0.85, margin: "0 0 32px" }}>
            Walk in during shop hours or book through the app. The chair is open — bring a
            reference if you've got one.
          </p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              background: CREAM,
              color: INK,
              padding: "20px 36px",
              fontSize: 13,
              letterSpacing: 2.5,
              textTransform: "uppercase",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-block",
              borderRadius: 2,
            }}
          >
            Get Directions →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: INK,
          color: CREAM,
          padding: "32px 28px",
          fontSize: 12,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          opacity: 0.85,
        }}
      >
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16 }}>
          Manuel Gutiérrez · The Luxury Cut
        </div>
        <div style={{ letterSpacing: 2, textTransform: "uppercase", fontSize: 10 }}>
          Berkeley, IL · MMXXVI
        </div>
      </footer>
    </main>
  );
}
