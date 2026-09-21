export const runtime = "nodejs";

const GROQ_TRANSCRIBE = "https://api.groq.com/openai/v1/audio/transcriptions";
const MODEL = "whisper-large-v3-turbo";
const MAX_BYTES = 8 * 1024 * 1024;
// Nudges Whisper toward the words visitors actually say here (brand and service names).
const VOCABULARY = "Digital Gogle Studio, website, mobile app, AI agent, chatbot, SEO, e-commerce, automation, WhatsApp.";

type Segment = { no_speech_prob?: number };
type Transcription = { text?: string; language?: string; segments?: Segment[] };

/** Whisper invents phrases like "Thank you." on near-silence; drop clips it is itself unsure contain speech. */
function looksLikeSilence(result: Transcription): boolean {
  const segments = result.segments ?? [];
  if (!segments.length) return true;
  return segments.every((segment) => (segment.no_speech_prob ?? 0) > 0.6);
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return new Response("Voice input is unavailable.", { status: 503 });

  let audio: File;
  try {
    const form = await request.formData();
    const file = form.get("audio");
    if (!(file instanceof File) || file.size === 0) return new Response("Audio is required.", { status: 400 });
    if (file.size > MAX_BYTES) return new Response("Recording is too long.", { status: 413 });
    audio = file;
  } catch {
    return new Response("Invalid request.", { status: 400 });
  }

  // No `language` on purpose: Whisper detects it, so Hindi, Spanish and English all just work.
  const upstreamForm = new FormData();
  upstreamForm.set("file", audio, audio.name || "voice.webm");
  upstreamForm.set("model", MODEL);
  upstreamForm.set("response_format", "verbose_json");
  upstreamForm.set("temperature", "0");
  upstreamForm.set("prompt", VOCABULARY);

  try {
    const upstream = await fetch(GROQ_TRANSCRIBE, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstreamForm,
      signal: AbortSignal.timeout(20000),
    });
    if (!upstream.ok) {
      console.error("Groq transcription failed", { status: upstream.status, detail: (await upstream.text()).slice(0, 500) });
      return new Response(upstream.status === 429 ? "Voice input is busy. Try again in a moment." : "Voice input is temporarily unavailable.", { status: upstream.status === 429 ? 429 : 502 });
    }
    const result = (await upstream.json()) as Transcription;
    const text = looksLikeSilence(result) ? "" : (result.text ?? "").trim();
    return Response.json({ text, language: result.language ?? null });
  } catch (error) {
    console.error("Groq transcription request failed", error);
    return new Response("Voice input is temporarily unavailable.", { status: 502 });
  }
}
