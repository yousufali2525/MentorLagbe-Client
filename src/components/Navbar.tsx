
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  GraduationCap,
  ChevronDown,
  LayoutDashboard,
  UserRound,
  LogOut,
} from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/#how-it-works" },
];

type UserData = {
  name?: string;
  email?: string;
  image?: string;
  imageUrl?: string;
  profileImage?: string;
  photoURL?: string;
  avatar?: string;
  role?: string;
};

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("mentorlagbe-token");
        const storedUser = localStorage.getItem("mentorlagbe-user");

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);

          const userData =
            parsedUser.user ||
            parsedUser.data?.user ||
            parsedUser;

          setUser(userData);
          setImageError(false);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("focus", loadUser);
    window.addEventListener("user-updated", loadUser);
    window.addEventListener("auth-updated", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("focus", loadUser);
      window.removeEventListener("user-updated", loadUser);
      window.removeEventListener("auth-updated", loadUser);
    };
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await fetch(
       `${process.env.NODE_ENV === "development" ? "http://localhost:5000" : ""}/api/auth/sign-out`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch {
      console.error("Sign out request failed");
    }

    localStorage.removeItem("mentorlagbe-token");
    localStorage.removeItem("mentorlagbe-user");

    setUser(null);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);

    router.push("/sign-in");
    router.refresh();
  };

  const profileImage =
    user?.profileImage ||
    user?.image ||
    user?.imageUrl ||
    user?.photoURL ||
    user?.avatar ||
    "";

  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const userRole = user?.role?.toLowerCase() || "student";

  const dashboardHref =
    userRole === "admin"
      ? "/dashboard/admin"
      : userRole === "tutor"
        ? "/dashboard/tutor"
        : "/dashboard/student";

  const showProfileImage = Boolean(profileImage) && !imageError;

  return (
    <header className="sticky top-0 z-50 border-b border-[#e3ebe8] bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087f6e] text-white">
            <GraduationCap size={27} strokeWidth={2.2} />
          </span>
          <span className="text-[23px] font-extrabold tracking-tight text-[#142c2b]">
            Mentor<span className="text-[#087f6e]">Lagbe</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : link.href.startsWith("/#")
                  ? false
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  active
                    ? "text-[#087f6e]"
                    : "text-[#526763] hover:text-[#087f6e]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {!loading && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-[#f0f7f4]"
              >
                {showProfileImage ? (
                  <img
                    src={profileImage}
                    alt={userName}
                    onError={() => setImageError(true)}
                    className="h-10 w-10 rounded-full border border-[#dce8e3] object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#087f6e] text-sm font-bold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}

                <span className="text-left">
                  <span className="block max-w-[120px] truncate text-sm font-bold text-[#142c2b]">
                    {userName}
                  </span>
                  <span className="block text-xs capitalize text-[#71817c]">
                    {userRole} Account
                  </span>
                </span>

                <ChevronDown size={16} className="text-[#526763]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#e3ebe8] bg-white p-2 shadow-xl">
                  <Link
                    href={dashboardHref}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#23413c] hover:bg-[#f0f7f4]"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#23413c] hover:bg-[#f0f7f4]"
                  >
                    <UserRound size={17} />
                    Update Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : !loading ? (
            <>
              <Link
                href="/sign-in"
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#23413c] transition hover:bg-[#f0f7f4]"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl bg-[#087f6e] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#066657]"
              >
                Get Started
              </Link>
            </>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#142c2b] hover:bg-[#e8f5f1] lg:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-[#e3ebe8] bg-white px-5 py-5 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                  pathname === link.href
                    ? "bg-[#e8f5f1] text-[#087f6e]"
                    : "text-[#526763] hover:bg-[#f5f8f7]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user ? (
              <div className="mt-3 border-t border-[#e3ebe8] pt-4">
                <div className="mb-3 flex items-center gap-3 px-3">
                  {showProfileImage ? (
                    <img
                      src={profileImage}
                      alt={userName}
                      onError={() => setImageError(true)}
                      className="h-11 w-11 rounded-full border border-[#dce8e3] object-cover"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#087f6e] font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div>
                    <p className="text-sm font-bold text-[#142c2b]">
                      {userName}
                    </p>
                    <p className="text-xs capitalize text-[#71817c]">
                      {userRole} Account
                    </p>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[#23413c] hover:bg-[#f0f7f4]"
                >
                  <LayoutDashboard size={17} />
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[#23413c] hover:bg-[#f0f7f4]"
                >
                  <UserRound size={17} />
                  Update Profile
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Sign Out
                </button>
              </div>
            ) : !loading ? (
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#e3ebe8] pt-4">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-[#dce8e3] px-4 py-3 text-center text-sm font-bold text-[#23413c]"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-[#087f6e] px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Get Started
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
