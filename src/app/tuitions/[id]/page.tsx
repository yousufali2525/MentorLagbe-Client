"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  Monitor,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import SessionLoader from "@/components/SessionLoader";
import { toast } from "@/components/ToastProvider";
import { apiFetch, ApiError } from "@/lib/api";
import { dashboardHrefForRole, normalizeRole } from "@/lib/roles";
import {
  bannerOf,
  classLevelOf,
  formatFee,
  locationOf,
  modeOf,
  tuitionFee,
  tutorNameOf,
  type Tuition,
} from "@/lib/tuitions";

type ApplicationRecord = { tuitionId?: string; status?: string };

/** Digits that are commonly used as profile placeholders rather than real numbers. */
const PLACEHOLDER_PHONE_DIGITS = new Set([
  "123456789",
  "1234567890",
  "0123456789",
  "9876543210",
]);

function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Digits, spaces, "+" and "-" are allowed; 10–15 digits are required. */
function isValidPhone(value: string): boolean {
  const phone = value.trim();
  if (!phone || !/^\+?[0-9 -]+$/.test(phone)) return false;

  const digits = normalizePhoneDigits(phone);
  return digits.length >= 10 && digits.length <= 15;
}

/** Only prefill from a saved profile when it looks like a real phone number. */
function isRealProfilePhone(value?: string | null): boolean {
  if (!value || !isValidPhone(value)) return false;

  const digits = normalizePhoneDigits(value);
  if (/^(\d)\1+$/.test(digits)) return false; // e.g. 11111111111 / 00000000000
  if (PLACEHOLDER_PHONE_DIGITS.has(digits)) return false;

  return true;
}

export default function TuitionDetailsPage() {
  const params = useParams();
  const id = String(params.id || "");

  const { user, status: authStatus } = useAuth();
  const isStudent = normalizeRole(user?.role) === "student";

  const [tuition, setTuition] = useState<Tuition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [studentPhone, setStudentPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    const profilePhone = user?.phone;
    if (isRealProfilePhone(profilePhone)) {
      setStudentPhone((profilePhone || "").trim());
    }
  }, [user?.phone]);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const result = await apiFetch<{ tuition?: Tuition } & Tuition>(
          `/api/tuitions/${id}`,
          { signal: controller.signal, auth: false }
        );
        if (controller.signal.aborted) return;
        setTuition(result.tuition || result);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof ApiError && err.status === 404
            ? "This tuition could not be found."
            : err instanceof Error
              ? err.message
              : "Unable to load tuition details.";
        setError(message);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadDetails();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !isStudent) {
      setAlreadyApplied(false);
      return;
    }

    let active = true;

    async function checkExistingApplication() {
      try {
        const result = await apiFetch<{ data?: ApplicationRecord[] }>(
          "/api/applications/my-applications"
        );
        const records = result.data || [];
        if (active) {
          setAlreadyApplied(
            records.some((record) => record.tuitionId === id)
          );
        }
      } catch {
        // A failed check should not block a genuine application attempt.
      }
    }

    checkExistingApplication();
    return () => {
      active = false;
    };
  }, [authStatus, isStudent, id]);

  async function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isStudent) {
      toast.error("Only student accounts can apply for a tuition.");
      return;
    }

    const phone = studentPhone.trim();
    const schedule = preferredSchedule.trim();

    if (!phone || !schedule) {
      toast.error("Phone and preferred schedule are required.");
      return;
    }

    if (!isValidPhone(phone)) {
      setPhoneError(
        "Enter a valid phone number with 10–15 digits (digits, spaces, + and - only)."
      );
      toast.error("Please enter a valid phone number.");
      return;
    }
    setPhoneError("");

    try {
      setApplying(true);
      const result = await apiFetch<{ message?: string }>("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          tuitionId: id,
          studentPhone: phone,
          preferredSchedule: schedule,
          studentNote: studentNote.trim(),
        }),
      });
      toast.success(result.message || "Application submitted successfully!");
      setPreferredSchedule("");
      setStudentNote("");
      setAlreadyApplied(true);
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 409
          ? "You have already applied for this tuition."
          : err instanceof Error
            ? err.message
            : "Unable to submit your application."
      );
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return <SessionLoader label="Loading tuition details..." />;
  }

  if (error || !tuition) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="card max-w-md p-8 text-center">
          <BookOpen className="mx-auto text-[var(--primary)]" size={40} />
          <h1 className="mt-4 text-xl font-bold">Tuition not available</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {error || "This tuition may have been removed."}
          </p>
          <Link href="/tuitions" className="btn-primary mt-6 px-5">
            <ArrowLeft size={16} />
            Browse Tuitions
          </Link>
        </div>
      </div>
    );
  }

  const fee = tuitionFee(tuition);
  const banner = bannerOf(tuition);
  const details = [
    { icon: BookOpen, label: "Subject", value: tuition.subject || "Not specified" },
    { icon: GraduationCap, label: "Class Level", value: classLevelOf(tuition) },
    { icon: Monitor, label: "Learning Mode", value: modeOf(tuition) },
    { icon: MapPin, label: "Location", value: locationOf(tuition) },
    {
      icon: CalendarDays,
      label: "Days per Week",
      value: tuition.daysPerWeek ? `${tuition.daysPerWeek} days` : "To be discussed",
    },
    { icon: Clock3, label: "Schedule", value: tuition.schedule || "To be discussed" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--primary)]"
          >
            <ArrowLeft size={17} />
            Back to Browse Tuitions
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid items-start gap-7 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            <section className="card p-6 sm:p-8">
              {banner && (
                <div className="-mx-6 -mt-6 mb-6 h-56 overflow-hidden rounded-t-2xl sm:-mx-8 sm:-mt-8">
                  <img
                    src={banner}
                    alt={tuition.title || "Tuition"}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <span className="badge">{tuition.subject || "General Subject"}</span>
                <span className="badge">{modeOf(tuition)}</span>
                {tuition.isActive && (
                  <span className="badge status-success">
                    <CheckCircle2 size={12} className="mr-1" />
                    Active
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                {tuition.title || "Tuition Details"}
              </h1>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[var(--muted)]">
                <span className="flex items-center gap-2">
                  <GraduationCap size={17} className="text-[var(--primary)]" />
                  {classLevelOf(tuition)}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={17} className="text-[var(--primary)]" />
                  {locationOf(tuition)}
                </span>
              </div>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-extrabold">Tuition Information</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {details.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 rounded-xl bg-[var(--secondary)] p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--primary)]">
                        <Icon size={19} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-[var(--muted)]">{item.label}</p>
                        <p className="mt-1 break-words text-sm font-bold">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-extrabold">Description</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[var(--muted)]">
                {tuition.description || "No additional description provided."}
              </p>
            </section>

            <section className="card p-6 sm:p-8">
              <h2 className="text-xl font-extrabold">About the Tutor</h2>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)]">
                  <UserRound size={27} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold">{tutorNameOf(tuition)}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                    <ShieldCheck size={15} className="text-[var(--primary)]" />
                    Verified tuition listing
                  </p>
                  {tuition.tutorEmail && (
                    <p className="mt-1 break-all text-sm text-[var(--muted)]">
                      {tuition.tutorEmail}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="card p-6 shadow-lg">
              <p className="text-sm text-[var(--muted)]">Monthly Tuition Fee</p>
              <p className="mt-2 text-3xl font-extrabold text-[var(--primary)]">
                {formatFee(fee)}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {fee !== null ? "Per month" : "Discuss the fee with the tutor"}
              </p>

              <div className="my-6 border-t border-[var(--border)]" />

              <h3 className="font-bold">Interested in this tuition?</h3>

              {authStatus === "loading" ? (
                <div className="mt-5 flex justify-center">
                  <SessionLoader />
                </div>
              ) : !user ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Sign in with your student account to apply for this tuition.
                  </p>
                  <Link
                    href={`/sign-in?redirect=/tuitions/${id}`}
                    className="btn-primary mt-5 h-12 w-full justify-center"
                  >
                    <Send size={17} />
                    Sign In to Apply
                  </Link>
                </>
              ) : !isStudent ? (
                <>
                  <div className="mt-3 rounded-xl status-alert-warning p-4 text-sm leading-6">
                    You are logged in as {user.role}. Only student accounts can apply.
                    <Link
                      href={dashboardHrefForRole(user.role)}
                      className="mt-2 inline-flex font-bold underline"
                    >
                      Go to your dashboard
                    </Link>
                  </div>
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="btn-secondary mt-4 h-12 w-full justify-center opacity-60"
                  >
                    Apply for Tuition (Students Only)
                    <Send size={17} />
                  </button>
                </>
              ) : alreadyApplied ? (
                <div className="mt-4 rounded-xl status-alert-success p-4 text-sm leading-6">
                  <CheckCircle2 size={18} className="mb-1" />
                  You have already applied for this tuition. Track its status in
                  your dashboard.
                </div>
              ) : (
                <form onSubmit={handleApply} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="applicant-name" className="field-label">
                      Student Name
                    </label>
                    <input
                      id="applicant-name"
                      value={user.name || ""}
                      readOnly
                      className="field-input opacity-70"
                    />
                  </div>

                  <div>
                    <label htmlFor="apply-phone" className="field-label">
                      Student Phone
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                      />
                      <input
                        id="apply-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        value={studentPhone}
                        onChange={(event) => {
                          setStudentPhone(event.target.value);
                          setPhoneError("");
                        }}
                        placeholder="01XXXXXXXXX"
                        aria-invalid={Boolean(phoneError)}
                        aria-describedby={phoneError ? "apply-phone-error" : undefined}
                        className="field-input pl-9"
                      />
                    </div>
                    {phoneError && (
                      <p
                        id="apply-phone-error"
                        role="alert"
                        className="mt-2 text-sm text-[var(--danger)]"
                      >
                        {phoneError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="apply-schedule" className="field-label">
                      Preferred Schedule
                    </label>
                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                      />
                      <input
                        id="apply-schedule"
                        required
                        value={preferredSchedule}
                        onChange={(event) =>
                          setPreferredSchedule(event.target.value)
                        }
                        placeholder="e.g. Weekdays 6:00–7:30 PM"
                        className="field-input pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="apply-note" className="field-label">
                      Learning Note
                    </label>
                    <textarea
                      id="apply-note"
                      value={studentNote}
                      onChange={(event) => setStudentNote(event.target.value)}
                      placeholder="Tell the tutor about your learning goals and any questions you have."
                      rows={5}
                      className="field-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="btn-primary h-12 w-full justify-center"
                  >
                    {applying ? "Submitting..." : "Apply for Tuition"}
                    {!applying && <Send size={17} />}
                  </button>
                </form>
              )}

              <p className="mt-4 text-center text-xs text-[var(--muted)]">
                Your application will be sent to the tutor for review.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
