
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Tuition = {
  _id: string;
  title: string;
  subject: string;
  description: string;
  location: string;
  salary: number;
  category?: string;
  banner?: string;
  tutorName?: string;
  tutorEmail?: string;
  approvalStatus: string;
  createdAt?: string;
};

export default function AdminTuitionsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [selectedTuition, setSelectedTuition] = useState<Tuition | null>(null);
  const [search, setSearch] = useState("");

  const fetchTuitions = useCallback(async () => {
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
        `${API_URL}/api/admin/tuitions/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load tuition requests");
      }

      setTuitions(data.tuitions || []);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load tuitions",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [router, showToast]);

  useEffect(() => {
    fetchTuitions();
  }, [fetchTuitions]);

  const updateStatus = async (
    tuitionId: string,
    status: "approved" | "rejected"
  ) => {
    const token = localStorage.getItem("mentorlagbe-token");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    const action = status === "approved" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this tuition?`)) {
      return;
    }

    setProcessingId(tuitionId);

    try {
      const response = await fetch(
        `${API_URL}/api/tuitions/admin/${tuitionId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update tuition");
      }

      setTuitions((previous) =>
        previous.filter((tuition) => tuition._id !== tuitionId)
      );

      setSelectedTuition(null);

      showToast(
        data.message || `Tuition ${status} successfully`,
        "success"
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Something went wrong",
        "error"
      );
    } finally {
      setProcessingId("");
    }
  };

  const filteredTuitions = tuitions.filter((tuition) => {
    const value = search.toLowerCase();

    return (
      tuition.title?.toLowerCase().includes(value) ||
      tuition.subject?.toLowerCase().includes(value) ||
      tuition.location?.toLowerCase().includes(value) ||
      tuition.tutorName?.toLowerCase().includes(value) ||
      tuition.tutorEmail?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="min-w-0 p-5 md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-teal-600">
              Administration
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
              Manage Tuitions
            </h2>
            <p className="mt-2 text-slate-500">
              Review tuition requests and approve or reject them.
            </p>
          </div>

          <button
            onClick={fetchTuitions}
            disabled={loading}
            className="rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending Tuition Requests
            </p>
            <h3 className="mt-2 text-3xl font-bold text-amber-600">
              {loading ? "..." : tuitions.length}
            </h3>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Filtered Results
            </p>
            <h3 className="mt-2 text-3xl font-bold text-teal-600">
              {loading ? "..." : filteredTuitions.length}
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, subject, location or tutor..."
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-bold text-slate-900">
              Pending Tuition Requests
            </h3>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading tuition requests...
            </div>
          ) : filteredTuitions.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mb-3 text-4xl">📚</div>
              <h4 className="font-semibold text-slate-800">
                No pending tuitions found
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                New tuition requests will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTuitions.map((tuition) => (
                <div key={tuition._id} className="p-5">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900">
                          {tuition.title}
                        </h4>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Pending
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span>📖 {tuition.subject}</span>
                        <span>📍 {tuition.location}</span>
                        <span>
                          💰 ৳
                          {Number(tuition.salary).toLocaleString("en-BD")}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-600">
                        Tutor: {tuition.tutorName || "Not provided"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {tuition.tutorEmail || ""}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Submitted:{" "}
                        {tuition.createdAt
                          ? new Date(tuition.createdAt).toLocaleDateString(
                              "en-BD"
                            )
                          : "Not available"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedTuition(tuition)}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(tuition._id, "approved")
                        }
                        disabled={processingId === tuition._id}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingId === tuition._id
                          ? "Processing..."
                          : "Approve"}
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(tuition._id, "rejected")
                        }
                        disabled={processingId === tuition._id}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedTuition && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedTuition(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-900">
                Tuition Details
              </h3>
              <button
                onClick={() => setSelectedTuition(null)}
                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            {selectedTuition.banner && (
              <img
                src={selectedTuition.banner}
                alt={selectedTuition.title}
                className="mb-5 max-h-56 w-full rounded-lg object-cover"
              />
            )}

            <h4 className="text-lg font-bold text-slate-900">
              {selectedTuition.title}
            </h4>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Subject</p>
                <p className="mt-1 font-medium text-slate-800">
                  {selectedTuition.subject}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Category</p>
                <p className="mt-1 font-medium text-slate-800">
                  {selectedTuition.category || "General"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="mt-1 font-medium text-slate-800">
                  {selectedTuition.location}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Salary</p>
                <p className="mt-1 font-medium text-slate-800">
                  ৳
                  {Number(selectedTuition.salary).toLocaleString("en-BD")}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Tutor Name</p>
                <p className="mt-1 font-medium text-slate-800">
                  {selectedTuition.tutorName || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Tutor Email</p>
                <p className="mt-1 font-medium text-slate-800">
                  {selectedTuition.tutorEmail || "Not provided"}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs text-slate-500">Description</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {selectedTuition.description}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setSelectedTuition(null)}
                className="rounded-lg border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={() =>
                  updateStatus(selectedTuition._id, "rejected")
                }
                disabled={processingId === selectedTuition._id}
                className="rounded-lg bg-red-600 px-5 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>

              <button
                onClick={() =>
                  updateStatus(selectedTuition._id, "approved")
                }
                disabled={processingId === selectedTuition._id}
                className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
