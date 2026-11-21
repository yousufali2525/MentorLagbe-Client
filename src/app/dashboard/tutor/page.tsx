"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
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
      } catch {
        // Applicant count is optional on the overview page.
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
    { title: "Total Tuitions", value: tuitions.length, icon: BookOpen },
    { title: "Approved", value: approvedCount, icon: CheckCircle2 },
    { title: "Applicants", value: applicantCount, icon: Users },
    { title: "Current Plan", value: user?.plan?.toUpperCase() || "FREE", icon: GraduationCap },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Hello, {user?.name?.split(" ")[0] || "Tutor"}!
          </h1>
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--muted)]">
                  {stat.title}
                </p>
                <div className="rounded-xl bg-[var(--secondary)] p-3 text-[var(--primary)]">
                  <Icon size={22} />
                </div>
              </div>
              <p className="mt-6 text-3xl font-extrabold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {user?.plan?.toLowerCase() !== "pro" && tuitions.length >= 2 && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-[var(--primary)] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <GraduationCap className="shrink-0" size={24} />
            <div>
              <h2 className="text-lg font-bold">You reached the free plan limit</h2>
              <p className="mt-1 text-sm text-white/80">
                Upgrade to Tutor Pro to post unlimited tuitions.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[var(--primary)]"
          >
            Upgrade
          </Link>
        </div>
      )}

      <section className="card mt-8 p-5 sm:p-7">
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
          <div className="empty-state">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)]">
              <BookOpen size={28} />
            </div>
            <h3 className="mt-4 font-bold">No tuitions posted yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              Create your first tuition post to start receiving applications.
            </p>
            <Link href="/dashboard/tutor/post-tuition" className="btn-primary mt-5">
              <Plus size={16} />
              Post a Tuition
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tuitions.slice(0, 5).map((tuition, index) => {
              const status = tuition.approvalStatus?.toLowerCase() || "pending";
              return (
                <div
                  key={tuition._id || index}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border)] p-4 sm:flex-row sm:items-center"
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
