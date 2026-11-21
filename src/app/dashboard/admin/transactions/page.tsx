"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";

type Payment = {
  _id?: string;
  id?: string;
  stripeSessionId?: string;
  userId?: string;
  userName?: string;
  email?: string;
  role?: string;
  plan?: string;
  amount?: number;
  currency?: string;
  paymentStatus?: string;
  createdAt?: string;
};

type PaymentsResponse = {
  success?: boolean;
  payments?: Payment[];
  totalRevenue?: number;
  pagination?: {
    totalPayments?: number;
    currentPage?: number;
    totalPages?: number;
  };
};

const PAGE_SIZE = 10;

function formatUsd(amount?: number, currency?: string) {
  const code = (currency || "usd").toUpperCase();
  const value = Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return code === "USD" ? `US$${value}` : `${value} ${code}`;
}

function statusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case "paid":
      return "status-success";
    case "failed":
      return "status-danger";
    default:
      return "status-warning";
  }
}

export default function AdminTransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      const result = await apiFetch<PaymentsResponse>(
        `/api/admin/payments?${params.toString()}`
      );
      setPayments(Array.isArray(result.payments) ? result.payments : []);
      setTotalPages(Math.max(1, result.pagination?.totalPages || 1));
      setTotalPayments(result.pagination?.totalPayments || 0);
      setTotalRevenue(Number(result.totalRevenue) || 0);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to load transactions."
      );
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const filtered = useMemo(() => {
    const value = search.toLowerCase();
    return payments.filter((payment) => {
      const matchesSearch =
        !value ||
        payment.email?.toLowerCase().includes(value) ||
        payment.stripeSessionId?.toLowerCase().includes(value) ||
        payment.userId?.toLowerCase().includes(value) ||
        payment.plan?.toLowerCase().includes(value);
      const matchesStatus =
        status === "all" || payment.paymentStatus?.toLowerCase() === status;
      return matchesSearch && matchesStatus;
    });
  }, [payments, search, status]);

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <Link href="/dashboard/admin" className="text-link">
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="mb-6 mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="section-title">Transactions</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Monitor Stripe payment records and plan upgrades.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            loadPayments();
            toast.info("Refreshing transactions...");
          }}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">Total Transactions</p>
            <CreditCard size={20} className="text-[var(--primary)]" />
          </div>
          <p className="mt-3 text-3xl font-extrabold">{totalPayments}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">Total Revenue</p>
            <CreditCard size={20} className="text-[var(--primary)]" />
          </div>
          <p className="mt-3 text-3xl font-extrabold">
            {formatUsd(totalRevenue)}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">On This Page</p>
            <Search size={20} className="text-[var(--primary)]" />
          </div>
          <p className="mt-3 text-3xl font-extrabold">{payments.length}</p>
        </div>
      </div>

      <p className="mb-4 text-xs text-[var(--muted)]">
        Payments are processed in USD by Stripe. Tuition fees displayed
        elsewhere on the site use ৳. Search and status filtering are local
        because the transactions endpoint has no query parameters.
      </p>

      <div className="card mb-6 grid gap-3 p-5 md:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search email, session, user or plan..."
            className="field-input pl-10"
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="field-input"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <CreditCard className="mx-auto text-[var(--primary)]" size={30} />
          <h2 className="mt-4 text-lg font-bold">No transactions found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            {payments.length === 0
              ? "Payment records will appear here when users upgrade their plans."
              : "Try a different search or status filter."}
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment, index) => (
                <tr key={payment._id || payment.id || index}>
                  <td>
                    <p className="font-bold text-[var(--foreground)]">
                      {payment.stripeSessionId || payment._id || "N/A"}
                    </p>
                    <p className="mt-1 text-xs">User ID: {payment.userId || "N/A"}</p>
                  </td>
                  <td>
                    {payment.userName ? (
                      <p className="mb-1 font-medium text-[var(--foreground)]">
                        {payment.userName}
                      </p>
                    ) : null}
                    <p className="text-sm text-[var(--muted)]">
                      {payment.email || "Not available"}
                    </p>
                    <p className="mt-1 text-xs capitalize">{payment.role || "user"}</p>
                  </td>
                  <td className="capitalize">{payment.plan || "N/A"}</td>
                  <td className="font-bold text-[var(--foreground)]">
                    {formatUsd(payment.amount, payment.currency)}
                  </td>
                  <td>
                    <span className={`badge capitalize ${statusStyle(payment.paymentStatus)}`}>
                      {payment.paymentStatus || "unknown"}
                    </span>
                  </td>
                  <td>
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleString("en-BD")
                      : "Not available"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPayments > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
              className="btn-secondary"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages}
              className="btn-secondary"
            >
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
