"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserRound,
  LogOut,
  Menu,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";

const navigation = [
  { name: "Overview", href: "/dashboard/tutor", icon: LayoutDashboard },
  { name: "Post Tuition", href: "/dashboard/tutor/post-tuition", icon: Plus },
  { name: "My Tuitions", href: "/dashboard/tutor/my-tuitions", icon: BookOpen },
  { name: "Applicants", href: "/dashboard/tutor/applicants", icon: Users },
  { name: "My Profile", href: "/dashboard/profile", icon: UserRound },
];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  const isExpanded = !collapsed || hovered;
  const userName = user?.name || user?.email?.split("@")[0] || "Tutor";
  const userImage = user?.profileImage || user?.image || "";

  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-in");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/dashboard/tutor"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-[calc(100vh-76px)] w-full items-stretch bg-[var(--background)]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-x-0 bottom-0 top-[76px] z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed left-0 top-[76px] z-50 flex h-[calc(100dvh-76px)] flex-col border-r border-[var(--border)] bg-white shadow-xl transition-[width,transform] duration-300 lg:sticky lg:top-[76px] lg:z-20 lg:shadow-none ${
          isExpanded ? "w-72" : "w-24"
        } w-72 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--border)] pl-4 pr-2">
          <Logo compact={!isExpanded} subtitle="Tutor Dashboard" />

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--secondary)] lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto p-4">
          {isExpanded && (
            <p className="whitespace-nowrap px-3 pb-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Workspace
            </p>
          )}

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                title={!isExpanded ? item.name : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                  isExpanded ? "" : "justify-center"
                } ${
                  active
                    ? "bg-[var(--primary)] font-bold text-white shadow-sm"
                    : "font-medium text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--primary)]"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[var(--border)] p-3">
          <button
            type="button"
            onClick={() => {
              setCollapsed(!collapsed);
              setHovered(false);
            }}
            className="mb-2 hidden w-full items-center justify-center rounded-xl border border-[var(--border)] py-2 text-[var(--muted)] transition hover:bg-[var(--secondary)] hover:text-[var(--primary)] lg:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title={!isExpanded ? "Sign Out" : undefined}
            className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 ${
              isExpanded ? "" : "justify-center"
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            {isExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="min-h-[calc(100vh-76px)] min-w-0 flex-1">
        <header className="sticky top-[76px] z-30 flex h-20 items-center justify-between border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--secondary)] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">
                {navigation.find((item) => item.href === pathname)?.name ||
                  "Tutor Dashboard"}
              </h1>
              <p className="hidden text-xs text-[var(--muted)] sm:block">
                Manage your tutoring activities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[var(--foreground)]">{userName}</p>
              <span className="inline-flex rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[11px] font-bold capitalize text-[var(--primary)]">
                tutor
              </span>
            </div>

            {userImage ? (
              <img
                src={userImage}
                alt="Tutor profile"
                className="h-10 w-10 rounded-full border border-[var(--border)] object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary)] font-bold text-[var(--primary)]">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
