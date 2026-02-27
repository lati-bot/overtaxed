import crypto from "crypto";

function getSigningSecret(): string {
  return process.env.TOKEN_SIGNING_SECRET || process.env.STRIPE_SECRET_KEY!;
}

/** Default token TTL: 90 days in seconds */
const DEFAULT_TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;

/**
 * Generate an HMAC-signed access token from arbitrary data.
 * Embeds a creation timestamp (`@ts=<epoch>`) at the end of the data string.
 * The data string is base64url-encoded, then signed with HMAC-SHA256.
 * Returns `encoded.hash`.
 */
export function generateAccessToken(data: string): string {
  const dataWithTs = `${data}@ts=${Math.floor(Date.now() / 1000)}`;
  const encoded = Buffer.from(dataWithTs).toString("base64url");
  const hash = crypto
    .createHmac("sha256", getSigningSecret())
    .update(dataWithTs)
    .digest("base64url");
  return `${encoded}.${hash}`;
}

/**
 * Verify an HMAC-signed access token and return the decoded data string.
 * Enforces TTL if the token contains a `@ts=` timestamp (default 90 days).
 * Legacy tokens without timestamps are accepted indefinitely.
 * Returns null if the token is invalid, tampered with, or expired.
 */
export function verifyAccessToken(token: string, ttlSeconds: number = DEFAULT_TOKEN_TTL_SECONDS): string | null {
  try {
    const [encoded, hash] = token.split(".");
    if (!encoded || !hash) return null;

    const rawData = Buffer.from(encoded, "base64url").toString();
    const expectedHash = crypto
      .createHmac("sha256", getSigningSecret())
      .update(rawData)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
      return null;
    }

    // Check expiration if timestamp is embedded
    const tsMatch = rawData.match(/@ts=(\d+)$/);
    if (tsMatch) {
      const createdAt = parseInt(tsMatch[1], 10);
      const now = Math.floor(Date.now() / 1000);
      if (now - createdAt > ttlSeconds) {
        return null; // Token expired
      }
      // Return data without the timestamp suffix
      return rawData.replace(/@ts=\d+$/, "");
    }

    // Legacy token without timestamp — accept
    return rawData;
  } catch {
    return null;
  }
}

/**
 * HTML-escape a string to prevent XSS in rendered HTML.
 * Only use on DATA values, not HTML structure.
 */
export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
