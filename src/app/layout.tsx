
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteLayout from "@/components/SiteLayout";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MentorLagbe | Find Your Perfect Tutor",
    template: "%s | MentorLagbe",
  },
  description:
    "Find the right tutor for your learning journey. Explore tuition opportunities, connect with tutors, and achieve your academic goals with MentorLagbe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ToastProvider>
          <SiteLayout>{children}</SiteLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
