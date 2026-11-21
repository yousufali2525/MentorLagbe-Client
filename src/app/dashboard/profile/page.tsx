"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  FileText,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import SessionLoader from "@/components/SessionLoader";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import { dashboardHrefForRole, normalizeRole } from "@/lib/roles";

type Profile = {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  profileImage: string;
  role?: string;
  plan?: string;
};

const emptyProfile: Profile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  profileImage: "",
};

export default function ProfilePage() {
  const { user, status, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please sign in to manage your profile.");
      return;
    }

    if (status !== "authenticated") return;

    let active = true;

    async function loadProfile() {
      try {
        const result = await apiFetch<{ user?: Partial<Profile> }>("/api/users/me");
        if (!active) return;

        const latest = result.user || {};
        setProfile({
          name: latest.name || user?.name || "",
          email: latest.email || user?.email || "",
          phone: latest.phone || user?.phone || "",
          location: latest.location || user?.location || "",
          bio: latest.bio || user?.bio || "",
          profileImage:
            latest.profileImage ||
            user?.profileImage ||
            user?.image ||
            "",
          role: latest.role || user?.role,
          plan: latest.plan || user?.plan,
        });
      } catch (err) {
        if (active) {
          setProfile((previous) => ({
            ...previous,
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            location: user?.location || "",
            bio: user?.bio || "",
            profileImage: user?.profileImage || user?.image || "",
            role: user?.role,
            plan: user?.plan,
          }));
          toast.error(
            err instanceof Error ? err.message : "Unable to load your profile."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [status, user]);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image size must be less than 8 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Could not read the image."));
        };
        reader.onerror = () => reject(new Error("Image reading failed."));
        reader.readAsDataURL(file);
      });

      const result = await apiFetch<{
        data?: { displayUrl?: string; url?: string };
      }>("/api/upload/image", {
        method: "POST",
        body: JSON.stringify({ image: dataUrl, name: file.name }),
      });

      const imageUrl = result.data?.displayUrl || result.data?.url;
      if (!imageUrl) throw new Error("Image URL was not returned by the server.");

      setProfile((previous) => ({ ...previous, profileImage: imageUrl }));
      toast.success("Photo uploaded. Save your profile to apply the change.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to upload the image."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (profile.name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    if (
      profile.profileImage &&
      !/^https:\/\//i.test(profile.profileImage.trim())
    ) {
      toast.error("Profile image must be a public HTTPS URL.");
      return;
    }

    try {
      setSaving(true);
      const result = await apiFetch<{ message?: string; user?: Partial<Profile> }>(
        "/api/users/me",
        {
          method: "PATCH",
          body: JSON.stringify({
            name: profile.name.trim(),
            phone: profile.phone.trim(),
            location: profile.location.trim(),
            bio: profile.bio.trim(),
            profileImage: profile.profileImage.trim(),
          }),
        }
      );

      const saved = result.user || {};
      setProfile((previous) => ({
        ...previous,
        name: saved.name || previous.name,
        phone: saved.phone ?? previous.phone,
        location: saved.location ?? previous.location,
        bio: saved.bio ?? previous.bio,
        profileImage: saved.profileImage || previous.profileImage,
      }));

      await refreshUser().catch(() => undefined);
      toast.success(result.message || "Profile updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return <SessionLoader label="Loading your profile..." />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-lg p-6">
        <div className="card p-8 text-center">
          <h1 className="text-lg font-bold">Sign in required</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Please sign in to manage your profile.
          </p>
          <Link href="/sign-in?redirect=/dashboard/profile" className="btn-primary mt-5">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const role = normalizeRole(profile.role || user?.role);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Link href={dashboardHrefForRole(role)} className="text-link">
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="mb-8 mt-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
          Account Settings
        </p>
        <h1 className="section-title mt-2">My Profile</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Manage your personal information and profile photo.
        </p>
      </div>

      <form onSubmit={handleSave} className="card overflow-hidden">
        <div className="border-b border-[var(--border)] px-6 py-5 sm:px-8">
          <h2 className="text-lg font-bold">Profile Information</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Keep your profile information up to date.
          </p>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <div>
            <p className="field-label">Profile Photo</p>
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--secondary)] bg-[var(--secondary)]">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="text-[var(--primary)]" size={48} />
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-primary"
                >
                  {uploading ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="mt-2 text-xs text-[var(--muted)]">
                  JPG, PNG or WEBP. Maximum size 8 MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className="field-label">
                <UserRound size={14} className="mr-1.5 inline" />
                Full Name
              </label>
              <input
                id="profile-name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                maxLength={100}
                className="field-input"
              />
            </div>

            <div>
              <label htmlFor="profile-email" className="field-label">
                <Mail size={14} className="mr-1.5 inline" />
                Email Address
              </label>
              <input
                id="profile-email"
                value={profile.email}
                readOnly
                className="field-input cursor-not-allowed opacity-70"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">
                Email address cannot be changed here.
              </p>
            </div>

            <div>
              <label htmlFor="profile-phone" className="field-label">
                <Phone size={14} className="mr-1.5 inline" />
                Phone Number
              </label>
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                maxLength={20}
                className="field-input"
              />
            </div>

            <div>
              <label htmlFor="profile-location" className="field-label">
                <MapPin size={14} className="mr-1.5 inline" />
                Location
              </label>
              <input
                id="profile-location"
                name="location"
                value={profile.location}
                onChange={handleChange}
                maxLength={150}
                className="field-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="profile-bio" className="field-label">
                <FileText size={14} className="mr-1.5 inline" />
                About Me
              </label>
              <textarea
                id="profile-bio"
                name="bio"
                rows={5}
                value={profile.bio}
                onChange={handleChange}
                maxLength={1000}
                className="field-input resize-y"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] bg-[var(--secondary)] px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <Link
            href={dashboardHrefForRole(role)}
            className="btn-secondary justify-center px-6"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="btn-primary px-6"
          >
            {saving ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
