/**
 * Shared auth-success logic.
 * Called after any successful login/OTP-verify to persist tokens,
 * decode the JWT for user info, set cookies, and notify the UI.
 */
import { decodeJwtPayload } from "@/lib/jwt";
import { STORAGE_KEYS, COOKIE_KEYS } from "@/lib/constants";

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  role: string;
  tokenType?: string;
  mustChangePassword?: boolean;
}

export function applyAuthSuccess(data: AuthResponseData): void {
  const role = data.role.replace("ROLE_", "");

  // Tokens & role
  localStorage.setItem(STORAGE_KEYS.TOKEN, data.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);

  // Optional fields
  if (data.tokenType) {
    localStorage.setItem(STORAGE_KEYS.TOKEN_TYPE, data.tokenType);
  }
  if (data.mustChangePassword !== undefined) {
    localStorage.setItem(STORAGE_KEYS.MUST_CHANGE_PASSWORD, String(data.mustChangePassword));
  }

  // Decode JWT for user info
  const payload = decodeJwtPayload(data.accessToken);
  const name   = (payload?.name   as string) || (payload?.fullName as string) || "";
  const email  = (payload?.email  as string) || (payload?.sub      as string) || "";
  const userId = (payload?.id     as string) || (payload?.userId   as string) || (payload?.sub as string) || "";

  if (name)   localStorage.setItem(STORAGE_KEYS.USER_NAME,  name);
  if (email)  localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
  if (userId) localStorage.setItem(STORAGE_KEYS.USER_ID,    userId);

  // Auth cookies (read by the proxy middleware for SSR route protection)
  const cookieOpts = "path=/; samesite=strict; max-age=86400";
  document.cookie = `${COOKIE_KEYS.TOKEN}=${data.accessToken}; ${cookieOpts}`;
  document.cookie = `${COOKIE_KEYS.ROLE}=${role}; ${cookieOpts}`;

  // Notify components that depend on user data (TopBar, Sidebar, etc.)
  window.dispatchEvent(new Event("user-auth-updated"));
}

/** Clears all auth state — tokens, localStorage, and cookies. */
export function clearAuthState(): void {
  localStorage.clear();
  document.cookie = `${COOKIE_KEYS.TOKEN}=; path=/; max-age=0; samesite=strict`;
  document.cookie = `${COOKIE_KEYS.ROLE}=; path=/; max-age=0; samesite=strict`;
}
