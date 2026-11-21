"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { extractTuitionList, type Tuition } from "@/lib/tuitions";

type ResponseShape = {
  success?: boolean;
  tuitions?: Tuition[];
  data?: Tuition[] | { tuitions?: Tuition[] };
};

export function useMyTuitions(enabled = true) {
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
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
      const result = await apiFetch<ResponseShape>("/api/tuitions/my-tuitions");
      setTuitions(extractTuitionList(result));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load your tuitions.";
      setError(message);
      setTuitions([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tuitions, loading, error, reload, setTuitions };
}
