export const runtime = "nodejs";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `Translate the user's message to natural, fluent English.
Reply with ONLY the translation — no notes, no quotes, no "Here is the translation", nothing else.
If the message is already in English, reply with it unchanged.`;

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response("Server is missing GROQ_API_KEY.", { status: 500 });
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return new Response("No text provided.", { status: 400 });
  }

  const upstream = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      stream: false,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    const status = upstream.status || 502;
    const message =
      status === 429
        ? "Groq rate limit reached. Please wait a moment and try again."
        : `Groq API error (${status}): ${detail.slice(0, 300)}`;
    return new Response(message, { status });
  }

  const json = await upstream.json();
  const translation: string = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!translation) {
    return new Response("Empty translation from upstream.", { status: 502 });
  }

  return Response.json({ translation });
}
