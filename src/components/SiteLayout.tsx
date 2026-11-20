
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StudentLayout from "@/components/StudentLayout";
import TutorLayout from "@/components/TutorLayout";
import AdminLayout from "@/components/AdminLayout";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [userRole, setUserRole] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  const isAuthPage =
    pathname === "/sign-in" || pathname === "/sign-up";

  useEffect(() => {
    const checkUser = () => {
      const token = localStorage.getItem("mentorlagbe-token");
      const savedUser = localStorage.getItem("mentorlagbe-user");

      if (!token || !savedUser) {
        setUserRole("");
        setAuthChecked(true);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);
        const userData =
          parsedUser.user ||
          parsedUser.data?.user ||
          parsedUser;

        setUserRole(userData.role?.toLowerCase() || "");
      } catch {
        setUserRole("");
      }

      setAuthChecked(true);
    };

    checkUser();

    window.addEventListener("storage", checkUser);
    window.addEventListener("user-updated", checkUser);
    window.addEventListener("auth-updated", checkUser);
    window.addEventListener("focus", checkUser);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("user-updated", checkUser);
      window.removeEventListener("auth-updated", checkUser);
      window.removeEventListener("focus", checkUser);
    };
  }, []);

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  let dashboardContent = children;

  if (authChecked) {
    if (userRole === "student") {
      dashboardContent = (
        <StudentLayout>{children}</StudentLayout>
      );
    } else if (userRole === "tutor") {
      dashboardContent = (
        <TutorLayout>{children}</TutorLayout>
      );
    } else if (userRole === "admin") {
      dashboardContent = (
        <AdminLayout>{children}</AdminLayout>
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {dashboardContent}
      </main>

      <Footer />
    </div>
  );
}
