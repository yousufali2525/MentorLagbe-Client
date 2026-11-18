
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Monitor,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Clock3,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Tuition = {
  _id?: string;
  id?: string;
  title?: string;
  subject?: string;
  classLevel?: string;
  class?: string;
  location?: string;
  mode?: string;
  monthlyFee?: number;
  salary?: number;
  tutorName?: string;
};

const subjects = [
  { name: "Mathematics", icon: "∑", color: "bg-blue-50 text-blue-700" },
  { name: "Physics", icon: "⚛", color: "bg-purple-50 text-purple-700" },
  { name: "Programming", icon: "</>", color: "bg-emerald-50 text-emerald-700" },
  { name: "IELTS", icon: "A+", color: "bg-orange-50 text-orange-700" },
];

const steps = [
  {
    number: "01",
    title: "Explore Tuitions",
    description:
      "Browse available tuition opportunities and find the one that matches your goals.",
    icon: Search,
  },
  {
    number: "02",
    title: "Connect with Tutors",
    description:
      "Review tuition details and apply to the opportunity that feels right for you.",
    icon: Users,
  },
  {
    number: "03",
    title: "Start Learning",
    description:
      "Connect, collaborate and take the next step towards academic success.",
    icon: GraduationCap,
  },
];

function formatFee(fee?: number) {
  if (typeof fee !== "number") return "Negotiable";
  return `৳${fee.toLocaleString("en-BD")}/month`;
}

export default function HomePage() {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function loadTuitions() {
      try {
        const response = await fetch(
          `${API_URL}/api/tuitions?limit=6`,
        );

        if (!response.ok) {
          throw new Error("Could not load tuitions");
        }

        const result = await response.json();

        const list = Array.isArray(result)
          ? result
          : Array.isArray(result.tuitions)
            ? result.tuitions
            : Array.isArray(result.data)
              ? result.data
              : Array.isArray(result.data?.tuitions)
                ? result.data.tuitions
                : [];

        setTuitions(list.slice(0, 6));
      } catch (error) {
        console.error("Tuition loading error:", error);
        setTuitions([]);
      } finally {
        setLoading(false);
      }
    }

    loadTuitions();
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchText.trim();
    const destination = query
      ? `/tuitions?search=${encodeURIComponent(query)}`
      : "/tuitions";

    window.location.href = destination;
  }

  return (
    <div className="overflow-hidden">
      <section className="relative bg-[#f0f8f5]">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#ccece1] opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-[#dcefe8] opacity-70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 md:py-24 lg:grid-cols-2 lg:px-10 lg:py-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cce6dc] bg-white px-4 py-2 text-sm font-semibold text-[#087f6e] shadow-sm">
              <Sparkles size={16} />
              Your learning journey starts here
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.15] tracking-tight text-[#142c2b] sm:text-5xl lg:text-[60px]">
              Find the right tutor.
              <span className="mt-2 block text-[#087f6e]">
                Unlock your potential.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[#61736e] sm:text-lg">
              Great learning starts with the right guidance. Discover
              tuition opportunities, connect with passionate tutors and
              make every lesson count.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-9 flex max-w-xl flex-col gap-3 rounded-2xl border border-[#e1ebe6] bg-white p-3 shadow-lg shadow-[#1b5140]/5 sm:flex-row"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search className="shrink-0 text-[#087f6e]" size={21} />
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search subject, class or tuition..."
                  className="w-full min-w-0 border-0 bg-transparent py-3 text-sm text-[#142c2b] outline-none placeholder:text-[#9aa9a3]"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#087f6e] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#066657]"
              >
                Find Tuition
                <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#61736e]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#087f6e]" />
                Verified opportunities
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#087f6e]" />
                Easy applications
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="relative overflow-hidden rounded-[32px] bg-[#103e36] p-7 shadow-2xl shadow-[#174e42]/15 sm:p-10">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[35px] border-white/5" />
              <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full border-[40px] border-white/5" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#c2e4d8]">
                    Learning made better
                  </span>
                  <span className="rounded-full bg-[#d3f4e7] px-3 py-1 text-xs font-bold text-[#087f6e]">
                    MentorLagbe
                  </span>
                </div>

                <div className="mt-10 flex justify-center">
                  <div className="flex h-44 w-44 items-center justify-center rounded-full border border-white/20 bg-white/10 sm:h-52 sm:w-52">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#bdebd9] text-[#087f6e] sm:h-40 sm:w-40">
                      <GraduationCap size={86} strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                  <p className="text-sm font-medium text-[#c2e4d8]">
                    Your next step starts today
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    Learn. Grow. Succeed.
                  </p>
                  <div className="mt-5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#6be0b6]" />
                    <span className="text-xs text-[#c2e4d8]">
                      Find your learning partner
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 top-20 hidden items-center gap-3 rounded-2xl bg-white p-4 shadow-xl sm:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f5f1] text-[#087f6e]">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#142c2b]">
                  Learn anything
                </p>
                <p className="text-xs text-[#71817c]">At your own pace</p>
              </div>
            </div>

            <div className="absolute -right-4 bottom-24 hidden items-center gap-3 rounded-2xl bg-white p-4 shadow-xl sm:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff4e5] text-[#c47a20]">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#142c2b]">
                  Grow with guidance
                </p>
                <p className="text-xs text-[#71817c]">Make progress daily</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e3ebe8] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 sm:px-8 md:grid-cols-4 lg:px-10">
          {[
            { icon: Users, title: "Student focused", text: "Learning first" },
            { icon: ShieldCheck, title: "Trusted platform", text: "Safer connections" },
            { icon: Wallet, title: "Clear pricing", text: "Simple plans" },
            { icon: Clock3, title: "Easy process", text: "Save your time" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f5f1] text-[#087f6e]">
                <item.icon size={21} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#203a35]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-[#788984]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#087f6e]">
              Explore subjects
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#142c2b] sm:text-4xl">
              What do you want to learn?
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#71817c]">
              Explore popular subjects and find the right learning support.
            </p>
          </div>
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#087f6e] hover:gap-3"
          >
            Browse all tuitions <ArrowRight size={17} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {subjects.map((subject) => (
            <Link
              key={subject.name}
              href={`/tuitions?subject=${encodeURIComponent(subject.name)}`}
              className="group rounded-2xl border border-[#e3ebe8] bg-white p-5 transition hover:-translate-y-1 hover:border-[#b8ded1] hover:shadow-lg sm:p-7"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold ${subject.color}`}
              >
                {subject.icon}
              </div>
              <h3 className="mt-5 text-base font-bold text-[#203a35]">
                {subject.name}
              </h3>
              <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#087f6e]">
                Explore subject <ArrowRight size={14} />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#f0f8f5] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#087f6e]">
                Fresh opportunities
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#142c2b] sm:text-4xl">
                Latest tuition posts
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#71817c]">
                Discover recently posted tuition opportunities.
              </p>
            </div>

            <Link
              href="/tuitions"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#087f6e] hover:gap-3"
            >
              View all tuitions <ArrowRight size={17} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-60 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>
          ) : tuitions.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {tuitions.map((tuition, index) => {
                const tuitionId = tuition._id || tuition.id || "";

                return (
                  <article
                    key={tuitionId || index}
                    className="flex min-h-[245px] flex-col rounded-2xl border border-[#e3ebe8] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-[#e8f5f1] px-3 py-1.5 text-xs font-bold text-[#087f6e]">
                        {tuition.subject || "General"}
                      </span>
                      <span className="text-xs font-semibold text-[#87958f]">
                        {tuition.mode || "Flexible"}
                      </span>
                    </div>

                    <h3 className="mt-5 line-clamp-2 text-lg font-bold text-[#203a35]">
                      {tuition.title || "Tuition opportunity"}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-[#71817c]">
                      <p className="flex items-center gap-2">
                        <BookOpen size={16} className="text-[#087f6e]" />
                        {tuition.classLevel ||
                          tuition.class ||
                          "Class not specified"}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#087f6e]" />
                        {tuition.location || "Location not specified"}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#edf1ef] pt-5">
                      <div>
                        <p className="text-xs text-[#87958f]">Monthly fee</p>
                        <p className="mt-1 text-sm font-extrabold text-[#087f6e]">
                          {formatFee(tuition.monthlyFee ?? tuition.salary)}
                        </p>
                      </div>

                      <Link
                        href={
                          tuitionId
                            ? `/tuitions/${tuitionId}`
                            : "/tuitions"
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-[#087f6e] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#066657]"
                      >
                        View details <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#c9ddd4] bg-white px-6 py-14 text-center">
              <BookOpen className="mx-auto text-[#087f6e]" size={35} />
              <h3 className="mt-4 text-lg font-bold text-[#203a35]">
                No tuition posts available yet
              </h3>
              <p className="mt-2 text-sm text-[#71817c]">
                New opportunities will appear here when they are published.
              </p>
              <Link
                href="/tuitions"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#087f6e]"
              >
                Browse tuitions <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#087f6e]">
            Simple process
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#142c2b] sm:text-4xl">
            Start your journey in three steps
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#71817c]">
            Finding the right learning opportunity does not have to be
            complicated.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-[#e3ebe8] bg-white p-7"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f5f1] text-[#087f6e]">
                  <step.icon size={26} />
                </div>
                <span className="text-3xl font-extrabold text-[#e1eee8]">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-7 text-xl font-bold text-[#203a35]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#71817c]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#102d2a] py-20 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#73d5b6]">
              Why MentorLagbe
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
              More than a platform.
              <span className="block text-[#73d5b6]">
                A better way to learn.
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-8 text-[#b8cbc5]">
              Whether you are a student looking for guidance or a tutor
              sharing your knowledge, MentorLagbe helps make the connection
              easier.
            </p>

            <Link
              href="/tuitions"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#087f6e] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b927e]"
            >
              Explore opportunities <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: ShieldCheck,
                title: "Trusted opportunities",
                text: "Explore approved tuition posts.",
              },
              {
                icon: Monitor,
                title: "Flexible learning",
                text: "Find online and offline options.",
              },
              {
                icon: Users,
                title: "Direct connection",
                text: "Apply and connect through one platform.",
              },
              {
                icon: Wallet,
                title: "Simple plans",
                text: "Clear options for students and tutors.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-6"
              >
                <feature.icon size={25} className="text-[#73d5b6]" />
                <h3 className="mt-5 font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#b8cbc5]">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#087f6e]">
            Simple pricing
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#142c2b] sm:text-4xl">
            Plans that work for you
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#71817c]">
            Get started for free and upgrade when you need more.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#e3ebe8] bg-white p-8">
            <p className="text-sm font-bold text-[#087f6e]">Free Plan</p>
            <h3 className="mt-3 text-3xl font-extrabold text-[#142c2b]">
              ৳0
            </h3>
            <p className="mt-2 text-sm text-[#71817c]">
              Start using MentorLagbe.
            </p>
            <ul className="mt-7 space-y-4 text-sm text-[#526763]">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#087f6e]" />
                Browse tuition opportunities
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#087f6e]" />
                Create an account
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#087f6e]" />
                Tutor can post up to 2 tuitions
              </li>
            </ul>
            <Link
              href="/sign-up"
              className="mt-8 block rounded-xl border border-[#087f6e] px-5 py-3.5 text-center text-sm font-bold text-[#087f6e] transition hover:bg-[#e8f5f1]"
            >
              Get started free
            </Link>
          </div>

          <div className="relative rounded-2xl border-2 border-[#087f6e] bg-[#f0f8f5] p-8">
            <span className="absolute right-6 top-6 rounded-full bg-[#087f6e] px-3 py-1 text-xs font-bold text-white">
              Pro
            </span>
            <p className="text-sm font-bold text-[#087f6e]">Pro Plan</p>
            <h3 className="mt-3 text-3xl font-extrabold text-[#142c2b]">
              $15{" "}
              <span className="text-sm font-medium text-[#71817c]">
                / tutor
              </span>
            </h3>
            <p className="mt-2 text-sm text-[#71817c]">
              More opportunities for tutors.
            </p>
            <ul className="mt-7 space-y-4 text-sm text-[#526763]">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#087f6e]" />
                Unlimited tuition posts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#087f6e]" />
                Access to more opportunities
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#087f6e]" />
                Student Pro option: $10
              </li>
            </ul>
            <Link
              href="/pricing"
              className="mt-8 block rounded-xl bg-[#087f6e] px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#066657]"
            >
              View all plans
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#dff2e9] px-6 py-14 text-center sm:px-12 sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#087f6e] shadow-sm">
            <GraduationCap size={30} />
          </div>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold tracking-tight text-[#142c2b] sm:text-4xl">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#61736e]">
            Join MentorLagbe and find the right learning opportunity
            for your goals.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087f6e] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#066657]"
            >
              Create free account <ArrowRight size={17} />
            </Link>
            <Link
              href="/tuitions"
              className="inline-flex items-center justify-center rounded-xl border border-[#b9d9cc] bg-white px-7 py-4 text-sm font-bold text-[#23413c] transition hover:bg-[#f7fcf9]"
            >
              Browse tuitions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
