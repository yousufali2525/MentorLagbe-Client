
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  UserRound,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Wallet,
  Clock3,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Tuition = {
  _id: string;
  title: string;
  subject: string;
  description: string;
  location: string;
  salary: number;
  category?: string;
  banner?: string;
  approvalStatus: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type User = {
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
  profileImage?: string;
  image?: string;
};

type TuitionForm = {
  title: string;
  subject: string;
  description: string;
  location: string;
  salary: string;
  category: string;
  banner: string;
};

const initialForm: TuitionForm = {
  title: "",
  subject: "",
  description: "",
  location: "",
  salary: "",
  category: "General",
  banner: "",
};

export default function TutorMyTuitionsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TuitionForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const pageSize = 6;

  const loadTuitions = useCallback(async () => {
    const token = localStorage.getItem("mentorlagbe-token");
    const savedUser = localStorage.getItem("mentorlagbe-user");

    if (!token || !savedUser) {
      router.replace("/sign-in");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser) as User;

      if (parsedUser.role?.toLowerCase() !== "tutor") {
        router.replace("/sign-in");
        return;
      }

      setUser(parsedUser);

      const response = await fetch(
        `${API_URL}/api/tuitions/my-tuitions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load your tuitions."
        );
      }

      setTuitions(
        Array.isArray(result.tuitions) ? result.tuitions : []
      );
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tuitions."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadTuitions();
  }, [loadTuitions]);

  const subjects = useMemo(
    () =>
      Array.from(
        new Set(
          tuitions
            .map((tuition) => tuition.subject)
            .filter(Boolean)
        )
      ),
    [tuitions]
  );

  const filteredTuitions = useMemo(() => {
    return tuitions.filter((tuition) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        tuition.title?.toLowerCase().includes(searchText) ||
        tuition.subject?.toLowerCase().includes(searchText) ||
        tuition.location?.toLowerCase().includes(searchText);

      const matchesSubject =
        subjectFilter === "all" ||
        tuition.subject === subjectFilter;

      const matchesStatus =
        statusFilter === "all" ||
        tuition.approvalStatus?.toLowerCase() === statusFilter;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [tuitions, search, subjectFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTuitions.length / pageSize)
  );

  const paginatedTuitions = filteredTuitions.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [search, subjectFilter, statusFilter]);

  const pendingCount = tuitions.filter(
    (item) => item.approvalStatus?.toLowerCase() === "pending"
  ).length;

  const approvedCount = tuitions.filter(
    (item) => item.approvalStatus?.toLowerCase() === "approved"
  ).length;

  const rejectedCount = tuitions.filter(
    (item) => item.approvalStatus?.toLowerCase() === "rejected"
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

  const startEditing = (tuition: Tuition) => {
    setEditingId(tuition._id);

    setForm({
      title: tuition.title || "",
      subject: tuition.subject || "",
      description: tuition.description || "",
      location: tuition.location || "",
      salary: String(tuition.salary ?? ""),
      category: tuition.category || "General",
      banner: tuition.banner || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleUpdate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingId) return;

    const token = localStorage.getItem("mentorlagbe-token");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    if (
      !form.title.trim() ||
      !form.subject.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      Number(form.salary) <= 0
    ) {
      setNotification("Please fill in all required fields correctly.");
      return;
    }

    try {
      setSaving(true);
      setNotification("");

      const response = await fetch(
        `${API_URL}/api/tuitions/${editingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            salary: Number(form.salary),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update tuition.");
      }

      setNotification(
        result.message || "Tuition updated and sent for approval."
      );

      cancelEditing();
      await loadTuitions();
    } catch (err) {
      setNotification(
        err instanceof Error
          ? err.message
          : "Unable to update tuition."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tuition? This action cannot be undone."
    );

    if (!confirmed) return;

    const token = localStorage.getItem("mentorlagbe-token");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    try {
      setDeletingId(id);
      setNotification("");

      const response = await fetch(
        `${API_URL}/api/tuitions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete tuition.");
      }

      setTuitions((previous) =>
        previous.filter((item) => item._id !== id)
      );

      if (editingId === id) {
        cancelEditing();
      }

      setNotification(
        result.message || "Tuition deleted successfully."
      );
    } catch (err) {
      setNotification(
        err instanceof Error
          ? err.message
          : "Unable to delete tuition."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const profileImage = user?.profileImage || user?.image || "";

  const stats = [
    {
      title: "Total Tuitions",
      value: tuitions.length,
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending Approval",
      value: pendingCount,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Approved Tuitions",
      value: approvedCount,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Rejected Tuitions",
      value: rejectedCount,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
  ];

  const statusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-50 text-green-700";
      case "rejected":
        return "bg-red-50 text-red-700";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

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
                  alt={user?.name || "Tutor"}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "T"
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#142c2b]">
                {user?.name || "Tutor"}
              </p>
              <span className="text-xs capitalize text-[#647875]">
                {user?.role || "Tutor"} Account
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-[#9aa9a4]">
            Dashboard
          </p>

          <Link
            href="/dashboard/tutor"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#647875] transition hover:bg-[#f2f7f5] hover:text-[#087f6e]"
          >
            <LayoutDashboard size={19} />
            Overview
          </Link>

          <Link
            href="/dashboard/tutor/my-tuitions"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl bg-[#e8f5f1] px-4 py-3 text-sm font-semibold text-[#087f6e]"
          >
            <BookOpen size={19} />
            My Tuitions
          </Link>

          <Link
            href="/dashboard/tutor/applicants"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#647875] transition hover:bg-[#f2f7f5] hover:text-[#087f6e]"
          >
            <Users size={19} />
            Applicants
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
                My Tuitions
              </h1>
              <p className="hidden text-xs text-[#82918c] sm:block">
                Manage your tuition posts
              </p>
            </div>
          </div>

          <Link
            href="/tuitions"
            className="flex items-center gap-2 rounded-xl bg-[#087f6e] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#066657] sm:px-4 sm:text-sm"
          >
            <Plus size={17} />
            Post a Tuition
          </Link>
        </header>

        <main className="p-4 sm:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#142c2b]">
                My Tuitions
              </h2>
              <p className="mt-2 text-sm text-[#647875]">
                View, edit and manage all your tuition posts.
              </p>
            </div>

            <button
              onClick={() => {
                setLoading(true);
                loadTuitions();
              }}
              className="flex items-center gap-2 rounded-xl border border-[#dce8e3] bg-white px-4 py-2.5 text-sm font-semibold text-[#647875] hover:bg-[#f2f7f5]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {notification && (
            <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-[#cce7dc] bg-[#effaf5] p-4 text-sm text-[#087f6e]">
              <p>{notification}</p>
              <button
                onClick={() => setNotification("")}
                aria-label="Dismiss notification"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

          {editingId && (
            <section className="mb-8 rounded-2xl border border-[#cce7dc] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-[#142c2b]">
                    Edit Tuition
                  </h3>
                  <p className="mt-1 text-sm text-[#82918c]">
                    Updated tuition will be submitted for admin approval.
                  </p>
                </div>

                <button
                  onClick={cancelEditing}
                  className="rounded-lg p-2 text-[#647875] hover:bg-[#f2f7f5]"
                  aria-label="Close edit form"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23413c]">
                      Tuition Title
                    </label>
                    <input
                      required
                      value={form.title}
                      onChange={(event) =>
                        setForm({ ...form, title: event.target.value })
                      }
                      className="w-full rounded-xl border border-[#dce8e3] px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
                      placeholder="Enter tuition title"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23413c]">
                      Subject
                    </label>
                    <input
                      required
                      value={form.subject}
                      onChange={(event) =>
                        setForm({ ...form, subject: event.target.value })
                      }
                      className="w-full rounded-xl border border-[#dce8e3] px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
                      placeholder="Enter subject"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23413c]">
                      Location
                    </label>
                    <input
                      required
                      value={form.location}
                      onChange={(event) =>
                        setForm({ ...form, location: event.target.value })
                      }
                      className="w-full rounded-xl border border-[#dce8e3] px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
                      placeholder="Enter location"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23413c]">
                      Monthly Salary (৳)
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={form.salary}
                      onChange={(event) =>
                        setForm({ ...form, salary: event.target.value })
                      }
                      className="w-full rounded-xl border border-[#dce8e3] px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
                      placeholder="Enter monthly salary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23413c]">
                      Category
                    </label>
                    <input
                      value={form.category}
                      onChange={(event) =>
                        setForm({ ...form, category: event.target.value })
                      }
                      className="w-full rounded-xl border border-[#dce8e3] px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
                      placeholder="General"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#23413c]">
                      Banner URL
                    </label>
                    <input
                      type="url"
                      value={form.banner}
                      onChange={(event) =>
                        setForm({ ...form, banner: event.target.value })
                      }
                      className="w-full rounded-xl border border-[#dce8e3] px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#23413c]">
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    className="w-full resize-y rounded-xl border border-[#dce8e3] px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
                    placeholder="Describe the tuition requirements..."
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[#087f6e] px-5 py-3 text-sm font-bold text-white hover:bg-[#066657] disabled:opacity-60"
                  >
                    {saving ? (
                      <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {saving ? "Updating..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-xl border border-[#dce8e3] px-5 py-3 text-sm font-semibold text-[#647875] hover:bg-[#f2f7f5]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="rounded-2xl border border-[#e3ebe8] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-[#142c2b]">
                All Tuition Posts
              </h3>
              <p className="mt-1 text-sm text-[#82918c]">
                Search and filter your tuition posts.
              </p>
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-3">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#82918c]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tuition..."
                  className="w-full rounded-xl border border-[#dce8e3] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#087f6e]"
                />
              </div>

              <select
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
                className="rounded-xl border border-[#dce8e3] px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
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
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-[#dce8e3] px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <LoaderCircle
                  size={35}
                  className="animate-spin text-[#087f6e]"
                />
              </div>
            ) : paginatedTuitions.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5f1] text-[#087f6e]">
                  <BookOpen size={30} />
                </div>

                <h4 className="mt-4 font-bold text-[#142c2b]">
                  {tuitions.length === 0
                    ? "No tuitions posted yet"
                    : "No matching tuitions found"}
                </h4>

                <p className="mt-2 text-sm text-[#82918c]">
                  {tuitions.length === 0
                    ? "Create your first tuition post to get started."
                    : "Try changing your search or filters."}
                </p>

                {tuitions.length === 0 && (
                  <Link
                    href="/tuitions"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#087f6e] px-5 py-3 text-sm font-bold text-white hover:bg-[#066657]"
                  >
                    <Plus size={17} />
                    Post a Tuition
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedTuitions.map((tuition) => (
                  <div
                    key={tuition._id}
                    className="rounded-xl border border-[#e3ebe8] p-4 transition hover:border-[#b8d8cd] sm:p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-[#142c2b]">
                            {tuition.title}
                          </h4>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyle(
                              tuition.approvalStatus
                            )}`}
                          >
                            {tuition.approvalStatus || "pending"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-medium text-[#087f6e]">
                          {tuition.subject}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-[#647875]">
                          {tuition.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#82918c]">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={15} />
                            {tuition.location}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Wallet size={15} />
                            ৳{Number(tuition.salary).toLocaleString("en-BD")} / month
                          </span>

                          <span className="flex items-center gap-1.5">
                            <BookOpen size={15} />
                            {tuition.category || "General"}
                          </span>

                          {tuition.createdAt && (
                            <span className="flex items-center gap-1.5">
                              <Clock3 size={15} />
                              {new Date(
                                tuition.createdAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2 lg:flex-col">
                        <button
                          onClick={() => startEditing(tuition)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#cce7dc] px-4 py-2.5 text-xs font-bold text-[#087f6e] transition hover:bg-[#e8f5f1] lg:flex-none"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(tuition._id)}
                          disabled={deletingId === tuition._id}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 lg:flex-none"
                        >
                          {deletingId === tuition._id ? (
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={15} />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredTuitions.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e3ebe8] pt-5">
                <p className="text-sm text-[#82918c]">
                  Showing{" "}
                  {(page - 1) * pageSize + 1}–{" "}
                  {Math.min(page * pageSize, filteredTuitions.length)} of{" "}
                  {filteredTuitions.length} tuitions
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page === 1}
                    className="rounded-lg border border-[#dce8e3] p-2 text-[#647875] hover:bg-[#f2f7f5] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ArrowLeft size={17} />
                  </button>

                  <span className="px-2 text-sm font-semibold text-[#647875]">
                    {page} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page === totalPages}
                    className="rounded-lg border border-[#dce8e3] p-2 text-[#647875] hover:bg-[#f2f7f5] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ArrowLeft
                      size={17}
                      className="rotate-180"
                    />
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
