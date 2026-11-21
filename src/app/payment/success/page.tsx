"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import { dashboardHrefForRole, normalizeRole } from "@/lib/roles";

type VerifyResponse = {
  success?: boolean;
  plan?: string;
  message?: string;
};

type VerifyStatus = "loading" | "verified" | "error" | "no-session";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { status: authStatus, user, refreshUser } = useAuth();
  const hasUser = Boolean(user);

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [failure, setFailure] = useState("");
  const toastShown = useRef(false);

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!sessionId) {
      setStatus("no-session");
      if (!toastShown.current) {
        toast.error("No Stripe session was found in the return URL.");
        toastShown.current = true;
      }
      return;
    }

    if (!hasUser) {
      setStatus("error");
      setFailure("Please sign in with the account you used for checkout.");
      if (!toastShown.current) {
        toast.error("Sign in to verify your payment and update your plan.");
        toastShown.current = true;
      }
      return;
    }

    let cancelled = false;

    async function verify() {
      setStatus("loading");
      setFailure("");

      try {
        const result = await apiFetch<VerifyResponse>(
          `/api/payments/verify-session?session_id=${encodeURIComponent(sessionId || "")}`,
          { cache: "no-store" }
        );

        if (!result.success) {
          throw new Error(result.message || "Payment verification failed.");
        }

        await refreshUser();

        if (cancelled) return;
        setStatus("verified");
        if (!toastShown.current) {
          toast.success("Payment confirmed. Your Pro plan is active!");
          toastShown.current = true;
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Unable to verify your payment.";
        setFailure(message);
        setStatus("error");
        if (!toastShown.current) {
          toast.error(message);
          toastShown.current = true;
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [authStatus, sessionId, hasUser, refreshUser]);

  const title =
    status === "verified"
      ? "Payment Successful!"
      : status === "no-session"
        ? "Missing Payment Session"
        : status === "error"
          ? "Payment Verification Failed"
          : "Verifying Your Payment";

  const message =
    status === "verified"
      ? "Your payment was confirmed and your Pro membership is now active."
      : status === "no-session"
        ? "We could not find a Stripe session in the return link. If you completed a payment, check your dashboard or contact support."
        : status === "error"
          ? failure || "We could not verify this payment session."
          : "Confirming your Stripe session and updating your plan...";

  const Icon = status === "verified" ? CheckCircle2 : status === "loading" ? LoaderCircle : XCircle;

  const iconStyle =
    status === "verified"
      ? "status-success"
      : status === "loading"
        ? "bg-[var(--secondary)] text-[var(--primary)]"
        : "status-danger";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="card w-full max-w-lg p-8 text-center">
        <div
          className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${iconStyle}`}
        >
          <Icon size={38} className={status === "loading" ? "animate-spin" : ""} />
        </div>

        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{message}</p>

        {status === "loading" ? (
          <div className="mt-8 flex justify-center">
            <LoaderCircle
              size={28}
              className="animate-spin text-[var(--primary)]"
            />
          </div>
        ) : (
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={user ? dashboardHrefForRole(normalizeRole(user.role)) : "/sign-in"}
              className="btn-primary h-12 justify-center px-6"
            >
              {user ? "Go to Dashboard" : "Sign In"}
              <ArrowRight size={16} />
            </Link>
            <Link href="/pricing" className="btn-secondary h-12 justify-center px-6">
              View Plans
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
          <LoaderCircle
            size={30}
            className="animate-spin text-[var(--primary)]"
          />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
