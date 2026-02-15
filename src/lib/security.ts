import crypto from "crypto";

function getSigningSecret(): string {
  return process.env.TOKEN_SIGNING_SECRET || process.env.STRIPE_SECRET_KEY!;
}

/**
 * Generate an HMAC-signed access token from arbitrary data.
 * The data string is base64url-encoded, then signed with HMAC-SHA256.
 * Returns `encoded.hash`.
 */
export function generateAccessToken(data: string): string {
  const encoded = Buffer.from(data).toString("base64url");
  const hash = crypto
    .createHmac("sha256", getSigningSecret())
    .update(data)
    .digest("base64url");
  return `${encoded}.${hash}`;
}

/**
 * Verify an HMAC-signed access token and return the decoded data string.
 * Returns null if the token is invalid or tampered with.
 */
export function verifyAccessToken(token: string): string | null {
  try {
    const [encoded, hash] = token.split(".");
    if (!encoded || !hash) return null;

    const data = Buffer.from(encoded, "base64url").toString();
    const expectedHash = crypto
      .createHmac("sha256", getSigningSecret())
      .update(data)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
      return null;
    }

    return data;
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
