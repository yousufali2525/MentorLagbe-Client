import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[var(--background)] px-4">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--secondary)]">
          <LoaderCircle
            size={28}
            className="animate-spin text-[var(--primary)]"
          />
        </div>
        <h2 className="mt-5 text-lg font-extrabold">MentorLagbe</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Loading, please wait...
        </p>
      </div>
    </div>
  );
}
