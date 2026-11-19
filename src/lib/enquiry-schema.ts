import { z } from "zod";

export const unitTypeSchema = z.enum(["ONE_BED", "TWO_BED", "THREE_BED", "FOUR_BED", "UNDECIDED"], {
  error: "Select a residence or choose general enquiry.",
});

export const unitOptions = [
  { value: "ONE_BED", label: "1 bedroom" },
  { value: "TWO_BED", label: "2 bedrooms" },
  { value: "THREE_BED", label: "3 bedrooms" },
  { value: "FOUR_BED", label: "4 bedrooms" },
  { value: "UNDECIDED", label: "General enquiry" },
] as const;

const attribution = z.string().trim().max(128, "Campaign fields must be 128 characters or fewer.").optional();
export const enquirySchema = z.strictObject({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120, "Use 120 characters or fewer."),
  email: z.string().trim().max(254).toLowerCase().pipe(z.email("Enter a valid email address.")),
  phone: z.string().trim().max(40).transform((value) => value.replace(/[\s().-]/g, ""))
    .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Include the country code, for example +971 50 123 4567.")),
  interestedUnitType: unitTypeSchema,
  message: z.string().trim().max(2000, "Use 2,000 characters or fewer.").optional(),
  contactConsent: z.boolean().refine(Boolean, "Please consent to being contacted about your enquiry."),
  marketingConsent: z.boolean().optional().default(false),
  website: z.string().max(512).optional(),
  utmSource: attribution,
  utmMedium: attribution,
  utmCampaign: attribution,
  idempotencyKey: z.uuid("Refresh the page and try again."),
});

export type Enquiry = z.output<typeof enquirySchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    fields[field] ??= issue.message;
  }
  return fields;
}
