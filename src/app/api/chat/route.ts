export const runtime = "nodejs";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are a helpful, friendly assistant for Digital Gogle Studio, a web/AI development agency.
Detect the language of the user's latest message yourself (regardless of what language earlier turns were in) and reply in that same language, matching script and tone naturally.
Keep answers concise and conversational since this is a live chat widget, not an essay.`;

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response("Server is missing GROQ_API_KEY.", { status: 500 });
  }

  let body: { messages?: ChatMessage[]; language?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response("No messages provided.", { status: 400 });
  }

  const languageHint = body.language && body.language !== "auto"
    ? `\nThe user has manually selected "${body.language}" as their preferred reply language — reply in it regardless of the language they typed in.`
    : "";

  const upstream = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + languageHint },
        ...messages,
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    const status = upstream.status || 502;
    const message =
      status === 429
        ? "Groq rate limit reached. Please wait a moment and try again."
        : `Groq API error (${status}): ${detail.slice(0, 300)}`;
    return new Response(message, { status });
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const delta: string | undefined = json.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // ignore malformed SSE chunk
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
