"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import {
  apiFetch,
  clearBetterAuthSessionToken,
  clearStoredSession,
  ensureFreshToken,
  getStoredToken,
  getStoredUser,
  normalizeAuthUser,
  storeSession,
  type AuthUser,
} from "@/lib/api";
import { toast } from "./ToastProvider";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type SignInInput = { email: string; password: string };
type SignUpInput = { name: string; email: string; password: string; role: string };

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  signIn: (input: SignInInput) => Promise<AuthUser>;
  signUp: (input: SignUpInput) => Promise<unknown>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Reads the Better Auth session token from any response/session shape. */
function extractSessionToken(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;

  const payload = value as {
    token?: unknown;
    session?: { token?: unknown } | null;
  };
  const token = payload.token ?? payload.session?.token;

  return typeof token === "string" && token.trim() ? token.trim() : null;
}

async function readSessionToken(): Promise<string | null> {
  try {
    const sessionResult = await authClient.getSession();
    return extractSessionToken(sessionResult.data);
  } catch {
    return null;
  }
}

/** Better Auth calls the avatar `image`; the app calls it `profileImage`. */
function extractSessionUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") return null;

  const payload = value as {
    user?: unknown;
    session?: { user?: unknown } | null;
  };

  return normalizeAuthUser(payload.user ?? payload.session?.user ?? value);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const applyStoredSession = useCallback(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setStatus("authenticated");
      return true;
    }

    return false;
  }, []);

  const refreshSession = useCallback(async () => {
    setStatus("loading");

    try {
      const sessionResult = await authClient.getSession();
      const sessionUser = extractSessionUser(sessionResult.data);
      const sessionToken = extractSessionToken(sessionResult.data);

      if (sessionUser || sessionToken) {
        await ensureFreshToken(true, sessionToken, sessionUser);
      }
    } catch {
      // A transient network failure must not log a valid JWT out.
    }

    if (!applyStoredSession()) {
      clearStoredSession();
      setToken(null);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [applyStoredSession]);

  useEffect(() => {
    let active = true;

    const resolve = async () => {
      setStatus("loading");

      try {
        const sessionResult = await authClient.getSession();
        const sessionUser = extractSessionUser(sessionResult.data);
        const sessionToken = extractSessionToken(sessionResult.data);

        if (sessionUser || sessionToken) {
          await ensureFreshToken(true, sessionToken, sessionUser);
        }
      } catch {
        // Fall through to the stored JWT check below.
      }

      if (!active) return;

      if (!applyStoredSession()) {
        clearStoredSession();
        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    resolve();

    const handleChange = () => {
      if (!active) return;
      if (!applyStoredSession()) {
        setToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    window.addEventListener("storage", handleChange);
    window.addEventListener("auth-updated", handleChange);

    return () => {
      active = false;
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("auth-updated", handleChange);
    };
  }, [applyStoredSession]);

  const signIn = useCallback(
    async ({ email, password }: SignInInput) => {
      const tokenFromHeader: { value: string | null } = { value: null };

      const result = await authClient.signIn.email(
        { email, password },
        {
          onResponse: (context) => {
            try {
              tokenFromHeader.value =
                context.response.headers.get("set-auth-token") || null;
            } catch {
              // The header may not be exposed by CORS; the body/session
              // fallbacks below still provide the session token.
            }
          },
        }
      );

      if (result.error) {
        throw new Error(result.error.message || "Invalid email or password.");
      }

      const sessionUser = extractSessionUser(result.data);
      const sessionToken =
        extractSessionToken(result.data) ??
        tokenFromHeader.value ??
        (await readSessionToken());

      const exchanged = await ensureFreshToken(
        true,
        sessionToken,
        sessionUser
      );
      if (!exchanged) {
        throw new Error("Unable to create an authentication session.");
      }

      const authUser = getStoredUser();
      if (!authUser?.role) {
        throw new Error("Your account role is missing. Please contact support.");
      }

      setUser(authUser);
      setToken(getStoredToken());
      setStatus("authenticated");

      toast.success(`Welcome back, ${authUser.name || authUser.email || "user"}!`);
      return authUser;
    },
    []
  );

  const signUp = useCallback(async ({ name, email, password, role }: SignUpInput) => {
    const result = await authClient.signUp.email({
      name,
      email,
      password,
      role,
    } as never);

    if (result.error) {
      throw new Error(result.error.message || "Registration failed.");
    }

    toast.success("Account created. Please sign in to continue.");
    return result.data;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut();
    } catch {
      // Clear local state even when the network request fails.
    }

    clearBetterAuthSessionToken();
    clearStoredSession();
    setToken(null);
    setUser(null);
    setStatus("unauthenticated");
    toast.success("You have been signed out.");
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) return null;

    const result = await apiFetch<{ user?: AuthUser }>("/api/users/me");
    if (!result.user) return null;

    const refreshedUser = normalizeAuthUser(result.user) ?? result.user;

    // apiFetch may have refreshed the JWT on a 401; store the current one so
    // the richer profile does not overwrite it with an expired token.
    storeSession(getStoredToken() || currentToken, refreshedUser);
    setUser(refreshedUser);
    return refreshedUser;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      token,
      signIn,
      signUp,
      signOut,
      refreshSession,
      refreshUser,
    }),
    [status, user, token, signIn, signUp, signOut, refreshSession, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
