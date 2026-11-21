"use client";

import { useState } from "react";
import Link from "next/link";
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

type PlanAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  primary: boolean;
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
    href: "/sign-up?role=tutor&plan=pro",
    featured: true,
  },
];

export default function PricingPage() {
  const { user, status } = useAuth();
  const [loadingRole, setLoadingRole] = useState<"student" | "tutor" | null>(null);

  const authLoading = status === "loading";
  const currentRole = normalizeRole(user?.role);
  const isAdmin = currentRole === "admin";
  const isProUser = user?.plan?.toLowerCase() === "pro";

  async function handleUpgrade(plan: Plan) {
    if (
      authLoading ||
      !user ||
      !currentRole ||
      isAdmin ||
      !plan.isPro ||
      currentRole !== plan.role ||
      isProUser
    ) {
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

  function planAction(plan: Plan): PlanAction {
    if (authLoading) {
      return { label: "Checking session...", disabled: true, primary: plan.featured };
    }

    if (isAdmin) {
      return {
        label: "Admins don't need a plan",
        disabled: true,
        primary: plan.featured,
      };
    }

    if (!user || !currentRole) {
      return { label: plan.button, href: plan.href, primary: plan.featured };
    }

    if (!plan.isPro) {
      return {
        label:
          currentRole === plan.role && !isProUser ? "Current Plan" : "Included",
        disabled: true,
        primary: false,
      };
    }

    if (isProUser) {
      return { label: "You're on Pro", disabled: true, primary: plan.featured };
    }

    if (currentRole !== plan.role) {
      return {
        label:
          plan.role === "tutor" ? "For Tutors only" : "For Students only",
        disabled: true,
        primary: plan.featured,
      };
    }

    return {
      label: "Upgrade to Pro",
      onClick: () => handleUpgrade(plan),
      disabled: loadingRole !== null,
      loading: loadingRole === plan.role,
      primary: plan.featured,
    };
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
            const action = planAction(plan);

            return (
              <article
                key={plan.name}
                className={`card relative flex h-full flex-col p-6 ${
                  plan.featured ? "border-[var(--primary)]" : ""
                }`}
              >
                {plan.featured && (
                  <span className="badge absolute -top-3 right-5 bg-[var(--primary)] text-[var(--primary-foreground)]">
                    Premium
                  </span>
                )}

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    plan.featured
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
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

                {action.href ? (
                  <Link
                    href={action.href}
                    className={`${
                      action.primary ? "btn-primary" : "btn-secondary"
                    } mt-8 h-12 w-full justify-center`}
                  >
                    {action.label}
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={action.disabled}
                    onClick={action.onClick}
                    className={`${
                      action.primary ? "btn-primary" : "btn-secondary"
                    } mt-8 h-12 w-full justify-center`}
                  >
                    {action.loading ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : null}
                    {action.label}
                    {!action.loading && action.onClick ? (
                      <ArrowRight size={16} />
                    ) : null}
                  </button>
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
          {authLoading ? (
            <button type="button" disabled className="btn-primary mt-6 px-6">
              Checking session...
            </button>
          ) : user ? (
            <Link
              href={dashboardHrefForRole(currentRole)}
              className="btn-primary mt-6 px-6"
            >
              Go to Dashboard
              <ArrowRight size={17} />
            </Link>
          ) : (
            <Link href="/sign-up" className="btn-primary mt-6 px-6">
              Create Free Account
              <ArrowRight size={17} />
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
