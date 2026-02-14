"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/* ──────────────────────────────────────────────
   Valentine's Day Love Letter — For Hannah
   Design panel: Scher × Ive × Walsh × Abloh
   ────────────────────────────────────────────── */

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function RevealSection({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 1s ease ${delay}ms, transform 1s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Photo placeholder ── */
function PhotoPlaceholder({
  aspectRatio = "4 / 5",
  caption,
}: {
  aspectRatio?: string;
  caption?: string;
}) {
  return (
    <RevealSection
      style={{
        margin: "56px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio,
          background: "#F0EAE2",
          border: "1px solid #D9CEBC",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#C4B9A8",
          }}
        >
          Photo
        </span>
      </div>
      {caption && (
        <p
          style={{
            fontFamily: SANS,
            fontSize: 11,
            letterSpacing: "0.08em",
            color: COLORS.muted,
            textAlign: "center",
            marginTop: 12,
          }}
        >
          {caption}
        </p>
      )}
    </RevealSection>
  );
}

/* ── Design tokens ── */
const COLORS = {
  bg: "#FAF6F1",
  text: "#2A2118",
  accent: "#C4A882",
  muted: "#9C8E7C",
  divider: "#D9CEBC",
  dark: "#1A1714",
  darkMuted: "#8A8279",
};

const SERIF = "'Cormorant Garamond', 'Georgia', serif";
const SANS =
  "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Arial', sans-serif";

/* ── Main page ── */
export default function HannahPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* Parallax-like subtle gradient shift on scroll */
  const [scrollY, setScrollY] = useState(0);
  const onScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const gradientStop = Math.min(scrollY / 3000, 1);
  const bgGradient = `linear-gradient(180deg, #FAF6F1 ${0}%, #F5EFE8 ${
    50 + gradientStop * 30
  }%, #FAF6F1 100%)`;

  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <title>For Hannah</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          minHeight: "100vh",
          background: bgGradient,
          display: "flex",
          justifyContent: "center",
          padding: "0 28px",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        <div
          style={{
            maxWidth: 600,
            width: "100%",
            paddingTop: 100,
            paddingBottom: 140,
          }}
        >
          {/* ══════ ACT I: The Monogram ══════ */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 72,
              opacity: mounted ? 1 : 0,
              transition: "opacity 2s ease 200ms",
            }}
          >
            <p
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(64px, 18vw, 120px)",
                fontWeight: 300,
                color: COLORS.accent,
                opacity: 0.25,
                lineHeight: 1,
                margin: 0,
                letterSpacing: "0.04em",
                userSelect: "none",
              }}
            >
              T &amp; H
            </p>
          </div>

          {/* ══════ ACT II: Date & Title ══════ */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 80,
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 1.4s ease 800ms, transform 1.4s ease 800ms",
            }}
          >
            <p
              style={{
                fontFamily: SANS,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: COLORS.muted,
                marginBottom: 28,
              }}
            >
              February 14, 2026
            </p>
            <h1
              style={{
                fontFamily: SERIF,
                fontSize: "clamp(40px, 10vw, 64px)",
                fontWeight: 300,
                color: COLORS.text,
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              For Hannah
            </h1>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 40,
              height: 1,
              background: COLORS.accent,
              margin: "0 auto 72px",
              opacity: mounted ? 0.6 : 0,
              transition: "opacity 1.2s ease 1.4s",
            }}
          />

          {/* ══════ ACT III: The Letter ══════ */}

          {/* — Opening — */}
          <RevealSection>
            <div style={letterBlockStyle}>
              <p style={{ ...paraStyle, marginBottom: 36 }}>My love,</p>

              <p style={paraStyle}>
                Everyone sees that you&apos;re beautiful. That&apos;s the easy
                part — the part the world gets for free. But what I see is so
                much more than that, and I don&apos;t think I say it enough.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p style={paraStyle}>
                You are the most understanding person I&apos;ve ever known. You
                actually try to see things from where I&apos;m standing — not
                because you have to, but because that&apos;s just who you are.
                And sometimes I wonder if you even know that I notice. I do.
                Every time.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p style={paraStyle}>
                You&apos;ve made me better in ways I didn&apos;t know I needed.
                The health stuff, the fitness, staying on me about my sleep — I
                act like it&apos;s annoying but honestly, nobody in my life has
                ever cared that specifically about me. That&apos;s not a small
                thing. That&apos;s love in its most real form.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p style={paraStyle}>
                And yes — I know I used to tell you to stop buying me things all
                the time. But I think you&apos;ve taken a little too long of a
                break now. I&apos;m ready for you to resume. Whenever
                you&apos;re ready.
              </p>
            </div>
          </RevealSection>

          {/* — Photo moment 1 — */}
          <PhotoPlaceholder aspectRatio="3 / 4" />

          {/* — The memory — */}
          <RevealSection>
            <div
              style={{
                width: 32,
                height: 1,
                background: COLORS.accent,
                opacity: 0.5,
                margin: "0 0 56px",
              }}
            />
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p style={paraStyle}>
                I still remember that night — December 2017. The party at my
                place in DeKalb. You&apos;d been ignoring my messages for weeks
                after we first met, and I honestly didn&apos;t think you&apos;d
                show up.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p
                style={{
                  ...paraStyle,
                  fontSize: "clamp(24px, 5.5vw, 32px)",
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: COLORS.text,
                }}
              >
                And then you walked in.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p style={paraStyle}>
                I remember going to my room together, I don&apos;t even remember
                what for. I remember talking all night — my friends probably
                wondering who this new non-Nigerian lady was. I remember the
                party ending and us still talking. 5 AM came and we were still
                going.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p style={paraStyle}>
                We&apos;ve never really been separated since that night.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p
                style={{
                  ...paraStyle,
                  fontStyle: "italic",
                  color: COLORS.muted,
                  fontSize: "clamp(17px, 3.8vw, 20px)",
                }}
              >
                Maybe — maybe not.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p
                style={{
                  ...paraStyle,
                  fontWeight: 400,
                }}
              >
                You still make me blush, Hannah.
              </p>
            </div>
          </RevealSection>

          {/* — Photo moment 2 — */}
          <PhotoPlaceholder aspectRatio="16 / 10" />

          {/* — The future — */}
          <RevealSection>
            <div
              style={{
                width: 32,
                height: 1,
                background: COLORS.accent,
                opacity: 0.5,
                margin: "0 0 56px",
              }}
            />
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p style={paraStyle}>
                I feel so lucky to have you. Not for what you do or what you
                give me — just for who you are. You&apos;re my sunshine. My
                favorite person in the entire world.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p style={paraStyle}>
                I don&apos;t have a list of things I want to change or fix or
                ask for. I just want more of this. More time together, more
                places to explore, more of the world — with you. Maybe one day
                with our kids running around somewhere warm, wondering how their
                parents met at a house party in DeKalb, Illinois.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div style={letterBlockStyle}>
              <p style={paraStyle}>
                I&apos;m really happy I get to celebrate love with you. Not just
                today — every day.
              </p>
            </div>
          </RevealSection>

          {/* — Sign-off — */}
          <RevealSection delay={200}>
            <div style={{ ...letterBlockStyle, marginTop: 64 }}>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(18px, 4.2vw, 22px)",
                  lineHeight: 1.85,
                  color: COLORS.text,
                  letterSpacing: "0.01em",
                  margin: 0,
                }}
              >
                Forever yours,
              </p>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: "clamp(22px, 5vw, 28px)",
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: COLORS.text,
                  margin: "8px 0 0",
                  letterSpacing: "0.02em",
                }}
              >
                Tomi
              </p>
            </div>
          </RevealSection>

          {/* ══════ THE SOUNDTRACK ══════ */}
          <RevealSection>
            <div
              style={{
                marginTop: 100,
                background: COLORS.dark,
                borderRadius: 16,
                padding: "48px 24px 40px",
              }}
            >
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: COLORS.darkMuted,
                  textAlign: "center",
                  marginBottom: 28,
                  marginTop: 0,
                }}
              >
                Press Play
              </p>

              {/* Spotify embed */}
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <iframe
                  src="https://open.spotify.com/embed/playlist/17LXniwQ21IChNU6xMHrok?utm_source=generator&theme=0"
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ display: "block", borderRadius: 12 }}
                />
              </div>
            </div>
          </RevealSection>

          {/* ══════ Footer ══════ */}
          <RevealSection>
            <div
              style={{
                textAlign: "center",
                marginTop: 80,
              }}
            >
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: COLORS.divider,
                  margin: 0,
                }}
              >
                2026
              </p>
            </div>
          </RevealSection>
        </div>
      </div>

      {/* Global resets */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            *, *::before, *::after { box-sizing: border-box; }
            html { scroll-behavior: smooth; }
            body { margin: 0; padding: 0; background: #FAF6F1; }
            ::selection { background: #D9CEBC; color: #2A2118; }
          `,
        }}
      />
    </>
  );
}

/* ── Shared styles ── */
const letterBlockStyle: React.CSSProperties = {
  marginBottom: 36,
};

const paraStyle: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: "clamp(18px, 4.2vw, 22px)",
  lineHeight: 1.9,
  color: COLORS.text,
  letterSpacing: "0.01em",
  margin: 0,
};
