"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import StatCard from "@/components/dashboard/StatCard";
import { toast } from "@/components/ToastProvider";
import { useMyTuitions } from "@/hooks/useMyTuitions";
import { apiFetch } from "@/lib/api";
import { formatFee, tuitionFee } from "@/lib/tuitions";

type ApplicantsResponse = {
  success?: boolean;
  total?: number;
  data?: unknown[];
};

export default function TutorDashboardPage() {
  const { user, refreshUser } = useAuth();
  const { tuitions, loading, error, reload } = useMyTuitions();
  const [applicantCount, setApplicantCount] = useState(0);

  useEffect(() => {
    refreshUser().catch(() => undefined);
  }, [refreshUser]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    let active = true;

    async function loadApplicants() {
      try {
        const result = await apiFetch<ApplicantsResponse>(
          "/api/applications/tutor-applicants"
        );
        const total =
          result.total ??
          (Array.isArray(result.data) ? result.data.length : 0);
        if (active) setApplicantCount(total);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? `Could not load applicant count: ${err.message}`
            : "Could not load applicant count."
        );
      }
    }

    loadApplicants();
    return () => {
      active = false;
    };
  }, []);

  const approvedCount = useMemo(
    () =>
      tuitions.filter(
        (item) => item.approvalStatus?.toLowerCase() === "approved"
      ).length,
    [tuitions]
  );

  const stats = [
    {
      title: "Total Tuitions",
      value: tuitions.length,
      icon: BookOpen,
      hint: "All tuition posts you created",
    },
    {
      title: "Active / Approved",
      value: approvedCount,
      icon: CheckCircle2,
      hint: "Posts visible to students",
    },
    {
      title: "Total Applicants",
      value: applicantCount,
      icon: Users,
      hint: "Students who applied to you",
    },
    {
      title: "Current Plan",
      value: user?.plan?.toUpperCase() || "FREE",
      icon: GraduationCap,
      hint: "Your account plan",
    },
  ];

  const quickActions = [
    {
      label: "Post a Tuition",
      description: "Create a new tuition request.",
      href: "/dashboard/tutor/post-tuition",
      icon: Plus,
      featured: true,
    },
    {
      label: "My Tuitions",
      description: "Review, edit and manage your posts.",
      href: "/dashboard/tutor/my-tuitions",
      icon: ClipboardList,
    },
    {
      label: "Applicants",
      description: "Handle incoming student applications.",
      href: "/dashboard/tutor/applicants",
      icon: Users,
    },
    {
      label: "View Pricing",
      description: "Compare Free and Pro tutor plans.",
      href: "/pricing",
      icon: Sparkles,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
            Tutor workspace
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Hello, {user?.name?.split(" ")[0] || "Tutor"}!
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Here is an overview of your tuition activities.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              reload();
              toast.info("Refreshing your tuitions...");
            }}
            disabled={loading}
            className="btn-secondary"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link href="/dashboard/tutor/post-tuition" className="btn-primary">
            <Plus size={17} />
            Post a Tuition
          </Link>
        </div>
      </section>

      <section
        aria-label="Tutor statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            hint={stat.hint}
          />
        ))}
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold">Quick actions</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Jump straight into the tasks you use most.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`card group flex h-full min-w-0 flex-col p-5 transition hover:border-[var(--primary)] ${
                  action.featured ? "bg-[var(--secondary)]" : ""
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--primary)] shadow-sm">
                  <Icon size={21} />
                </span>
                <h3 className="mt-4 font-extrabold transition group-hover:text-[var(--primary)]">
                  {action.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {action.description}
                </p>
                <span className="text-link mt-auto pt-5">
                  Open <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {user?.plan?.toLowerCase() !== "pro" && tuitions.length >= 2 && (
        <section className="flex flex-col gap-4 rounded-2xl bg-[var(--primary)] p-6 text-[var(--surface)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <GraduationCap className="shrink-0" size={24} />
            <div>
              <h2 className="text-lg font-bold">You reached the free plan limit</h2>
              <p className="mt-1 text-sm opacity-80">
                Upgrade to Tutor Pro to post unlimited tuitions.
              </p>
            </div>
          </div>
          <Link href="/pricing" className="upgrade-button">
            Upgrade to Pro
          </Link>
        </section>
      )}

      <section className="card p-5 sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">Recent Tuitions</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Your latest posts and their approval status.
            </p>
          </div>
          <Link href="/dashboard/tutor/my-tuitions" className="text-link">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : tuitions.length === 0 ? (
          <div className="empty-state px-4 py-12 sm:py-16">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 rounded-3xl bg-[var(--secondary)] blur-xl" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)]">
                <BookOpen size={30} />
              </span>
              <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--surface)] shadow-md">
                <Plus size={16} />
              </span>
            </div>
            <h3 className="mt-5 text-lg font-extrabold">
              No tuitions posted yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              Post your first tuition and start connecting with students who need
              your expertise.
            </p>
            <Link href="/dashboard/tutor/post-tuition" className="btn-primary mt-6">
              <Plus size={16} />
              Post your first tuition
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tuitions.slice(0, 5).map((tuition, index) => {
              const status = tuition.approvalStatus?.toLowerCase() || "pending";
              return (
                <div
                  key={tuition._id || index}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--primary)] sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold">{tuition.title}</h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {tuition.subject} • {tuition.location}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatFee(tuitionFee(tuition))}
                    </p>
                  </div>
                  <span className="badge w-fit shrink-0 capitalize">
                    <Clock3 size={12} className="mr-1" />
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
