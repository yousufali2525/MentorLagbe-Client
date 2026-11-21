import Link from "next/link";
import { ArrowRight, Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="card w-full max-w-lg p-8 text-center sm:p-10">
        <p className="text-6xl font-extrabold tracking-tight text-[var(--primary)] sm:text-7xl">
          404
        </p>
        <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--primary)]">
          <SearchX size={26} />
        </div>

        <h1 className="section-title mt-5 text-2xl">Page Not Found</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[var(--muted)]">
          Sorry, the page you are looking for does not exist or may have been
          moved.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary h-11 justify-center px-5">
            <Home size={16} />
            Back to Home
          </Link>
          <Link
            href="/tuitions"
            className="btn-secondary h-11 justify-center px-5"
          >
            Browse Tuitions
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
