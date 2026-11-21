"use client";

import type { ReactNode } from "react";
import { Toaster, toast } from "sonner";
import { useTheme } from "@/components/ThemeProvider";

export { toast };

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        theme={theme}
        toastOptions={{
          classNames: {
            toast: "!rounded-xl !border-[var(--border)] !font-medium",
          },
        }}
      />
    </>
  );
}

export function useToast() {
  const showToast = (message: string, type: ToastType = "success") => {
    switch (type) {
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      case "info":
        toast.info(message);
        break;
      case "loading":
        toast.loading(message);
        break;
      default:
        toast.success(message);
    }
  };

  return { showToast };
}
