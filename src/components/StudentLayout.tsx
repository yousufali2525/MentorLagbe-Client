
"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  UserRound,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";

export default function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  const isExpanded = !collapsed || hovered;

  useEffect(() => {
    setMobileOpen(false);
    setHovered(false);
  }, [pathname]);

  const handleToggle = () => {
    setCollapsed((previous) => !previous);
    setHovered(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-in");
    router.refresh();
  };

  const menuItems = [
    {
      label: "Overview",
      href: "/dashboard/student",
      icon: LayoutDashboard,
    },
    {
      label: "My Applications",
      href: "/dashboard/student/my-applications",
      icon: FileText,
    },
    {
      label: "Browse Tuitions",
      href: "/tuitions",
      icon: BookOpen,
    },
    {
      label: "My Profile",
      href: "/dashboard/profile",
      icon: UserRound,
    },
  ];

  const pageTitle =
    pathname === "/dashboard/student"
      ? "Student Dashboard"
      : pathname.startsWith("/dashboard/student/my-applications")
        ? "My Applications"
        : pathname.startsWith("/dashboard/profile")
          ? "My Profile"
          : pathname.startsWith("/tuitions/")
            ? "Tuition Details"
            : pathname.startsWith("/tuitions")
              ? "Browse Tuitions"
              : pathname === "/pricing"
                ? "Pricing"
                : pathname === "/"
                  ? "Home"
                  : "Student Dashboard";

  const profileImage = user?.profileImage || user?.image || "";

  return (
    <div className="flex min-h-[calc(100vh-76px)] w-full items-stretch bg-[#f7faf8]">
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-x-0 bottom-0 top-[76px] z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed left-0 top-[76px] z-50 flex h-[calc(100dvh-76px)] flex-col border-r border-[#e3ebe8] bg-white shadow-xl transition-[width,transform] duration-300 ease-in-out lg:sticky lg:top-[76px] lg:z-20 lg:shadow-none ${
          isExpanded ? "lg:w-72" : "lg:w-24"
        } w-72 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[#e3ebe8] pl-4 pr-2">
          <Logo compact={!isExpanded} subtitle="Student Dashboard" />

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={handleToggle}
              className="hidden translate-x-1 rounded-lg p-2 text-[#647875] transition-colors hover:bg-[#e8f5f1] hover:text-[#087f6e] lg:flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen size={20} />
              ) : (
                <PanelLeftClose size={20} />
              )}
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-[#647875] transition hover:bg-[#f2f7f5] lg:hidden"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div
          className={`shrink-0 border-b border-[#e3ebe8] py-5 transition-all duration-300 ${
            isExpanded ? "px-5" : "px-3"
          }`}
        >
          <div
            className={`flex items-center gap-3 ${
              isExpanded ? "" : "justify-center"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#dceae5] bg-[#e8f5f1] font-bold text-[#087f6e]">
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

            {isExpanded && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#142c2b]">
                  {user?.name || "Student"}
                </p>
                <p className="truncate text-xs text-[#82918c]">
                  {user?.email || "Student Account"}
                </p>
                <span className="mt-1 inline-flex rounded-full bg-[#e8f5f1] px-2 py-0.5 text-[11px] font-bold capitalize text-[#087f6e]">
                  {user?.role || "student"}
                </span>
              </div>
            )}
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto p-4">
          {isExpanded && (
            <p className="whitespace-nowrap px-3 pb-2 text-xs font-bold uppercase tracking-wider text-[#9aa9a4]">
              Student Menu
            </p>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              item.href === "/dashboard/student"
                ? pathname === item.href
                : item.href === "/tuitions"
                  ? pathname.startsWith("/tuitions")
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!isExpanded ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                  isExpanded ? "" : "justify-center"
                } ${
                  active
                    ? "bg-[#e8f5f1] font-bold text-[#087f6e]"
                    : "font-medium text-[#647875] hover:bg-[#f2f7f5] hover:text-[#087f6e]"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {isExpanded && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-[#e3ebe8] p-4">
          <button
            onClick={handleLogout}
            title={!isExpanded ? "Sign Out" : undefined}
            className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 ${
              isExpanded ? "" : "justify-center"
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            {isExpanded && (
              <span className="whitespace-nowrap">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      <div className="min-h-[calc(100vh-76px)] min-w-0 flex-1">
        <header className="sticky top-[76px] z-30 flex h-20 items-center justify-between border-b border-[#e3ebe8] bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-[#647875] transition hover:bg-[#f2f7f5] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold text-[#142c2b] sm:text-xl">
                {pageTitle}
              </h1>
              <p className="hidden text-xs text-[#82918c] sm:block">
                Manage your learning journey
              </p>
            </div>
          </div>

          <Link
            href="/tuitions"
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#087f6e] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#066657] sm:px-4 sm:text-sm"
          >
            Find a Tutor
            <ArrowRight size={16} />
          </Link>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
