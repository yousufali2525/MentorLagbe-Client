
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Profile = {
  name: string;
  email: string;
  phone: string;
  bio: string;
  profileImage: string;
  role?: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("mentorlagbe-token");
      const savedUser = localStorage.getItem("mentorlagbe-user");

      if (!token) {
        router.push("/sign-in");
        return;
      }

      const localUser = savedUser ? JSON.parse(savedUser) : {};

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load profile.");
      }

      const user =
        result.user ||
        result.data?.user ||
        result.data ||
        result;

      const updatedProfile: Profile = {
        name: user.name || localUser.name || "",
        email: user.email || localUser.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        profileImage:
          user.profileImage ||
          user.image ||
          localUser.profileImage ||
          localUser.image ||
          "",
        role: user.role || localUser.role || "student",
      };

      setProfile(updatedProfile);

      localStorage.setItem(
        "mentorlagbe-user",
        JSON.stringify({
          ...localUser,
          ...updatedProfile,
          image: updatedProfile.profileImage,
        })
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError("Image size must be less than 8 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("mentorlagbe-token");

      if (!token) {
        throw new Error("Please sign in again.");
      }

      const base64Image = await new Promise<string>(
        (resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            } else {
              reject(new Error("Could not read image."));
            }
          };

          reader.onerror = () => {
            reject(new Error("Image reading failed."));
          };

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

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Image upload failed.");
      }

      const imageUrl =
        result.data?.url || result.url || result.imageUrl;

      if (!imageUrl) {
        throw new Error("Image URL was not returned by the server.");
      }

      setProfile((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));

      setSuccess(
        "Image uploaded successfully. Click Save Changes to save your profile."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("mentorlagbe-token");

      if (!token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio,
          profileImage: profile.profileImage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile.");
      }

      const savedUser = localStorage.getItem("mentorlagbe-user");
      const localUser = savedUser ? JSON.parse(savedUser) : {};
      const savedProfile = result.user || result.data?.user || {};

      const updatedUser = {
        ...localUser,
        ...savedProfile,
        name: savedProfile.name || profile.name,
        email: savedProfile.email || profile.email,
        role: savedProfile.role || profile.role || localUser.role,
        phone: savedProfile.phone ?? profile.phone,
        bio: savedProfile.bio ?? profile.bio,
        profileImage:
          savedProfile.profileImage || profile.profileImage,
        image: savedProfile.profileImage || profile.profileImage,
      };

      setProfile((prev) => ({
        ...prev,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role,
      }));

      localStorage.setItem(
        "mentorlagbe-user",
        JSON.stringify(updatedUser)
      );

      window.dispatchEvent(new Event("user-updated"));

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Profile update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#087f6e]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#087f6e] hover:text-[#066657]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#087f6e]">
            Account Settings
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#142c2b] sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-[#647875]">
            Manage your personal information and profile photo.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="overflow-hidden rounded-2xl border border-[#e3ebe8] bg-white shadow-sm">
            <div className="border-b border-[#e3ebe8] px-6 py-5 sm:px-8">
              <h2 className="text-lg font-bold text-[#142c2b]">
                Profile Information
              </h2>

              <p className="mt-1 text-sm text-[#647875]">
                Keep your profile information up to date.
              </p>
            </div>

            <div className="space-y-8 p-6 sm:p-8">
              <div>
                <label className="mb-4 block text-sm font-semibold text-[#142c2b]">
                  Profile Photo
                </label>

                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#e8f5f1] bg-[#e8f5f1]">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-[#087f6e]" />
                    )}
                  </div>

                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#087f6e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#066657]">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}

                      {uploading ? "Uploading..." : "Upload Photo"}

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>

                    <p className="mt-2 text-xs text-[#647875]">
                      JPG, PNG or WEBP. Maximum size 8 MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-[#142c2b]"
                  >
                    <User className="mr-2 inline h-4 w-4 text-[#087f6e]" />
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profile.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-[#dce7e2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#087f6e] focus:ring-2 focus:ring-[#087f6e]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-[#142c2b]"
                  >
                    <Mail className="mr-2 inline h-4 w-4 text-[#087f6e]" />
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-[#e3ebe8] bg-[#f7faf8] px-4 py-3 text-sm text-[#647875] outline-none"
                  />

                  <p className="mt-1 text-xs text-[#647875]">
                    Email address cannot be changed here.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-[#142c2b]"
                  >
                    <Phone className="mr-2 inline h-4 w-4 text-[#087f6e]" />
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full rounded-xl border border-[#dce7e2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#087f6e] focus:ring-2 focus:ring-[#087f6e]/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="bio"
                    className="mb-2 block text-sm font-semibold text-[#142c2b]"
                  >
                    <FileText className="mr-2 inline h-4 w-4 text-[#087f6e]" />
                    About Me
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    rows={5}
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Write a little about yourself..."
                    className="w-full resize-y rounded-xl border border-[#dce7e2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#087f6e] focus:ring-2 focus:ring-[#087f6e]/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#e3ebe8] bg-[#fbfdfc] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <Link
                href="/dashboard"
                className="rounded-xl border border-[#dce7e2] px-6 py-3 text-center text-sm font-semibold text-[#647875] transition hover:bg-[#f1f6f3]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#087f6e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#066657] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
