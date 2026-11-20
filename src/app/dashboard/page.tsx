
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock3,
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
  Crown,
  ArrowRight,
} from "lucide-react";

const API_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

type User = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  plan?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  image?: string;
};

type Application = {
  _id?: string;
  id?: string;
  status?: string;
  createdAt?: string;
  tuition?: {
    _id?: string;
    title?: string;
    subject?: string;
    monthlyFee?: number;
    tutorName?: string;
  };
  tuitionTitle?: string;
  tutorName?: string;
  monthlyFee?: number;
};

export default function StudentDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("mentorlagbe-token");
        const savedUser = localStorage.getItem("mentorlagbe-user");

        if (!token || !savedUser) {
          router.replace("/sign-in");
          return;
        }

        const parsedUser = JSON.parse(savedUser) as User;

        if (parsedUser.role?.toLowerCase() !== "student") {
          router.replace("/sign-in");
          return;
        }

        if (active) setUser(parsedUser);

        const profileResponse = await fetch(
          `${API_URL}/api/users/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const profileResult = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileResult.message || "Failed to load profile."
          );
        }

        const latestUser =
          profileResult.user ||
          profileResult.data?.user ||
          profileResult.data ||
          profileResult;

        const updatedUser: User = {
          ...parsedUser,
          ...latestUser,
          profileImage:
            latestUser.profileImage ||
            latestUser.image ||
            parsedUser.profileImage ||
            parsedUser.image ||
            "",
          image:
            latestUser.profileImage ||
            latestUser.image ||
            parsedUser.profileImage ||
            parsedUser.image ||
            "",
        };

        if (updatedUser.role?.toLowerCase() !== "student") {
          router.replace("/sign-in");
          return;
        }

        localStorage.setItem(
          "mentorlagbe-user",
          JSON.stringify(updatedUser)
        );

        if (active) setUser(updatedUser);

        window.dispatchEvent(new Event("user-updated"));

        const response = await fetch(
          `${API_URL}/api/applications/my-applications`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load applications."
          );
        }

        const applicationList = Array.isArray(result)
          ? result
          : result.applications ||
            result.data?.applications ||
            result.data ||
            [];

        if (active) {
          setApplications(
            Array.isArray(applicationList)
              ? applicationList
              : []
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    const updateUserFromStorage = () => {
      const savedUser = localStorage.getItem("mentorlagbe-user");

      if (!savedUser) return;

      try {
        setUser(JSON.parse(savedUser) as User);
      } catch {
        console.error("Unable to update user information.");
      }
    };

    window.addEventListener("user-updated", updateUserFromStorage);

    return () => {
      active = false;
      window.removeEventListener(
        "user-updated",
        updateUserFromStorage
      );
    };
  }, [router]);

  const pendingCount = applications.filter(
    (item) => item.status?.toLowerCase() === "pending"
  ).length;

  const acceptedCount = applications.filter(
    (item) => item.status?.toLowerCase() === "accepted"
  ).length;

  const rejectedCount = applications.filter(
    (item) => item.status?.toLowerCase() === "rejected"
  ).length;

  const stats = [
    {
      title: "Total Applications",
      value: applications.length,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Applications",
      value: pendingCount,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Accepted Applications",
      value: acceptedCount,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Current Plan",
      value: user?.plan?.toUpperCase() || "FREE",
      icon: Crown,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-[#142c2b]">
              Hello, {user?.name?.split(" ")[0] || "Student"}!
            </h2>
            <p className="mt-2 text-sm text-[#647875]">
              Here is an overview of your learning activities.
            </p>
          </div>

          <Link
            href="/tuitions"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#087f6e] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#066657]"
          >
            Explore Tuitions
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#e3ebe8] bg-white">
          <LoaderCircle
            size={35}
            className="animate-spin text-[#087f6e]"
          />
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-[#e3ebe8] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#647875]">
                      {stat.title}
                    </p>
                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  <p className="mt-6 text-3xl font-extrabold text-[#142c2b]">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          <section className="mt-8 rounded-2xl border border-[#e3ebe8] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#142c2b]">
                  Recent Applications
                </h3>
                <p className="mt-1 text-sm text-[#82918c]">
                  Track your latest tuition applications.
                </p>
              </div>

              <Link
                href="/dashboard/student/my-applications"
                className="inline-flex items-center gap-1 text-sm font-bold text-[#087f6e] transition hover:text-[#066657]"
              >
                View All
                <ArrowRight size={15} />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5f1] text-[#087f6e]">
                  <FileText size={28} />
                </div>

                <h4 className="mt-4 font-bold text-[#142c2b]">
                  No applications yet
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm text-[#82918c]">
                  Explore available tuitions and submit your first application.
                </p>

                <Link
                  href="/tuitions"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#087f6e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#066657]"
                >
                  Browse Tuitions
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt || 0).getTime() -
                      new Date(a.createdAt || 0).getTime()
                  )
                  .slice(0, 5)
                  .map((application, index) => {
                    const status =
                      application.status?.toLowerCase() || "pending";

                    const title =
                      application.tuition?.title ||
                      application.tuitionTitle ||
                      "Tuition Application";

                    const fee =
                      application.tuition?.monthlyFee ??
                      application.monthlyFee;

                    return (
                      <div
                        key={application._id || application.id || index}
                        className="flex flex-col justify-between gap-3 rounded-xl border border-[#e3ebe8] p-4 transition hover:bg-[#fbfdfc] sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0">
                          <h4 className="font-bold text-[#142c2b]">
                            {title}
                          </h4>

                          <p className="mt-1 text-xs text-[#82918c]">
                            {application.tutorName ||
                              application.tuition?.tutorName ||
                              "Tutor information unavailable"}
                          </p>

                          <p className="mt-1 text-xs text-[#82918c]">
                            {application.tuition?.subject ||
                              "Subject unavailable"}
                            {fee !== undefined && ` â€¢ à§³${fee}`}
                          </p>

                          {application.createdAt && (
                            <p className="mt-1 text-xs text-[#82918c]">
                              Applied:{" "}
                              {new Date(
                                application.createdAt
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <span
                          className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
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
                    );
                  })}
              </div>
            )}
          </section>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-white px-5 py-4">
            <p className="text-sm font-medium text-[#647875]">
              Rejected Applications
            </p>
            <span className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-bold text-red-600">
              {rejectedCount}
            </span>
          </div>
        </>
      )}
    </main>
  );
}
