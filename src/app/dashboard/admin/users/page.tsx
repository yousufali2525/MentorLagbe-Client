"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";

type AdminUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
  profileImage?: string;
  isActive?: boolean;
  createdAt?: string;
};

type UsersResponse = {
  success?: boolean;
  users?: AdminUser[];
  pagination?: { totalUsers?: number; currentPage?: number; totalPages?: number };
};

const PAGE_SIZE = 10;

function userId(user: AdminUser) {
  return user._id || user.id || "";
}

function statusStyle(active?: boolean) {
  return active === false
    ? "status-danger"
    : "status-success";
}

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const currentAdminId = currentAdmin?._id || currentAdmin?.id || "";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [localStatus, setLocalStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (role !== "all") params.set("role", role);

      const result = await apiFetch<UsersResponse>(
        `/api/admin/users?${params.toString()}`
      );

      setUsers(Array.isArray(result.users) ? result.users : []);
      setTotalPages(Math.max(1, result.pagination?.totalPages || 1));
      setTotalUsers(result.pagination?.totalUsers || 0);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to load users."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, role, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const visible = useMemo(() => {
    if (localStatus === "all") return users;
    return users.filter((user) =>
      localStatus === "active" ? user.isActive !== false : user.isActive === false
    );
  }, [users, localStatus]);

  async function changeStatus(user: AdminUser) {
    const id = userId(user);
    if (!id || id === currentAdminId) {
      toast.error("You cannot change your own account status.");
      return;
    }

    const nextActive = user.isActive === false;
    if (
      !window.confirm(
        `Are you sure you want to ${nextActive ? "activate" : "deactivate"} ${
          user.name || user.email || "this user"
        }?`
      )
    ) {
      return;
    }

    try {
      setUpdatingId(id);
      const result = await apiFetch<{ message?: string }>(
        `/api/admin/users/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: nextActive }),
        }
      );
      setUsers((previous) =>
        previous.map((item) =>
          userId(item) === id ? { ...item, isActive: nextActive } : item
        )
      );
      toast.success(result.message || "User status updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function changeRole(
    user: AdminUser,
    nextRole: "student" | "tutor" | "admin"
  ) {
    const id = userId(user);
    if (!id || id === currentAdminId) {
      toast.error("You cannot change your own role.");
      return;
    }
    if (user.role === nextRole) return;

    if (
      !window.confirm(
        `Change ${user.name || user.email || "this user"}'s role to ${nextRole}?`
      )
    ) {
      return;
    }

    try {
      setUpdatingId(id);
      const result = await apiFetch<{ message?: string }>(
        `/api/admin/users/${id}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: nextRole }),
        }
      );
      setUsers((previous) =>
        previous.map((item) =>
          userId(item) === id ? { ...item, role: nextRole } : item
        )
      );
      toast.success(result.message || "User role updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update role.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <Link href="/dashboard/admin" className="text-link">
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="mb-6 mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="section-title">Manage Users</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Search all accounts and manage account status or roles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            loadUsers();
            toast.info("Refreshing users...");
          }}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="card mb-6 grid gap-3 p-5 md:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name or email..."
            className="field-input pl-10"
          />
        </div>
        <select
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
          }}
          className="field-input"
        >
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={localStatus}
          onChange={(event) => setLocalStatus(event.target.value)}
          className="field-input"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <Users className="mx-auto text-[var(--primary)]" size={30} />
          <h2 className="mt-4 text-lg font-bold">No users found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            Try changing the search term or filters.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item, index) => {
                const id = userId(item);
                const isSelf = id === currentAdminId;
                return (
                  <tr key={id || index}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] font-bold text-[var(--primary)]">
                          {item.profileImage ? (
                            <img
                              src={item.profileImage}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            item.name?.charAt(0)?.toUpperCase() || "U"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--foreground)]">
                            {item.name || "Unnamed User"}
                          </p>
                          <p className="truncate text-xs">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {isSelf ? (
                        <span className="badge capitalize">
                          <ShieldCheck size={12} className="mr-1" />
                          {item.role || "admin"}
                        </span>
                      ) : (
                        <select
                          value={
                            ["student", "tutor", "admin"].includes(
                              item.role || ""
                            )
                              ? item.role
                              : "student"
                          }
                          onChange={(event) =>
                            changeRole(
                              item,
                              event.target.value as "student" | "tutor" | "admin"
                            )
                          }
                          disabled={updatingId !== null}
                          className="field-input min-w-[7rem] py-1.5 text-xs font-bold capitalize"
                        >
                          <option value="student">Student</option>
                          <option value="tutor">Tutor</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="capitalize">{item.plan || "free"}</td>
                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-BD")
                        : "Not available"}
                    </td>
                    <td>
                      <span className={`badge ${statusStyle(item.isActive)}`}>
                        {item.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => changeStatus(item)}
                        disabled={updatingId !== null || isSelf}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                          item.isActive === false
                            ? "status-success hover:opacity-90"
                            : "status-danger hover:opacity-90"
                        }`}
                      >
                        {item.isActive === false ? (
                          <UserCheck size={14} />
                        ) : (
                          <UserX size={14} />
                        )}
                        {updatingId === id
                          ? "Updating..."
                          : isSelf
                            ? "Your Account"
                            : item.isActive === false
                              ? "Activate"
                              : "Deactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalUsers > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            Page {page} of {totalPages} · {totalUsers} users
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page <= 1}
              className="btn-secondary"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={page >= totalPages}
              className="btn-secondary"
            >
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
