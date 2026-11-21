"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Crown,
  GraduationCap,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import { dashboardHrefForRole, normalizeRole } from "@/lib/roles";

type Plan = {
  name: string;
  audience: string;
  price: string;
  period: string;
  description: string;
  icon: typeof GraduationCap;
  role: "student" | "tutor";
  isPro: boolean;
  features: string[];
  button: string;
  href: string;
  featured: boolean;
};

const plans: Plan[] = [
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
    href: "/sign-up?role=student",
    featured: false,
  },
  {
    name: "Student Pro",
    audience: "For ambitious students",
    price: "$10",
    period: "One-time payment",
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
    button: "Upgrade to Student Pro",
    href: "/sign-in?redirect=/pricing&role=student",
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
    href: "/sign-up?role=tutor",
    featured: false,
  },
  {
    name: "Tutor Pro",
    audience: "For professional tutors",
    price: "$15",
    period: "One-time payment",
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
    button: "Upgrade to Tutor Pro",
    href: "/sign-in?redirect=/pricing&role=tutor",
    featured: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const [loadingRole, setLoadingRole] = useState<"student" | "tutor" | null>(null);

  async function handleUpgrade(plan: Plan) {
    if (status === "loading") {
      toast.info("Checking your session. Please try again in a moment.");
      return;
    }

    if (!user) {
      toast.info("Sign in to upgrade your plan.");
      router.push(plan.href);
      return;
    }

    const userRole = normalizeRole(user.role);
    if (userRole !== plan.role) {
      toast.error(`Please use your ${plan.role} account for this plan.`);
      return;
    }

    if (user.plan?.toLowerCase() === "pro") {
      toast.info("Your Pro plan is already active.");
      router.push(dashboardHrefForRole(userRole));
      return;
    }

    try {
      setLoadingRole(plan.role);
      toast.info("Opening secure Stripe Checkout...");

      const result = await apiFetch<{ url?: string; message?: string }>(
        "/api/payments/create-checkout-session",
        { method: "POST" }
      );

      if (!result.url) {
        throw new Error(result.message || "Stripe did not return a checkout URL.");
      }

      toast.success("Redirecting to Stripe Checkout...");
      window.location.assign(result.url);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to start checkout."
      );
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--border)] bg-[var(--surface)] px-5 py-16 text-center sm:py-20">
        <span className="badge">
          <Sparkles size={14} className="mr-1.5" />
          Simple and transparent pricing
        </span>

        <h1 className="section-title mx-auto mt-5 max-w-3xl">
          Choose the right plan for your journey
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          Whether you are looking for a tutor or building your teaching career,
          MentorLagbe has a plan to help you move forward. Pro payments are
          processed securely by Stripe in USD.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isProActive =
              plan.isPro &&
              user?.plan?.toLowerCase() === "pro" &&
              normalizeRole(user?.role) === plan.role;
            const isLoading = loadingRole === plan.role;

            return (
              <article
                key={plan.name}
                className={`card relative flex h-full flex-col p-6 ${
                  plan.featured ? "border-[var(--primary)]" : ""
                }`}
              >
                {plan.featured && (
                  <span className="badge absolute -top-3 right-5 bg-[var(--primary)] text-white">
                    Premium
                  </span>
                )}

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    plan.featured
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--secondary)] text-[var(--primary)]"
                  }`}
                >
                  <Icon size={25} />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  {plan.audience}
                </p>
                <h2 className="mt-2 text-xl font-extrabold">{plan.name}</h2>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-xs text-[var(--muted)]">
                    {plan.period}
                  </span>
                </div>

                <p className="mt-4 min-h-[66px] text-sm leading-6 text-[var(--muted)]">
                  {plan.description}
                </p>

                <div className="my-6 border-t border-[var(--border)]" />
                <p className="mb-4 text-sm font-bold">What&apos;s included</p>

                <ul className="flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--primary)]">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      <span className="text-[var(--muted)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.isPro ? (
                  isProActive ? (
                    <Link
                      href={dashboardHrefForRole(plan.role)}
                      className="btn-primary mt-8 h-12 w-full justify-center"
                    >
                      Go to Dashboard
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={loadingRole !== null}
                      onClick={() => handleUpgrade(plan)}
                      className={`mt-8 h-12 w-full justify-center ${
                        plan.featured ? "btn-primary" : "btn-secondary"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <LoaderCircle size={17} className="animate-spin" />
                          Opening Checkout...
                        </>
                      ) : (
                        <>
                          {plan.button}
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  )
                ) : (
                  <Link
                    href={plan.href}
                    className="btn-secondary mt-8 h-12 w-full justify-center"
                  >
                    {plan.button}
                    <ArrowRight size={16} />
                  </Link>
                )}
              </article>
            );
          })}
        </div>

        <div className="card mt-12 p-6 text-center sm:p-9">
          <h2 className="text-xl font-extrabold">Not sure which plan to choose?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
            Start with a free account. You can explore MentorLagbe and upgrade
            your membership when you are ready.
          </p>
          <Link href="/sign-up" className="btn-primary mt-6 px-6">
            Create Free Account
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
