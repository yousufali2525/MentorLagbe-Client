
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";
const ITEMS_PER_PAGE = 10;

type User = {
  _id: string;
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
  isActive?: boolean;
  plan?: string;
  createdAt?: string;
};

type Pagination = {
  totalUsers: number;
  currentPage: number;
  totalPages: number;
};

export default function ManageUsersPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminName] = useState("Administrator");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [roleUpdatingId, setRoleUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    totalUsers: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("mentorlagbe-token");

      if (!token) {
        router.replace("/sign-in");
        return;
      }

      const profileResponse = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileResult = await profileResponse.json();

      if (!profileResponse.ok || !profileResult.success) {
        router.replace("/sign-in");
        return;
      }

      const currentUser = profileResult.user;

      if (currentUser?.role !== "admin") {
        if (currentUser?.role === "student") {
          router.replace("/dashboard");
        } else if (currentUser?.role === "tutor") {
          router.replace("/dashboard/tutor");
        } else {
          router.replace("/sign-in");
        }
        return;
      }

      setAdminId(currentUser._id);
      setAdminName(currentUser.name || "Administrator");

      const query = new URLSearchParams({
        page: "1",
        limit: "50",
      });

      if (search.trim()) {
        query.set("search", search.trim());
      }

      if (roleFilter !== "all") {
        query.set("role", roleFilter);
      }

      const firstResponse = await fetch(
        `${API_URL}/api/admin/users?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const firstResult = await firstResponse.json();

      if (!firstResponse.ok || !firstResult.success) {
        throw new Error(firstResult.message || "Unable to load users.");
      }

      let allUsers: User[] = firstResult.users || [];
      const totalPages = firstResult.pagination?.totalPages || 1;

      for (let page = 2; page <= totalPages; page++) {
        const pageQuery = new URLSearchParams(query);
        pageQuery.set("page", String(page));

        const response = await fetch(
          `${API_URL}/api/admin/users?${pageQuery.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load all users.");
        }

        allUsers = [...allUsers, ...(result.users || [])];
      }

      setUsers(allUsers);

      setPagination({
        totalUsers: allUsers.length,
        currentPage: 1,
        totalPages: Math.max(
          1,
          Math.ceil(allUsers.length / ITEMS_PER_PAGE)
        ),
      });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Something went wrong.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [router, search, roleFilter, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, search ? 400 : 0);

    return () => clearTimeout(timer);
  }, [loadUsers, search]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (statusFilter === "active" && user.isActive === false) {
        return false;
      }

      if (statusFilter === "inactive" && user.isActive !== false) {
        return false;
      }

      return true;
    });
  }, [users, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    setPagination({
      totalUsers: filteredUsers.length,
      currentPage,
      totalPages,
    });
  }, [filteredUsers.length, currentPage, totalPages]);

  const handleStatusChange = async (user: User) => {
    if (user._id === adminId) {
      showToast("You cannot deactivate your own account.", "error");
      return;
    }

    const nextStatus = user.isActive === false;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus ? "activate" : "deactivate"
      } ${user.name}'s account?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(user._id);

      const token = localStorage.getItem("mentorlagbe-token");

      if (!token) {
        router.replace("/sign-in");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/users/${user._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: nextStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update user status.");
      }

      setUsers((previous) =>
        previous.map((item) =>
          item._id === user._id
            ? { ...item, isActive: nextStatus }
            : item
        )
      );

      showToast(
        result.message ||
          `${user.name}'s account has been ${
            nextStatus ? "activated" : "deactivated"
          }.`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to update account.",
        "error"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleRoleChange = async (
    user: User,
    newRole: "student" | "tutor"
  ) => {
    if (user._id === adminId || user.role === "admin") {
      showToast("Admin roles cannot be changed.", "error");
      return;
    }

    if (user.role === newRole) return;

    const confirmed = window.confirm(
      `Are you sure you want to change ${user.name}'s role from ${user.role} to ${newRole}?`
    );

    if (!confirmed) return;

    try {
      setRoleUpdatingId(user._id);

      const token = localStorage.getItem("mentorlagbe-token");

      if (!token) {
        router.replace("/sign-in");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/admin/users/${user._id}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update user role.");
      }

      setUsers((previous) =>
        previous.map((item) =>
          item._id === user._id
            ? { ...item, role: newRole }
            : item
        )
      );

      showToast(
        result.message || `${user.name}'s role updated to ${newRole}.`,
        "success"
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Unable to update user role.",
        "error"
      );
    } finally {
      setRoleUpdatingId("");
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: "â™™",
      color: "bg-[#e7f3ef] text-[#087f6e]",
    },
    {
      label: "Students",
      value: users.filter((user) => user.role === "student").length,
      icon: "S",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Tutors",
      value: users.filter((user) => user.role === "tutor").length,
      icon: "T",
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Inactive Accounts",
      value: users.filter((user) => user.isActive === false).length,
      icon: "!",
      color: "bg-red-50 text-red-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f5f8f7]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dce9e5] border-t-[#087f6e]" />
          <p className="mt-4 text-sm font-medium text-[#647875]">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8f7] text-[#142c2b]">
      <header className="sticky top-0 z-20 border-b border-[#e3ebe8] bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold sm:text-xl">
              Manage Users
            </h1>
            <p className="mt-1 text-xs text-[#647875] sm:text-sm">
              Manage all student and tutor accounts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-[#647875] sm:block">
              {adminName}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9eee7] font-bold text-[#087f6e]">
              {adminName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="mb-7">
          <Link
            href="/dashboard/admin"
            className="text-sm font-semibold text-[#087f6e] hover:underline"
          >
            â† Back to Dashboard
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                User Management
              </h2>
              <p className="mt-2 text-sm text-[#647875]">
                View, search, filter and manage platform accounts.
              </p>
            </div>

            <button
              onClick={loadUsers}
              disabled={loading}
              className="w-fit rounded-xl border border-[#dce9e5] bg-white px-5 py-3 text-sm font-semibold text-[#087f6e] transition hover:bg-[#e7f3ef] disabled:opacity-50"
            >
              â†» Refresh Users
            </button>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#e3ebe8] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#647875]">
                  {stat.label}
                </p>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${stat.color}`}
                >
                  {stat.icon}
                </span>
              </div>
              <h3 className="mt-4 text-3xl font-extrabold">
                {stat.value}
              </h3>
            </div>
          ))}
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-[#e3ebe8] bg-white shadow-sm">
          <div className="border-b border-[#e3ebe8] p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-lg font-bold">All Users</h3>
                <p className="mt-1 text-sm text-[#647875]">
                  {filteredUsers.length} users found
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:flex">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name or email..."
                  className="w-full rounded-xl border border-[#dce9e5] bg-[#fbfdfc] px-4 py-3 text-sm outline-none transition focus:border-[#087f6e] lg:w-64"
                />

                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="rounded-xl border border-[#dce9e5] bg-white px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-[#dce9e5] bg-white px-4 py-3 text-sm outline-none focus:border-[#087f6e]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[#f7faf9]">
                <tr className="text-xs uppercase tracking-wide text-[#647875]">
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Plan</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf2ef]">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="transition hover:bg-[#fbfdfc]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e7f3ef] font-bold text-[#087f6e]">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-sm font-bold">
                            {user.name || "Unnamed User"}
                          </p>
                          <p className="max-w-[220px] truncate text-xs text-[#647875]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {user.role === "admin" || user._id === adminId ? (
                        <span className="rounded-full bg-[#f0f4f2] px-3 py-1.5 text-xs font-bold capitalize text-[#526762]">
                          {user.role}
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(event) =>
                            handleRoleChange(
                              user,
                              event.target.value as "student" | "tutor"
                            )
                          }
                          disabled={roleUpdatingId === user._id}
                          className="rounded-lg border border-[#dce9e5] bg-white px-3 py-2 text-xs font-bold capitalize text-[#526762] outline-none focus:border-[#087f6e] disabled:cursor-wait disabled:opacity-50"
                        >
                          <option value="student">Student</option>
                          <option value="tutor">Tutor</option>
                        </select>
                      )}
                      {roleUpdatingId === user._id && (
                        <p className="mt-1 text-xs text-[#087f6e]">
                          Updating role...
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium capitalize text-[#647875]">
                      {user.plan || "Free"}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#647875]">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                          user.isActive === false
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.isActive === false
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        />
                        {user.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleStatusChange(user)}
                        disabled={
                          updatingId === user._id || user._id === adminId
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          user.isActive === false
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {updatingId === user._id
                          ? "Updating..."
                          : user._id === adminId
                            ? "Your Account"
                            : user.isActive === false
                              ? "Activate"
                              : "Deactivate"}
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-4xl text-[#94a5a0]">â™™</div>
                      <h4 className="mt-3 font-bold">No users found</h4>
                      <p className="mt-2 text-sm text-[#647875]">
                        Try changing your search or filter settings.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-4 border-t border-[#e3ebe8] px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-sm text-[#647875]">
              Showing{" "}
              {filteredUsers.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              {" - "}
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredUsers.length
              )}
              {" of "}
              {filteredUsers.length} users
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                disabled={currentPage === 1}
                className="rounded-lg border border-[#dce9e5] px-4 py-2 text-sm font-semibold text-[#647875] transition hover:bg-[#f5f8f7] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="px-2 text-sm font-semibold">
                {currentPage} / {pagination.totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-[#dce9e5] px-4 py-2 text-sm font-semibold text-[#647875] transition hover:bg-[#f5f8f7] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-[#94a5a0]">
          Â© {new Date().getFullYear()} MentorLagbe. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
