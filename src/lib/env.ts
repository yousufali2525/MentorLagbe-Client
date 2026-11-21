/**
 * Allowed frontend env vars:
 * - NEXT_PUBLIC_API_URL: Express backend origin used by apiFetch and BetterAuth.
 * - NEXT_PUBLIC_IMGBB_KEY: not used here; the backend uploads to ImgBB.
 * - NEXT_PUBLIC_STRIPE_PK: not used here; the backend returns a Checkout URL.
 */
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "";

export const API_URL = rawApiUrl.replace(/\/+$/, "");

export const apiPath = (path: string) =>
  `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const TOKEN_KEY = "mentorlagbe-token";
export const USER_KEY = "mentorlagbe-user";
