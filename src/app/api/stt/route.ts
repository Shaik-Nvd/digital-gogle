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

  async function transcribe(languageHint?: string): Promise<Response> {
    const form = new FormData();
    form.set("file", audio, audio.name || "voice.webm");
    form.set("model", MODEL);
    form.set("response_format", "verbose_json");
    form.set("temperature", "0");
    form.set("prompt", VOCABULARY);
    if (languageHint) form.set("language", languageHint);
    return fetch(GROQ_TRANSCRIBE, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(20000),
    });
  }

  try {
    // No language hint on the first pass: Whisper auto-detects, and that's what makes Spanish,
    // Tamil, English, and everything else just work without configuration.
    const upstream = await transcribe();
    if (!upstream.ok) {
      console.error("Groq transcription failed", { status: upstream.status, detail: (await upstream.text()).slice(0, 500) });
      return new Response(upstream.status === 429 ? "Voice input is busy. Try again in a moment." : "Voice input is temporarily unavailable.", { status: upstream.status === 429 ? 429 : 502 });
    }
    let result = (await upstream.json()) as Transcription;

    // Hindi and Urdu are close to the same spoken language (Hindustani) in different scripts,
    // and Whisper's auto-detect frequently mislabels clean Hindi speech as Urdu — confirmed by
    // feeding this route's own Hindi TTS output back through it. Since the vast majority of this
    // site's Hindi/Urdu voice traffic is Hindi, and forcing the "hi" language re-decodes the same
    // audio in Devanagari, re-run just that case rather than ship visibly wrong-script transcripts.
    if (result.language === "Urdu") {
      const retry = await transcribe("hi");
      if (retry.ok) result = (await retry.json()) as Transcription;
    }

    const text = looksLikeSilence(result) ? "" : (result.text ?? "").trim();
    return Response.json({ text, language: result.language ?? null });
  } catch (error) {
    console.error("Groq transcription request failed", error);
    return new Response("Voice input is temporarily unavailable.", { status: 502 });
  }
}
