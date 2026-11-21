import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  loading = false,
}: {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <div className="card flex h-full min-w-0 flex-col justify-between p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">
            {title}
          </p>
          {loading ? (
            <span className="skeleton mt-4 block h-9 w-20 rounded-lg" />
          ) : (
            <p className="mt-4 break-words text-3xl font-extrabold tracking-tight">
              {value}
            </p>
          )}
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--primary)]">
          <Icon size={21} strokeWidth={2.1} />
        </span>
      </div>

      {hint ? (
        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
