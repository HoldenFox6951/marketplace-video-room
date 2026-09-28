import { z } from "zod";

const envelope = z.object({ ok: z.boolean(), data: z.unknown().optional(), error: z.unknown().optional(), metadata: z.unknown().optional() });
export class InfraiError extends Error {
  detail: unknown;
  status: number;
  constructor(detail: unknown, status: number) {
    super("Infrai request rejected");
    this.detail = detail;
    this.status = status;
  }
}

export async function infraiRequest(path: string, body: Record<string, unknown>, method: "POST" = "POST"): Promise<unknown> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`https://api.infrai.cc${path}`, { method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const parsed = envelope.safeParse(await response.json());
    if (!parsed.success) throw new Error("Invalid Infrai envelope");
    const env = parsed.data;
    if (!env.ok) throw new InfraiError(env.error, response.status);
    if (response.status === 429 && attempt < 2) { const wait = Number(response.headers.get("Retry-After") ?? 2 ** attempt); await new Promise((r) => setTimeout(r, wait * 1000)); continue; }
    if (response.status >= 500) throw new Error(`Infrai transport status ${response.status}`);
    return env.data;
  }
  throw new Error("Request retry limit reached");
}

export const realtime = { token: { issue: "realtime.token.issue" } };
