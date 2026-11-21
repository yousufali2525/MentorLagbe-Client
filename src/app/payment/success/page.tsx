"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import { dashboardHrefForRole, normalizeRole } from "@/lib/roles";

type PaymentRecord = {
  stripeSessionId?: string;
  paymentStatus?: string;
};

type PaymentsResponse = {
  success?: boolean;
  payments?: PaymentRecord[];
};

type VerifyStatus = "loading" | "verified" | "pending" | "error" | "no-session";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { status: authStatus, user, refreshUser } = useAuth();

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [attempts, setAttempts] = useState(0);
  const toastShown = useRef(false);
  const userId = user?._id || user?.id || "";

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

    if (!userId) {
      setStatus("error");
      if (!toastShown.current) {
        toast.error("Sign in to verify your payment and update your plan.");
        toastShown.current = true;
      }
      return;
    }

    let cancelled = false;

    async function verify() {
      setStatus("loading");

      for (let attempt = 0; attempt < 10; attempt += 1) {
        if (cancelled) return;
        setAttempts(attempt + 1);

        try {
          const result = await apiFetch<PaymentsResponse>(
            "/api/payments/my-payments",
            { cache: "no-store" }
          );

          const confirmed = result.payments?.some(
            (payment) =>
              payment.stripeSessionId === sessionId &&
              payment.paymentStatus === "paid"
          );

          if (cancelled) return;

          if (confirmed) {
            await refreshUser().catch(() => undefined);
            if (cancelled) return;
            setStatus("verified");
            if (!toastShown.current) {
              toast.success("Payment confirmed. Your Pro plan is active!");
              toastShown.current = true;
            }
            return;
          }
        } catch {
          // Keep polling: the Stripe webhook may not have been processed yet.
        }

        if (cancelled) return;
        if (attempt < 9) {
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
        }
      }

      if (cancelled) return;
      setStatus("pending");
      if (!toastShown.current) {
        toast.warning(
          "Payment is still processing. Please check your dashboard shortly."
        );
        toastShown.current = true;
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [authStatus, sessionId, userId, refreshUser]);

  const title =
    status === "verified"
      ? "Payment Successful!"
      : status === "pending"
        ? "Payment is Processing"
        : status === "no-session"
          ? "Missing Payment Session"
          : status === "error"
            ? "Sign In Required"
            : "Verifying Your Payment";

  const message =
    status === "verified"
      ? "Your payment was confirmed and your Pro membership is now active."
      : status === "pending"
        ? "Stripe accepted your payment, but the webhook has not confirmed it yet. Your plan will update automatically once confirmation arrives."
        : status === "no-session"
          ? "We could not find a Stripe session in the return link. If you completed a payment, check your dashboard or contact support."
          : status === "error"
            ? "Please sign in with the account you used for checkout so we can verify the payment."
            : `Checking your payment record${attempts ? ` (attempt ${attempts})` : ""}...`;

  const Icon =
    status === "verified"
      ? CheckCircle2
      : status === "pending"
        ? Clock3
        : status === "loading"
          ? LoaderCircle
          : XCircle;

  const iconStyle =
    status === "verified"
      ? "status-success"
      : status === "pending"
        ? "status-warning"
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
