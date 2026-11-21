"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import SessionLoader from "@/components/SessionLoader";
import { dashboardHrefForRole } from "@/lib/roles";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/sign-in?redirect=/dashboard");
      return;
    }

    if (status === "authenticated") {
      router.replace(dashboardHrefForRole(user?.role));
    }
  }, [status, user?.role, router]);

  return <SessionLoader label="Opening your dashboard..." />;
}
