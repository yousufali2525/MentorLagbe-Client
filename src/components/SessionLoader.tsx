import { LoaderCircle } from "lucide-react";

export default function SessionLoader({
  label = "Loading your session...",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[var(--background)] px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-[var(--primary)]" />
        <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
      </div>
    </div>
  );
}
