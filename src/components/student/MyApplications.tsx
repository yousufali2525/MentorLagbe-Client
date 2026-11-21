"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "@/components/ToastProvider";
import { useMyApplications } from "@/hooks/useMyApplications";
import { apiFetch } from "@/lib/api";
import { formatFee } from "@/lib/tuitions";

type Filter = "all" | "pending" | "accepted" | "rejected";

function statusStyle(status?: string) {
  switch (status?.toLowerCase()) {
    case "accepted":
      return "status-success";
    case "rejected":
      return "status-danger";
    default:
      return "status-warning";
  }
}

function StatusIcon({ status }: { status?: string }) {
  const size = 14;
  if (status?.toLowerCase() === "accepted") return <CheckCircle2 size={size} />;
  if (status?.toLowerCase() === "rejected") return <XCircle size={size} />;
  return <Clock3 size={size} />;
}

export default function MyApplications() {
  const { applications, loading, error, reload, setApplications } =
    useMyApplications();
  const [filter, setFilter] = useState<Filter>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const counts = useMemo(() => {
    const value = (status?: string) => status?.toLowerCase();
    return {
      all: applications.length,
      pending: applications.filter((item) => value(item.status) === "pending").length,
      accepted: applications.filter((item) => value(item.status) === "accepted").length,
      rejected: applications.filter((item) => value(item.status) === "rejected").length,
    };
  }, [applications]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? applications
        : applications.filter((item) => item.status?.toLowerCase() === filter),
    [applications, filter]
  );

  async function handleCancel(id: string) {
    if (!window.confirm("Cancel this application? This cannot be undone.")) return;

    try {
      setCancellingId(id);
      const result = await apiFetch<{ message?: string }>(
        `/api/applications/${id}`,
        { method: "DELETE" }
      );
      setApplications((previous) =>
        previous.filter((item) => (item._id || item.id) !== id)
      );
      toast.success(result.message || "Application cancelled successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to cancel application."
      );
    } finally {
      setCancellingId(null);
    }
  }

  const rows = useMemo(
    () =>
      visible.map((application, index) => {
        const status = application.status || "pending";
        return {
          key: application._id || application.id || `application-${index}`,
          id: application._id || application.id,
          status,
          title:
            application.tuition?.title ||
            application.tuitionTitle ||
            "Tuition Application",
          tutor:
            application.tutorName ||
            application.tuition?.tutorName ||
            application.tutorEmail ||
            "Not available",
          subject:
            application.subject ||
            application.tuition?.subject ||
            "Subject unavailable",
          fee:
            application.monthlyFee ??
            application.salary ??
            application.tuition?.monthlyFee ??
            application.tuition?.salary,
          applied: application.createdAt
            ? new Date(application.createdAt).toLocaleDateString("en-BD", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Date unavailable",
        };
      }),
    [visible]
  );

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Track and manage all your tuition applications.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reload();
            toast.info("Refreshing applications...");
          }}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { key: "all" as Filter, label: "Total Applications", color: "text-[var(--primary)]" },
          { key: "pending" as Filter, label: "Pending", color: "status-text-warning" },
          { key: "accepted" as Filter, label: "Accepted", color: "status-text-success" },
          { key: "rejected" as Filter, label: "Rejected", color: "status-text-danger" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`card p-5 text-left transition ${
              filter === item.key ? "border-[var(--primary)]" : ""
            }`}
          >
            <p className="text-sm text-[var(--muted)]">{item.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${item.color}`}>
              {counts[item.key]}
            </p>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 rounded-xl border status-alert-danger p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)]">
            <FileText size={30} />
          </div>
          <h2 className="mt-5 text-xl font-bold">
            {filter === "all" ? "No applications found" : `No ${filter} applications`}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
            Explore available tuitions and find the right tutor for your
            learning journey.
          </p>
          <Link href="/tuitions" className="btn-primary mt-6">
            <BookOpen size={17} />
            Browse Tuitions
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-5 py-5 sm:px-7">
            <div>
              <h2 className="font-bold">Application History</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                All your submitted tuition applications.
              </p>
            </div>
            <span className="text-sm text-[var(--muted)]">
              {visible.length} shown
            </span>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Tuition</th>
                  <th scope="col">Tutor</th>
                  <th scope="col">Applied</th>
                  <th scope="col">Fee</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <p className="font-bold">{row.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{row.subject}</p>
                    </td>
                    <td>{row.tutor}</td>
                    <td>{row.applied}</td>
                    <td>{row.fee !== undefined ? formatFee(row.fee) : "—"}</td>
                    <td>
                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold capitalize ${statusStyle(row.status)}`}
                      >
                        <StatusIcon status={row.status} />
                        {row.status}
                      </span>
                    </td>
                    <td>
                      {row.status.toLowerCase() === "pending" && row.id ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(row.id as string)}
                          disabled={cancellingId !== null}
                          className="btn-danger text-xs"
                        >
                          {cancellingId === row.id ? "Cancelling..." : "Cancel"}
                          {cancellingId !== row.id && <Trash2 size={14} />}
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--muted)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[var(--border)] md:hidden">
            {rows.map((row) => (
              <div
                key={row.key}
                className="flex flex-col justify-between gap-4 p-5 sm:px-7"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--primary)]">
                    <BookOpen size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="break-words font-bold">{row.title}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Tutor: {row.tutor}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {row.subject} · Applied: {row.applied}
                    </p>
                    {row.fee !== undefined && (
                      <p className="mt-2 text-sm font-bold text-[var(--primary)]">
                        {formatFee(row.fee)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold capitalize ${statusStyle(row.status)}`}
                  >
                    <StatusIcon status={row.status} />
                    {row.status}
                  </span>
                  {row.status.toLowerCase() === "pending" && row.id && (
                    <button
                      type="button"
                      onClick={() => handleCancel(row.id as string)}
                      disabled={cancellingId !== null}
                      className="btn-danger text-xs"
                    >
                      {cancellingId === row.id ? "Cancelling..." : "Cancel"}
                      {cancellingId !== row.id && <Trash2 size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
