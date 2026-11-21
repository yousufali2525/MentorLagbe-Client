"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Crown,
  FileText,
  GraduationCap,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/components/ToastProvider";
import { useMyApplications } from "@/hooks/useMyApplications";
import { apiFetch } from "@/lib/api";
import {
  classLevelOf,
  extractTuitionList,
  formatFee,
  tuitionFee,
  type Tuition,
} from "@/lib/tuitions";

export default function StudentDashboardPage() {
  const { user, refreshUser } = useAuth();
  const { applications, loading, error, reload } = useMyApplications();
  const [recommended, setRecommended] = useState<Tuition[]>([]);

  useEffect(() => {
    refreshUser().catch(() => {
      // Keep the cached profile visible when a refresh fails.
    });
  }, [refreshUser]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    let active = true;

    async function loadRecommended() {
      try {
        const result = await apiFetch<unknown>("/api/tuitions", {
          auth: false,
        });
        if (active) setRecommended(extractTuitionList(result).slice(0, 3));
      } catch {
        // Recommendations are optional; the dashboard still works.
      }
    }

    loadRecommended();
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    const status = (value?: string) => value?.toLowerCase();
    return {
      total: applications.length,
      pending: applications.filter((item) => status(item.status) === "pending").length,
      accepted: applications.filter((item) => status(item.status) === "accepted").length,
      rejected: applications.filter((item) => status(item.status) === "rejected").length,
    };
  }, [applications]);

  const stats = [
    { title: "Total Applications", value: counts.total, icon: FileText },
    { title: "Pending", value: counts.pending, icon: Clock3 },
    { title: "Accepted", value: counts.accepted, icon: CheckCircle2 },
    { title: "Current Plan", value: user?.plan?.toUpperCase() || "FREE", icon: Crown },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Hello, {user?.name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Here is an overview of your learning activities.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              reload();
              toast.info("Refreshing applications...");
            }}
            disabled={loading}
            className="btn-secondary"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link href="/tuitions" className="btn-primary">
            Explore Tuitions
            <ArrowRight size={17} />
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

      {user?.plan?.toLowerCase() !== "pro" && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-[var(--primary)] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="shrink-0" size={24} />
            <div>
              <h2 className="text-lg font-bold">
                Unlock more with Student Pro
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Priority applications and a highlighted profile.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[var(--primary)]"
          >
            View plans
          </Link>
        </div>
      )}

      <section className="card mt-8 p-5 sm:p-7">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">Recent Applications</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Track your latest tuition applications.
            </p>
          </div>
          <Link href="/dashboard/student/my-applications" className="text-link">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)]">
              <FileText size={28} />
            </div>
            <h3 className="mt-4 font-bold">No applications yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              Explore available tuitions and submit your first application.
            </p>
            <Link href="/tuitions" className="btn-primary mt-5">
              Browse Tuitions <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 5).map((application, index) => {
              const status = application.status?.toLowerCase() || "pending";
              const title =
                application.tuition?.title ||
                application.tuitionTitle ||
                "Tuition Application";
              const fee = application.monthlyFee ?? application.tuition?.monthlyFee;

              return (
                <div
                  key={application._id || application.id || index}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border)] p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {application.tutorName ||
                        application.tuition?.tutorName ||
                        application.tutorEmail ||
                        "Tutor information unavailable"}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {application.subject || application.tuition?.subject || "Subject unavailable"}
                      {fee !== undefined && ` • ${formatFee(fee)}`}
                    </p>
                  </div>
                  <span className="badge w-fit shrink-0 capitalize">{status}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">Recommended for you</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Recently approved tuition posts.
            </p>
          </div>
          <Link href="/tuitions" className="text-link">
            Browse all <ArrowRight size={15} />
          </Link>
        </div>

        {recommended.length > 0 && (
          <div className="grid gap-5 md:grid-cols-3">
            {recommended.map((tuition, index) => (
              <div key={tuition._id || index} className="card flex h-full flex-col p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--primary)]">
                  <GraduationCap size={22} />
                </div>
                <h3 className="mt-4 line-clamp-2 font-bold">
                  {tuition.title || "Tuition opportunity"}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <BookOpen size={13} />
                  {classLevelOf(tuition)}
                </p>
                <p className="mt-auto pt-5 text-sm font-extrabold text-[var(--primary)]">
                  {formatFee(tuitionFee(tuition))}
                </p>
                <Link
                  href={`/tuitions/${tuition._id || tuition.id}`}
                  className="btn-secondary mt-3 w-full justify-center"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
