import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Logo({
  href = "/",
  subtitle,
  inverse = false,
  compact = false,
}: {
  href?: string;
  subtitle?: string;
  inverse?: boolean;
  compact?: boolean;
}) {
  return (
    <Link href={href} className="inline-flex min-w-0 items-center gap-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]">
        <GraduationCap size={24} strokeWidth={2.2} />
      </span>

      {!compact ? (
        <span className="min-w-0">
          <span
            className={`block whitespace-nowrap text-xl font-extrabold tracking-tight ${
              inverse ? "text-[var(--hero-foreground)]" : "text-[var(--foreground)]"
            }`}
          >
            Mentor
            <span className={inverse ? "text-[var(--hero-accent)]" : "text-[var(--primary)]"}>
              Lagbe
            </span>
          </span>
          {subtitle ? (
            <span
              className={`block text-[10px] font-bold uppercase tracking-[2px] ${
                inverse ? "text-[var(--hero-muted)]" : "text-[var(--muted-foreground)]"
              }`}
            >
              {subtitle}
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
