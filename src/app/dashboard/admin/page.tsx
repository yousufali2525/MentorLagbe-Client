
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Stats = {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalAdmins: number;
  totalTuitions: number;
  pendingTuitions: number;
  approvedTuitions: number;
  rejectedTuitions: number;
  totalApplications: number;
  totalPayments: number;
  paidPayments: number;
  totalRevenue: number;
};

const initialStats: Stats = {
  totalUsers: 0,
  totalStudents: 0,
  totalTutors: 0,
  totalAdmins: 0,
  totalTuitions: 0,
  pendingTuitions: 0,
  approvedTuitions: 0,
  rejectedTuitions: 0,
  totalApplications: 0,
  totalPayments: 0,
  paidPayments: 0,
  totalRevenue: 0,
};

const navigation = [
  { label: "Overview", href: "/dashboard/admin", icon: "📊" },
  { label: "Manage Users", href: "/dashboard/admin/users", icon: "👥" },
  { label: "Manage Tuitions", href: "/dashboard/admin/tuitions", icon: "📚" },
  { label: "Transactions", href: "/dashboard/admin/transactions", icon: "💳" },
];

const statCards = [
  { title: "Total Users", key: "totalUsers", icon: "👥" },
  { title: "Students", key: "totalStudents", icon: "🎓" },
  { title: "Tutors", key: "totalTutors", icon: "👨‍🏫" },
  { title: "Admins", key: "totalAdmins", icon: "🛡️" },
  { title: "Total Tuitions", key: "totalTuitions", icon: "📚" },
  { title: "Pending Tuitions", key: "pendingTuitions", icon: "⏳" },
  { title: "Approved Tuitions", key: "approvedTuitions", icon: "✅" },
  { title: "Rejected Tuitions", key: "rejectedTuitions", icon: "❌" },
  { title: "Total Applications", key: "totalApplications", icon: "📝" },
  { title: "Total Payments", key: "totalPayments", icon: "💳" },
  { title: "Paid Payments", key: "paidPayments", icon: "💰" },
] as const;

const quickActions = [
  {
    title: "Manage Users",
    description: "View, search and manage platform users.",
    href: "/dashboard/admin/users",
    icon: "👥",
  },
  {
    title: "Manage Tuitions",
    description: "Review and approve tuition requests.",
    href: "/dashboard/admin/tuitions",
    icon: "📚",
  },
  {
    title: "Transactions",
    description: "View payment records and transactions.",
    href: "/dashboard/admin/transactions",
    icon: "💳",
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { showToast } = useToast();

  const [stats, setStats] = useState<Stats>(initialStats);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem("mentorlagbe-token");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    setLoading(true);

    try {
      const profileResponse = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileData = await profileResponse.json();

      if (!profileResponse.ok || !profileData.user) {
        localStorage.removeItem("mentorlagbe-token");
        localStorage.removeItem("mentorlagbe-user");
        router.replace("/sign-in");
        return;
      }

      const user = profileData.user;

      if (user.role !== "admin") {
        if (user.role === "student") {
          router.replace("/dashboard");
        } else if (user.role === "tutor") {
          router.replace("/dashboard/tutor");
        } else {
          router.replace("/sign-in");
        }
        return;
      }

      setAdminName(user.name || "Admin");

      const statsResponse = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const statsData = await statsResponse.json();

      if (!statsResponse.ok || !statsData.success) {
        throw new Error(
          statsData.message || "Failed to load dashboard statistics"
        );
      }

      setStats({
        ...initialStats,
        ...statsData.stats,
      });
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading dashboard",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleLogout = () => {
    localStorage.removeItem("mentorlagbe-token");
    localStorage.removeItem("mentorlagbe-user");
    router.replace("/sign-in");
  };

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="w-full bg-slate-950 text-white md:min-h-screen md:w-64">
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-2xl font-bold text-teal-400">
            MentorLagbe
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Admin Dashboard
          </p>
        </div>

        <nav className="space-y-2 p-4">
          {navigation.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                item.href === "/dashboard/admin"
                  ? "bg-teal-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4 md:mt-8">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-teal-600">
              Administration
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
              Welcome, {adminName}
            </h2>
            <p className="mt-2 text-slate-500">
              Monitor and manage your MentorLagbe platform.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="rounded-lg bg-teal-600 px-5 py-3 font-medium text-white transition hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white shadow-sm sm:col-span-2">
            <p className="text-sm text-teal-100">
              Total Revenue
            </p>
            <h3 className="mt-3 text-3xl font-bold">
              {loading ? "..." : formatMoney(stats.totalRevenue)}
            </h3>
            <p className="mt-2 text-sm text-teal-100">
              Revenue from paid payments (USD)
            </p>
          </div>

          {[
            {
              title: "Total Users",
              value: stats.totalUsers,
              icon: "👥",
            },
            {
              title: "Total Tuitions",
              value: stats.totalTuitions,
              icon: "📚",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {item.title}
                </p>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <h3 className="mt-4 text-3xl font-bold text-slate-900">
                {loading
                  ? "..."
                  : item.value.toLocaleString("en-US")}
              </h3>
            </div>
          ))}
        </section>

        <section className="mb-8">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-900">
              Platform Statistics
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Live statistics from the database
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {statCards.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {item.title}
                  </p>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h4 className="mt-4 text-3xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : stats[item.key].toLocaleString("en-US")}
                </h4>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-5 text-xl font-bold text-slate-900">
            Quick Actions
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-teal-400 hover:shadow-md"
              >
                <span className="text-3xl">{item.icon}</span>
                <h4 className="mt-4 font-bold text-slate-900">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  {item.description}
                </p>
                <p className="mt-4 text-sm font-semibold text-teal-600">
                  Open page →
                </p>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
