"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/sign-up/email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            plan,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error?.message ||
            "Registration failed. Please try again."
        );
      }

      router.push(
        `/sign-in?message=account-created&role=${role}&plan=${plan}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
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
              Start your learning journey with MentorLagbe.
            </h1>

            <p className="mt-5 text-sm leading-7 text-white/75">
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
              Create your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#647875]">
              Join MentorLagbe and get started today.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#23413c]">
                  Full Name
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl border border-[#dce8e3] px-4 transition focus-within:border-[#087f6e] focus-within:ring-2 focus-within:ring-[#087f6e]/10">
                  <UserRound size={18} className="shrink-0 text-[#82918c]" />
                  <input
                    required
                    minLength={2}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#a0ada8]"
                  />
                </div>
              </div>

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
                  <LockKeyhole size={18} className="shrink-0 text-[#82918c]" />

                  <input
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#a0ada8]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-[#82918c] transition hover:text-[#087f6e]"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-[#23413c]">
                  I want to join as
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`rounded-xl border p-3 text-left transition sm:p-4 ${
                      role === "student"
                        ? "border-[#087f6e] bg-[#e8f5f1] ring-1 ring-[#087f6e]"
                        : "border-[#e3ebe8] bg-white hover:border-[#a8cfc1]"
                    }`}
                  >
                    <BookOpen
                      size={22}
                      className={
                        role === "student"
                          ? "text-[#087f6e]"
                          : "text-[#82918c]"
                      }
                    />
                    <span className="mt-2 block text-sm font-bold text-[#142c2b]">
                      Student
                    </span>
                    <span className="mt-1 block text-xs text-[#82918c]">
                      Find a tutor
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("tutor")}
                    className={`rounded-xl border p-3 text-left transition sm:p-4 ${
                      role === "tutor"
                        ? "border-[#087f6e] bg-[#e8f5f1] ring-1 ring-[#087f6e]"
                        : "border-[#e3ebe8] bg-white hover:border-[#a8cfc1]"
                    }`}
                  >
                    <GraduationCap
                      size={22}
                      className={
                        role === "tutor"
                          ? "text-[#087f6e]"
                          : "text-[#82918c]"
                      }
                    />
                    <span className="mt-2 block text-sm font-bold text-[#142c2b]">
                      Tutor
                    </span>
                    <span className="mt-1 block text-xs text-[#82918c]">
                      Teach students
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-[#23413c]">
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
                          ? "border-[#087f6e] bg-[#e8f5f1] ring-1 ring-[#087f6e]"
                          : "border-[#e3ebe8] hover:border-[#a8cfc1]"
                      }`}
                    >
                      <span className="block text-sm font-bold text-[#142c2b]">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-[#647875]">
                        {item.price}
                      </span>
                    </button>
                  ))}
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

            <p className="mt-7 text-center text-sm text-[#647875]">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-bold text-[#087f6e] hover:underline"
              >
                Sign In
              </Link>
            </p>

            <p className="mt-5 text-center text-xs text-[#9aa9a4]">
              By creating an account, you agree to use MentorLagbe responsibly.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
