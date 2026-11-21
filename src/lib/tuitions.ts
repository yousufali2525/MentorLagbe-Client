export type Tuition = {
  _id?: string;
  id?: string;
  title?: string;
  subject?: string;
  category?: string;
  classLevel?: string;
  class?: string;
  mode?: "Online" | "Offline" | string;
  location?: string;
  salary?: number | string;
  monthlyFee?: number | string;
  daysPerWeek?: number | string;
  tutorId?: string;
  tutorName?: string;
  tutorEmail?: string;
  description?: string;
  schedule?: string;
  banner?: string;
  approvalStatus?: string;
  isActive?: boolean;
  createdAt?: string;
};

export type TuitionListResponse = {
  success?: boolean;
  count?: number;
  total?: number;
  tuitions?: Tuition[];
  data?: Tuition[] | { tuitions?: Tuition[]; pagination?: unknown };
  pagination?: { total?: number; totalItems?: number; totalPages?: number };
};

/** Normalizes the several response shapes used by the tuition endpoints. */
export function extractTuitionList(result: unknown): Tuition[] {
  if (Array.isArray(result)) return result as Tuition[];

  const payload = result as TuitionListResponse | undefined;
  if (Array.isArray(payload?.tuitions)) return payload.tuitions;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.tuitions)) return payload.data.tuitions;

  return [];
}

export function tuitionId(tuition: Tuition): string {
  return tuition._id || tuition.id || "";
}

export function tuitionFee(tuition: Tuition): number | null {
  const raw = tuition.monthlyFee ?? tuition.salary;
  if (raw === null || raw === undefined || raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatFee(fee: number | string | null | undefined): string {
  if (fee === null || fee === undefined || fee === "") return "Negotiable";
  const parsed = Number(fee);
  if (!Number.isFinite(parsed)) return "Negotiable";
  return `৳${parsed.toLocaleString("en-BD")}/month`;
}

export function classLevelOf(tuition: Tuition): string {
  return tuition.classLevel || tuition.class || "Class not specified";
}

export function modeOf(tuition: Tuition): string {
  return tuition.mode || "Flexible";
}

export function locationOf(tuition: Tuition): string {
  return tuition.location || "Location not specified";
}

export function tutorNameOf(tuition: Tuition): string {
  return tuition.tutorName || "MentorLagbe Tutor";
}
