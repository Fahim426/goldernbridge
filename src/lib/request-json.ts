const maxBytes = 16 * 1024;

export class BodyError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

export async function readEnquiryBody(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new BodyError(415, "Send the enquiry as JSON.");
  }
  if (Number(request.headers.get("content-length")) > maxBytes) throw new BodyError(413, "The enquiry is too large.");
  if (!request.body) throw new BodyError(400, "The enquiry is empty.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new BodyError(413, "The enquiry is too large.");
      }
      chunks.push(value);
    }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks)));
  } catch (error) {
    if (error instanceof BodyError) throw error;
    throw new BodyError(400, "The enquiry could not be read.");
  } finally {
    reader.releaseLock();
  }
}
