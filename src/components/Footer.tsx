
import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Tuitions", href: "/tuitions" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/#how-it-works" },
];

const supportLinks = [
  { label: "Sign In", href: "/sign-in" },
  { label: "Create Account", href: "/sign-up" },
  { label: "Find a Tutor", href: "/tuitions" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#102d2a] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-10 lg:py-16">
        <div>
          <Link href="/" className="mb-5 inline-flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087f6e]">
              <GraduationCap size={27} />
            </span>
            <span className="text-2xl font-extrabold tracking-tight">
              Mentor<span className="text-[#62c9ad]">Lagbe</span>
            </span>
          </Link>

          <p className="max-w-xs text-sm leading-7 text-[#b8cbc5]">
            Connecting ambitious students with passionate tutors.
            Find the right guidance and make learning meaningful.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-bold transition hover:bg-[#087f6e]"
            >
              f
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-bold transition hover:bg-[#087f6e]"
            >
              ◎
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold transition hover:bg-[#087f6e]"
            >
              in
            </a>
            <a
              href="https://x.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold transition hover:bg-[#087f6e]"
            >
              𝕏
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-5 text-base font-bold">Quick Links</h3>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-[#b8cbc5] transition hover:text-[#62c9ad]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-base font-bold">Get Started</h3>
          <ul className="space-y-3">
            {supportLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-[#b8cbc5] transition hover:text-[#62c9ad]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-base font-bold">Contact Us</h3>
          <ul className="space-y-4 text-sm text-[#b8cbc5]">
            <li className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-[#62c9ad]" />
              <span>support@mentorlagbe.com</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-[#62c9ad]" />
              <span>Contact support</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-[#62c9ad]" />
              <span>Bangladesh</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center text-xs text-[#a9beb7] sm:px-8 md:flex-row lg:px-10">
          <p>
            © {new Date().getFullYear()} MentorLagbe. All rights reserved.
          </p>
          <p>Built to make learning easier.</p>
        </div>
      </div>
    </footer>
  );
}
