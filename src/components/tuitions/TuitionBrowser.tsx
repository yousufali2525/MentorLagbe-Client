"use client";

import { Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import { getPageNumbers } from "@/lib/pagination";
import {
  bannerOf,
  classLevelOf,
  extractTuitionList,
  formatFee,
  locationOf,
  modeOf,
  tuitionFee,
  tuitionId,
  tutorNameOf,
  type Tuition,
  type TuitionListResponse,
} from "@/lib/tuitions";

const SUBJECTS = [
  "All Subjects",
  "Mathematics",
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Programming",
  "IELTS",
];

const CLASS_LEVELS = [
  "All Classes",
  "Class 6",
  "Class 8",
  "Class 9",
  "Class 10",
  "HSC",
  "University",
  "General",
];

const MODES = ["All Modes", "Online", "Offline"];
const PAGE_SIZE = 9;
const ALL_SUBJECTS = SUBJECTS[0];
const ALL_CLASSES = CLASS_LEVELS[0];
const ALL_MODES = MODES[0];

type FilterKey = "search" | "subject" | "classLevel" | "mode" | "page";
type FilterPatch = Partial<Record<FilterKey, string | number>>;

function readParam(params: URLSearchParams, key: string, fallback: string) {
  return params.get(key) || fallback;
}

function TuitionBrowserContent({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = readParam(searchParams, "search", "").trim();
  const subject = readParam(searchParams, "subject", ALL_SUBJECTS);
  const classLevel = readParam(searchParams, "classLevel", ALL_CLASSES);
  const mode = readParam(searchParams, "mode", ALL_MODES);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateFilters = useCallback(
    (patch: FilterPatch) => {
      const next = new URLSearchParams(searchParams.toString());

      Object.entries(patch).forEach(([key, value]) => {
        const text = String(value);

        if (key === "page" && (!text || Number(text) <= 1)) {
          next.delete("page");
        } else if (key === "search" && !text) {
          next.delete("search");
        } else if (key === "subject" && text === ALL_SUBJECTS) {
          next.delete("subject");
        } else if (key === "classLevel" && text === ALL_CLASSES) {
          next.delete("classLevel");
        } else if (key === "mode" && text === ALL_MODES) {
          next.delete("mode");
        } else {
          next.set(key, text);
        }
      });

      const query = next.toString();
      router.replace(query ? `${basePath}?${query}` : basePath, {
        scroll: false,
      });
    },
    [basePath, router, searchParams]
  );

  // Browser back/forward and shared links update the visible text box.
  useEffect(() => {
    if (searchInput !== search) setSearchInput(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Debounce the text box before writing it to the URL and firing a request.
  useEffect(() => {
    const value = searchInput.trim();
    if (value === search) return;

    const timer = window.setTimeout(() => {
      updateFilters({ search: value, page: 1 });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput, search, updateFilters]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTuitions() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (subject !== ALL_SUBJECTS) params.set("subject", subject);
      if (classLevel !== ALL_CLASSES) params.set("classLevel", classLevel);
      if (mode !== ALL_MODES) params.set("mode", mode);

      try {
        const result = await apiFetch<TuitionListResponse>(
          `/api/tuitions?${params.toString()}`,
          { signal: controller.signal, auth: false }
        );

        if (controller.signal.aborted) return;
        const list = extractTuitionList(result);
        setTuitions(list);
        setTotal(Number(result.total) || list.length);
        setTotalPages(Math.max(1, Number(result.totalPages) || 1));
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Unable to load tuition listings.";
        setError(message);
        setTuitions([]);
        setTotal(0);
        setTotalPages(1);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadTuitions();
    return () => controller.abort();
  }, [search, subject, classLevel, mode, page]);

  useEffect(() => {
    if (!loading && page > totalPages) {
      updateFilters({ page: totalPages });
    }
  }, [loading, page, totalPages, updateFilters]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ search: searchInput.trim(), page: 1 });
  }

  function clearFilters() {
    setSearchInput("");
    router.replace(basePath, { scroll: false });
  }

  const hasFilters =
    Boolean(search) ||
    subject !== ALL_SUBJECTS ||
    classLevel !== ALL_CLASSES ||
    mode !== ALL_MODES;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge">
              <GraduationCap size={14} className="mr-1.5" />
              Find your perfect tutor
            </span>

            <h1 className="section-title mt-5">
              Explore tuition opportunities
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Discover the right learning opportunity. Search by subject,
              class level, or learning mode and take the next step in your
              education.
            </p>

            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow)] sm:flex-row"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search className="shrink-0 text-[var(--primary)]" size={21} />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by title or subject..."
                  aria-label="Search tuitions"
                  className="h-12 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                />
              </div>

              <button type="submit" className="btn-primary h-12 justify-center px-7">
                <Search size={17} />
                Search Tuitions
              </button>
            </form>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
              <SlidersHorizontal size={17} />
              Find your match
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Browse available tuitions
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Approved and active tuition listings from the community.
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="btn-secondary self-start sm:self-auto"
          >
            <RefreshCw size={15} />
            Clear filters
          </button>
        </div>

        <section className="card mb-8 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="subject-filter" className="field-label">
              Subject
            </label>
            <select
              id="subject-filter"
              value={subject}
              onChange={(event) =>
                updateFilters({ subject: event.target.value, page: 1 })
              }
              className="field-input"
            >
              {SUBJECTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="class-filter" className="field-label">
              Class Level
            </label>
            <select
              id="class-filter"
              value={classLevel}
              onChange={(event) =>
                updateFilters({ classLevel: event.target.value, page: 1 })
              }
              className="field-input"
            >
              {CLASS_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mode-filter" className="field-label">
              Learning Mode
            </label>
            <select
              id="mode-filter"
              value={mode}
              onChange={(event) =>
                updateFilters({ mode: event.target.value, page: 1 })
              }
              className="field-input"
            >
              {MODES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex h-[2.9rem] w-full items-center gap-2 rounded-xl bg-[var(--secondary)] px-4 text-sm font-semibold text-[var(--primary)]">
              <BookOpen size={18} />
              {loading ? "Finding tuitions..." : `${total} listings found`}
            </div>
          </div>
        </section>

        <p className="mb-6 text-xs text-[var(--muted)]">
          Search, filters and pagination are handled by the API. Your current
          filters are stored in the URL.
        </p>

        {error && (
          <div className="mb-6 rounded-xl border status-alert-danger p-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={index} className="card h-[360px] overflow-hidden">
                <div className="skeleton h-40 w-full" />
                <div className="space-y-3 p-6">
                  <div className="skeleton h-5 w-2/3 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-16 w-full rounded" />
                  <div className="skeleton h-10 w-full rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : tuitions.length > 0 ? (
          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((tuition, index) => {
              const id = tuitionId(tuition);
              const fee = tuitionFee(tuition);
              const banner = bannerOf(tuition);

              return (
                <article
                  key={id || `tuition-${index}`}
                  className="card group flex h-full flex-col overflow-hidden p-5 sm:p-6"
                >
                  <div className="-mx-5 -mt-5 mb-5 h-40 overflow-hidden bg-[var(--secondary)] sm:-mx-6 sm:-mt-6">
                    {banner ? (
                      <img
                        src={banner}
                        alt={tuition.title || "Tuition"}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[var(--primary)]">
                        <GraduationCap size={55} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge">{tuition.subject || "General"}</span>
                    <span className="badge">{modeOf(tuition)}</span>
                  </div>

                  <h3 className="mt-4 line-clamp-2 min-h-[3.5rem] text-lg font-extrabold leading-7 transition group-hover:text-[var(--primary)]">
                    {tuition.title || "Tuition opportunity"}
                  </h3>

                  <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
                    <div className="flex items-center gap-2.5">
                      <GraduationCap size={17} className="shrink-0 text-[var(--primary)]" />
                      <span>{classLevelOf(tuition)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin size={17} className="shrink-0 text-[var(--primary)]" />
                      <span className="line-clamp-1">{locationOf(tuition)}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CalendarDays size={17} className="shrink-0 text-[var(--primary)]" />
                      <span>
                        {tuition.daysPerWeek
                          ? `${tuition.daysPerWeek} days per week`
                          : "Schedule to be discussed"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Users size={17} className="shrink-0 text-[var(--primary)]" />
                      <span className="line-clamp-1">Tutor: {tutorNameOf(tuition)}</span>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-[var(--border)] pt-5">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span className="text-xs text-[var(--muted)]">Monthly Fee</span>
                      <span className="text-lg font-extrabold text-[var(--primary)]">
                        {formatFee(fee)}
                      </span>
                    </div>

                    {id ? (
                      <Link
                        href={`/tuitions/${id}`}
                        className="btn-primary h-11 w-full justify-center"
                      >
                        View Details
                        <ArrowRight size={17} />
                      </Link>
                    ) : (
                      <button type="button" disabled className="btn-secondary h-11 w-full justify-center">
                        Details unavailable
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)]">
              <BookOpen size={30} />
            </div>
            <h3 className="mt-5 text-xl font-bold">
              {hasFilters ? "No tuitions found" : "No tuitions available yet"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
              {hasFilters
                ? "We could not find any tuition matching your search. Try changing your filters or search for another subject."
                : "New opportunities will appear here when tutors publish them."}
            </p>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="btn-primary mt-6 px-6">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <nav
            aria-label="Tuition pagination"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateFilters({ page: page - 1 })}
              className="btn-secondary"
            >
              <ArrowLeft size={16} />
              Previous
            </button>

            {getPageNumbers(page, totalPages).map((item, index) =>
              item === "…" ? (
                <span key={`ellipsis-${index}`} className="px-1 text-sm text-[var(--muted)]">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => updateFilters({ page: item })}
                  className={
                    item === page
                      ? "btn-primary h-10 w-10 justify-center px-0"
                      : "btn-secondary h-10 w-10 justify-center px-0"
                  }
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => updateFilters({ page: page + 1 })}
              className="btn-secondary"
            >
              Next
              <ArrowRight size={16} />
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}

export default function TuitionBrowser({ basePath }: { basePath: string }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <LoaderCircle className="animate-spin text-[var(--primary)]" size={32} />
        </div>
      }
    >
      <TuitionBrowserContent basePath={basePath} />
    </Suspense>
  );
}
