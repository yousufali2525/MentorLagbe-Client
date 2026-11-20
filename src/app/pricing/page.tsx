
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Crown,
  GraduationCap,
  Sparkles,
  ArrowRight,
  LoaderCircle,
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

const plans = [
  {
    name: "Student Free",
    audience: "For students",
    price: "$0",
    period: "Forever",
    description: "Start finding the right tutor for your learning journey.",
    icon: GraduationCap,
    role: "student",
    isPro: false,
    features: [
      "Browse approved tuition listings",
      "Apply for available tuitions",
      "Track application status",
      "Manage your student profile",
    ],
    button: "Get Started Free",
    href: "/sign-up?role=student&plan=free",
    featured: false,
  },
  {
    name: "Student Pro",
    audience: "For ambitious students",
    price: "$10",
    period: "One-time subscription",
    description: "Unlock a premium experience for your education journey.",
    icon: Sparkles,
    role: "student",
    isPro: true,
    features: [
      "Everything in Student Free",
      "Premium student membership",
      "Enhanced learning experience",
      "Priority support",
    ],
    button: "Choose Student Pro",
    href: "/sign-up?role=student&plan=pro",
    featured: true,
  },
  {
    name: "Tutor Free",
    audience: "For new tutors",
    price: "$0",
    period: "Forever",
    description: "Start teaching and connect with students.",
    icon: GraduationCap,
    role: "tutor",
    isPro: false,
    features: [
      "Post up to 2 tuition listings",
      "Manage your tuition posts",
      "View student applications",
      "Manage your tutor profile",
    ],
    button: "Get Started Free",
    href: "/sign-up?role=tutor&plan=free",
    featured: false,
  },
  {
    name: "Tutor Pro",
    audience: "For professional tutors",
    price: "$15",
    period: "One-time subscription",
    description: "Grow your tutoring career without posting limits.",
    icon: Crown,
    role: "tutor",
    isPro: true,
    features: [
      "Everything in Tutor Free",
      "Unlimited tuition posts",
      "Manage all your applicants",
      "Premium tutor membership",
    ],
    button: "Choose Tutor Pro",
    href: "/sign-up?role=tutor&plan=pro",
    featured: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");

  const handleProUpgrade = async (selectedRole: string) => {
    setError("");

    try {
      setLoadingPlan(selectedRole);

      let token = localStorage.getItem("mentorlagbe-token");
      let savedUser = localStorage.getItem("mentorlagbe-user");
      let user: User | null = null;

      if (token && savedUser) {
        try {
          user = JSON.parse(savedUser) as User;
        } catch {
          localStorage.removeItem("mentorlagbe-user");
          user = null;
        }
      }

      if (!token || !user) {
        const tokenResponse = await fetch(`${API_URL}/api/token`, {
          method: "GET",
          credentials: "include",
        });

        const tokenResult = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenResult.token || !tokenResult.user) {
          router.push(`/sign-in?role=${selectedRole}&plan=pro`);
          return;
        }

        token = tokenResult.token;
        user = tokenResult.user as User;

        localStorage.setItem("mentorlagbe-token", String(token));
        localStorage.setItem("mentorlagbe-user", JSON.stringify(user));
      }

      const userRole = String(user.role || "").toLowerCase();

      if (userRole !== selectedRole) {
        setError(
          `This Pro plan is for ${selectedRole}s. Please use your ${selectedRole} account.`
        );
        return;
      }

      if (String(user.plan || "").toLowerCase() === "pro") {
        router.push(`/dashboard/${userRole}`);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/payments/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(
          result.message || "Unable to start Stripe Checkout."
        );
      }

      window.location.assign(result.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoadingPlan("");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7faf8]">
      <section className="border-b border-[#e3ebe8] bg-white px-5 py-16 text-center sm:py-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f5f1] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#087f6e]">
          <Sparkles size={15} />
          Simple and transparent pricing
        </span>

        <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-[#142c2b] sm:text-4xl lg:text-5xl">
          Choose the right plan for your journey
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#647875] sm:text-base">
          Whether you are looking for a tutor or building your teaching career,
          MentorLagbe has a plan to help you move forward.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        {error && (
          <div
            role="alert"
            className="mx-auto mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.role && plan.isPro;

            return (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  plan.featured
                    ? "border-[#087f6e] bg-[#0b7567] text-white shadow-lg shadow-[#087f6e]/10"
                    : "border-[#e3ebe8] bg-white text-[#142c2b] shadow-sm"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 right-5 rounded-full bg-[#d6f3e8] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#087f6e]">
                    Premium
                  </span>
                )}

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    plan.featured
                      ? "bg-white/15 text-white"
                      : "bg-[#e8f5f1] text-[#087f6e]"
                  }`}
                >
                  <Icon size={25} />
                </div>

                <p
                  className={`mt-5 text-xs font-bold uppercase tracking-wider ${
                    plan.featured ? "text-white/65" : "text-[#82918c]"
                  }`}
                >
                  {plan.audience}
                </p>

                <h2 className="mt-2 text-xl font-extrabold">{plan.name}</h2>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span
                    className={`text-xs ${
                      plan.featured ? "text-white/65" : "text-[#82918c]"
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                <p
                  className={`mt-4 min-h-[66px] text-sm leading-6 ${
                    plan.featured ? "text-white/75" : "text-[#647875]"
                  }`}
                >
                  {plan.description}
                </p>

                <div
                  className={`my-6 border-t ${
                    plan.featured ? "border-white/20" : "border-[#edf1ef]"
                  }`}
                />

                <p className="mb-4 text-sm font-bold">What&apos;s included</p>

                <ul className="flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.featured
                            ? "bg-white/15 text-white"
                            : "bg-[#e8f5f1] text-[#087f6e]"
                        }`}
                      >
                        <Check size={13} strokeWidth={3} />
                      </span>

                      <span
                        className={
                          plan.featured ? "text-white/90" : "text-[#526763]"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.isPro ? (
                  <button
                    type="button"
                    disabled={loadingPlan !== ""}
                    onClick={() => handleProUpgrade(plan.role)}
                    className="mt-8 flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-black transition hover:bg-[#e8f5f1] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <LoaderCircle size={17} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {plan.button}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={plan.href}
                    className="mt-8 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087f6e] px-4 text-sm font-bold text-white transition hover:bg-[#066657]"
                  >
                    {plan.button}
                    <ArrowRight size={16} />
                  </Link>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-[#dcebe4] bg-white p-6 text-center sm:p-9">
          <h2 className="text-xl font-extrabold text-[#142c2b]">
            Not sure which plan to choose?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#647875]">
            Start with a free account. You can explore MentorLagbe and upgrade
            your membership when you are ready.
          </p>

          <Link
            href="/sign-up"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087f6e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#066657]"
          >
            Create Free Account
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
