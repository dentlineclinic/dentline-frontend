export interface JwtPayload {
  role?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export const ROLE_ROUTE_MAP: Record<string, string> = {
  ADMIN: "/admin",
  DOCTOR: "/doctor",
  PATIENT: "/patient",
};

/**
 * Decodes a JWT payload using only Web-standard APIs (atob).
 * Safe to use on the Edge Runtime — no Node.js Buffer or crypto required.
 * Returns null on any error (malformed token, invalid base64, invalid JSON).
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64URL → Base64 → decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const jsonStr = atob(padded);
    const payload = JSON.parse(jsonStr);

    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
      return null;
    }

    return payload as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Returns true if the token's exp claim is in the past.
 * Tokens without an exp claim are treated as non-expiring (returns false).
 */
export function isTokenExpired(payload: JwtPayload): boolean {
  if (typeof payload.exp !== "number") return false;
  return payload.exp < Math.floor(Date.now() / 1000);
}
