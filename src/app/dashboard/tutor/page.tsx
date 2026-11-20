
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Plus,
  GraduationCap,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type User = {
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  image?: string;
  plan?: string;
};

type Tuition = {
  _id: string;
  title: string;
  subject: string;
  location: string;
  salary?: number;
  approvalStatus?: string;
  isActive?: boolean;
  createdAt?: string;
};

export default function TutorDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [applicantCount, setApplicantCount] = useState(0);
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

        if (parsedUser.role?.toLowerCase() !== "tutor") {
          router.replace("/sign-in");
          return;
        }

        if (active) {
          setUser(parsedUser);
        }

        const [tuitionResponse, applicantResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/tuitions/my-tuitions`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }),
            fetch(`${API_URL}/api/applications/tutor-applicants`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              cache: "no-store",
            }),
          ]);

        const tuitionResult = await tuitionResponse.json();
        const applicantResult = await applicantResponse.json();

        if (!tuitionResponse.ok) {
          throw new Error(
            tuitionResult.message || "Failed to load your tuitions."
          );
        }

        const tuitionList = Array.isArray(tuitionResult)
          ? tuitionResult
          : tuitionResult.tuitions ||
            tuitionResult.data?.tuitions ||
            tuitionResult.data ||
            [];

        if (active) {
          setTuitions(
            Array.isArray(tuitionList) ? tuitionList : []
          );

          setApplicantCount(
            applicantResponse.ok
              ? applicantResult.total ??
                  applicantResult.data?.length ??
                  0
              : 0
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
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  const approvedCount = tuitions.filter(
    (item) =>
      item.approvalStatus?.toLowerCase() === "approved"
  ).length;

  const stats = [
    {
      title: "Total Tuitions Posted",
      value: tuitions.length,
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active/Approved Tuitions",
      value: approvedCount,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Total Applicants Received",
      value: applicantCount,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Current Plan",
      value: (user?.plan || "free").toUpperCase(),
      icon: GraduationCap,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7faf8] p-4 sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142c2b]">
            Hello, {user?.name?.split(" ")[0] || "Tutor"}!
          </h2>
          <p className="mt-2 text-sm text-[#647875]">
            Here is an overview of your tuition activities.
          </p>
        </div>

        <Link
          href="/dashboard/tutor/post-tuition"
          className="inline-flex items-center gap-2 rounded-xl bg-[#087f6e] px-5 py-3 text-sm font-bold text-white hover:bg-[#066657]"
        >
          <Plus size={18} />
          Post a Tuition
        </Link>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

          <section className="mt-8 rounded-2xl border border-[#e3ebe8] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#142c2b]">
                  Recent Tuitions
                </h3>
                <p className="mt-1 text-sm text-[#82918c]">
                  Your latest tuition posts and their approval status.
                </p>
              </div>

              <Link
                href="/dashboard/tutor/my-tuitions"
                className="text-sm font-bold text-[#087f6e] hover:underline"
              >
                View All
              </Link>
            </div>

            {tuitions.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen
                  size={32}
                  className="mx-auto text-[#087f6e]"
                />
                <h4 className="mt-4 font-bold text-[#142c2b]">
                  No tuitions posted yet
                </h4>
                <p className="mt-2 text-sm text-[#82918c]">
                  Create your first tuition post to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tuitions.slice(0, 5).map((tuition) => {
                  const status =
                    tuition.approvalStatus?.toLowerCase() || "pending";

                  return (
                    <div
                      key={tuition._id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-[#e3ebe8] p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <h4 className="font-bold text-[#142c2b]">
                          {tuition.title}
                        </h4>
                        <p className="mt-1 text-xs text-[#82918c]">
                          {tuition.subject} • {tuition.location}
                        </p>

                        {tuition.salary !== undefined && (
                          <p className="mt-1 text-xs text-[#647875]">
                            Monthly Salary: ৳{tuition.salary}
                          </p>
                        )}
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                          status === "approved"
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
        </>
      )}
    </main>
  );
}
