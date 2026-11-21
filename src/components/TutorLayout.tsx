import type { ReactNode } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function TutorLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout role="tutor">{children}</DashboardLayout>;
}
