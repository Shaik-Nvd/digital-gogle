import type { ChatContext } from "@/lib/chat-context";

export const runtime = "nodejs";

type Turn = { role: string; content: string };
type Lead = {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  transcript?: Turn[];
  context?: ChatContext;
};

/** Readable one-liner describing where on the site the visitor was. */
function describeContext(context?: ChatContext): string {
  if (!context) return "Unknown";
  const dwell = Object.entries(context.dwellSeconds)
    .filter(([, seconds]) => (seconds ?? 0) > 3)
    .map(([section, seconds]) => `${section} ${Math.round(seconds ?? 0)}s`)
    .join(", ");
  return [
    `Reading: ${context.currentSection}`,
    dwell && `Time on page: ${dwell}`,
    context.isReturning && "Returning visitor",
    context.referrer && `Referred by: ${context.referrer}`,
    context.localTime && `Their local time: ${context.localTime}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function formatTranscript(transcript?: Turn[]): string {
  if (!Array.isArray(transcript) || transcript.length === 0) return "(no transcript)";
  return transcript
    .map((turn) => `${turn.role === "user" ? "Visitor" : "Assistant"}: ${turn.content}`)
    .join("\n\n");
}

export async function POST(request: Request) {
  let lead: Lead;
  try {
    lead = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    console.info("Lead webhook not configured; lead capture skipped.");
    return new Response(null, { status: 204 });
  }

  const handle = lead.email || lead.phone || "no contact handle";

  // Flat string fields so an email-delivery webhook (Formspree et al.) renders a
  // readable message; the raw objects ride along for anything more structured.
  const payload = {
    _subject: `New chat lead — ${handle}`,
    name: lead.name || "(not given)",
    email: lead.email || "(not given)",
    phone: lead.phone || "(not given)",
    summary: lead.summary || "(none)",
    page_context: describeContext(lead.context),
    conversation: formatTranscript(lead.transcript),
    received_at: new Date().toISOString(),
    raw: { transcript: lead.transcript, context: lead.context },
  };

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) console.error("Lead webhook failed", { status: response.status });
  } catch (error) {
    console.error("Lead webhook request failed", error);
  }

  return new Response(null, { status: 204 });
}
