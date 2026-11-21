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
  clearStoredSession,
  ensureFreshToken,
  getStoredToken,
  getStoredUser,
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
      const sessionUser = sessionResult.data?.user;

      if (sessionUser) {
        await ensureFreshToken(true);
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
        const sessionUser = sessionResult.data?.user;

        if (sessionUser) {
          await ensureFreshToken(true);
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
      const result = await authClient.signIn.email({ email, password });

      if (result.error) {
        throw new Error(result.error.message || "Invalid email or password.");
      }

      const exchanged = await ensureFreshToken(true);
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

    storeSession(currentToken, result.user);
    setUser(result.user);
    return result.user;
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
