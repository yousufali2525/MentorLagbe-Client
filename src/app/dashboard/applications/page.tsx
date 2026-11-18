"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  RefreshCw,
  Clock3,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  AlertCircle,
  BookOpen,
  Trash2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Application = {
  _id?: string;
  id?: string;
  status?: string;
  createdAt?: string;
  tuition?: {
    title?: string;
    subject?: string;
    monthlyFee?: number;
    tutorName?: string;
  };
  tuitionTitle?: string;
  subject?: string;
  tutorName?: string;
  tutorEmail?: string;
  monthlyFee?: number;
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("mentorlagbe-token");
    const savedUser = localStorage.getItem("mentorlagbe-user");

    if (!token || !savedUser) {
      router.replace("/sign-in");
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (user.role !== "student") {
        router.replace("/sign-in");
        return;
      }

      const response = await fetch(`${API_URL}/api/applications/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load applications.");
      }

      const list = Array.isArray(result)
        ? result
        : result.applications || result.data?.applications || result.data || [];

      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleCancel = async (applicationId: string) => {
    if (!window.confirm("Are you sure you want to cancel this application?")) return;

    try {
      setCancellingId(applicationId);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("mentorlagbe-token");

      if (!token) {
        router.replace("/sign-in");
        return;
      }

      const response = await fetch(`${API_URL}/api/applications/${applicationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel application.");
      }

      setApplications((prev) =>
        prev.filter((app) => (app._id || app.id) !== applicationId)
      );

      setSuccess("Application cancelled successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel application.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return <CheckCircle2 size={15} />;
      case "rejected":
        return <XCircle size={15} />;
      default:
        return <Clock3 size={15} />;
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "Date unavailable";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

    return parsedDate.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const pendingCount = applications.filter((app) => app.status?.toLowerCase() === "pending").length;
  const acceptedCount = applications.filter((app) => app.status?.toLowerCase() === "accepted").length;
  const rejectedCount = applications.filter((app) => app.status?.toLowerCase() === "rejected").length;

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <header className="border-b border-[#e3ebe8] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
          <div>
            <Link href="/dashboard/student" className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[#087f6e] hover:underline">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-[#142c2b]">My Applications</h1>
            <p className="mt-1 text-sm text-[#647875]">Manage and track your tuition applications.</p>
          </div>

          <button onClick={loadApplications} disabled={loading || cancellingId !== null} className="flex items-center gap-2 rounded-xl border border-[#e3ebe8] bg-white px-4 py-2.5 text-sm font-semibold text-[#087f6e] transition hover:bg-[#e8f5f1] disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Applications", value: applications.length, color: "text-[#142c2b]" },
            { label: "Pending", value: pendingCount, color: "text-amber-600" },
            { label: "Accepted", value: acceptedCount, color: "text-green-600" },
            { label: "Rejected", value: rejectedCount, color: "text-red-600" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-[#e3ebe8] bg-white p-5">
              <p className="text-sm text-[#647875]">{item.label}</p>
              <p className={`mt-2 text-3xl font-extrabold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>

        {error && <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><p>{error}</p></div>}
        {success && <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /><p>{success}</p></div>}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle size={36} className="animate-spin text-[#087f6e]" />
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-[#e3ebe8] bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5f1] text-[#087f6e]"><FileText size={30} /></div>
            <h2 className="mt-5 text-xl font-extrabold text-[#142c2b]">No Applications Found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#647875]">You have not applied for any tuition yet. Explore available tuitions and find the right tutor for your learning journey.</p>
            <Link href="/tuitions" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087f6e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#066657]"><BookOpen size={17} />Browse Tuitions</Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#e3ebe8] bg-white shadow-sm">
            <div className="border-b border-[#e3ebe8] px-5 py-5 sm:px-7">
              <h2 className="font-extrabold text-[#142c2b]">Application History</h2>
              <p className="mt-1 text-sm text-[#82918c]">All your submitted tuition applications.</p>
            </div>

            <div className="divide-y divide-[#e3ebe8]">
              {applications.map((application, index) => {
                const status = application.status?.toLowerCase() || "pending";
                const title = application.tuition?.title || application.tuitionTitle || "Tuition Application";
                const tutor = application.tutorName || application.tuition?.tutorName || application.tutorEmail || "Not available";
                const fee = application.monthlyFee ?? application.tuition?.monthlyFee;
                const id = application._id || application.id;

                return (
                  <div key={id || index} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:px-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e8f5f1] text-[#087f6e]"><BookOpen size={22} /></div>
                      <div>
                        <h3 className="font-bold text-[#142c2b]">{title}</h3>
                        <p className="mt-1 text-sm text-[#647875]">Tutor: {tutor}</p>
                        <p className="mt-1 text-xs text-[#82918c]">{application.tuition?.subject || application.subject || "Subject unavailable"} · Applied: {formatDate(application.createdAt)}</p>
                        {fee !== undefined && <p className="mt-2 text-sm font-bold text-[#087f6e]">৳{fee} / month</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <div className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold capitalize ${getStatusStyle(status)}`}>
                        {getStatusIcon(status)}
                        {status}
                      </div>

                      {status === "pending" && id && (
                        <button onClick={() => handleCancel(id)} disabled={cancellingId !== null} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
                          {cancellingId === id ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          {cancellingId === id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}