
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const ITEMS_PER_PAGE = 8;

type Applicant = {
  _id?: string;
  id?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  message?: string;
  status?: string;
  createdAt?: string;
  appliedAt?: string;
  tuition?: {
    _id?: string;
    id?: string;
    title?: string;
    subject?: string;
    salary?: number;
    location?: string;
  };
  tuitionId?: {
    _id?: string;
    id?: string;
    title?: string;
    subject?: string;
    salary?: number;
    location?: string;
  } | string;
};

export default function TutorApplicantsPage() {
  const router = useRouter();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    window.setTimeout(() => {
      setNotification({ type: "", message: "" });
    }, 3500);
  };

  const fetchApplicants = useCallback(async () => {
    const token = localStorage.getItem("mentorlagbe-token");
    const storedUser = localStorage.getItem("mentorlagbe-user");

    if (!token || !storedUser) {
      router.replace("/sign-in");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "tutor") {
        router.replace(`/dashboard/${user.role || "student"}`);
        return;
      }

      const response = await fetch(
        `${API_URL}/api/applications/tutor-applicants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("mentorlagbe-token");
        localStorage.removeItem("mentorlagbe-user");
        router.replace("/sign-in");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Applicants load করা যায়নি।");
      }

      setApplicants(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      showNotification(
        "error",
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const updateApplicationStatus = async (
    applicationId: string,
    status: "accepted" | "rejected"
  ) => {
    const token = localStorage.getItem("mentorlagbe-token");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    const confirmed = window.confirm(
      `তুমি কি এই application টি ${status === "accepted" ? "Accept" : "Reject"} করতে চাও?`
    );

    if (!confirmed) return;

    setUpdatingId(applicationId);

    try {
      const response = await fetch(
        `${API_URL}/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("mentorlagbe-token");
        localStorage.removeItem("mentorlagbe-user");
        router.replace("/sign-in");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Application update করা যায়নি।");
      }

      setApplicants((previous) =>
        previous.map((applicant) =>
          (applicant._id || applicant.id) === applicationId
            ? { ...applicant, status }
            : applicant
        )
      );

      showNotification(
        "success",
        `Application ${status === "accepted" ? "accepted" : "rejected"} successfully.`
      );
    } catch (error) {
      showNotification(
        "error",
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const tuition =
        typeof applicant.tuitionId === "object"
          ? applicant.tuitionId
          : applicant.tuition;

      const searchText = [
        applicant.studentName,
        applicant.studentEmail,
        applicant.message,
        tuition?.title,
        tuition?.subject,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (applicant.status || "pending").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applicants, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplicants.length / ITEMS_PER_PAGE)
  );

  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const pendingCount = applicants.filter(
    (item) => (item.status || "pending").toLowerCase() === "pending"
  ).length;

  const acceptedCount = applicants.filter(
    (item) => item.status?.toLowerCase() === "accepted"
  ).length;

  const rejectedCount = applicants.filter(
    (item) => item.status?.toLowerCase() === "rejected"
  ).length;

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTuition = (applicant: Applicant) => {
    if (typeof applicant.tuitionId === "object" && applicant.tuitionId) {
      return applicant.tuitionId;
    }

    return applicant.tuition;
  };

  const signOut = () => {
    localStorage.removeItem("mentorlagbe-token");
    localStorage.removeItem("mentorlagbe-user");
    router.replace("/sign-in");
  };

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside className="w-full border-b border-gray-200 bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-gray-100 px-6 py-6">
          <Link
            href="/dashboard/tutor"
            className="text-2xl font-bold text-indigo-600"
          >
            MentorLagbe
          </Link>
          <p className="mt-1 text-sm text-gray-500">Tutor Dashboard</p>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-4 md:flex-col">
          <Link
            href="/dashboard/tutor"
            className="shrink-0 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/tutor/my-tuitions"
            className="shrink-0 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            My Tuitions
          </Link>
          <Link
            href="/dashboard/tutor/applicants"
            className="shrink-0 rounded-lg bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700"
          >
            Applicants
          </Link>
          <Link
            href="/dashboard/tutor/profile"
            className="shrink-0 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            My Profile
          </Link>
          <button
            onClick={signOut}
            className="shrink-0 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Sign Out
          </button>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Applicants Management
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                তোমার tuition-এ যারা application করেছে তাদের manage করো।
              </p>
            </div>

            <Link
              href="/dashboard/tutor"
              className="inline-flex w-fit items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
          </div>

          {notification.message && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                notification.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {notification.message}
            </div>
          )}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Total Applicants
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {applicants.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Accepted</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {acceptedCount}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {rejectedCount}
              </p>
            </div>
          </div>

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    All Applicants
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    মোট {filteredApplicants.length} জন applicant পাওয়া গেছে।
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search student or tuition..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
                  />

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                <p className="mt-4 text-sm text-gray-500">
                  Loading applicants...
                </p>
              </div>
            ) : paginatedApplicants.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl">
                  <span>👥</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No applicants found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {applicants.length === 0
                    ? "তোমার tuition-এ এখনো কেউ application করেনি।"
                    : "তোমার search অথবা filter অনুযায়ী কোনো applicant পাওয়া যায়নি।"}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {paginatedApplicants.map((applicant) => {
                    const applicationId =
                      applicant._id || applicant.id || "";
                    const tuition = getTuition(applicant);
                    const status = (
                      applicant.status || "pending"
                    ).toLowerCase();

                    return (
                      <div
                        key={applicationId}
                        className="p-5 transition hover:bg-gray-50 sm:p-6"
                      >
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-gray-900">
                                {applicant.studentName || "Unknown Student"}
                              </h3>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                  status === "accepted"
                                    ? "bg-green-100 text-green-700"
                                    : status === "rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {status}
                              </span>
                            </div>

                            <p className="mt-1 break-all text-sm text-gray-500">
                              {applicant.studentEmail || "Email not available"}
                            </p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                  Tuition
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                  {tuition?.title || "Tuition information unavailable"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                  Subject
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                  {tuition?.subject || "N/A"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                  Tuition Fee
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                  {typeof tuition?.salary === "number"
                                    ? `৳${tuition.salary.toLocaleString("en-BD")}`
                                    : "N/A"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                  Applied Date
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                  {formatDate(
                                    applicant.createdAt || applicant.appliedAt
                                  )}
                                </p>
                              </div>
                            </div>

                            {applicant.message && (
                              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  Student Message
                                </p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                  {applicant.message}
                                </p>
                              </div>
                            )}
                          </div>

                          {status === "pending" && (
                            <div className="flex shrink-0 gap-2 lg:flex-col">
                              <button
                                onClick={() =>
                                  updateApplicationStatus(
                                    applicationId,
                                    "accepted"
                                  )
                                }
                                disabled={
                                  updatingId === applicationId ||
                                  !applicationId
                                }
                                className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                              >
                                {updatingId === applicationId
                                  ? "Updating..."
                                  : "Accept"}
                              </button>

                              <button
                                onClick={() =>
                                  updateApplicationStatus(
                                    applicationId,
                                    "rejected"
                                  )
                                }
                                disabled={
                                  updatingId === applicationId ||
                                  !applicationId
                                }
                                className="flex-1 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredApplicants.length
                    )}{" "}
                    of {filteredApplicants.length}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="px-2 text-sm text-gray-600">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
