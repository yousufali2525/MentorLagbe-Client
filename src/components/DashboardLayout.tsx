"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { dashboardHrefForRole, type Role } from "@/lib/roles";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

type DashboardMeta = {
  label: string;
  menuLabel: string;
  subtitle: string;
};

const NAV_ITEMS: Record<Role, NavItem[]> = {
  tutor: [
    {
      label: "Overview",
      href: "/dashboard/tutor",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Post Tuition",
      href: "/dashboard/tutor/post-tuition",
      icon: Plus,
    },
    {
      label: "My Tuitions",
      href: "/dashboard/tutor/my-tuitions",
      icon: BookOpen,
    },
    {
      label: "Applicants",
      href: "/dashboard/tutor/applicants",
      icon: Users,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
  ],
  student: [
    {
      label: "Overview",
      href: "/dashboard/student",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "My Applications",
      href: "/dashboard/student/my-applications",
      icon: FileText,
    },
    {
      label: "Browse Tuitions",
      href: "/dashboard/student/browse",
      icon: BookOpen,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
  ],
  admin: [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      label: "Manage Tuitions",
      href: "/dashboard/admin/tuitions",
      icon: BookOpen,
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: CreditCard,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
  ],
};

const META: Record<Role, DashboardMeta> = {
  tutor: {
    label: "Tutor Dashboard",
    menuLabel: "Tutor Workspace",
    subtitle: "Manage your tutoring activities",
  },
  student: {
    label: "Student Dashboard",
    menuLabel: "Student Workspace",
    subtitle: "Manage your learning journey",
  },
  admin: {
    label: "Admin Dashboard",
    menuLabel: "Admin Workspace",
    subtitle: "Monitor and manage the platform",
  },
};

function isItemActive(item: NavItem, pathname: string) {
  if (item.exact) return pathname === item.href;
  if (item.href === "/dashboard/profile") {
    return (
      pathname === item.href ||
      /^\/dashboard\/(tutor|student|admin)\/profile$/.test(pathname)
    );
  }
  if (item.href === "/dashboard/student/my-applications") {
    return (
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`) ||
      pathname === "/dashboard/applications"
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function UserAvatar({
  name,
  src,
  className = "h-10 w-10",
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--secondary)] font-extrabold text-[var(--primary)] ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase() || "U"
      )}
    </span>
  );
}

function Sidebar({
  role,
  navItems,
  pathname,
  showLabels,
  mobile = false,
  displayName,
  email,
  avatar,
  roleLabel,
  planLabel,
  onNavigate,
  onClose,
  onLogout,
}: {
  role: Role;
  navItems: NavItem[];
  pathname: string;
  showLabels: boolean;
  mobile?: boolean;
  displayName: string;
  email: string;
  avatar?: string;
  roleLabel: string;
  planLabel: string;
  onNavigate: () => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  const meta = META[role];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--surface)]">
      <div
        className={`flex h-[72px] shrink-0 items-center border-b border-[var(--border)] ${
          showLabels ? "justify-between gap-2 px-5" : "justify-center px-3"
        }`}
      >
        <div className="min-w-0" title={!showLabels ? "MentorLagbe" : undefined}>
          <Logo
            href={dashboardHrefForRole(role)}
            compact={!showLabels}
            subtitle={meta.menuLabel}
          />
        </div>

        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--secondary)] hover:text-[var(--primary)]"
          >
            <X size={20} />
          </button>
        ) : null}
      </div>

      <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-5">
        {showLabels ? (
          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--muted)]">
            {meta.menuLabel}
          </p>
        ) : null}

        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item, pathname);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={!showLabels ? item.label : undefined}
                  className={`group relative flex h-11 items-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                    showLabels ? "gap-3 px-3" : "justify-center px-0"
                  } ${
                    active
                      ? "bg-[var(--primary)] text-[var(--surface)] shadow-sm"
                      : "text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--primary)]"
                  }`}
                >
                  <Icon size={20} className="shrink-0" strokeWidth={2.1} />
                  {showLabels ? (
                    <span className="truncate">{item.label}</span>
                  ) : null}
                  {active && showLabels ? (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
                  ) : null}
                  {!showLabels ? (
                    <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[60] -translate-y-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {item.label}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={`shrink-0 border-t border-[var(--border)] ${
          showLabels ? "p-4" : "p-3"
        }`}
      >
        <div
          className={`flex items-center ${showLabels ? "gap-3" : "justify-center"}`}
          title={!showLabels ? `${displayName} · ${planLabel}` : undefined}
        >
          <UserAvatar name={displayName} src={avatar} />

          {showLabels ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">{displayName}</p>
              <p className="truncate text-[11px] text-[var(--muted)]">{email}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="badge">{roleLabel}</span>
                <span
                  className={`badge ${
                    planLabel === "Pro"
                      ? "bg-[var(--primary)] text-[var(--surface)]"
                      : ""
                  }`}
                >
                  {planLabel}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onLogout}
          title={!showLabels ? "Sign Out" : undefined}
          className={`group relative mt-3 flex h-11 w-full items-center rounded-xl text-sm font-semibold text-[var(--danger)] transition hover-danger-soft ${
            showLabels ? "gap-3 px-3" : "justify-center px-0"
          }`}
        >
          <LogOut size={19} className="shrink-0" />
          {showLabels ? <span>Sign Out</span> : null}
          {!showLabels ? (
            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[60] -translate-y-1/2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Sign Out
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = NAV_ITEMS[role];
  const meta = META[role];

  const activeItem = useMemo(
    () => navItems.find((item) => isItemActive(item, pathname)),
    [navItems, pathname]
  );

  const displayName =
    user?.name || user?.email?.split("@")[0] || titleCase(role) || "User";
  const email = user?.email || `${role}@mentorlagbe.com`;
  const avatar = user?.profileImage || user?.image || "";
  const roleLabel = titleCase(role);
  const planLabel =
    user?.plan?.toLowerCase() === "pro" ? "Pro" : "Free";

  const handleLogout = useCallback(async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await signOut();
    router.replace("/sign-in");
    router.refresh();
  }, [router, signOut]);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const pageTitle = activeItem?.label || meta.label;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden h-screen border-r border-[var(--border)] shadow-sm transition-[width] duration-300 ease-in-out lg:flex ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        <Sidebar
          role={role}
          navItems={navItems}
          pathname={pathname}
          showLabels={!collapsed}
          displayName={displayName}
          email={email}
          avatar={avatar}
          roleLabel={roleLabel}
          planLabel={planLabel}
          onNavigate={() => undefined}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[min(20rem,85vw)] border-r border-[var(--border)] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          role={role}
          navItems={navItems}
          pathname={pathname}
          showLabels
          mobile
          displayName={displayName}
          email={email}
          avatar={avatar}
          roleLabel={roleLabel}
          planLabel={planLabel}
          onNavigate={() => setMobileOpen(false)}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </aside>

      <div
        className={`flex min-h-screen min-w-0 flex-col transition-[padding] duration-300 ease-in-out ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] lg:hidden"
            >
              <Menu size={20} />
            </button>

            <button
              type="button"
              onClick={() => setCollapsed((previous) => !previous)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] lg:inline-flex"
            >
              {collapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )}
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold sm:text-base">
                {pageTitle}
              </p>
              <p className="hidden truncate text-xs text-[var(--muted)] sm:block">
                {meta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle compact />

            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((previous) => !previous)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label="Open account menu"
                className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 transition hover:border-[var(--border)] hover:bg-[var(--secondary)]"
              >
                <UserAvatar
                  name={displayName}
                  src={avatar}
                  className="h-9 w-9"
                />
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[140px] truncate text-xs font-extrabold">
                    {displayName}
                  </span>
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
                    {roleLabel}
                  </span>
                </span>
                <ChevronDown
                  size={15}
                  className="hidden text-[var(--muted)] sm:block"
                />
              </button>

              {userMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
                >
                  <div className="border-b border-[var(--border)] px-4 py-3">
                    <p className="truncate text-sm font-extrabold">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {email}
                    </p>
                  </div>
                  <Link
                    role="menuitem"
                    href="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--secondary)] hover:text-[var(--primary)]"
                  >
                    <UserRound size={17} />
                    Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[var(--danger)] transition hover-danger-soft"
                  >
                    <LogOut size={17} />
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
