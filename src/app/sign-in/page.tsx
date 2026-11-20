
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
};

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const accountCreated =
    searchParams.get("message") === "account-created";

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/sign-in/email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error?.message ||
            "Invalid email or password."
        );
      }

      const tokenResponse = await fetch(`${API_URL}/api/token`, {
        method: "GET",
        credentials: "include",
      });

      const tokenResult = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenResult.token) {
        throw new Error(
          tokenResult.message ||
            "Failed to generate authentication token."
        );
      }

      const user = tokenResult.user as User | undefined;

      if (!user || !user.role) {
        throw new Error(
          "User role information is missing. Please contact support."
        );
      }

      const role = String(user.role).toLowerCase();
      const plan = searchParams.get("plan");
      const requestedRole = searchParams.get("role");

      localStorage.setItem(
        "mentorlagbe-token",
        tokenResult.token
      );

      localStorage.setItem(
        "mentorlagbe-user",
        JSON.stringify(user)
      );

      window.dispatchEvent(new Event("auth-updated"));
      window.dispatchEvent(new Event("user-updated"));

      const redirect = searchParams.get("redirect");

      if (
        redirect?.startsWith("/") &&
        !redirect.startsWith("//")
      ) {
        router.replace(redirect);
        return;
      }

      if (plan === "pro") {
        if (
          !["student", "tutor"].includes(role) ||
          requestedRole !== role
        ) {
          setError(
            "The selected plan does not match your account role. Please check your account and try again."
          );
          return;
        }

        if (user.plan === "pro") {
          router.replace(`/dashboard/${role}`);
          return;
        }

        const checkoutResponse = await fetch(
          `${API_URL}/api/payments/create-checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenResult.token}`,
            },
            credentials: "include",
          }
        );

        const checkoutResult = await checkoutResponse.json();

        if (!checkoutResponse.ok || !checkoutResult.url) {
          throw new Error(
            checkoutResult.message ||
              "Unable to start Stripe Checkout. Please try again."
          );
        }

        window.location.assign(checkoutResult.url);
        return;
      }

      switch (role) {
        case "student":
          router.replace("/dashboard/student");
          break;

        case "tutor":
          router.replace("/dashboard/tutor");
          break;

        case "admin":
          router.replace("/dashboard/admin");
          break;

        default:
          localStorage.removeItem("mentorlagbe-token");
          localStorage.removeItem("mentorlagbe-user");

          window.dispatchEvent(new Event("auth-updated"));

          setError(
            "Your account role is not recognized. Please contact support."
          );
          break;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7faf8] px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#e3ebe8] bg-white shadow-[0_20px_60px_rgba(20,44,43,0.08)] lg:grid-cols-[0.85fr_1.15fr]">
        <section className="hidden flex-col justify-between bg-[#087f6e] p-10 text-white lg:flex">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <GraduationCap size={28} />
            </div>

            <h1 className="mt-10 text-4xl font-extrabold leading-tight">
              Welcome back to your learning community.
            </h1>

            <p className="mt-5 text-sm leading-7 text-white/75">
              Continue connecting with tutors, discovering opportunities
              and making progress with MentorLagbe.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3 text-sm">
              <BookOpen size={20} />
              Discover learning opportunities
            </div>

            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck size={20} />
              Manage your account securely
            </div>
          </div>

          <p className="text-xs text-white/60">
            Learn better. Teach better. Grow together.
          </p>
        </section>

        <section className="p-5 sm:p-8 md:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <div className="mb-7 flex items-center gap-2 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f1] text-[#087f6e]">
                <GraduationCap size={24} />
              </div>

              <span className="text-lg font-extrabold text-[#087f6e]">
                MentorLagbe
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-[#142c2b] sm:text-3xl">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#647875]">
              Sign in to continue to your MentorLagbe account.
            </p>

            {accountCreated && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                Your account has been created. Please sign in.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#23413c]">
                  Email Address
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl border border-[#dce8e3] px-4 transition focus-within:border-[#087f6e] focus-within:ring-2 focus-within:ring-[#087f6e]/10">
                  <Mail size={18} className="shrink-0 text-[#82918c]" />

                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#a0ada8]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#23413c]">
                  Password
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl border border-[#dce8e3] px-4 transition focus-within:border-[#087f6e] focus-within:ring-2 focus-within:ring-[#087f6e]/10">
                  <LockKeyhole
                    size={18}
                    className="shrink-0 text-[#82918c]"
                  />

                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#a0ada8]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-[#82918c] transition hover:text-[#087f6e]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087f6e] text-sm font-bold text-white transition hover:bg-[#066657] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#647875]">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-bold text-[#087f6e] hover:underline"
              >
                Create Account
              </Link>
            </p>

            <p className="mt-5 text-center text-xs text-[#9aa9a4]">
              Your learning journey continues with MentorLagbe.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f7faf8]">
          <LoaderCircle className="animate-spin text-[#087f6e]" size={32} />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
