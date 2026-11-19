import { enquirySchema, fieldErrors } from "@/lib/enquiry-schema";
import { recordEnquiry } from "@/lib/enquiries";
import { networkKey } from "@/lib/rate-limit";
import { BodyError, readEnquiryBody } from "@/lib/request-json";

export const runtime = "nodejs";

function response(status: number, data: object, extraHeaders: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...extraHeaders } });
}

export async function POST(request: Request) {
  try {
    if (request.headers.get("sec-fetch-site") === "cross-site") {
      return response(403, { ok: false, message: "Submit the form on the Liora project page." });
    }
    const input = await readEnquiryBody(request);
    const validation = enquirySchema.safeParse(input);
    if (!validation.success) {
      return response(422, { ok: false, message: "Please check the highlighted fields.", errors: fieldErrors(validation.error) });
    }
    if (validation.data.website) return response(200, { ok: true });
    const result = await recordEnquiry(validation.data, networkKey(request.headers));
    switch (result) {
      case "created": return response(201, { ok: true });
      case "retry": return response(200, { ok: true });
      case "conflict": return response(409, { ok: false, message: "These details have changed. Start a new enquiry to send them." });
      case "limited": return response(429, { ok: false, message: "Several enquiries have been received. Please try again in ten minutes." }, { "Retry-After": "600" });
      case "unavailable": return response(503, { ok: false, message: "Enquiries are temporarily unavailable. Please try again later." });
    }
  } catch (error) {
    if (error instanceof BodyError) return response(error.status, { ok: false, message: error.message });
    return response(503, { ok: false, message: "We could not save your enquiry. Please try again." });
  }
}
