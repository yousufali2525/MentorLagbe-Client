import type { ReactNode } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout role="student">{children}</DashboardLayout>;
}
