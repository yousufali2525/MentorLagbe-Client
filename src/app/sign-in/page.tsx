
"use client";

import { Suspense, useEffect, useState } from "react";
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
import { useAuth } from "@/components/AuthProvider";
import Logo from "@/components/Logo";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import { dashboardHrefForRole, normalizeRole } from "@/lib/roles";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const accountCreated =
    searchParams.get("message") === "account-created";

  useEffect(() => {
    if (accountCreated) {
      toast.success("Account created. Please sign in to continue.");
    }
  }, [accountCreated]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const user = await signIn({ email: email.trim(), password });
      const role = normalizeRole(user.role);

      if (!role) {
        toast.error("Your account role is not recognized. Please contact support.");
        return;
      }

      const redirect = searchParams.get("redirect");
      if (redirect?.startsWith("/") && !redirect.startsWith("//")) {
        router.replace(redirect);
        return;
      }

      const plan = searchParams.get("plan");
      const requestedRole = normalizeRole(searchParams.get("role"));

      if (plan === "pro") {
        if (
          !["student", "tutor"].includes(role) ||
          (requestedRole && requestedRole !== role)
        ) {
          toast.error(
            "The selected plan does not match your account role."
          );
          return;
        }

        if (user.plan === "pro") {
          router.replace(dashboardHrefForRole(role));
          return;
        }

        const checkout = await apiFetch<{ url: string }>(
          "/api/payments/create-checkout-session",
          { method: "POST" }
        );

        toast.info("Redirecting to Stripe Checkout...");
        window.location.assign(checkout.url);
        return;
      }

      router.replace(dashboardHrefForRole(role));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl lg:grid-cols-[0.85fr_1.15fr]">
        <section className="hidden flex-col justify-between bg-[var(--hero)] p-10 text-[var(--hero-foreground)] lg:flex">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <GraduationCap size={28} />
            </div>

            <h1 className="mt-10 text-4xl font-extrabold leading-tight">
              Welcome back to your learning community.
            </h1>

            <p className="mt-5 text-sm leading-7 text-[var(--hero-muted)]">
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

          <p className="text-xs text-[var(--hero-muted)]">
            Learn better. Teach better. Grow together.
          </p>
        </section>

        <section className="p-5 sm:p-8 md:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <div className="mb-7 lg:hidden">
              <Logo />
            </div>

            <h2 className="text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Sign in to continue to your MentorLagbe account.
            </p>

            {accountCreated && (
              <div className="mt-6 status-alert-success rounded-xl p-3 text-sm">
                Your account has been created. Please sign in.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                  Email Address
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl border border-[var(--border)] px-4 transition focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary-light)]">
                  <Mail size={18} className="shrink-0 text-[var(--muted-foreground)]" />

                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                  Password
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl border border-[var(--border)] px-4 transition focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary-light)]">
                  <LockKeyhole
                    size={18}
                    className="shrink-0 text-[var(--muted-foreground)]"
                  />

                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
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
                  className="status-alert-danger rounded-xl p-3 text-sm"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] text-sm font-bold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
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

            <p className="mt-7 text-center text-sm text-[var(--muted-foreground)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-bold text-[var(--primary)] hover:underline"
              >
                Create Account
              </Link>
            </p>

            <p className="mt-5 text-center text-xs text-[var(--muted-foreground)]">
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
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
          <LoaderCircle className="animate-spin text-[var(--primary)]" size={32} />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
