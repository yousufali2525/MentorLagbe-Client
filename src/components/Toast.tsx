
"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
};

export default function Toast({
  message,
  type = "success",
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-[var(--success)] text-[var(--success-foreground)]",
    error: "bg-[var(--danger)] text-[var(--danger-foreground)]",
    info: "bg-[var(--info)] text-[var(--info-foreground)]",
  };

  return (
    <div className="fixed right-5 top-5 z-[9999]">
      <div
        role="alert"
        className={`${styles[type]} flex min-w-[260px] items-center justify-between gap-4 rounded-lg px-5 py-4 shadow-lg`}
      >
        <p className="text-sm font-medium">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className="text-xl font-bold"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
