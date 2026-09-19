import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Overtaxed — less assembly, more room for professional judgment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f4f4ee",
          color: "#192e32",
          padding: "64px 72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div
              style={{
                width: "35px",
                height: "35px",
                display: "flex",
                border: "3px solid #192e32",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "18px", height: "3px", backgroundColor: "#216452" }} />
            </div>
            <span style={{ fontSize: "34px", fontWeight: 600, letterSpacing: "-1.5px" }}>overtaxed</span>
          </div>
          <div
            style={{
              display: "flex",
              padding: "9px 13px",
              border: "1px solid #aebbb4",
              color: "#59686b",
              fontSize: "14px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            Professional workflow research
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#216452", fontSize: "18px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "24px" }}>
            For Cook County residential appeal teams
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: "70px", lineHeight: 1.04, fontWeight: 500, letterSpacing: "-3.5px" }}>
            <span>Less assembly.</span>
            <span style={{ color: "#216452" }}>More room for your judgment.</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "22px", borderTop: "1px solid #cfd7d1", color: "#59686b", fontSize: "16px" }}>
          <span>Inspectable evidence preparation</span>
          <span>Public-data case review · Professional control</span>
        </div>
      </div>
    ),
    size,
  );
}
