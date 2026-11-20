
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  BookOpen,
  GraduationCap,
  Monitor,
  ArrowRight,
  SlidersHorizontal,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

type Tuition = {
  _id?: string;
  id?: string;
  title?: string;
  subject?: string;
  classLevel?: string;
  class?: string;
  mode?: string;
  location?: string;
  monthlyFee?: number;
  salary?: number;
  daysPerWeek?: number;
  tutorName?: string;
  description?: string;
  banner?: string;
};

const subjects = [
  "All Subjects",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Programming",
  "IELTS",
];

const classLevels = [
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

const API_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

function TuitionsPageContent() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [classLevel, setClassLevel] = useState("All Classes");
  const [mode, setMode] = useState("All Modes");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchTuitions = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "9",
        });

        if (search) params.set("search", search);

        if (subject !== "All Subjects") {
          params.set("subject", subject);
        }

        if (classLevel !== "All Classes") {
          params.set("classLevel", classLevel);
        }

        if (mode !== "All Modes") {
          params.set("mode", mode);
        }

        const response = await fetch(
          `${API_URL}/api/tuitions?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load tuition listings."
          );
        }

        const list = Array.isArray(result)
          ? result
          : Array.isArray(result.tuitions)
            ? result.tuitions
            : Array.isArray(result.data)
              ? result.data
              : Array.isArray(result.data?.tuitions)
                ? result.data.tuitions
                : [];

        setTuitions(list);

        const pagination =
          result.pagination || result.data?.pagination;

        if (pagination) {
          setTotalPages(
            Math.max(1, Number(pagination.totalPages) || 1)
          );

          setTotalItems(
            Number(
              pagination.totalItems ??
                pagination.total ??
                list.length
            )
          );
        } else {
          setTotalPages(1);
          setTotalItems(list.length);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setTuitions([]);
        setTotalPages(1);
        setTotalItems(0);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTuitions();

    return () => {
      controller.abort();
    };
  }, [search, subject, classLevel, mode, page]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setSubject("All Subjects");
    setClassLevel("All Classes");
    setMode("All Modes");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <section className="border-b border-[#e4eee9] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f5f1] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#087f6e]">
              <GraduationCap size={16} />
              Find your perfect tutor
            </span>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#142c2b] sm:text-4xl lg:text-5xl">
              Explore tuition opportunities
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#647875] sm:text-base">
              Discover the right learning opportunity. Search by subject,
              class level, or learning mode and take the next step in your
              education.
            </p>

            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-[#e3ebe8] bg-white p-2 shadow-[0_12px_40px_rgba(20,44,43,0.07)] sm:flex-row"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search className="shrink-0 text-[#087f6e]" size={21} />

                <input
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Search by title or subject..."
                  className="h-12 w-full min-w-0 bg-transparent text-sm text-[#142c2b] outline-none placeholder:text-[#9aa9a4]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087f6e] px-7 text-sm font-bold text-white transition hover:bg-[#066657]"
              >
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
            <div className="flex items-center gap-2 text-sm font-semibold text-[#087f6e]">
              <SlidersHorizontal size={17} />
              Find your match
            </div>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#142c2b] sm:text-3xl">
              Browse available tuitions
            </h2>

            <p className="mt-2 text-sm text-[#647875]">
              Explore approved and active tuition listings.
            </p>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-[#dce8e3] bg-white px-4 py-2.5 text-sm font-semibold text-[#526763] transition hover:border-[#087f6e] hover:text-[#087f6e] sm:self-auto"
          >
            <RefreshCw size={15} />
            Clear filters
          </button>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-[#e3ebe8] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-[#526763]">
              Subject
            </label>

            <select
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setPage(1);
              }}
              className="h-12 w-full rounded-xl border border-[#e3ebe8] bg-[#fbfdfc] px-3 text-sm text-[#23413c] outline-none focus:border-[#087f6e]"
            >
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-[#526763]">
              Class Level
            </label>

            <select
              value={classLevel}
              onChange={(event) => {
                setClassLevel(event.target.value);
                setPage(1);
              }}
              className="h-12 w-full rounded-xl border border-[#e3ebe8] bg-[#fbfdfc] px-3 text-sm text-[#23413c] outline-none focus:border-[#087f6e]"
            >
              {classLevels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-[#526763]">
              Learning Mode
            </label>

            <select
              value={mode}
              onChange={(event) => {
                setMode(event.target.value);
                setPage(1);
              }}
              className="h-12 w-full rounded-xl border border-[#e3ebe8] bg-[#fbfdfc] px-3 text-sm text-[#23413c] outline-none focus:border-[#087f6e]"
            >
              <option value="All Modes">All Modes</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="flex h-12 w-full items-center gap-2 rounded-xl bg-[#e8f5f1] px-4 text-sm font-semibold text-[#087f6e]">
              <BookOpen size={18} />
              {loading
                ? "Finding tuitions..."
                : `${totalItems} listings found`}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[310px] animate-pulse rounded-2xl border border-[#e3ebe8] bg-white p-5"
              >
                <div className="h-5 w-2/3 rounded bg-[#e8efeb]" />
                <div className="mt-5 h-4 w-1/2 rounded bg-[#edf2ef]" />
                <div className="mt-8 h-20 rounded-xl bg-[#edf2ef]" />
                <div className="mt-6 h-10 rounded-lg bg-[#e8efeb]" />
              </div>
            ))}
          </div>
        ) : tuitions.length > 0 ? (
          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((tuition, index) => {
              const tuitionId = tuition._id || tuition.id;
              const fee = tuition.monthlyFee ?? tuition.salary;
              const level =
                tuition.classLevel ||
                tuition.class ||
                "Not specified";

              return (
                <article
                  key={tuitionId || `tuition-${index}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e3ebe8] bg-white p-5 shadow-[0_5px_20px_rgba(20,44,43,0.035)] transition duration-300 hover:-translate-y-1 hover:border-[#b7d9cd] hover:shadow-[0_15px_35px_rgba(20,44,43,0.09)] sm:p-6"
                >
                  <div className="-mx-5 -mt-5 mb-5 h-44 overflow-hidden bg-[#e8f5f1] sm:-mx-6 sm:-mt-6">
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
                      <div className="flex h-full items-center justify-center">
                        <GraduationCap
                          size={55}
                          className="text-[#087f6e]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-lg bg-[#e8f5f1] px-3 py-1.5 text-xs font-bold text-[#087f6e]">
                      {tuition.subject || "General"}
                    </span>

                    <span className="rounded-lg bg-[#f1f5f3] px-3 py-1.5 text-xs font-semibold text-[#526763]">
                      {tuition.mode || "Flexible"}
                    </span>
                  </div>

                  <h3 className="mt-5 line-clamp-2 min-h-[56px] text-lg font-extrabold leading-7 text-[#142c2b] transition group-hover:text-[#087f6e]">
                    {tuition.title || "Tuition opportunity"}
                  </h3>

                  <div className="mt-5 space-y-3 text-sm text-[#647875]">
                    <div className="flex items-center gap-2.5">
                      <GraduationCap
                        size={17}
                        className="shrink-0 text-[#087f6e]"
                      />
                      <span>{level}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <MapPin
                        size={17}
                        className="shrink-0 text-[#087f6e]"
                      />
                      <span className="line-clamp-1">
                        {tuition.location || "Location not specified"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <CalendarDays
                        size={17}
                        className="shrink-0 text-[#087f6e]"
                      />
                      <span>
                        {tuition.daysPerWeek
                          ? `${tuition.daysPerWeek} days per week`
                          : "Schedule to be discussed"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Monitor
                        size={17}
                        className="shrink-0 text-[#087f6e]"
                      />
                      <span>
                        Tutor: {tuition.tutorName || "MentorLagbe tutor"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-[#edf1ef] pt-5">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#82918c]">
                        Monthly Fee
                      </span>

                      <span className="text-lg font-extrabold text-[#087f6e]">
                        à§³{" "}
                        {fee != null
                          ? Number(fee).toLocaleString("en-BD")
                          : "Negotiable"}
                      </span>
                    </div>

                    {tuitionId ? (
                      <Link
                        href={`/tuitions/${tuitionId}`}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#087f6e] text-sm font-bold text-white transition hover:bg-[#066657]"
                      >
                        View Details
                        <ArrowRight size={17} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="h-11 w-full rounded-xl bg-gray-300 text-sm font-bold text-gray-600"
                      >
                        Details unavailable
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#cbdcd4] bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5f1] text-[#087f6e]">
              <BookOpen size={30} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-[#142c2b]">
              No tuitions found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647875]">
              We could not find any tuition matching your search.
              Try changing your filters or search for another subject.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-[#087f6e] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#066657]"
            >
              Clear all filters
            </button>
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Tuition pagination"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              className="rounded-lg border border-[#dce8e3] bg-white px-4 py-2.5 text-sm font-semibold text-[#526763] transition hover:border-[#087f6e] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-3 text-sm font-semibold text-[#526763]">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              className="rounded-lg border border-[#dce8e3] bg-white px-4 py-2.5 text-sm font-semibold text-[#526763] transition hover:border-[#087f6e] disabled:cursor-not-allowed disabled:opacity-40"
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
  return <TuitionsPageContent />;
}
