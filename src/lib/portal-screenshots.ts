/**
 * Portal Screenshot Utility
 * Maps counties to their filing portal screenshots for embedding in PDFs.
 */

import { readFileSync } from "fs";
import { join } from "path";

const SCREENSHOT_MAP: Record<string, string> = {
  Harris: "hcad-portal.png",
  Dallas: "dcad-portal.png",
  Tarrant: "tad-portal.jpg",
  Collin: "collincad-portal.jpg",
  Denton: "dentoncad-portal.png",
  Travis: "tcad-portal.jpg",
  Williamson: "wcad-portal.jpg",
  Rockwall: "rockwallcad-portal.png",
  // Fort Bend and Bexar — screenshots not yet captured
  // Cook County uses its own Appeal Guide
};

/**
 * Returns a base64 data URI for the county's portal screenshot, or null if not available.
 */
export function getPortalScreenshotDataUri(county: string): string | null {
  const filename = SCREENSHOT_MAP[county];
  if (!filename) return null;

  try {
    const ext = filename.endsWith(".png") ? "png" : "jpeg";
    const filePath = join(process.cwd(), "public", "portal-screenshots", filename);
    const buffer = readFileSync(filePath);
    return `data:image/${ext};base64,${buffer.toString("base64")}`;
  } catch {
    console.warn(`Portal screenshot not found for ${county}: ${filename}`);
    return null;
  }
}
