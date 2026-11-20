
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const menuItems = [
  {
    label: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
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
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [hovered, setHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [adminImage, setAdminImage] = useState("");

  const isExpanded = hovered;

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("mentorlagbe-user");

      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAdminName(user.name || user.displayName || "Admin");
        setAdminImage(user.photoURL || user.image || user.photo || "");
      }
    } catch {
      setAdminName("Admin");
      setAdminImage("");
    }
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const token = localStorage.getItem("mentorlagbe-token");

    try {
      await fetch(`${API_URL}/api/auth/sign-out`, {
        method: "POST",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });
    } catch {
    } finally {
      localStorage.removeItem("mentorlagbe-token");
      localStorage.removeItem("mentorlagbe-user");
      window.dispatchEvent(new Event("auth-updated"));
      router.push("/sign-in");
    }
  };

  const SidebarContent = ({
    mobile = false,
  }: {
    mobile?: boolean;
  }) => (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div
        className={`flex h-20 shrink-0 items-center border-b border-slate-100 ${
          mobile || isExpanded
            ? "justify-start gap-3 px-5"
            : "justify-center"
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
          <GraduationCap size={25} strokeWidth={2.2} />
        </div>

        {(mobile || isExpanded) && (
          <div className="overflow-hidden whitespace-nowrap">
            <h2 className="text-lg font-extrabold tracking-tight text-slate-800">
              Mentor<span className="text-blue-600">Lagbe</span>
            </h2>
            <p className="text-[10px] font-semibold uppercase tracking-[2px] text-slate-400">
              Admin Panel
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-6">
        <p
          className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-400 ${
            mobile || isExpanded ? "" : "text-center"
          }`}
        >
          {mobile || isExpanded ? "Menu" : "• • •"}
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/admin" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!mobile && !isExpanded ? item.label : undefined}
              className={`group flex h-12 items-center rounded-xl transition-all duration-200 ${
                mobile || isExpanded
                  ? "gap-3 px-3"
                  : "justify-center px-2"
              } ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon
                size={21}
                strokeWidth={2}
                className={`shrink-0 transition-transform duration-200 ${
                  isActive
                    ? "text-blue-600"
                    : "group-hover:scale-110"
                }`}
              />

              {(mobile || isExpanded) && (
                <span
                  className={`whitespace-nowrap text-sm font-semibold ${
                    isActive ? "text-blue-700" : ""
                  }`}
                >
                  {item.label}
                </span>
              )}

              {isActive && (mobile || isExpanded) && (
                <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-100 p-3">
        <button
          onClick={handleLogout}
          title={!mobile && !isExpanded ? "Sign Out" : undefined}
          className={`flex h-12 w-full items-center rounded-xl text-red-500 transition-all hover:bg-red-50 ${
            mobile || isExpanded
              ? "gap-3 px-3"
              : "justify-center px-2"
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

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full bg-slate-50">
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative z-20 hidden shrink-0 transition-[width] duration-300 ease-in-out lg:block ${
          isExpanded ? "w-72" : "w-20"
        }`}
      >
        <div
          className={`sticky top-0 h-[calc(100vh-80px)] overflow-hidden border-r border-slate-200 bg-white shadow-sm transition-[width] duration-300 ${
            isExpanded ? "w-72" : "w-20"
          }`}
        >
          <SidebarContent />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
                Admin Dashboard
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Manage your platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-700">
                {adminName}
              </p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>

            {adminImage ? (
              <img
                src={adminImage}
                alt="Admin"
                className="h-10 w-10 rounded-full border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {adminName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="absolute bottom-0 left-0 top-20 w-72 max-w-[85vw] overflow-hidden bg-white shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
              <span className="text-sm font-bold text-slate-700">
                Admin Navigation
              </span>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close admin menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="h-[calc(100%-56px)]">
              <SidebarContent mobile />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
