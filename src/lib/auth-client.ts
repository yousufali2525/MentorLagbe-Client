import { createAuthClient } from "better-auth/react";
import { API_URL } from "./env";

/**
 * BetterAuth client pointed at the deployed Express backend.
 * When NEXT_PUBLIC_API_URL is empty, BetterAuth falls back to the current
 * origin, which is useful when the backend is exposed through /api rewrites.
 */
export const authClient = createAuthClient({
  ...(API_URL ? { baseURL: API_URL } : {}),
  fetchOptions: {
    credentials: "include",
  },
});
