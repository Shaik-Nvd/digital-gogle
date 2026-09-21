import type { ChatContext } from "@/lib/chat-context";
export const runtime = "nodejs";
type Lead = { name?: string; email?: string; phone?: string; summary?: string; transcript?: unknown; context?: ChatContext };
export async function POST(request: Request) {
  let lead: Lead;
  try { lead = await request.json(); } catch { return new Response(null, { status: 400 }); }
  if (!process.env.LEAD_WEBHOOK_URL) { console.info("Lead webhook not configured; lead capture skipped."); return new Response(null, { status: 204 }); }
  try {
    const response = await fetch(process.env.LEAD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead), signal: AbortSignal.timeout(8000) });
    if (!response.ok) console.error("Lead webhook failed", { status: response.status });
  } catch (error) { console.error("Lead webhook request failed", error); }
  return new Response(null, { status: 204 });
}
