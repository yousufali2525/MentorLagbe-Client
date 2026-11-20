
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

type UserProfile = {
  _id?: string;
  name: string;
  email: string;
  role: string;
  plan?: string;
  profileImage?: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt?: string;
};

export default function TutorProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    role: "tutor",
    plan: "free",
    profileImage: "",
    phone: "",
    location: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });

    window.setTimeout(() => {
      setNotification({ type: "", message: "" });
    }, 3500);
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);

    const token = localStorage.getItem("mentorlagbe-token");
    const storedUser = localStorage.getItem("mentorlagbe-user");

    if (!token || !storedUser) {
      setLoading(false);
      router.replace("/sign-in");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "tutor") {
        setLoading(false);
        router.replace(`/dashboard/${user.role || "student"}`);
        return;
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("mentorlagbe-token");
        localStorage.removeItem("mentorlagbe-user");
        router.replace("/sign-in");
        return;
      }

      if (!response.ok || !result.success || !result.user) {
        throw new Error(result.message || "Failed to load profile.");
      }

      const userData = result.user;

      setProfile({
        ...userData,
        phone: userData.phone || "",
        location: userData.location || "",
        bio: userData.bio || "",
        profileImage: userData.profileImage || "",
      });

      localStorage.setItem(
        "mentorlagbe-user",
        JSON.stringify({
          ...user,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          plan: userData.plan,
          profileImage: userData.profileImage || "",
        })
      );
    } catch (error) {
      showNotification(
        "error",
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showNotification(
        "error",
        "Only PNG, JPG, or WEBP images are allowed."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showNotification("error", "Image size must not exceed 8 MB.");
      event.target.value = "";
      return;
    }

    const token = localStorage.getItem("mentorlagbe-token");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    setUploading(true);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
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
      });

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

      if (response.status === 401) {
        localStorage.removeItem("mentorlagbe-token");
        localStorage.removeItem("mentorlagbe-user");
        router.replace("/sign-in");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Image upload failed.");
      }

      const imageUrl = result.data?.url;

      if (!imageUrl) {
        throw new Error("Uploaded image URL was not found.");
      }

      setProfile((previous) => ({
        ...previous,
        profileImage: imageUrl,
      }));

      showNotification(
        "success",
        "Image uploaded successfully. Save your profile to apply the changes."
      );
    } catch (error) {
      showNotification(
        "error",
        error instanceof Error ? error.message : "Image upload failed."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = localStorage.getItem("mentorlagbe-token");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    if (!profile.name.trim()) {
      showNotification("error", "Name is required.");
      return;
    }

    if (uploading) {
      showNotification(
        "error",
        "Please wait until the image upload finishes before saving."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name.trim(),
          phone: profile.phone || "",
          location: profile.location || "",
          bio: profile.bio || "",
          profileImage: profile.profileImage || "",
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("mentorlagbe-token");
        localStorage.removeItem("mentorlagbe-user");
        router.replace("/sign-in");
        return;
      }

      if (!response.ok || !result.success || !result.user) {
        throw new Error(result.message || "Failed to update profile.");
      }

      const userData = result.user;

      setProfile({
        ...userData,
        phone: userData.phone || "",
        location: userData.location || "",
        bio: userData.bio || "",
        profileImage: userData.profileImage || "",
      });

      const storedUser = JSON.parse(
        localStorage.getItem("mentorlagbe-user") || "{}"
      );

      localStorage.setItem(
        "mentorlagbe-user",
        JSON.stringify({
          ...storedUser,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          plan: userData.plan,
          profileImage: userData.profileImage || "",
        })
      );

      window.dispatchEvent(new Event("user-updated"));

      showNotification("success", "Profile successfully updated.");
    } catch (error) {
      showNotification(
        "error",
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("mentorlagbe-token");
    localStorage.removeItem("mentorlagbe-user");
    router.replace("/sign-in");
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside className="w-full border-b border-gray-200 bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-gray-100 px-6 py-6">
          <Link
            href="/dashboard/tutor"
            className="text-2xl font-bold text-indigo-600"
          >
            MentorLagbe
          </Link>

          <p className="mt-1 text-sm text-gray-500">Tutor Dashboard</p>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-4 md:flex-col">
          <Link
            href="/dashboard/tutor"
            className="shrink-0 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Overview
          </Link>

          <Link
            href="/dashboard/tutor/my-tuitions"
            className="shrink-0 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            My Tuitions
          </Link>

          <Link
            href="/dashboard/tutor/applicants"
            className="shrink-0 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Applicants
          </Link>

          <Link
            href="/dashboard/tutor/profile"
            className="shrink-0 rounded-lg bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700"
          >
            My Profile
          </Link>

          <button
            onClick={signOut}
            className="shrink-0 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Sign Out
          </button>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Update your personal information and tutor profile.
            </p>
          </div>

          {notification.message && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                notification.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {notification.message}
            </div>
          )}

          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-3xl font-bold text-indigo-700">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Tutor profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.name?.charAt(0).toUpperCase() || "T"
                )}
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">{profile.email}</p>

                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                    {profile.role}
                  </span>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold capitalize text-green-700">
                    {profile.plan || "Free"} Plan
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSave}
            className="rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                You can update your profile information here.
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Profile Picture
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || saving}
                    className="w-fit rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Choose Image"}
                  </button>

                  <span className="text-xs text-gray-500">
                    PNG, JPG, WEBP Â· Maximum 8 MB
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    maxLength={100}
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    maxLength={20}
                    value={profile.phone || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Location
                  </label>

                  <input
                    id="location"
                    name="location"
                    type="text"
                    maxLength={150}
                    value={profile.location || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Enter your location"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  About Me / Bio
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  rows={5}
                  maxLength={1000}
                  value={profile.bio || ""}
                  onChange={handleChange}
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Tell students about your teaching experience, qualifications and expertise..."
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {(profile.bio || "").length}/1000
                </p>
              </div>

              <div className="grid gap-5 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Account Role
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize text-gray-800">
                    {profile.role}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Subscription Plan
                  </p>

                  <p className="mt-1 text-sm font-semibold capitalize text-gray-800">
                    {profile.plan || "Free"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Member Since
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 p-5 sm:flex-row sm:p-6">
              <button
                type="button"
                onClick={fetchProfile}
                disabled={saving || uploading || loading}
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Reset Changes"}
              </button>

              <button
                type="submit"
                disabled={saving || uploading || loading}
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
