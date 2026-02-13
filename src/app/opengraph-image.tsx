import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lower Your Property Tax";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a6b5a",
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          {/* Teal rounded square with white "o" ring — inverted for teal bg */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                border: "3.5px solid #1a6b5a",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 500,
              color: "white",
              letterSpacing: "0.01em",
            }}
          >
            overtaxed
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "54px",
            fontWeight: 600,
            color: "white",
            letterSpacing: "-0.01em",
            marginBottom: "28px",
          }}
        >
          Lower Your Property Tax
        </div>

        {/* Accent line */}
        <div
          style={{
            width: "80px",
            height: "1.5px",
            backgroundColor: "rgba(255,255,255,0.3)",
            marginBottom: "28px",
          }}
        />

        {/* Geographic descriptor */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.05em",
          }}
        >
          Texas & Illinois
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
