"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import TuitionForm, { type TuitionPayload } from "@/components/tutor/TuitionForm";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import { useMyTuitions } from "@/hooks/useMyTuitions";

export default function PostTuitionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tuitions, error } = useMyTuitions();
  const [submitting, setSubmitting] = useState(false);

  const freeLimitReached =
    user?.plan?.toLowerCase() !== "pro" && tuitions.length >= 2;

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  async function handleSubmit(payload: TuitionPayload) {
    if (freeLimitReached) {
      toast.error("Free tutors can post a maximum of 2 tuitions. Upgrade to Pro to continue.");
      return;
    }

    try {
      setSubmitting(true);
      const result = await apiFetch<{ message?: string }>("/api/tuitions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success(result.message || "Tuition submitted for admin approval.");
      router.push("/dashboard/tutor/my-tuitions");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to post the tuition."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link href="/dashboard/tutor/my-tuitions" className="text-link">
        <ArrowLeft size={18} />
        Back to My Tuitions
      </Link>

      <div className="mb-8 mt-5">
        <h1 className="section-title">Post a Tuition</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Create a tuition post. An admin will review it before it appears in
          public listings.
        </p>
      </div>

      {freeLimitReached && (
        <div className="mb-6 flex flex-col gap-4 rounded-xl border status-alert-warning p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">
                Free plan limit reached — 2 of 2 tuitions posted.
              </p>
              <p className="mt-1 text-[var(--muted)]">
                Upgrade to Pro to post unlimited tuitions.
              </p>
            </div>
          </div>
          <Link href="/pricing" className="btn-primary shrink-0">
            Upgrade to Pro
          </Link>
        </div>
      )}

      <div className="card p-6 sm:p-8">
        <TuitionForm
          submitLabel="Submit for Approval"
          submitting={submitting}
          disabled={freeLimitReached}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
