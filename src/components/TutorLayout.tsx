
"use client";

import { useState, useEffect } from "react";
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
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard/tutor",
    icon: LayoutDashboard,
  },
  {
    name: "Post Tuition",
    href: "/dashboard/tutor/post-tuition",
    icon: Plus,
  },
  {
    name: "My Tuitions",
    href: "/dashboard/tutor/my-tuitions",
    icon: BookOpen,
  },
  {
    name: "Applicants",
    href: "/dashboard/tutor/applicants",
    icon: Users,
  },
  {
    name: "My Profile",
    href: "/dashboard/tutor/profile",
    icon: UserRound,
  },
];

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [userName, setUserName] = useState("Tutor");
  const [userImage, setUserImage] = useState("");

  const isExpanded = !collapsed || hovered;

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("mentorlagbe-user");

      if (!savedUser) return;

      try {
        const parsed = JSON.parse(savedUser);
        const user = parsed.user || parsed.data?.user || parsed;

        setUserName(user.name || "Tutor");
        setUserImage(user.profileImage || user.image || "");
      } catch {
        setUserName("Tutor");
      }
    };

    loadUser();

    window.addEventListener("user-updated", loadUser);

    return () => {
      window.removeEventListener("user-updated", loadUser);
    };
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("mentorlagbe-token");

    try {
      await fetch(
        `${process.env.NODE_ENV === "development" ? "http://localhost:5000" : ""}/api/auth/sign-out`,        {
          method: "POST",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );
    } catch {
    } finally {
      localStorage.removeItem("mentorlagbe-token");
      localStorage.removeItem("mentorlagbe-user");
      window.dispatchEvent(new Event("auth-updated"));
      router.push("/sign-in");
    }
  };

  const handleToggle = () => {
    setCollapsed(!collapsed);
    setHovered(false);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/tutor") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300 ${
          isExpanded ? "w-72" : "w-24"
        } ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
          <Link
            href="/dashboard/tutor"
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200">
              <GraduationCap size={25} />
            </div>

            {isExpanded && (
              <div className="whitespace-nowrap">
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                  Mentor<span className="text-blue-600">Lagbe</span>
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  Tutor Dashboard
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6">
          {isExpanded && (
            <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              Workspace
            </p>
          )}

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={!isExpanded ? item.name : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-slate-600 hover:translate-x-1 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  <Icon size={21} className="shrink-0" />

                  {isExpanded && (
                    <span className="whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={!isExpanded ? "Logout" : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={21} className="shrink-0" />
            {isExpanded && <span>Logout</span>}
          </button>

          <button
            type="button"
            onClick={handleToggle}
            className="mt-2 hidden w-full items-center justify-center rounded-xl border border-slate-200 py-2 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 lg:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={19} />
            ) : (
              <ChevronLeft size={19} />
            )}
          </button>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-all duration-300 ${
          isExpanded ? "lg:ml-72" : "lg:ml-24"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                {navigation.find((item) => item.href === pathname)?.name ||
                  "Tutor Dashboard"}
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Manage your tutoring activities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-800">
                {userName}
              </p>
              <p className="text-xs font-medium text-blue-600">Tutor</p>
            </div>

            {userImage ? (
              <img
                src={userImage}
                alt="Tutor profile"
                className="h-10 w-10 rounded-full border-2 border-blue-100 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
