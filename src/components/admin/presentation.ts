import { unitOptions } from "@/lib/enquiry-schema";
import type { LeadStatus } from "@/generated/prisma/enums";

export const statusLabels = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  CLOSED: "Closed",
} satisfies Record<LeadStatus, string>;

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && Object.hasOwn(statusLabels, value);
}

export function unitLabel(value: string) {
  return unitOptions.find((option) => option.value === value)?.label ?? value;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai", day: "numeric", month: "short", year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
export function formatDate(value: Date) {
  return dateFormatter.format(value);
}
export function formatTime(value: Date) {
  return timeFormatter.format(value);
}

export type QueryInput = Record<string, string | string[] | undefined>;
export const pageSize = 15;

export function parseFilters(input: QueryInput) {
  const term = typeof input.q === "string" ? input.q.trim().slice(0, 120) : "";
  const status = isLeadStatus(input.status) ? input.status : undefined;
  const sort = input.sort === "oldest" ? "oldest" : "newest";
  const page = typeof input.page === "string" && /^[1-9]\d{0,6}$/.test(input.page)
    ? Number(input.page) : 1;
  const range = input.range === '7' || input.range === '30' ? input.range : undefined;
  return { term, status, sort, page, range } as const;
}

export function pageUrl(filters: ReturnType<typeof parseFilters>, page: number) {
  const query = new URLSearchParams();
  if (filters.term) query.set("q", filters.term);
  if (filters.status) query.set("status", filters.status);
  if (filters.sort === "oldest") query.set("sort", "oldest");
  if (page > 1) query.set("page", String(page));
  if (filters.range) query.set("range", filters.range);
  return query.size ? `/admin/leads?${query}` : "/admin/leads";
}
