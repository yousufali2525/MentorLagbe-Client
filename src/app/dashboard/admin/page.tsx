"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  Users,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import StatCard from "@/components/dashboard/StatCard";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";

type Stats = {
  totalUsers?: number;
  totalStudents?: number;
  totalTutors?: number;
  totalAdmins?: number;
  totalTuitions?: number;
  pendingTuitions?: number;
  approvedTuitions?: number;
  rejectedTuitions?: number;
  totalApplications?: number;
  totalPayments?: number;
  paidPayments?: number;
  totalRevenue?: number;
};

const quickActions = [
  {
    title: "Manage Users",
    description: "Search accounts and manage status or roles.",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Review Tuitions",
    description: "Approve or reject pending tuition requests.",
    href: "/dashboard/admin/tuitions",
    icon: BookOpen,
  },
  {
    title: "Transactions",
    description: "Inspect Stripe payment records.",
    href: "/dashboard/admin/transactions",
    icon: CreditCard,
  },
];

function formatUsd(amount?: number) {
  return `US$${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async (withToast = false) => {
    setLoading(true);
    try {
      const result = await apiFetch<{ stats?: Stats }>("/api/admin/stats");
      setStats(result.stats || {});
      if (withToast) toast.success("Dashboard statistics refreshed.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    refreshUser().catch(() => undefined);
  }, [loadStats, refreshUser]);

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      hint: `${stats.totalStudents || 0} students · ${stats.totalTutors || 0} tutors`,
    },
    {
      title: "Total Tuitions",
      value: stats.totalTuitions,
      icon: BookOpen,
      hint: `${stats.approvedTuitions || 0} approved`,
    },
    {
      title: "Pending Review",
      value: stats.pendingTuitions,
      icon: Clock3,
      hint: "tuitions waiting for approval",
    },
    {
      title: "Applications",
      value: stats.totalApplications,
      icon: FileText,
      hint: "submitted by students",
    },
    {
      title: "Paid Payments",
      value: stats.paidPayments,
      icon: CheckCircle2,
      hint: `of ${stats.totalPayments || 0} transactions`,
    },
    {
      title: "Total Revenue",
      value: formatUsd(stats.totalRevenue),
      icon: CreditCard,
      hint: "Stripe payments in USD",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
            Administration
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome, {user?.name?.split(" ")[0] || "Admin"}!
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Monitor and manage the MentorLagbe platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadStats(true)}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <section
        aria-label="Platform statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value ?? 0}
            icon={card.icon}
            hint={card.hint}
            loading={loading}
          />
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold">Quick Actions</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Jump into the most common admin tasks.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} className="card group p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--primary)]">
                  <Icon size={23} />
                </div>
                <h3 className="mt-5 font-bold transition group-hover:text-[var(--primary)]">
                  {action.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {action.description}
                </p>
                <span className="text-link mt-5">
                  Open <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card mt-8 grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-7">
        {[
          {
            label: "Students",
            value: stats.totalStudents,
            icon: GraduationCap,
          },
          { label: "Tutors", value: stats.totalTutors, icon: ShieldCheck },
          { label: "Admins", value: stats.totalAdmins, icon: LayoutDashboard },
          { label: "Rejected", value: stats.rejectedTuitions, icon: BookOpen },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className="rounded-lg bg-[var(--secondary)] p-2.5 text-[var(--primary)]">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">{item.label}</p>
                <p className="text-lg font-extrabold">{item.value ?? 0}</p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
