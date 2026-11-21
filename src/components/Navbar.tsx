"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { dashboardHrefForRole, normalizeRole } from "@/lib/roles";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/#how-it-works" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, status, signOut } = useAuth();
  const loading = status === "loading";

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    router.replace("/sign-in");
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
  const userRole = normalizeRole(user?.role) || "student";
  const dashboardHref = dashboardHrefForRole(userRole);
  const showProfileImage = Boolean(profileImage) && !imageError;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur-md">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <div onClick={() => setMobileMenuOpen(false)}>
          <Logo />
        </div>

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
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted)] hover:text-[var(--primary)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />

          {!loading && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-[var(--secondary)]"
              >
                {showProfileImage ? (
                  <img
                    src={profileImage}
                    alt={userName}
                    onError={() => setImageError(true)}
                    className="h-10 w-10 rounded-full border border-[var(--border)] object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}

                <span className="text-left">
                  <span className="block max-w-[120px] truncate text-sm font-bold text-[var(--foreground)]">
                    {userName}
                  </span>
                  <span className="mt-1 inline-flex rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[11px] font-bold capitalize text-[var(--primary)]">
                    {userRole}
                  </span>
                </span>

                <ChevronDown size={16} className="text-[var(--muted)]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
                  <Link
                    href={dashboardHref}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  >
                    <LayoutDashboard size={17} />
                    Dashboard
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  >
                    <UserRound size={17} />
                    Update Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[var(--danger)] hover:bg-red-50"
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
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--secondary)]"
              >
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary h-11 px-5">
                Sign Up
              </Link>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle compact />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)]"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-5 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                  pathname === link.href
                    ? "bg-[var(--secondary)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--background)]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!loading && user ? (
              <div className="mt-3 border-t border-[var(--border)] pt-4">
                <div className="mb-3 flex items-center gap-3 px-3">
                  {showProfileImage ? (
                    <img
                      src={profileImage}
                      alt={userName}
                      onError={() => setImageError(true)}
                      className="h-11 w-11 rounded-full border border-[var(--border)] object-cover"
                    />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div>
                    <p className="text-sm font-bold text-[var(--foreground)]">
                      {userName}
                    </p>
                    <span className="mt-1 inline-flex rounded-full bg-[var(--secondary)] px-2 py-0.5 text-[11px] font-bold capitalize text-[var(--primary)]">
                      {userRole}
                    </span>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)]"
                >
                  <LayoutDashboard size={17} />
                  Dashboard
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)]"
                >
                  <UserRound size={17} />
                  Update Profile
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-[var(--danger)] hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Sign Out
                </button>
              </div>
            ) : !loading ? (
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl border border-[var(--border)] px-4 py-3 text-center text-sm font-bold text-[var(--foreground)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary h-11 justify-center px-4"
                >
                  Sign Up
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
