"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type ApplicationRecord = {
  _id?: string;
  id?: string;
  tuitionId?: string;
  status?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  preferredSchedule?: string;
  studentNote?: string;
  message?: string;
  appliedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  tuitionTitle?: string;
  subject?: string;
  monthlyFee?: number | string;
  salary?: number | string;
  tutorName?: string;
  tutorEmail?: string;
  tuition?: {
    _id?: string;
    title?: string;
    subject?: string;
    monthlyFee?: number | string;
    salary?: number | string;
    tutorName?: string;
    tutorEmail?: string;
  };
};

type ApplicationsResponse = {
  success?: boolean;
  total?: number;
  data?: ApplicationRecord[];
};

export function useMyApplications(enabled = true) {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await apiFetch<ApplicationsResponse>(
        "/api/applications/my-applications"
      );
      setApplications(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load applications.";
      setError(message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { applications, loading, error, reload, setApplications };
}
