
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  GraduationCap,
  MapPin,
  Monitor,
  IndianRupee,
  UserRound,
  Clock,
  LoaderCircle,
  Send,
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
  tutorEmail?: string;
  description?: string;
  schedule?: string;
};

type LoggedInUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
};

const API_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

export default function TuitionDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [tuition, setTuition] = useState<Tuition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [token, setToken] = useState("");
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [studentPhone, setStudentPhone] = useState("");
  const [preferredSchedule, setPreferredSchedule] = useState("");
  const [studentNote, setStudentNote] = useState("");

  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  const isStudent = user?.role?.toLowerCase() === "student";

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("mentorlagbe-token");
      const savedUser = localStorage.getItem("mentorlagbe-user");

      if (savedToken) {
        setToken(savedToken);
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Unable to read login information:", err);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/tuitions/${id}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "This tuition could not be found."
              : "Unable to load tuition details."
          );
        }

        const result = await response.json();

        const data =
          result.tuition ||
          result.data?.tuition ||
          result.data ||
          result;

        setTuition(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

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

    fetchDetails();

    return () => controller.abort();
  }, [id]);

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token || !user) {
      setApplyMessage("Please sign in to apply.");
      setApplySuccess(false);
      return;
    }

    if (!isStudent) {
      setApplyMessage("Only student accounts can apply.");
      setApplySuccess(false);
      return;
    }

    if (!studentPhone.trim() || !preferredSchedule.trim()) {
      setApplyMessage("Please complete all required fields.");
      setApplySuccess(false);
      return;
    }

    try {
      setApplying(true);
      setApplyMessage("");
      setApplySuccess(false);

      const response = await fetch(`${API_URL}/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tuitionId: id,
          title: tuition?.title,
          subject: tuition?.subject,
          monthlyFee: tuition?.monthlyFee ?? tuition?.salary,
          tutorEmail: tuition?.tutorEmail,
          studentName: user.name,
          studentEmail: user.email,
          studentPhone,
          preferredSchedule,
          studentNote,
          status: "pending",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to submit application."
        );
      }

      setApplySuccess(true);
      setApplyMessage(
        result.message || "Application submitted successfully!"
      );

      setStudentPhone("");
      setPreferredSchedule("");
      setStudentNote("");
    } catch (err) {
      setApplySuccess(false);
      setApplyMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f7faf8]">
        <div className="text-center">
          <LoaderCircle
            className="mx-auto animate-spin text-[#087f6e]"
            size={36}
          />
          <p className="mt-4 text-sm font-medium text-[#647875]">
            Loading tuition details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !tuition) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f7faf8] px-5">
        <div className="max-w-md rounded-2xl border border-[#e3ebe8] bg-white p-8 text-center">
          <BookOpen className="mx-auto text-[#087f6e]" size={40} />
          <h1 className="mt-4 text-xl font-bold text-[#142c2b]">
            Tuition not available
          </h1>
          <p className="mt-2 text-sm text-[#647875]">
            {error || "This tuition may have been removed."}
          </p>
          <Link
            href="/tuitions"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087f6e] px-5 py-3 text-sm font-bold text-white hover:bg-[#066657]"
          >
            <ArrowLeft size={16} />
            Browse Tuitions
          </Link>
        </div>
      </div>
    );
  }

  const fee = tuition.monthlyFee ?? tuition.salary;
  const level = tuition.classLevel || tuition.class || "Not specified";

  const details = [
    {
      icon: BookOpen,
      label: "Subject",
      value: tuition.subject || "Not specified",
    },
    {
      icon: GraduationCap,
      label: "Class Level",
      value: level,
    },
    {
      icon: Monitor,
      label: "Learning Mode",
      value: tuition.mode || "Not specified",
    },
    {
      icon: MapPin,
      label: "Location",
      value: tuition.location || "Not specified",
    },
    {
      icon: CalendarDays,
      label: "Days per Week",
      value: tuition.daysPerWeek
        ? `${tuition.daysPerWeek} days`
        : "To be discussed",
    },
    {
      icon: Clock,
      label: "Schedule",
      value: tuition.schedule || "To be discussed",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <div className="border-b border-[#e3ebe8] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#647875] transition hover:text-[#087f6e]"
          >
            <ArrowLeft size={17} />
            Back to Browse Tuitions
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid items-start gap-7 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#e3ebe8] bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-[#e8f5f1] px-3 py-1.5 text-xs font-bold text-[#087f6e]">
                  {tuition.subject || "General Subject"}
                </span>
                <span className="rounded-lg bg-[#f1f5f3] px-3 py-1.5 text-xs font-semibold text-[#526763]">
                  {tuition.mode || "Flexible Mode"}
                </span>
              </div>

              <h1 className="mt-5 text-2xl font-extrabold leading-tight text-[#142c2b] sm:text-3xl lg:text-4xl">
                {tuition.title || "Tuition Details"}
              </h1>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[#647875]">
                <span className="flex items-center gap-2">
                  <GraduationCap size={17} className="text-[#087f6e]" />
                  {level}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={17} className="text-[#087f6e]" />
                  {tuition.location || "Location not specified"}
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-[#e3ebe8] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-extrabold text-[#142c2b]">
                Tuition Information
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {details.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 rounded-xl bg-[#f7faf8] p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5f1] text-[#087f6e]">
                        <Icon size={19} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#82918c]">
                          {item.label}
                        </p>
                        <p className="mt-1 break-words text-sm font-bold text-[#23413c]">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-[#e3ebe8] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-extrabold text-[#142c2b]">
                Description
              </h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[#647875]">
                {tuition.description || "No additional description provided."}
              </p>
            </section>

            <section className="rounded-2xl border border-[#e3ebe8] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-extrabold text-[#142c2b]">
                About the Tutor
              </h2>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5f1] text-[#087f6e]">
                  <UserRound size={27} />
                </div>
                <div>
                  <h3 className="font-bold text-[#142c2b]">
                    {tuition.tutorName || "MentorLagbe Tutor"}
                  </h3>
                  <p className="mt-1 text-sm text-[#82918c]">
                    Verified tuition listing
                  </p>
                  {tuition.tutorEmail && (
                    <p className="mt-1 break-all text-sm text-[#647875]">
                      {tuition.tutorEmail}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-[#dcebe4] bg-white p-6 shadow-[0_10px_35px_rgba(20,44,43,0.06)]">
              <p className="text-sm font-semibold text-[#647875]">
                Monthly Tuition Fee
              </p>

              <div className="mt-2 flex items-center gap-1 text-3xl font-extrabold text-[#087f6e]">
                <IndianRupee size={25} />
                {fee != null ? Number(fee).toLocaleString() : "Negotiable"}
              </div>

              <p className="mt-2 text-xs text-[#82918c]">
                {fee != null
                  ? "Per month"
                  : "Discuss the fee with the tutor"}
              </p>

              <div className="my-6 border-t border-[#edf1ef]" />

              <h3 className="font-bold text-[#142c2b]">
                Interested in this tuition?
              </h3>

              {!authChecked ? (
                <div className="mt-5 flex justify-center">
                  <LoaderCircle
                    size={24}
                    className="animate-spin text-[#087f6e]"
                  />
                </div>
              ) : !user ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-[#647875]">
                    Sign in with your student account to apply for this tuition.
                  </p>

                  <Link
                    href={`/sign-in?redirect=/tuitions/${id}`}
                    className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087f6e] text-sm font-bold text-white transition hover:bg-[#066657]"
                  >
                    <Send size={17} />
                    Sign In to Apply
                  </Link>
                </>
              ) : isStudent ? (
                <form onSubmit={handleApply} className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#526763]">
                      Student Name
                    </label>
                    <input
                      value={user.name || ""}
                      readOnly
                      className="h-11 w-full rounded-xl border border-[#e3ebe8] bg-[#f7faf8] px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#526763]">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                      className="h-11 w-full rounded-xl border border-[#e3ebe8] px-3 text-sm outline-none focus:border-[#087f6e]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#526763]">
                      Preferred Schedule *
                    </label>
                    <input
                      value={preferredSchedule}
                      onChange={(e) => setPreferredSchedule(e.target.value)}
                      placeholder="e.g. 5 PM - 7 PM"
                      required
                      className="h-11 w-full rounded-xl border border-[#e3ebe8] px-3 text-sm outline-none focus:border-[#087f6e]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#526763]">
                      Additional Note
                    </label>
                    <textarea
                      value={studentNote}
                      onChange={(e) => setStudentNote(e.target.value)}
                      placeholder="Write something about yourself..."
                      rows={3}
                      className="w-full rounded-xl border border-[#e3ebe8] p-3 text-sm outline-none focus:border-[#087f6e]"
                    />
                  </div>

                  {applyMessage && (
                    <p
                      className={`rounded-lg p-3 text-sm ${
                        applySuccess
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {applyMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={applying}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087f6e] text-sm font-bold text-white transition hover:bg-[#066657] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {applying ? (
                      <>
                        <LoaderCircle size={17} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Apply for Tuition
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-[#82918c]">
                    Your application will be sent to the tutor for review.
                  </p>
                </form>
              ) : (
                <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  You are logged in as {user.role}. Only student accounts can
                  apply for tuition opportunities.
                </p>
              )}

              <p className="mt-4 text-center text-xs leading-5 text-[#82918c]">
                Only student accounts can apply for tuition opportunities.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
