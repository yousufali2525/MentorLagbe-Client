"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { animate, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  Monitor,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import { normalizeRole } from "@/lib/roles";
import {
  extractTuitionList,
  formatFee,
  tuitionFee,
  type Tuition,
} from "@/lib/tuitions";

type PlanRole = "student" | "tutor";

const subjects = [
  { name: "Math", icon: "∑", color: "bg-blue-50 text-blue-700" },
  { name: "Physics", icon: "⚛", color: "bg-purple-50 text-purple-700" },
  { name: "Programming", icon: "</>", color: "bg-emerald-50 text-emerald-700" },
  { name: "IELTS", icon: "A+", color: "bg-orange-50 text-orange-700" },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Join as a student or tutor in less than a minute. Your plan starts free.",
    icon: Users,
  },
  {
    number: "02",
    title: "Find or post tuition",
    description:
      "Students browse verified posts. Tutors create a post and wait for approval.",
    icon: Search,
  },
  {
    number: "03",
    title: "Apply or review",
    description:
      "Students apply with a note. Tutors review applicants and accept the best fit.",
    icon: BookOpen,
  },
  {
    number: "04",
    title: "Start learning",
    description:
      "Connect, collaborate and make steady progress with the right guidance.",
    icon: GraduationCap,
  },
];

const testimonials = [
  {
    quote:
      "I found a mathematics tutor within two days. The application process was simple and the tutor was exactly what I needed.",
    name: "Ayesha Rahman",
    role: "Student, Dhaka",
  },
  {
    quote:
      "Posting tuition and managing applicants is straightforward. The free plan was enough to get my first student.",
    name: "Tanvir Ahmed",
    role: "Tutor, Rajshahi",
  },
  {
    quote:
      "The platform keeps everything organized — from applications to application status. It saves me a lot of time.",
    name: "Nusrat Jahan",
    role: "Student, Chittagong",
  },
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, status } = useAuth();

  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<PlanRole | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTuitions() {
      try {
        const result = await apiFetch<unknown>("/api/tuitions", {
          auth: false,
        });

        if (active) setTuitions(extractTuitionList(result).slice(0, 6));
      } catch {
        if (active) toast.error("Could not load featured tuitions.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTuitions();
    return () => {
      active = false;
    };
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchText.trim();
    router.push(query ? `/tuitions?search=${encodeURIComponent(query)}` : "/tuitions");
  }

  async function subscribe(role: PlanRole) {
    if (status === "loading") return;

    if (!user) {
      router.push(`/sign-up?role=${role}&plan=pro`);
      return;
    }

    const currentRole = normalizeRole(user.role);
    if (currentRole !== role) {
      toast.error(`Please use your ${currentRole || "own"} account to upgrade.`);
      return;
    }

    if (user.plan === "pro") {
      toast.info("Your account is already on the Pro plan.");
      return;
    }

    try {
      setCheckoutLoading(role);
      const checkout = await apiFetch<{ url: string }>(
        "/api/payments/create-checkout-session",
        { method: "POST" }
      );
      toast.info("Redirecting to Stripe Checkout...");
      window.location.assign(checkout.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to start Checkout."
      );
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <div className="overflow-hidden">
      <section className="relative bg-[var(--secondary)]">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#bfe6d8] opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-[#d7eee5] opacity-80 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 md:py-24 lg:grid-cols-2 lg:px-10 lg:py-28">
          <motion.div {...reveal}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cce6dc] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)] shadow-sm">
              <Sparkles size={16} />
              Your learning journey starts here
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[58px]">
              Find Your Ideal Tutor or Mentorship Batch Today
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Discover verified tuition opportunities, connect with passionate
              tutors and make every lesson count.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-9 flex max-w-xl flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-lg sm:flex-row"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search className="shrink-0 text-[var(--primary)]" size={21} />
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search subject, class or tuition..."
                  aria-label="Search tuitions"
                  className="w-full min-w-0 border-0 bg-transparent py-3 text-sm outline-none placeholder:text-[#9aa9a3]"
                />
              </div>
              <button type="submit" className="btn-primary justify-center px-7 py-4">
                Find Tuition
                <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[var(--primary)]" />
                Verified opportunities
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[var(--primary)]" />
                Easy applications
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="relative overflow-hidden rounded-[32px] bg-[#103e36] p-7 shadow-2xl sm:p-10">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[35px] border-white/5" />
              <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full border-[40px] border-white/5" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#c2e4d8]">
                    Learning made better
                  </span>
                  <span className="rounded-full bg-[#d3f4e7] px-3 py-1 text-xs font-bold text-[var(--primary)]">
                    MentorLagbe
                  </span>
                </div>

                <div className="mt-10 flex justify-center">
                  <div className="flex h-44 w-44 items-center justify-center rounded-full border border-white/20 bg-white/10 sm:h-52 sm:w-52">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#bdebd9] text-[var(--primary)] sm:h-40 sm:w-40">
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
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--primary)]">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  Learn anything
                </p>
                <p className="text-xs text-[var(--muted)]">At your own pace</p>
              </div>
            </div>

            <div className="absolute -right-4 bottom-24 hidden items-center gap-3 rounded-2xl bg-white p-4 shadow-xl sm:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  Grow with guidance
                </p>
                <p className="text-xs text-[var(--muted)]">Make progress daily</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 sm:px-8 md:grid-cols-4 lg:px-10">
          {[
            { icon: Users, title: "Student focused", text: "Learning first" },
            { icon: ShieldCheck, title: "Trusted platform", text: "Safer connections" },
            { icon: Wallet, title: "Clear pricing", text: "Simple plans" },
            { icon: Clock3, title: "Easy process", text: "Save your time" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--primary)]">
                <item.icon size={21} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <motion.section {...reveal} className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
              Explore subjects
            </p>
            <h2 className="section-title mt-3">What do you want to learn?</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Explore popular subjects and find the right learning support.
            </p>
          </div>
          <Link href="/tuitions" className="text-link">
            Browse all tuitions <ArrowRight size={17} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {subjects.map((subject) => (
            <Link
              key={subject.name}
              href={`/tuitions?subject=${encodeURIComponent(subject.name)}`}
              className="card flex flex-col p-5 transition hover:-translate-y-1 hover:shadow-lg sm:p-7"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold ${subject.color}`}
              >
                {subject.icon}
              </div>
              <h3 className="mt-5 text-base font-bold text-[var(--foreground)]">
                {subject.name}
              </h3>
              <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--primary)]">
                Explore subject <ArrowRight size={14} />
              </p>
            </Link>
          ))}
        </div>
      </motion.section>

      <section className="bg-[var(--secondary)] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                Fresh opportunities
              </p>
              <h2 className="section-title mt-3">Latest tuition posts</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Six recently approved opportunities from the community.
              </p>
            </div>
            <Link href="/tuitions" className="text-link">
              View all tuitions <ArrowRight size={17} />
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="skeleton h-[360px] rounded-2xl" />
              ))}
            </div>
          ) : tuitions.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {tuitions.map((tuition, index) => {
                const tuitionId = tuition._id || tuition.id || "";

                return (
                  <motion.article
                    key={tuitionId || index}
                    {...reveal}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="card flex h-full min-h-[360px] flex-col overflow-hidden"
                  >
                    <div className="relative flex h-36 shrink-0 items-center justify-center bg-gradient-to-br from-[#0d6b5c] to-[#28a58b] text-white">
                      {tuition.banner ? (
                        <img
                          src={tuition.banner}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <GraduationCap size={52} strokeWidth={1.4} />
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[var(--primary)]">
                        {tuition.subject || "General"}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="line-clamp-2 text-lg font-bold text-[var(--foreground)]">
                        {tuition.title || "Tuition opportunity"}
                      </h3>

                      <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                        <p className="flex items-center gap-2">
                          <BookOpen size={16} className="text-[var(--primary)]" />
                          {tuition.classLevel || tuition.class || "Class not specified"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Monitor size={16} className="text-[var(--primary)]" />
                          {tuition.mode || "Flexible"}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-[var(--primary)]" />
                          {tuition.location || "Location not specified"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users size={16} className="text-[var(--primary)]" />
                          {tuition.tutorName || "MentorLagbe Tutor"}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
                        <div>
                          <p className="text-xs text-[var(--muted)]">Monthly fee</p>
                          <p className="mt-1 text-sm font-extrabold text-[var(--primary)]">
                            {formatFee(tuitionFee(tuition))}
                          </p>
                        </div>
                        <Link
                          href={tuitionId ? `/tuitions/${tuitionId}` : "/tuitions"}
                          className="btn-primary px-3 py-2.5 text-xs"
                        >
                          View Details <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="card px-6 py-14 text-center">
              <BookOpen className="mx-auto text-[var(--primary)]" size={35} />
              <h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">
                No tuition posts available yet
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                New opportunities will appear here when they are published.
              </p>
            </div>
          )}
        </div>
      </section>

      <motion.section
        {...reveal}
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
            Simple process
          </p>
          <h2 className="section-title mt-3">How MentorLagbe Works</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            A clear workflow for both students and tutors.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="card p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)]">
                  <step.icon size={26} />
                </div>
                <span className="text-3xl font-extrabold text-[#e1eee8]">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-7 text-lg font-bold text-[var(--foreground)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...reveal} className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
              MentorLagbe in numbers
            </p>
            <h2 className="section-title mt-3">Trusted by learners</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: 5, suffix: "k+", label: "Students" },
              { to: 1200, suffix: "+", label: "Tutors" },
              { to: 48, suffix: "+", label: "Subjects" },
              { to: 98, suffix: "%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="card p-8 text-center">
                <p className="text-4xl font-extrabold text-[var(--primary)]">
                  <Counter to={stat.to} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...reveal} className="bg-[var(--secondary)] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
              Testimonials
            </p>
            <h2 className="section-title mt-3">Stories from the community</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="card flex h-full flex-col p-7">
                <Quote size={30} className="text-[var(--primary)]/30" />
                <p className="mt-4 flex-1 text-sm leading-7 text-[var(--muted)]">
                  “{item.quote}”
                </p>
                <div className="mt-6 flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-3 text-sm font-bold text-[var(--foreground)]">
                  {item.name}
                </p>
                <p className="text-xs text-[var(--muted)]">{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...reveal} className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
            Simple pricing
          </p>
          <h2 className="section-title mt-3">Plans that work for you</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              role: "student" as PlanRole,
              title: "Student Free",
              price: "$0",
              features: ["Browse tuition posts", "Apply to tuitions", "Track applications"],
              pro: false,
            },
            {
              role: "student" as PlanRole,
              title: "Student Pro",
              price: "$10",
              features: ["Everything in Free", "Priority applications", "Profile highlight"],
              pro: true,
            },
            {
              role: "tutor" as PlanRole,
              title: "Tutor Free",
              price: "$0",
              features: ["Create a profile", "Post up to 2 tuitions", "Manage applicants"],
              pro: false,
            },
            {
              role: "tutor" as PlanRole,
              title: "Tutor Pro",
              price: "$15",
              features: ["Everything in Free", "Unlimited tuition posts", "Profile highlight"],
              pro: true,
            },
          ].map((plan) => (
            <div
              key={plan.title}
              className={`card flex h-full flex-col p-6 ${
                plan.pro ? "border-2 border-[var(--primary)]" : ""
              }`}
            >
              {plan.pro && (
                <span className="mb-3 self-start rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white">
                  PRO
                </span>
              )}
              <h3 className="text-lg font-extrabold text-[var(--foreground)]">
                {plan.title}
              </h3>
              <p className="mt-3 text-3xl font-extrabold text-[var(--primary)]">
                {plan.price}
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-[var(--muted)]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[var(--primary)]" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.pro ? (
                <button
                  type="button"
                  onClick={() => subscribe(plan.role)}
                  disabled={checkoutLoading === plan.role}
                  className="btn-primary mt-7 w-full justify-center py-3 text-sm"
                >
                  {checkoutLoading === plan.role
                    ? "Opening Checkout..."
                    : "Subscribe with Stripe"}
                </button>
              ) : (
                <Link
                  href={`/sign-up?role=${plan.role}`}
                  className="btn-secondary mt-7 w-full justify-center py-3 text-sm"
                >
                  Get started free
                </Link>
              )}
            </div>
          ))}
        </div>
      </motion.section>

      <section className="px-5 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[28px] bg-[var(--secondary)] px-6 py-14 text-center sm:px-12 sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm">
            <GraduationCap size={30} />
          </div>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
            Join MentorLagbe and find the right learning opportunity for your goals.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/sign-up" className="btn-primary justify-center px-7 py-4">
              Create free account <ArrowRight size={17} />
            </Link>
            <Link href="/tuitions" className="btn-secondary justify-center px-7 py-4">
              Browse tuitions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
