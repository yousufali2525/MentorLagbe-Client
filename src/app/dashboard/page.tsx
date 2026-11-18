
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  UserRound,
  LogOut,
  Menu,
  X,
  Clock3,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  Crown,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleLogout = async () => {
    const token = localStorage.getItem("mentorlagbe-token");

    try {
      await fetch(`${API_URL}/api/auth/sign-out`, {
        method: "POST",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("mentorlagbe-token");
      localStorage.removeItem("mentorlagbe-user");
      router.replace("/sign-in");
    }
  };

  const profileImage = user?.profileImage || user?.image || "";

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
    <div className="min-h-screen bg-[#f7faf8]">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#e3ebe8] bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-[#e3ebe8] px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5f1] text-[#087f6e]">
              <GraduationCap size={25} />
            </div>
            <span className="text-xl font-extrabold text-[#087f6e]">
              MentorLagbe
            </span>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#647875] lg:hidden"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="border-b border-[#e3ebe8] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e3ebe8] bg-[#e8f5f1] font-bold text-[#087f6e]">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user?.name || "Student"}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "S"
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#142c2b]">
                {user?.name || "Student"}
              </p>
              <span className="text-xs capitalize text-[#647875]">
                {user?.role || "Student"} Account
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-[#9aa9a4]">
            Dashboard
          </p>

          <Link
            href="/dashboard/student"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl bg-[#e8f5f1] px-4 py-3 text-sm font-semibold text-[#087f6e]"
          >
            <LayoutDashboard size={19} />
            Overview
          </Link>

          <Link
            href="/dashboard/applications"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#647875] transition hover:bg-[#f2f7f5] hover:text-[#087f6e]"
          >
            <FileText size={19} />
            My Applications
          </Link>

          <Link
            href="/tuitions"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#647875] transition hover:bg-[#f2f7f5] hover:text-[#087f6e]"
          >
            <BookOpen size={19} />
            Browse Tuitions
          </Link>

          <Link
            href="/dashboard/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#647875] transition hover:bg-[#f2f7f5] hover:text-[#087f6e]"
          >
            <UserRound size={19} />
            My Profile
          </Link>
        </nav>

        <div className="border-t border-[#e3ebe8] p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#e3ebe8] bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[#647875] hover:bg-[#f2f7f5] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div>
              <h1 className="text-lg font-extrabold text-[#142c2b] sm:text-xl">
                Student Dashboard
              </h1>
              <p className="hidden text-xs text-[#82918c] sm:block">
                Manage your learning journey
              </p>
            </div>
          </div>

          <Link
            href="/tuitions"
            className="flex items-center gap-2 rounded-xl bg-[#087f6e] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#066657] sm:px-4 sm:text-sm"
          >
            Find a Tutor
            <ArrowRight size={16} />
          </Link>
        </header>

        <main className="p-4 sm:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#142c2b]">
              Hello, {user?.name?.split(" ")[0] || "Student"}!
            </h2>
            <p className="mt-2 text-sm text-[#647875]">
              Here is an overview of your learning activities.
            </p>
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
                    href="/dashboard/applications"
                    className="text-sm font-bold text-[#087f6e] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {applications.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5f1] text-[#087f6e]">
                      <FileText size={27} />
                    </div>

                    <h4 className="mt-4 font-bold text-[#142c2b]">
                      No applications yet
                    </h4>

                    <p className="mt-2 text-sm text-[#82918c]">
                      Explore available tuitions and submit your first application.
                    </p>

                    <Link
                      href="/tuitions"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#087f6e] px-5 py-3 text-sm font-bold text-white hover:bg-[#066657]"
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
                            className="flex flex-col justify-between gap-3 rounded-xl border border-[#e3ebe8] p-4 sm:flex-row sm:items-center"
                          >
                            <div>
                              <h4 className="font-bold text-[#142c2b]">
                                {title}
                              </h4>

                              <p className="mt-1 text-xs text-[#82918c]">
                                {application.tutorName ||
                                  application.tuition?.tutorName ||
                                  "Tutor information unavailable"}
                              </p>

                              <p className="mt-1 text-xs text-[#82918c]">
                                {application.tuition?.subject || "Subject unavailable"}
                                {fee !== undefined && ` • ৳${fee}`}
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
                              className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
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

              <p className="mt-4 text-xs text-[#82918c]">
                Rejected Applications: {rejectedCount}
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
