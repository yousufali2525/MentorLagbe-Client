export type Role = "student" | "tutor" | "admin";

export function normalizeRole(role?: string | null): Role | null {
  const value = role?.toLowerCase();
  return value === "student" || value === "tutor" || value === "admin"
    ? value
    : null;
}

export function dashboardHrefForRole(role?: string | null): string {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "/dashboard/admin";
  if (normalized === "tutor") return "/dashboard/tutor";
  return "/dashboard/student";
}
