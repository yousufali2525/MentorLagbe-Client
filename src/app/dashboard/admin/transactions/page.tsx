
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const LIMIT = 10;

type Payment = {
  _id: string;
  stripeSessionId: string;
  userId: string;
  email: string;
  role: string;
  plan: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
};

type Pagination = {
  totalPayments: number;
  currentPage: number;
  totalPages: number;
};

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalPayments: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayments = useCallback(async () => {
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

      if (profileData.user.role !== "admin") {
        if (profileData.user.role === "student") {
          router.replace("/dashboard");
        } else if (profileData.user.role === "tutor") {
          router.replace("/dashboard/tutor");
        } else {
          router.replace("/sign-in");
        }
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/payments?page=${page}&limit=${LIMIT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load transactions");
      }

      setPayments(data.payments || []);

      setPagination(
        data.pagination || {
          totalPayments: data.payments?.length || 0,
          currentPage: page,
          totalPages: 1,
        }
      );
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to load transactions",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [router, page, showToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleLogout = () => {
    localStorage.removeItem("mentorlagbe-token");
    localStorage.removeItem("mentorlagbe-user");
    router.replace("/sign-in");
  };

  const formatAmount = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: (currency || "usd").toUpperCase(),
      }).format(Number(amount || 0));
    } catch {
      return `${Number(amount || 0).toFixed(2)} ${currency || "USD"}`;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      payment.email?.toLowerCase().includes(searchValue) ||
      payment.stripeSessionId?.toLowerCase().includes(searchValue) ||
      payment.userId?.toLowerCase().includes(searchValue) ||
      payment.plan?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      payment.paymentStatus?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, pagination.totalPages);

  const menuItems = [
    { label: "Overview", href: "/dashboard/admin", icon: "📊" },
    {
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: "👥",
    },
    {
      label: "Manage Tuitions",
      href: "/dashboard/admin/tuitions",
      icon: "📚",
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: "💳",
    },
  ];

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
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition ${
                item.href === "/dashboard/admin/transactions"
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
            className="w-full rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
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
              Transactions
            </h2>
            <p className="mt-2 text-slate-500">
              Monitor platform payments and Stripe transactions.
            </p>
          </div>

          <button
            onClick={fetchPayments}
            disabled={loading}
            className="rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Transactions
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              {loading
                ? "..."
                : pagination.totalPayments.toLocaleString("en-US")}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Transactions on This Page
            </p>
            <h3 className="mt-2 text-3xl font-bold text-teal-600">
              {loading ? "..." : payments.length}
            </h3>
          </div>
        </section>

        <section className="mb-6 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by email, session ID, user ID or plan..."
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-bold text-slate-900">
              Payment History
            </h3>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading transactions...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mb-3 text-4xl">💳</div>
              <h4 className="font-semibold text-slate-800">
                No transactions found
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Payment records will appear here when available.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Transaction
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        User
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Plan
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Amount
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Status
                      </th>
                      <th className="px-5 py-4 font-semibold">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">
                            {payment.stripeSessionId || payment._id}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            User ID: {payment.userId}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">
                            {payment.email || "Not available"}
                          </p>
                          <p className="mt-1 text-xs capitalize text-slate-500">
                            {payment.role || "User"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold capitalize text-teal-700">
                            {payment.plan || "N/A"}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {formatAmount(payment.amount, payment.currency)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              payment.paymentStatus === "paid"
                                ? "bg-green-100 text-green-700"
                                : payment.paymentStatus === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {payment.paymentStatus || "Unknown"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {payment.createdAt
                            ? new Date(payment.createdAt).toLocaleString(
                                "en-BD"
                              )
                            : "Not available"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
                <p className="text-sm text-slate-500">
                  Page {pagination.currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={page <= 1 || loading}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      setPage((current) =>
                        Math.min(totalPages, current + 1)
                      )
                    }
                    disabled={page >= totalPages || loading}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
