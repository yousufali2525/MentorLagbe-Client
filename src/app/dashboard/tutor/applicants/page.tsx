
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Search,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  BookOpen,
  MapPin,
  Wallet,
  CalendarDays,
  MessageSquare,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  tuitionId?:
    | {
        _id?: string;
        id?: string;
        title?: string;
        subject?: string;
        salary?: number;
        location?: string;
      }
    | string;
};

type Notification = {
  type: "success" | "error";
  message: string;
};

export default function TutorApplicantsPage() {
  const router = useRouter();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] =
    useState<Notification | null>(null);

  const showNotification = (
    type: "success" | "error",
    message: string
  ) => {
    setNotification({ type, message });
  };

  const fetchApplicants = useCallback(async () => {
    const token = localStorage.getItem("mentorlagbe-token");
    const storedUser = localStorage.getItem("mentorlagbe-user");

    if (!token || !storedUser) {
      router.replace("/sign-in");
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const user = parsedUser.user || parsedUser.data?.user || parsedUser;
      const role = user.role?.toLowerCase();

      if (role !== "tutor") {
        router.replace(`/dashboard/${role || "student"}`);
        setLoading(false);
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
        window.dispatchEvent(new Event("auth-updated"));
        router.replace("/sign-in");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Applicants load করা যায়নি।"
        );
      }

      const applicantList = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.applicants)
          ? result.applicants
          : [];

      setApplicants(applicantList);
      setNotification(null);
    } catch (error) {
      showNotification(
        "error",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const refreshApplicants = () => {
    setRefreshing(true);
    fetchApplicants();
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: "accepted" | "rejected"
  ) => {
    const token = localStorage.getItem("mentorlagbe-token");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    if (!applicationId) {
      showNotification("error", "Application ID পাওয়া যায়নি।");
      return;
    }

    const confirmed = window.confirm(
      `তুমি কি এই application টি ${
        status === "accepted" ? "Accept" : "Reject"
      } করতে চাও?`
    );

    if (!confirmed) return;

    setUpdatingId(applicationId);
    setNotification(null);

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
        window.dispatchEvent(new Event("auth-updated"));
        router.replace("/sign-in");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Application update করা যায়নি।"
        );
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
        `Application ${
          status === "accepted" ? "accepted" : "rejected"
        } successfully.`
      );
    } catch (error) {
      showNotification(
        "error",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const getTuition = (applicant: Applicant) => {
    if (
      typeof applicant.tuitionId === "object" &&
      applicant.tuitionId
    ) {
      return applicant.tuitionId;
    }

    return applicant.tuition;
  };

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const tuition = getTuition(applicant);

      const searchText = [
        applicant.studentName,
        applicant.studentEmail,
        applicant.message,
        tuition?.title,
        tuition?.subject,
        tuition?.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        statusFilter === "all" ||
        (applicant.status || "pending").toLowerCase() ===
          statusFilter;

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

  const stats = [
    {
      title: "Total Applicants",
      value: applicants.length,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Accepted",
      value: acceptedCount,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Rejected",
      value: rejectedCount,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#142c2b]">
              Applicants Management
            </h1>
            <p className="mt-2 text-sm text-[#647875]">
              তোমার tuition-এ যারা application করেছে তাদের manage করো।
            </p>
          </div>

          <button
            onClick={refreshApplicants}
            disabled={loading || refreshing}
            className="flex items-center gap-2 rounded-xl border border-[#dce8e3] bg-white px-4 py-2.5 text-sm font-semibold text-[#647875] transition hover:bg-[#f2f7f5] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loading || refreshing ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        {notification && (
          <div
            className={`mb-6 flex items-start justify-between gap-3 rounded-xl border p-4 text-sm ${
              notification.type === "success"
                ? "border-[#cce7dc] bg-[#effaf5] text-[#087f6e]"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-start gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 size={18} className="shrink-0" />
              ) : (
                <AlertCircle size={18} className="shrink-0" />
              )}
              <p>{notification.message}</p>
            </div>

            <button
              onClick={() => setNotification(null)}
              aria-label="Dismiss notification"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-[#e3ebe8] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#647875]">
                    {stat.title}
                  </p>
                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={21} />
                  </div>
                </div>

                <p className="mt-5 text-3xl font-extrabold text-[#142c2b]">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <section className="rounded-2xl border border-[#e3ebe8] bg-white shadow-sm">
          <div className="border-b border-[#e3ebe8] p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-extrabold text-[#142c2b]">
                  All Applicants
                </h2>
                <p className="mt-1 text-sm text-[#82918c]">
                  মোট {filteredApplicants.length} জন applicant পাওয়া গেছে।
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#82918c]"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search student or tuition..."
                    className="w-full rounded-xl border border-[#dce8e3] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#087f6e] sm:w-64"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="rounded-xl border border-[#dce8e3] px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
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
            <div className="flex min-h-64 flex-col items-center justify-center">
              <LoaderCircle
                size={35}
                className="animate-spin text-[#087f6e]"
              />
              <p className="mt-4 text-sm text-[#82918c]">
                Loading applicants...
              </p>
            </div>
          ) : paginatedApplicants.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5f1] text-[#087f6e]">
                <Users size={30} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#142c2b]">
                No applicants found
              </h3>

              <p className="mt-2 text-sm text-[#82918c]">
                {applicants.length === 0
                  ? "তোমার tuition-এ এখনো কেউ application করেনি।"
                  : "তোমার search অথবা filter অনুযায়ী কোনো applicant পাওয়া যায়নি।"}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#e3ebe8]">
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
                      className="p-5 transition hover:bg-[#fbfdfc] sm:p-6"
                    >
                      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-[#142c2b]">
                              {applicant.studentName || "Unknown Student"}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                                status === "accepted"
                                  ? "bg-green-50 text-green-700"
                                  : status === "rejected"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {status}
                            </span>
                          </div>

                          <p className="mt-2 flex items-center gap-2 break-all text-sm text-[#647875]">
                            <Mail size={15} className="shrink-0" />
                            {applicant.studentEmail || "Email not available"}
                          </p>

                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#82918c]">
                                Tuition
                              </p>
                              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#23413c]">
                                <BookOpen size={15} className="shrink-0 text-[#087f6e]" />
                                {tuition?.title || "Tuition information unavailable"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#82918c]">
                                Subject
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[#23413c]">
                                {tuition?.subject || "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#82918c]">
                                Tuition Fee
                              </p>
                              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#23413c]">
                                <Wallet size={15} className="text-[#087f6e]" />
                                {typeof tuition?.salary === "number"
                                  ? `৳${tuition.salary.toLocaleString("en-BD")}`
                                  : "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#82918c]">
                                Location
                              </p>
                              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#23413c]">
                                <MapPin size={15} className="text-[#087f6e]" />
                                {tuition?.location || "N/A"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#82918c]">
                                Applied Date
                              </p>
                              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#23413c]">
                                <CalendarDays size={15} className="text-[#087f6e]" />
                                {applicant.createdAt || applicant.appliedAt
                                  ? new Date(
                                      applicant.createdAt || applicant.appliedAt!
                                    ).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "N/A"}
                              </p>
                            </div>
                          </div>

                          {applicant.message && (
                            <div className="mt-5 rounded-xl bg-[#f5f9f7] p-4">
                              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#647875]">
                                <MessageSquare size={15} />
                                Student Message
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#405b55]">
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
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#087f6e] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#066657] disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                            >
                              {updatingId === applicationId ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                              Accept
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
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-[#e3ebe8] px-5 py-4 sm:flex-row">
                <p className="text-sm text-[#82918c]">
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
                    className="rounded-lg border border-[#dce8e3] px-3 py-2 text-sm font-semibold text-[#647875] hover:bg-[#f2f7f5] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm font-semibold text-[#647875]">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-[#dce8e3] px-3 py-2 text-sm font-semibold text-[#647875] hover:bg-[#f2f7f5] disabled:cursor-not-allowed disabled:opacity-40"
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
