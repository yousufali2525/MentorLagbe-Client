"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { animate, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LoaderCircle,
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
import { dashboardHrefForRole, normalizeRole } from "@/lib/roles";
import {
  bannerOf,
  extractTuitionList,
  formatFee,
  tuitionFee,
  type Tuition,
} from "@/lib/tuitions";

const HERO_IMAGE = "/images/hero.jpg";

type PlanRole = "student" | "tutor";

type PlanAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  primary: boolean;
};

const subjects = [
  { name: "Math", icon: "∑", color: "bg-[var(--surface-muted)] text-[var(--primary)]" },
  { name: "Physics", icon: "⚛", color: "bg-[var(--surface-muted)] text-[var(--primary)]" },
  { name: "Programming", icon: "</>", color: "bg-[var(--surface-muted)] text-[var(--primary)]" },
  { name: "IELTS", icon: "A+", color: "bg-[var(--surface-muted)] text-[var(--primary)]" },
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

  const authLoading = status === "loading";
  const currentRole = normalizeRole(user?.role);
  const isAdmin = currentRole === "admin";
  const isProUser = user?.plan?.toLowerCase() === "pro";

  useEffect(() => {
    let active = true;

    async function loadTuitions() {
      try {
        const result = await apiFetch<unknown>("/api/tuitions?page=1&limit=6", {
          auth: false,
        });

        if (active) setTuitions(extractTuitionList(result));
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
    if (
      authLoading ||
      !user ||
      !currentRole ||
      isAdmin ||
      currentRole !== role ||
      isProUser
    ) {
      return;
    }

    try {
      setCheckoutLoading(role);
      toast.info("Opening secure Stripe Checkout...");

      const checkout = await apiFetch<{ url?: string; message?: string }>(
        "/api/payments/create-checkout-session",
        { method: "POST" }
      );

      if (!checkout.url) {
        throw new Error(checkout.message || "Stripe did not return a checkout URL.");
      }

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

  function homePlanAction(role: PlanRole, pro: boolean): PlanAction {
    if (authLoading) {
      return { label: "Checking session...", disabled: true, primary: pro };
    }

    if (isAdmin) {
      return {
        label: "Admins don't need a plan",
        disabled: true,
        primary: pro,
      };
    }

    if (!user || !currentRole) {
      return {
        label: pro ? "Subscribe with Stripe" : "Get started free",
        href: pro
          ? `/sign-up?role=${role}&plan=pro`
          : `/sign-up?role=${role}`,
        primary: pro,
      };
    }

    if (!pro) {
      return {
        label:
          currentRole === role && !isProUser ? "Current Plan" : "Included",
        disabled: true,
        primary: false,
      };
    }

    if (isProUser) {
      return { label: "You're on Pro", disabled: true, primary: true };
    }

    if (currentRole !== role) {
      return {
        label: role === "tutor" ? "For Tutors only" : "For Students only",
        disabled: true,
        primary: true,
      };
    }

    return {
      label: "Upgrade to Pro",
      onClick: () => subscribe(role),
      disabled: checkoutLoading !== null,
      loading: checkoutLoading === role,
      primary: true,
    };
  }

  return (
    <div className="overflow-hidden">
      <section className="relative bg-[var(--secondary)]">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[var(--primary-light)] opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-[var(--primary-light)] opacity-80 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 md:py-24 lg:grid-cols-2 lg:px-10 lg:py-28">
          <motion.div {...reveal}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-[var(--primary)] shadow-sm">
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
              className="mt-9 flex max-w-xl flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg sm:flex-row"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Search className="shrink-0 text-[var(--primary)]" size={21} />
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search subject, class or tuition..."
                  aria-label="Search tuitions"
                  className="w-full min-w-0 border-0 bg-transparent py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
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
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="relative h-[340px] w-full overflow-hidden rounded-3xl bg-[var(--secondary)] shadow-xl shadow-black/10 dark:shadow-black/40 sm:h-[460px] lg:aspect-[4/5] lg:h-auto">
              <Image
                src={HERO_IMAGE}
                alt="Students studying together"
                fill
                priority
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 48vw, 520px"
                className="object-cover"
              />
            </div>

            <div className="absolute left-2 top-5 flex items-center gap-2 rounded-xl bg-[var(--card)] p-2.5 shadow-xl sm:-left-4 sm:top-20 sm:gap-3 sm:rounded-2xl sm:p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--secondary)] text-[var(--primary)] sm:h-11 sm:w-11 sm:rounded-xl">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[var(--foreground)] sm:text-sm">
                  Learn anything
                </p>
                <p className="text-[10px] text-[var(--muted)] sm:text-xs">
                  At your own pace
                </p>
              </div>
            </div>

            <div className="absolute bottom-5 right-2 flex items-center gap-2 rounded-xl bg-[var(--card)] p-2.5 shadow-xl sm:-right-4 sm:bottom-24 sm:gap-3 sm:rounded-2xl sm:p-4">
              <div className="status-warning flex h-9 w-9 items-center justify-center rounded-lg sm:h-11 sm:w-11 sm:rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-[var(--foreground)] sm:text-sm">
                  Grow with guidance
                </p>
                <p className="text-[10px] text-[var(--muted)] sm:text-xs">
                  Make progress daily
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--card)]">
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
                const banner = bannerOf(tuition);

                return (
                  <motion.article
                    key={tuitionId || index}
                    {...reveal}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="card flex h-full min-h-[360px] flex-col overflow-hidden"
                  >
                    <div className="relative flex h-36 shrink-0 items-center justify-center bg-gradient-to-br from-[var(--hero-deep)] to-[var(--hero)] text-[var(--hero-foreground)]">
                      {banner ? (
                        <img
                          src={banner}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <GraduationCap size={52} strokeWidth={1.4} />
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
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
                <span className="text-3xl font-extrabold text-[var(--muted-foreground)] opacity-30">
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

      <motion.section {...reveal} className="bg-[var(--card)] py-20">
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
                <div className="mt-6 flex items-center gap-1 text-[var(--warning)]">
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
          ].map((plan) => {
            const action = homePlanAction(plan.role, plan.pro);

            return (
              <div
              key={plan.title}
              className={`card flex h-full flex-col p-6 ${
                plan.pro ? "border-2 border-[var(--primary)]" : ""
              }`}
            >
              {plan.pro && (
                <span className="mb-3 self-start rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-[var(--primary-foreground)]">
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

              {action.href ? (
                <Link
                  href={action.href}
                  className={`${
                    action.primary ? "btn-primary" : "btn-secondary"
                  } mt-7 w-full justify-center py-3 text-sm`}
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`${
                    action.primary ? "btn-primary" : "btn-secondary"
                  } mt-7 w-full justify-center py-3 text-sm`}
                >
                  {action.loading ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : null}
                  {action.label}
                </button>
              )}
              </div>
            );
          })}
        </div>
      </motion.section>

      <section className="px-5 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[28px] bg-[var(--secondary)] px-6 py-14 text-center sm:px-12 sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--card)] text-[var(--primary)] shadow-sm">
            <GraduationCap size={30} />
          </div>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">
            Join MentorLagbe and find the right learning opportunity for your goals.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {authLoading ? (
              <button
                type="button"
                disabled
                className="btn-primary justify-center px-7 py-4"
              >
                Checking session...
              </button>
            ) : user ? (
              <Link
                href={dashboardHrefForRole(currentRole)}
                className="btn-primary justify-center px-7 py-4"
              >
                Go to Dashboard <ArrowRight size={17} />
              </Link>
            ) : (
              <Link href="/sign-up" className="btn-primary justify-center px-7 py-4">
                Create free account <ArrowRight size={17} />
              </Link>
            )}
            <Link href="/tuitions" className="btn-secondary justify-center px-7 py-4">
              Browse tuitions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
