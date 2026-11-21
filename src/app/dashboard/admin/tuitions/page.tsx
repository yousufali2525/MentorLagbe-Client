"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import { getPageNumbers } from "@/lib/pagination";
import {
  bannerOf,
  formatFee,
  tuitionFee,
  type Tuition,
} from "@/lib/tuitions";

type StatusTab = "all" | "pending" | "approved" | "rejected";

type TuitionListResponse = {
  success?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  tuitions?: Tuition[];
  data?: Tuition[];
};

const PAGE_SIZE = 10;

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function statusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "status-success";
    case "rejected":
      return "status-danger";
    default:
      return "status-warning";
  }
}

export default function AdminTuitionsPage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Tuition | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadTuitions = useCallback(
    async (showToast = false) => {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (status !== "all") params.set("status", status);
      if (search) params.set("search", search);

      try {
        const result = await apiFetch<TuitionListResponse>(
          `/api/admin/tuitions?${params.toString()}`
        );
        const list = Array.isArray(result.tuitions)
          ? result.tuitions
          : Array.isArray(result.data)
            ? result.data
            : [];

        setTuitions(list);
        setTotal(Number(result.total) || list.length);
        setTotalPages(Math.max(1, Number(result.totalPages) || 1));
        if (showToast) toast.success("Tuitions refreshed.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Unable to load tuitions."
        );
        setTuitions([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [page, search, status]
  );

  useEffect(() => {
    loadTuitions();
  }, [loadTuitions]);

  useEffect(() => {
    if (!loading && page > totalPages) setPage(totalPages);
  }, [loading, page, totalPages]);

  async function updateStatus(tuition: Tuition, nextStatus: "approved" | "rejected") {
    const id = tuition._id || tuition.id;
    if (!id) return;

    const action = nextStatus === "approved" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${action} this tuition?`)) return;

    try {
      setProcessingId(id);
      const result = await apiFetch<{ message?: string }>(
        `/api/tuitions/admin/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      if (selected && (selected._id || selected.id) === id) setSelected(null);
      toast.success(result.message || `Tuition ${nextStatus} successfully.`);
      await loadTuitions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update status.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <Link href="/dashboard/admin" className="text-link">
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="mb-6 mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="section-title">Manage Tuitions</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Review all tuitions and approve or reject them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadTuitions(true)}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">Total Results</p>
            <BookOpen size={20} className="text-[var(--primary)]" />
          </div>
          <p className="mt-3 text-3xl font-extrabold">{total}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">On This Page</p>
            <Search size={20} className="text-[var(--primary)]" />
          </div>
          <p className="mt-3 text-3xl font-extrabold">{tuitions.length}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-[var(--border)] p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Tuition status">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={status === tab.value}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={
                  status === tab.value
                    ? "btn-primary px-4 py-2 text-xs"
                    : "btn-secondary px-4 py-2 text-xs"
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-xl">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search title, subject or tutor..."
              className="field-input pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-28 rounded-xl" />
            ))}
          </div>
        ) : tuitions.length === 0 ? (
          <div className="empty-state m-5 sm:m-6">
            <BookOpen className="mx-auto text-[var(--primary)]" size={30} />
            <h2 className="mt-4 text-lg font-bold">
              {status === "all" && !search
                ? "No tuitions found"
                : "No matching tuitions"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              Try a different status, search term or page.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {tuitions.map((tuition, index) => {
              const id = tuition._id || tuition.id;
              const currentStatus = tuition.approvalStatus || "pending";
              const banner = bannerOf(tuition);

              return (
                <div key={id || index} className="p-5 sm:p-6">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold">{tuition.title}</h3>
                        <span className={`badge capitalize ${statusStyle(currentStatus)}`}>
                          {currentStatus}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                        {tuition.subject} · {tuition.classLevel || "Class not set"}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                        <MapPin size={15} />
                        {tuition.location}
                      </p>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Tutor: {tuition.tutorName || "Not provided"} · {formatFee(tuitionFee(tuition))}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Submitted:{" "}
                        {tuition.createdAt
                          ? new Date(tuition.createdAt).toLocaleDateString("en-BD")
                          : "Not available"}
                        {banner ? " · Banner available" : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col">
                      <button
                        type="button"
                        onClick={() => setSelected(tuition)}
                        className="btn-secondary flex-1 justify-center text-xs lg:flex-none"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(tuition, "approved")}
                        disabled={processingId !== null}
                        className="btn-primary flex-1 justify-center text-xs lg:flex-none"
                      >
                        <CheckCircle2 size={14} />
                        {processingId === id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(tuition, "rejected")}
                        disabled={processingId !== null}
                        className="btn-danger flex-1 justify-center text-xs lg:flex-none"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <nav
            aria-label="Admin tuition pagination"
            className="flex flex-wrap items-center justify-center gap-2 border-t border-[var(--border)] p-5 sm:p-6"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="btn-secondary"
            >
              <ArrowLeft size={16} />
              Previous
            </button>

            {getPageNumbers(page, totalPages).map((item, index) =>
              item === "…" ? (
                <span key={`ellipsis-${index}`} className="px-1 text-sm text-[var(--muted)]">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => setPage(item)}
                  className={
                    item === page
                      ? "btn-primary h-10 w-10 justify-center px-0"
                      : "btn-secondary h-10 w-10 justify-center px-0"
                  }
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="btn-secondary"
            >
              Next
              <ArrowRight size={16} />
            </button>
          </nav>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold">Tuition Details</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--secondary)]"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {bannerOf(selected) && (
              <img
                src={bannerOf(selected)}
                alt={selected.title || "Tuition"}
                className="mb-5 max-h-56 w-full rounded-xl object-cover"
              />
            )}

            <h3 className="text-lg font-bold">{selected.title}</h3>
            <span className={`badge mt-2 capitalize ${statusStyle(selected.approvalStatus)}`}>
              {selected.approvalStatus || "pending"}
            </span>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Subject", value: selected.subject },
                { label: "Class Level", value: selected.classLevel },
                { label: "Mode", value: selected.mode },
                { label: "Location", value: selected.location },
                { label: "Fee", value: formatFee(tuitionFee(selected)) },
                { label: "Days / Week", value: String(selected.daysPerWeek || "—") },
                { label: "Tutor", value: selected.tutorName },
                { label: "Tutor Email", value: selected.tutorEmail },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-[var(--secondary)] p-4">
                  <p className="text-xs text-[var(--muted)]">{item.label}</p>
                  <p className="mt-1 break-words text-sm font-bold">
                    {item.value || "Not provided"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-xs text-[var(--muted)]">Description</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">
                {selected.description || "No description provided."}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => updateStatus(selected, "rejected")}
                disabled={processingId !== null}
                className="btn-danger"
              >
                <XCircle size={15} />
                Reject
              </button>
              <button
                type="button"
                onClick={() => updateStatus(selected, "approved")}
                disabled={processingId !== null}
                className="btn-primary"
              >
                <CheckCircle2 size={15} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
