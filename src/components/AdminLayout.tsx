"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";

const menuItems = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Manage Tuitions", href: "/dashboard/admin/tuitions", icon: BookOpen },
  { label: "Transactions", href: "/dashboard/admin/transactions", icon: CreditCard },
];

function SidebarContent({
  mobile = false,
  isExpanded,
  pathname,
  onNavigate,
  onLogout,
}: {
  mobile?: boolean;
  isExpanded: boolean;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--surface)]">
      <div
        className={`flex h-20 shrink-0 items-center border-b border-[var(--border)] ${
          mobile || isExpanded ? "justify-start gap-3 px-5" : "justify-center"
        }`}
      >
        {mobile || isExpanded ? (
          <Logo subtitle="Admin Panel" />
        ) : (
          <Logo compact />
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
        <p
          className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-[var(--muted)] ${
            mobile || isExpanded ? "" : "text-center"
          }`}
        >
          {mobile || isExpanded ? "Menu" : "• • •"}
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!mobile && !isExpanded ? item.label : undefined}
              onClick={onNavigate}
              className={`group flex h-12 items-center rounded-xl transition-all duration-200 ${
                mobile || isExpanded ? "gap-3 px-3" : "justify-center px-2"
              } ${
                isActive
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--primary)]"
              }`}
            >
              <Icon size={21} strokeWidth={2} className="shrink-0" />
              {(mobile || isExpanded) && (
                <span className="whitespace-nowrap text-sm font-semibold">
                  {item.label}
                </span>
              )}
              {isActive && (mobile || isExpanded) && (
                <span className="ml-auto h-2 w-2 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[var(--border)] p-3">
        <button
          type="button"
          onClick={onLogout}
          title={!mobile && !isExpanded ? "Sign Out" : undefined}
          className={`flex h-12 w-full items-center rounded-xl text-red-600 transition-all hover:bg-red-50 ${
            mobile || isExpanded ? "gap-3 px-3" : "justify-center px-2"
          }`}
        >
          <LogOut size={21} className="shrink-0" />
          {(mobile || isExpanded) && (
            <span className="whitespace-nowrap text-sm font-semibold">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [hovered, setHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isExpanded = hovered;
  const adminName = user?.name || user?.email?.split("@")[0] || "Admin";
  const adminImage = user?.profileImage || user?.image || "";

  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <div className="flex min-h-[calc(100vh-76px)] w-full bg-[var(--background)]">
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative z-20 hidden shrink-0 transition-[width] duration-300 lg:block ${
          isExpanded ? "w-72" : "w-20"
        }`}
      >
        <div
          className={`sticky top-[76px] h-[calc(100vh-76px)] overflow-hidden border-r border-[var(--border)] bg-[var(--surface)] shadow-sm transition-[width] duration-300 ${
            isExpanded ? "w-72" : "w-20"
          }`}
        >
          <SidebarContent
            isExpanded={isExpanded}
            pathname={pathname}
            onNavigate={() => setMobileMenuOpen(false)}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-[76px] z-30 flex h-20 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--secondary)] lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-extrabold text-[var(--foreground)] sm:text-xl">
                Admin Dashboard
              </h1>
              <p className="hidden text-xs text-[var(--muted)] sm:block">
                Manage your platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[var(--foreground)]">
                {adminName}
              </p>
              <span className="inline-flex rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[11px] font-bold capitalize text-[var(--primary)]">
                admin
              </span>
            </div>

            {adminImage ? (
              <img
                src={adminImage}
                alt="Admin"
                className="h-10 w-10 rounded-full border border-[var(--border)] object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary)] text-sm font-bold text-[var(--primary)]">
                {adminName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="absolute bottom-0 left-0 top-[76px] w-72 max-w-[85vw] overflow-hidden bg-[var(--surface)] shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
              <span className="text-sm font-bold text-[var(--foreground)]">
                Admin Navigation
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--secondary)]"
                aria-label="Close admin menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="h-[calc(100%-56px)]">
              <SidebarContent
                mobile
                isExpanded={isExpanded}
                pathname={pathname}
                onNavigate={() => setMobileMenuOpen(false)}
                onLogout={handleLogout}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
