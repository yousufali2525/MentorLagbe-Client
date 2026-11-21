"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import Logo from "@/components/Logo";
import { toast } from "@/components/ToastProvider";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();

  const initialRole =
    searchParams.get("role") === "tutor" ? "tutor" : "student";

  const initialPlan =
    searchParams.get("plan") === "pro" ? "pro" : "free";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [plan, setPlan] = useState(initialPlan);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);

      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      router.push(
        `/sign-in?message=account-created&role=${role}&plan=${plan}`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
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
              Start your learning journey with MentorLagbe.
            </h1>

            <p className="mt-5 text-sm leading-7 text-[var(--hero-muted)]">
              Connect with the right people, discover new opportunities
              and make every learning moment count.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Find suitable tuition opportunities",
              "Connect with students and tutors",
              "Manage your learning journey",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={19} />
                {item}
              </div>
            ))}
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
              Create your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Join MentorLagbe and get started today.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                  Full Name
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl border border-[var(--border)] px-4 transition focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary-light)]">
                  <UserRound size={18} className="shrink-0 text-[var(--muted-foreground)]" />
                  <input
                    required
                    minLength={2}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                  />
                </div>
              </div>

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
                  <LockKeyhole size={18} className="shrink-0 text-[var(--muted-foreground)]" />

                  <input
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-semibold text-[var(--foreground)]"
                >
                  I want to join as
                </label>

                <select
                  id="role"
                  required
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]"
                >
                  <option value="student">Student — find a tutor</option>
                  <option value="tutor">Tutor — teach students</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-[var(--foreground)]">
                  Choose your plan
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "free", label: "Free", price: "$0" },
                    {
                      value: "pro",
                      label: "Pro",
                      price: role === "tutor" ? "$15" : "$10",
                    },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPlan(item.value)}
                      className={`rounded-xl border p-3 text-left transition ${
                        plan === item.value
                          ? "border-[var(--primary)] bg-[var(--primary-light)] ring-1 ring-[var(--primary)]"
                          : "border-[var(--border)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className="block text-sm font-bold text-[var(--foreground)]">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                        {item.price}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  Accounts start on Free. Choosing Pro starts Stripe Checkout
                  after you sign in.
                </p>
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[var(--muted-foreground)]">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-bold text-[var(--primary)] hover:underline"
              >
                Sign In
              </Link>
            </p>

            <p className="mt-5 text-center text-xs text-[var(--muted-foreground)]">
              By creating an account, you agree to use MentorLagbe responsibly.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
          <LoaderCircle className="animate-spin text-[var(--primary)]" size={32} />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
