import { API_URL, apiPath, TOKEN_KEY, USER_KEY } from "./env";

export type AuthUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
  phone?: string;
  bio?: string;
  location?: string;
  profileImage?: string;
  image?: string;
  imageUrl?: string;
  photoURL?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
};

/**
 * Better Auth uses `image`, the app database uses `profileImage`, and older
 * responses may use one of the other aliases. Normalize all of them so the
 * Navbar always receives the same field.
 */
export function normalizeAuthUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Record<string, unknown>;
  const user = { ...raw } as AuthUser;

  const imageValue = [
    raw.profileImage,
    raw.image,
    raw.imageUrl,
    raw.photoURL,
    raw.avatar,
  ].find((item) => typeof item === "string" && item.trim());

  if (typeof imageValue === "string" && imageValue.trim()) {
    const image = imageValue.trim();
    user.profileImage = image;
    user.image = image;
  }

  const idValue = raw._id ?? raw.id;
  if (idValue !== undefined && idValue !== null) {
    const id = String(idValue);
    user._id = id;
    user.id = id;
  }

  return user;
}

function sameAuthUser(a: AuthUser | null, b: AuthUser | null): boolean {
  const aId = a?._id || a?.id;
  const bId = b?._id || b?.id;
  return Boolean(aId && bId && String(aId) === String(bId));
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Better Auth session token used only for exchanging into the backend JWT.
 * Kept in memory so the JWT refresh path also works when cross-site cookies
 * are unavailable.
 */
let betterAuthSessionToken: string | null = null;

export function rememberBetterAuthSessionToken(token?: string | null): void {
  if (typeof token === "string" && token.trim()) {
    betterAuthSessionToken = token.trim();
  }
}

export function clearBetterAuthSessionToken(): void {
  betterAuthSessionToken = null;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return (parsed?.user || parsed?.data?.user || parsed) as AuthUser;
  } catch {
    return null;
  }
}

export function storeSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-updated"));
  window.dispatchEvent(new Event("user-updated"));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth-updated"));
  window.dispatchEvent(new Event("user-updated"));
}

/** Exchange the BetterAuth session for the backend JWT. */
async function exchangeCookieForToken(
  sessionToken: string | null = betterAuthSessionToken,
  fallbackUser?: AuthUser | null
): Promise<{
  token: string;
  user: AuthUser;
} | null> {
  try {
    const requestHeaders = new Headers({ Accept: "application/json" });

    // Cross-site cookies can be blocked in production. The backend accepts the
    // Better Auth session token as a bearer in that case.
    if (sessionToken) {
      requestHeaders.set("Authorization", `Bearer ${sessionToken}`);
    }

    const response = await fetch(apiPath("/api/token"), {
      method: "GET",
      credentials: "include",
      headers: requestHeaders,
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data?.token) return null;

    const tokenUser = normalizeAuthUser(data.user);
    const previousUser = getStoredUser();
    const sessionUser = normalizeAuthUser(fallbackUser);

    // /api/token returns only id/name/email/role/plan. Keep the richer profile
    // (especially profileImage) that /api/users/me or Better Auth already gave
    // us for the same user, so a forced JWT refresh does not erase the avatar.
    const user =
      normalizeAuthUser({
        ...(sameAuthUser(previousUser, tokenUser) ? previousUser : {}),
        ...(sameAuthUser(sessionUser, tokenUser) ? sessionUser : {}),
        ...(tokenUser ?? {}),
      }) ?? ({} as AuthUser);

    storeSession(data.token, user);
    return { token: data.token, user };
  } catch {
    return null;
  }
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Ensures a JWT is available. A stored token is reused unless `force` is set.
 * Concurrent callers share a single /api/token request.
 */
export function ensureFreshToken(
  force = false,
  sessionToken?: string | null,
  fallbackUser?: AuthUser | null
): Promise<boolean> {
  rememberBetterAuthSessionToken(sessionToken);

  if (!force && getStoredToken()) return Promise.resolve(true);

  if (refreshPromise) return refreshPromise;

  refreshPromise = exchangeCookieForToken(
    sessionToken ?? betterAuthSessionToken,
    fallbackUser
  )
    .then((result) => Boolean(result))
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  /** Attach JWT and retry once after a 401 token refresh. Defaults to true. */
  auth?: boolean;
  /** Internal flag used by the retry. */
  _retried?: boolean;
};

/**
 * Fetch wrapper for every backend API call. It always sends the JWT when a
 * protected request is made and transparently refreshes it from the
 * BetterAuth session cookie on 401.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { auth = true, _retried = false, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const token = getStoredToken();
  if (auth && token && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const send = () =>
    fetch(apiPath(path), {
      ...init,
      headers: requestHeaders,
      credentials: "include",
    });

  let response = await send();

  if (response.status === 401 && auth && !_retried) {
    const refreshed = await ensureFreshToken(true);
    if (refreshed) {
      const freshToken = getStoredToken();
      if (freshToken) requestHeaders.set("Authorization", `Bearer ${freshToken}`);
      response = await send();
    }
  }

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      (payload as { message?: string })?.message ||
      (payload as { error?: { message?: string } })?.error?.message ||
      `Request failed (${response.status})`;

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const isApiConfigured = Boolean(API_URL);
