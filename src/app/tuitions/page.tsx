"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
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
import {
  classLevelOf,
  extractTuitionList,
  formatFee,
  locationOf,
  modeOf,
  tuitionFee,
  tuitionId,
  tutorNameOf,
  type Tuition,
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
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "University",
];

const MODES = ["All Modes", "Online", "Offline"];
const PAGE_SIZE = 9;

function readParam(params: URLSearchParams, key: string, fallback: string) {
  return params.get(key) || fallback;
}

function TuitionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [searchInput, setSearchInput] = useState(() =>
    readParam(searchParams, "search", "")
  );
  const [search, setSearch] = useState(() =>
    readParam(searchParams, "search", "")
  );
  const [subject, setSubject] = useState(() =>
    readParam(searchParams, "subject", "All Subjects")
  );
  const [classLevel, setClassLevel] = useState(() =>
    readParam(searchParams, "classLevel", "All Classes")
  );
  const [mode, setMode] = useState(() =>
    readParam(searchParams, "mode", "All Modes")
  );
  const [page, setPage] = useState(() => {
    const value = Number(searchParams.get("page"));
    return Number.isInteger(value) && value > 0 ? value : 1;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce the text input so every keystroke does not trigger a request.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Keep the URL shareable and in sync with browser back/forward navigation.
  useEffect(() => {
    const nextSearch = searchParams.get("search") || "";
    const nextSubject = readParam(searchParams, "subject", "All Subjects");
    const nextClassLevel = readParam(searchParams, "classLevel", "All Classes");
    const nextMode = readParam(searchParams, "mode", "All Modes");
    const nextPage = Number(searchParams.get("page")) || 1;

    if (
      nextSearch !== searchInput ||
      nextSubject !== subject ||
      nextClassLevel !== classLevel ||
      nextMode !== mode ||
      nextPage !== page
    ) {
      setSearchInput(nextSearch);
      setSearch(nextSearch);
      setSubject(nextSubject);
      setClassLevel(nextClassLevel);
      setMode(nextMode);
      setPage(nextPage);
    }
    // Run only when the URL itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (subject !== "All Subjects") params.set("subject", subject);
    if (classLevel !== "All Classes") params.set("classLevel", classLevel);
    if (mode !== "All Modes") params.set("mode", mode);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    const target = query ? `/tuitions?${query}` : "/tuitions";
    if (`${searchParams.toString() ? "?" : ""}${searchParams.toString()}` !== (query ? `?${query}` : "")) {
      router.replace(target, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, subject, classLevel, mode, page]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTuitions() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (subject !== "All Subjects") params.set("subject", subject);

        const result = await apiFetch<unknown>(
          `/api/tuitions${params.size ? `?${params.toString()}` : ""}`,
          { signal: controller.signal, auth: false }
        );

        if (controller.signal.aborted) return;
        setTuitions(extractTuitionList(result));
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Unable to load tuition listings.";
        setError(message);
        setTuitions([]);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadTuitions();
    return () => controller.abort();
  }, [search, subject]);

  // classLevel and mode are filtered locally: the backend ignores those params.
  const filtered = useMemo(() => {
    return tuitions.filter((tuition) => {
      const matchesClass =
        classLevel === "All Classes" ||
        classLevelOf(tuition).toLowerCase().includes(classLevel.toLowerCase());
      const matchesMode =
        mode === "All Modes" ||
        modeOf(tuition).toLowerCase() === mode.toLowerCase();
      return matchesClass && matchesMode;
    });
  }, [tuitions, classLevel, mode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setSubject("All Subjects");
    setClassLevel("All Classes");
    setMode("All Modes");
    setPage(1);
  }

  const hasFilters =
    Boolean(search) ||
    subject !== "All Subjects" ||
    classLevel !== "All Classes" ||
    mode !== "All Modes";

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
                  placeholder="Search by title, subject or class..."
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
              onChange={(event) => {
                setSubject(event.target.value);
                setPage(1);
              }}
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
              onChange={(event) => {
                setClassLevel(event.target.value);
                setPage(1);
              }}
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
              onChange={(event) => {
                setMode(event.target.value);
                setPage(1);
              }}
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
              {loading ? "Finding tuitions..." : `${filtered.length} listings found`}
            </div>
          </div>
        </section>

        <p className="mb-6 text-xs text-[var(--muted)]">
          Search and subject filters are handled by the API. Class level,
          learning mode and pagination are applied locally because the current
          API does not accept those query parameters.
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
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
        ) : pageItems.length > 0 ? (
          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((tuition, index) => {
              const id = tuitionId(tuition);
              const fee = tuitionFee(tuition);

              return (
                <article
                  key={id || `tuition-${index}`}
                  className="card group flex h-full flex-col overflow-hidden p-5 sm:p-6"
                >
                  <div className="-mx-5 -mt-5 mb-5 h-40 overflow-hidden bg-[var(--secondary)] sm:-mx-6 sm:-mt-6">
                    {tuition.banner ? (
                      <img
                        src={tuition.banner}
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
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="px-3 text-sm font-semibold text-[var(--muted)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="btn-secondary"
            >
              Next
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}

export default function TuitionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <LoaderCircle className="animate-spin text-[var(--primary)]" size={32} />
        </div>
      }
    >
      <TuitionsPageContent />
    </Suspense>
  );
}
