"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, LoaderCircle, Save } from "lucide-react";
import { toast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/api";
import type { Tuition } from "@/lib/tuitions";

export type TuitionPayload = {
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  description: string;
  location: string;
  salary: number;
  daysPerWeek: number;
  category: string;
  banner: string;
};

type FormState = {
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline";
  description: string;
  location: string;
  salary: string;
  daysPerWeek: string;
  category: string;
  banner: string;
};

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Programming",
  "IELTS",
  "Other",
];

const CLASS_LEVELS = [
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
  "Class 11",
  "Class 12",
  "University",
  "Adult learner",
];

function toFormState(tuition?: Partial<Tuition>): FormState {
  return {
    title: tuition?.title || "",
    subject: tuition?.subject || "",
    classLevel: tuition?.classLevel || "",
    mode: tuition?.mode === "Offline" ? "Offline" : "Online",
    description: tuition?.description || "",
    location: tuition?.location || "",
    salary: tuition?.salary ? String(tuition.salary) : "",
    daysPerWeek: tuition?.daysPerWeek ? String(tuition.daysPerWeek) : "",
    category: tuition?.category || "General",
    banner: tuition?.banner || "",
  };
}

export default function TuitionForm({
  initial,
  submitLabel = "Post Tuition",
  submitting = false,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Tuition>;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (payload: TuitionPayload) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function update(field: keyof FormState, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: field === "mode" ? (value === "Offline" ? "Offline" : "Online") : value,
    }));
  }

  async function uploadBanner(event: ChangeEvent<HTMLInputElement>) {
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
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Could not read the image."));
        };
        reader.onerror = () => reject(new Error("Image reading failed."));
        reader.readAsDataURL(file);
      });

      const result = await apiFetch<{ data?: { displayUrl?: string; url?: string } }>(
        "/api/upload/image",
        {
          method: "POST",
          body: JSON.stringify({ image, name: file.name }),
        }
      );

      const url = result.data?.displayUrl || result.data?.url;
      if (!url) throw new Error("Image URL was not returned by the server.");
      update("banner", url);
      toast.success("Banner uploaded.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to upload the banner."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const salary = Number(form.salary);
    const daysPerWeek = Number(form.daysPerWeek);

    if (
      !form.title.trim() ||
      !form.subject.trim() ||
      !form.classLevel.trim() ||
      !form.description.trim() ||
      !form.location.trim()
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(salary) || salary <= 0) {
      toast.error("Monthly salary must be greater than zero.");
      return;
    }

    if (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
      toast.error("Days per week must be a number between 1 and 7.");
      return;
    }

    await onSubmit({
      title: form.title.trim(),
      subject: form.subject.trim(),
      classLevel: form.classLevel.trim(),
      mode: form.mode,
      description: form.description.trim(),
      location: form.location.trim(),
      salary,
      daysPerWeek,
      category: form.category.trim() || "General",
      banner: form.banner.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="tuition-title" className="field-label">
            Tuition Title *
          </label>
          <input
            id="tuition-title"
            required
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="e.g. HSC Physics private tuition"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="tuition-subject" className="field-label">
            Subject *
          </label>
          <select
            id="tuition-subject"
            required
            value={form.subject}
            onChange={(event) => update("subject", event.target.value)}
            className="field-input"
          >
            <option value="">Select a subject</option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tuition-class" className="field-label">
            Class Level *
          </label>
          <select
            id="tuition-class"
            required
            value={form.classLevel}
            onChange={(event) => update("classLevel", event.target.value)}
            className="field-input"
          >
            <option value="">Select a class level</option>
            {CLASS_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tuition-mode" className="field-label">
            Learning Mode *
          </label>
          <select
            id="tuition-mode"
            required
            value={form.mode}
            onChange={(event) => update("mode", event.target.value)}
            className="field-input"
          >
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        <div>
          <label htmlFor="tuition-location" className="field-label">
            Location *
          </label>
          <input
            id="tuition-location"
            required
            value={form.location}
            onChange={(event) => update("location", event.target.value)}
            placeholder="e.g. Dhanmondi, Dhaka"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="tuition-salary" className="field-label">
            Monthly Salary (৳) *
          </label>
          <input
            id="tuition-salary"
            type="number"
            min="1"
            required
            value={form.salary}
            onChange={(event) => update("salary", event.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="tuition-days" className="field-label">
            Days per Week *
          </label>
          <input
            id="tuition-days"
            type="number"
            min="1"
            max="7"
            required
            value={form.daysPerWeek}
            onChange={(event) => update("daysPerWeek", event.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="tuition-category" className="field-label">
            Category
          </label>
          <input
            id="tuition-category"
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="tuition-banner" className="field-label">
            Banner URL
          </label>
          <input
            id="tuition-banner"
            type="url"
            value={form.banner}
            onChange={(event) => update("banner", event.target.value)}
            placeholder="https://..."
            className="field-input"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary h-[2.9rem] w-full justify-center"
          >
            {uploading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <ImagePlus size={16} />
            )}
            {uploading ? "Uploading..." : "Upload Banner Image"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={uploadBanner}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <label htmlFor="tuition-description" className="field-label">
          Description *
        </label>
        <textarea
          id="tuition-description"
          required
          rows={5}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="Describe the tuition requirements and expectations..."
          className="field-input resize-y"
        />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-5">
        <button type="submit" disabled={submitting || uploading} className="btn-primary">
          {submitting ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {submitting ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
