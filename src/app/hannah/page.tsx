"use client";

import { useEffect, useState } from "react";

export default function HannahPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in on load
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow" />
        <title>For Hannah</title>
      </head>
      <div
        style={{
          minHeight: "100vh",
          background: "#faf8f5",
          display: "flex",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            width: "100%",
            paddingTop: 80,
            paddingBottom: 120,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 1.2s ease, transform 1.2s ease",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 64, textAlign: "center" }}>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#b8a99a",
                marginBottom: 24,
              }}
            >
              February 14, 2026
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                fontSize: "clamp(36px, 8vw, 56px)",
                fontWeight: 300,
                color: "#2c2420",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              For Hannah
            </h1>
          </div>

          {/* Divider */}
          <div
            style={{
              width: 48,
              height: 1,
              background: "#d4c8bc",
              margin: "0 auto 64px",
            }}
          />

          {/* Letter */}
          <div
            style={{
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontSize: "clamp(18px, 4vw, 22px)",
              lineHeight: 1.85,
              color: "#3d352e",
              letterSpacing: "0.01em",
            }}
          >
            <p style={{ marginBottom: 32 }}>My love,</p>

            <p style={{ marginBottom: 32 }}>
              Everyone sees that you&apos;re beautiful. That&apos;s the easy part — the
              part the world gets for free. But what I see is so much more than
              that, and I don&apos;t think I say it enough.
            </p>

            <p style={{ marginBottom: 32 }}>
              You are the most understanding person I&apos;ve ever known. You
              actually try to see things from where I&apos;m standing — not
              because you have to, but because that&apos;s just who you are. And
              sometimes I wonder if you even know that I notice. I do. Every
              time.
            </p>

            <p style={{ marginBottom: 32 }}>
              You&apos;ve made me better in ways I didn&apos;t know I needed. The
              health stuff, the fitness, staying on me about my sleep — I act
              like it&apos;s annoying but honestly, nobody in my life has ever cared
              that specifically about me. That&apos;s not a small thing. That&apos;s
              love in its most real form.
            </p>

            <p style={{ marginBottom: 32 }}>
              And yes — I know I used to tell you to stop buying me things all
              the time. But I think you&apos;ve taken a little too long of a break
              now. I&apos;m ready for you to resume. Whenever you&apos;re ready.
            </p>

            {/* Divider */}
            <div
              style={{
                width: 32,
                height: 1,
                background: "#d4c8bc",
                margin: "48px 0",
              }}
            />

            <p style={{ marginBottom: 32 }}>
              I still remember that night — December 2017. The party at my
              place in DeKalb. You&apos;d been ignoring my messages for weeks after
              we first met, and I honestly didn&apos;t think you&apos;d show up.
            </p>

            <p style={{ marginBottom: 32 }}>
              And then you walked in.
            </p>

            <p style={{ marginBottom: 32 }}>
              I remember going to my room together, I don&apos;t even remember what
              for. I remember talking all night — my friends probably wondering
              who this new non-Nigerian lady was. I remember the party ending
              and us still talking. 5 AM came and we were still going.
            </p>

            <p style={{ marginBottom: 32 }}>
              We&apos;ve never really been separated since that night.
            </p>

            <p
              style={{
                marginBottom: 32,
                fontStyle: "italic",
                color: "#8a7d6b",
              }}
            >
              Maybe — maybe not.
            </p>

            <p style={{ marginBottom: 32 }}>
              You still make me blush, Hannah.
            </p>

            {/* Divider */}
            <div
              style={{
                width: 32,
                height: 1,
                background: "#d4c8bc",
                margin: "48px 0",
              }}
            />

            <p style={{ marginBottom: 32 }}>
              I feel so lucky to have you. Not for what you do or what you give
              me — just for who you are. You&apos;re my sunshine. My favorite person
              in the entire world.
            </p>

            <p style={{ marginBottom: 32 }}>
              I don&apos;t have a list of things I want to change or fix or ask
              for. I just want more of this. More time together, more places
              to explore, more of the world — with you. Maybe one day with our
              kids running around somewhere warm, wondering how their parents
              met at a house party in DeKalb, Illinois.
            </p>

            <p style={{ marginBottom: 32 }}>
              I&apos;m really happy I get to celebrate love with you. Not just
              today — every day.
            </p>

            <p style={{ marginBottom: 0 }}>
              Forever yours,
              <br />
              <span style={{ fontStyle: "italic" }}>Tomi</span>
            </p>
          </div>

          {/* Divider before playlist */}
          <div
            style={{
              width: 48,
              height: 1,
              background: "#d4c8bc",
              margin: "80px auto 48px",
            }}
          />

          {/* Playlist section - placeholder */}
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#b8a99a",
                marginBottom: 32,
              }}
            >
              A playlist for us
            </p>
            {/* Spotify embed will go here */}
            <div id="spotify-embed" />
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              marginTop: 80,
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                fontSize: 16,
                color: "#b8a99a",
                fontStyle: "italic",
              }}
            >
              Happy Valentine&apos;s Day, my love ♥
            </p>
          </div>
        </div>
      </div>

      {/* Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap"
        rel="stylesheet"
      />
    </>
  );
}
