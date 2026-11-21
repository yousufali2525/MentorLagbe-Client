"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import TuitionForm, { type TuitionPayload } from "@/components/tutor/TuitionForm";
import { toast } from "@/components/ToastProvider";
import { useMyTuitions } from "@/hooks/useMyTuitions";
import { apiFetch } from "@/lib/api";
import {
  classLevelOf,
  formatFee,
  modeOf,
  tuitionFee,
  tuitionId,
  type Tuition,
} from "@/lib/tuitions";

const PAGE_SIZE = 6;

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

export default function TutorMyTuitionsPage() {
  const { tuitions, loading, error, reload, setTuitions } = useMyTuitions();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Tuition | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const subjects = useMemo(
    () => Array.from(new Set(tuitions.map((item) => item.subject).filter(Boolean))),
    [tuitions]
  );

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return tuitions.filter((item) => {
      const matchesSearch =
        !text ||
        item.title?.toLowerCase().includes(text) ||
        item.subject?.toLowerCase().includes(text) ||
        item.location?.toLowerCase().includes(text);
      const matchesSubject =
        subjectFilter === "all" || item.subject === subjectFilter;
      const matchesStatus =
        statusFilter === "all" ||
        item.approvalStatus?.toLowerCase() === statusFilter;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [tuitions, search, subjectFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const counts = useMemo(() => {
    const status = (value?: string) => value?.toLowerCase();
    return {
      total: tuitions.length,
      pending: tuitions.filter((item) => status(item.approvalStatus) === "pending").length,
      approved: tuitions.filter((item) => status(item.approvalStatus) === "approved").length,
      rejected: tuitions.filter((item) => status(item.approvalStatus) === "rejected").length,
    };
  }, [tuitions]);

  async function handleUpdate(payload: TuitionPayload) {
    if (!editing) return;
    const id = tuitionId(editing);
    if (!id) return;

    try {
      setSaving(true);
      const result = await apiFetch<{ message?: string }>(`/api/tuitions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      toast.success(result.message || "Tuition updated and sent for approval.");
      setEditing(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update tuition.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this tuition? This cannot be undone.")) return;

    try {
      setDeletingId(id);
      const result = await apiFetch<{ message?: string }>(`/api/tuitions/${id}`, {
        method: "DELETE",
      });
      setTuitions((previous) =>
        previous.filter((item) => tuitionId(item) !== id)
      );
      toast.success(result.message || "Tuition deleted successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete tuition.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(tuition: Tuition) {
    const id = tuitionId(tuition);
    if (!id) return;

    const nextActive = !tuition.isActive;

    try {
      setTogglingId(id);
      const result = await apiFetch<{ message?: string; isActive?: boolean }>(
        `/api/tuitions/${id}/active`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: nextActive }),
        }
      );
      setTuitions((previous) =>
        previous.map((item) =>
          tuitionId(item) === id ? { ...item, isActive: result.isActive ?? nextActive } : item
        )
      );
      toast.success(result.message || `Tuition ${nextActive ? "activated" : "closed"} successfully.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update tuition status."
      );
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold sm:text-2xl">My Tuitions</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            View, edit and manage all your tuition posts.
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

      <section
        aria-label="Tuition statistics"
        className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          { label: "Total Tuitions", value: counts.total, icon: BookOpen },
          { label: "Pending Approval", value: counts.pending, icon: Clock3 },
          { label: "Approved", value: counts.approved, icon: CheckCircle2 },
          { label: "Rejected", value: counts.rejected, icon: XCircle },
        ].map((item) => (
          <StatCard
            key={item.label}
            title={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </section>

      {error && (
        <div className="mb-6 rounded-xl border status-alert-danger p-4 text-sm">
          {error}
        </div>
      )}

      {editing && (
        <section className="card mb-8 p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold">Edit Tuition</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Updated tuition will be submitted for admin approval.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="btn-secondary"
            >
              Close editor
            </button>
          </div>
          <TuitionForm
            initial={editing}
            submitLabel="Save Changes"
            submitting={saving}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </section>
      )}

      <section className="card overflow-hidden">
        <div className="border-b border-[var(--border)] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold">All Tuition Posts</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Search and filter your tuition posts.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
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
                placeholder="Search tuition..."
                className="field-input pl-10"
              />
            </div>
            <select
              value={subjectFilter}
              onChange={(event) => {
                setSubjectFilter(event.target.value);
                setPage(1);
              }}
              className="field-input"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5 sm:p-7">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton h-28 rounded-xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state m-5 sm:m-7">
            <BookOpen className="mx-auto text-[var(--primary)]" size={30} />
            <h3 className="mt-4 font-bold">
              {tuitions.length === 0
                ? "No tuitions posted yet"
                : "No matching tuitions found"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
              {tuitions.length === 0
                ? "Create your first tuition post to get started."
                : "Try changing your search or filters."}
            </p>
            {tuitions.length === 0 && (
              <Link href="/dashboard/tutor/post-tuition" className="btn-primary mt-5">
                <Plus size={16} />
                Post a Tuition
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {visible.map((tuition, index) => {
              const id = tuitionId(tuition);
              const status = tuition.approvalStatus || "pending";
              return (
                <div key={id || index} className="p-5 sm:p-7">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold">{tuition.title}</h3>
                        <span className={`badge capitalize ${statusStyle(status)}`}>
                          {status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                        {tuition.subject} · {classLevelOf(tuition)} · {modeOf(tuition)}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                        {tuition.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--muted)]">
                        <span>{tuition.location}</span>
                        <span>{formatFee(tuitionFee(tuition))}</span>
                        <span>{tuition.daysPerWeek} days/week</span>
                        {tuition.createdAt && (
                          <span>
                            {new Date(tuition.createdAt).toLocaleDateString("en-BD")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2 lg:flex-col">
                      {id && (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(tuition)}
                          disabled={togglingId !== null}
                          className={`${
                            tuition.isActive ? "btn-secondary" : "btn-primary"
                          } flex-1 justify-center text-xs lg:flex-none`}
                        >
                          {tuition.isActive ? (
                            <XCircle size={14} />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          {togglingId === id
                            ? "Updating..."
                            : tuition.isActive
                              ? "Close"
                              : "Activate"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditing(tuition)}
                        className="btn-secondary flex-1 justify-center text-xs lg:flex-none"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      {id && (
                        <button
                          type="button"
                          onClick={() => handleDelete(id)}
                          disabled={deletingId !== null}
                          className="btn-danger flex-1 justify-center text-xs lg:flex-none"
                        >
                          <Trash2 size={14} />
                          {deletingId === id ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] p-5 sm:p-7">
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
      </section>
    </div>
  );
}
