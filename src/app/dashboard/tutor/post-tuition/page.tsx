
"use client";

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Upload,
  Wallet,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type TuitionForm = {
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  salary: string;
  daysPerWeek: string;
  description: string;
};

const initialForm: TuitionForm = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "Offline",
  location: "",
  salary: "",
  daysPerWeek: "3",
  description: "",
};

export default function PostTuitionPage() {
  const router = useRouter();

  const [form, setForm] = useState<TuitionForm>(initialForm);
  const [token, setToken] = useState("");
  const [plan, setPlan] = useState("free");
  const [tuitionCount, setTuitionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [banner, setBanner] = useState("");
  const [bannerName, setBannerName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isPro = plan.toLowerCase() === "pro";
  const limitReached = !isPro && tuitionCount >= 2;

  const loadUserData = useCallback(async () => {
    const savedToken = localStorage.getItem("mentorlagbe-token");
    const savedUser = localStorage.getItem("mentorlagbe-user");

    if (!savedToken || !savedUser) {
      router.replace("/sign-in");
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      const user = parsed.user || parsed.data?.user || parsed;

      if (user.role?.toLowerCase() !== "tutor") {
        router.replace("/dashboard");
        return;
      }

      setToken(savedToken);
      setPlan(user.plan || "free");

      const response = await fetch(
        `${API_URL}/api/tuitions/my-tuitions`,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setTuitionCount(
          Array.isArray(result.tuitions) ? result.tuitions.length : 0
        );
      } else if (response.status === 401) {
        localStorage.removeItem("mentorlagbe-token");
        localStorage.removeItem("mentorlagbe-user");
        router.replace("/sign-in");
      } else {
        setError(result.message || "Failed to load your tuition information.");
      }
    } catch {
      setError("Unable to load your account information.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setBanner("");

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a PNG, JPG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Image size must be less than 8 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    try {
      const base64Image = await new Promise<string>(
        (resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            } else {
              reject(new Error("Unable to read image."));
            }
          };

          reader.onerror = () => reject(new Error("Image reading failed."));
          reader.readAsDataURL(file);
        }
      );

      const response = await fetch(`${API_URL}/api/upload/image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: base64Image,
          name: file.name,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.data?.url) {
        throw new Error(result.message || "Image upload failed.");
      }

      setBanner(result.data.url);
      setBannerName(file.name);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (
      !form.title.trim() ||
      !form.subject.trim() ||
      !form.classLevel.trim() ||
      !form.location.trim() ||
      !form.description.trim() ||
      !form.salary ||
      !form.daysPerWeek
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (Number(form.salary) <= 0) {
      setError("Monthly fee must be greater than zero.");
      return;
    }

    if (
      !Number.isInteger(Number(form.daysPerWeek)) ||
      Number(form.daysPerWeek) < 1 ||
      Number(form.daysPerWeek) > 7
    ) {
      setError("Days per week must be between 1 and 7.");
      return;
    }

    if (!banner) {
      setError("Please upload a tuition banner image.");
      return;
    }

    if (limitReached) {
      setError("Free tutors can post a maximum of 2 tuitions. Upgrade to Pro to post more.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/tuitions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          subject: form.subject.trim(),
          classLevel: form.classLevel.trim(),
          mode: form.mode,
          location: form.location.trim(),
          salary: Number(form.salary),
          daysPerWeek: Number(form.daysPerWeek),
          description: form.description.trim(),
          category: form.subject.trim(),
          banner,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to post tuition.");
      }

      setSuccess(true);
      setTuitionCount((previous) => previous + 1);
      setForm(initialForm);
      setBanner("");
      setBannerName("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard/tutor"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-7">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
              <BookOpen size={25} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Post a Tuition
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Share your tutoring opportunity with students.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Your current plan</p>
              <p className="mt-1 text-lg font-bold capitalize text-slate-900">
                {plan} Plan
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">Tuition posts</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {tuitionCount} / {isPro ? "Unlimited" : "2"}
              </p>
            </div>
          </div>

          {!isPro && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{
                  width: `${Math.min((tuitionCount / 2) * 100, 100)}%`,
                }}
              />
            </div>
          )}

          {limitReached && (
            <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              You have reached your free plan limit. Upgrade to Pro to post unlimited tuitions.
              <Link
                href="/pricing"
                className="ml-1 font-bold underline"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={34} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Tuition Submitted Successfully!
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
              Your tuition post has been submitted and is waiting for admin approval.
              You can track its approval status from My Tuitions.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/tutor/my-tuitions"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                View My Tuitions
              </Link>

              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Post Another Tuition
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <X size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Tuition Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the details of the tuition you want to offer.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tuition Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  placeholder="Example: Class 8 Mathematics Tutor Needed"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select Subject</option>
                  {[
                    "Mathematics",
                    "Higher Mathematics",
                    "English",
                    "Physics",
                    "Chemistry",
                    "Biology",
                    "Science",
                    "ICT",
                    "Bangla",
                    "Accounting",
                    "All Subjects",
                    "Other",
                  ].map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Class Level *
                </label>
                <select
                  name="classLevel"
                  value={form.classLevel}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select Class Level</option>
                  {[
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
                    "SSC",
                    "HSC",
                    "University",
                    "Admission Test",
                    "IELTS",
                    "Other",
                  ].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tuition Mode *
                </label>
                <select
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location *
                </label>
                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="Example: Rajshahi"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Monthly Fee (BDT) *
                </label>
                <div className="relative">
                  <Wallet
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="salary"
                    type="number"
                    min="1"
                    value={form.salary}
                    onChange={handleChange}
                    required
                    placeholder="5000"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Days Per Week *
                </label>
                <select
                  name="daysPerWeek"
                  value={form.daysPerWeek}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <option key={day} value={day}>
                      {day} {day === 1 ? "Day" : "Days"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  maxLength={2000}
                  placeholder="Describe the tuition requirements, schedule, and other details..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.description.length}/2000
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-900">
                Tuition Banner
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Upload a PNG, JPG, or WEBP image. Maximum size 8 MB.
              </p>

              <label className="mt-4 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
                {banner ? (
                  <div className="w-full">
                    <img
                      src={banner}
                      alt="Tuition banner preview"
                      className="mx-auto max-h-56 max-w-full rounded-xl object-contain"
                    />
                    <p className="mt-3 text-sm font-medium text-green-700">
                      {bannerName || "Image uploaded successfully"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3 rounded-full bg-indigo-100 p-4 text-indigo-600">
                      {uploading ? (
                        <LoaderCircle className="animate-spin" size={27} />
                      ) : (
                        <ImagePlus size={27} />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {uploading ? "Uploading image..." : "Click to upload banner"}
                    </span>
                    <span className="mt-1 text-xs text-slate-400">
                      PNG, JPG or WEBP (Max 8 MB)
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading || submitting}
                  className="hidden"
                />
              </label>

              {banner && (
                <button
                  type="button"
                  onClick={() => {
                    setBanner("");
                    setBannerName("");
                  }}
                  className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove Image
                </button>
              )}
            </div>

            <div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              <strong>Approval Notice:</strong> Your tuition will be submitted
              for admin review. It will become visible to students after approval.
            </div>

            <button
              type="submit"
              disabled={submitting || uploading || limitReached}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Submitting...
                </>
              ) : uploading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Uploading Image...
                </>
              ) : (
                <>
                  <Upload size={19} />
                  Submit Tuition for Approval
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
