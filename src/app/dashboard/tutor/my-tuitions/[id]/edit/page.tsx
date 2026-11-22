"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, SearchX } from "lucide-react";
import TuitionForm, { type TuitionPayload } from "@/components/tutor/TuitionForm";
import { toast } from "@/components/ToastProvider";
import { useMyTuitions } from "@/hooks/useMyTuitions";
import { apiFetch } from "@/lib/api";
import { tuitionId, type Tuition } from "@/lib/tuitions";

const LIST_HREF = "/dashboard/tutor/my-tuitions";

export default function EditTuitionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const rawId = params?.id;
  const id =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0] || ""
        : "";

  const { tuitions, loading, error, reload, setTuitions } = useMyTuitions();
  const [saving, setSaving] = useState(false);

  const tuition = useMemo<Tuition | undefined>(
    () => tuitions.find((item) => tuitionId(item) === id),
    [tuitions, id]
  );

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  async function handleUpdate(payload: TuitionPayload) {
    if (!id) return;

    try {
      setSaving(true);
      const result = await apiFetch<{ message?: string }>(`/api/tuitions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      // Keep the cached list consistent before navigating back to it.
      setTuitions((previous) =>
        previous.map((item) =>
          tuitionId(item) === id
            ? {
                ...item,
                ...payload,
                approvalStatus: "pending",
              }
            : item
        )
      );

      toast.success(result.message || "Tuition updated and sent for admin approval.");
      await reload();
      router.push(LIST_HREF);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update tuition."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link href={LIST_HREF} className="text-link">
        <ArrowLeft size={18} />
        Back to My Tuitions
      </Link>

      <div className="mb-6 mt-5">
        <h1 className="section-title">Edit Tuition</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Update the details of your tuition post below.
        </p>
      </div>

      {loading ? (
        <div className="card space-y-4 p-6 sm:p-8">
          <div className="skeleton h-6 w-1/3 rounded-lg" />
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-32 rounded-xl" />
        </div>
      ) : !tuition ? (
        <div className="card empty-state p-10">
          <SearchX className="mx-auto text-[var(--primary)]" size={30} />
          <h2 className="mt-4 font-bold">Tuition not found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            This tuition may have been deleted or is no longer in your account.
          </p>
          <Link href={LIST_HREF} className="btn-primary mt-5">
            <ArrowLeft size={16} />
            Back to My Tuitions
          </Link>
        </div>
      ) : (
        <div className="card p-6 sm:p-8">
          <TuitionForm
            key={id}
            initial={tuition}
            submitLabel="Save Changes"
            submitting={saving}
            onSubmit={handleUpdate}
            onCancel={() => router.push(LIST_HREF)}
          />
        </div>
      )}

      {saving && (
        <p className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
          <LoaderCircle size={15} className="animate-spin" />
          Saving your changes...
        </p>
      )}
    </div>
  );
}
