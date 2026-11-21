"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import { useMyTuitions } from "@/hooks/useMyTuitions";
import { formatFee, tuitionFee, type Tuition } from "@/lib/tuitions";

type Applicant = {
  _id?: string;
  id?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  message?: string;
  status?: string;
  createdAt?: string;
  tuitionId?: string;
  tuition?: Partial<Tuition>;
};

type ApplicantsResponse = {
  success?: boolean;
  total?: number;
  data?: Applicant[];
};

const PAGE_SIZE = 8;

function statusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case "accepted":
      return "bg-emerald-50 text-emerald-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function TutorApplicantsPage() {
  const { tuitions } = useMyTuitions();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const loadApplicants = useCallback(async () => {
    setLoading(true);
    setError("");
    setRefreshing(false);

    try {
      const result = await apiFetch<ApplicantsResponse>(
        "/api/applications/tutor-applicants"
      );
      setApplicants(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load applicants.";
      setError(message);
      toast.error(message);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  const tuitionById = useMemo(() => {
    const map = new Map<string, Tuition>();
    tuitions.forEach((tuition) => {
      if (tuition._id) map.set(tuition._id, tuition);
    });
    return map;
  }, [tuitions]);

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return applicants.filter((item) => {
      const tuition = tuitionById.get(item.tuitionId || "");
      const matchesSearch =
        !text ||
        item.studentName?.toLowerCase().includes(text) ||
        item.studentEmail?.toLowerCase().includes(text) ||
        tuition?.title?.toLowerCase().includes(text);
      const matchesStatus =
        statusFilter === "all" ||
        item.status?.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applicants, search, statusFilter, tuitionById]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const counts = useMemo(() => {
    const status = (value?: string) => value?.toLowerCase();
    return {
      total: applicants.length,
      pending: applicants.filter((item) => status(item.status) === "pending").length,
      accepted: applicants.filter((item) => status(item.status) === "accepted").length,
      rejected: applicants.filter((item) => status(item.status) === "rejected").length,
    };
  }, [applicants]);

  async function updateStatus(id: string, status: "accepted" | "rejected") {
    try {
      setUpdatingId(id);
      const result = await apiFetch<{ message?: string }>(
        `/api/applications/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );
      setApplicants((previous) =>
        previous.map((item) =>
          (item._id || item.id) === id ? { ...item, status } : item
        )
      );
      toast.success(result.message || `Application ${status} successfully.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update application."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">Applicants</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Review students who applied to your tuition posts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRefreshing(true);
            loadApplicants();
            toast.info("Refreshing applicants...");
          }}
          disabled={loading || refreshing}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Applicants", value: counts.total, icon: Users },
          { label: "Pending", value: counts.pending, icon: Clock3 },
          { label: "Accepted", value: counts.accepted, icon: CheckCircle2 },
          { label: "Rejected", value: counts.rejected, icon: XCircle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[var(--muted)]">{item.label}</p>
                <Icon size={20} className="text-[var(--primary)]" />
              </div>
              <p className="mt-3 text-3xl font-extrabold">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="card mb-5 grid gap-3 p-5 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search student or tuition..."
            className="field-input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          className="field-input"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <p className="mb-4 text-xs text-[var(--muted)]">
        The current API returns a tuition ID only; tuition titles are matched
        against your own posts in the browser.
      </p>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-36 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <Users className="mx-auto text-[var(--primary)]" size={30} />
          <h2 className="mt-4 text-lg font-bold">
            {applicants.length === 0
              ? "No applicants yet"
              : `No ${statusFilter} applicants`}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            {applicants.length === 0
              ? "When students apply to your approved tuitions, they will appear here."
              : "Try a different status filter or search term."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((applicant, index) => {
            const id = applicant._id || applicant.id;
            const status = applicant.status || "pending";
            const tuition = tuitionById.get(applicant.tuitionId || "");
            const applied = applicant.createdAt
              ? new Date(applicant.createdAt).toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Date unavailable";

            return (
              <div key={id || index} className="card p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">
                        {applicant.studentName || "Student"}
                      </h3>
                      <span className={`badge capitalize ${statusStyle(status)}`}>
                        {status}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                      <p className="flex items-center gap-2 break-all">
                        <Mail size={15} className="shrink-0 text-[var(--primary)]" />
                        {applicant.studentEmail || "Email unavailable"}
                      </p>
                      <p className="flex items-center gap-2">
                        <BookOpen size={15} className="shrink-0 text-[var(--primary)]" />
                        {tuition?.title || `Tuition ID: ${applicant.tuitionId || "N/A"}`}
                      </p>
                      {tuition && (
                        <p className="flex items-center gap-2">
                          <CalendarDays size={15} className="shrink-0 text-[var(--primary)]" />
                          {tuition.subject || "Subject unavailable"} ·{" "}
                          {formatFee(tuitionFee(tuition))}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Clock3 size={15} className="shrink-0 text-[var(--primary)]" />
                        Applied: {applied}
                      </p>
                    </div>

                    {applicant.message && (
                      <div className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--secondary)] p-3 text-sm text-[var(--muted)]">
                        <MessageSquare size={16} className="mt-0.5 shrink-0 text-[var(--primary)]" />
                        <p className="whitespace-pre-line">{applicant.message}</p>
                      </div>
                    )}
                  </div>

                  {status.toLowerCase() === "pending" && id && (
                    <div className="flex shrink-0 gap-2 lg:flex-col">
                      <button
                        type="button"
                        onClick={() => updateStatus(id, "accepted")}
                        disabled={updatingId !== null}
                        className="btn-primary flex-1 justify-center text-xs lg:flex-none"
                      >
                        <CheckCircle2 size={14} />
                        {updatingId === id ? "Updating..." : "Accept"}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(id, "rejected")}
                        disabled={updatingId !== null}
                        className="btn-danger flex-1 justify-center text-xs lg:flex-none"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!loading && filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
              <p className="text-sm text-[var(--muted)]">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-secondary"
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>
                <span className="px-2 text-sm font-semibold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-secondary"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
