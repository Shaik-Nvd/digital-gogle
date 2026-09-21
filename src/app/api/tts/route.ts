import { normaliseSpeech, truncateSpeech } from "@/lib/speech";
import { sanitiseSpeechTags, usesIndicScript } from "@/lib/speech-tags";

export const runtime = "nodejs";

const FISH_ENDPOINT = "https://api.fish.audio/v1/tts";
// Free tier model id. Fish lists free access through 2026-11-30; after that switch to "s2.1-pro" (paid).
const DEFAULT_MODEL = "s2.1-pro-free";

export async function POST(request: Request) {
  const key = process.env.FISH_AUDIO_API_KEY;
  const englishVoice = process.env.FISH_AUDIO_VOICE_ID;
  if (!key || !englishVoice) return new Response("Voice is unavailable.", { status: 503 });

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid request.", { status: 400 });
  }
  const raw = typeof body.text === "string" ? body.text : "";

  // Hindi and other Indian-script text goes to the Indian-language voice; the English voice
  // turns those scripts into gibberish. With no such voice configured, stay silent instead.
  const indic = usesIndicScript(raw);
  const voiceId = indic ? process.env.FISH_AUDIO_VOICE_ID_HI : englishVoice;
  if (!voiceId) return new Response(null, { status: 204 });

  // Order matters: markdown/links are flattened first, so any [word] left over is an expression cue.
  const text = truncateSpeech(sanitiseSpeechTags(normaliseSpeech(raw, indic)));
  if (!text) return new Response("Text is required.", { status: 400 });

  try {
    const upstream = await fetch(FISH_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        model: process.env.FISH_AUDIO_MODEL || DEFAULT_MODEL,
      },
      body: JSON.stringify({
        text,
        reference_id: voiceId,
        format: "mp3",
        mp3_bitrate: 128,
        normalize: true,
        latency: "balanced",
        chunk_length: 200,
      }),
      signal: request.signal,
    });
    if (!upstream.ok || !upstream.body) {
      console.error("Fish Audio TTS failed", { status: upstream.status, detail: (await upstream.text()).slice(0, 500) });
      return new Response("Voice is temporarily unavailable.", { status: 502 });
    }
    return new Response(upstream.body, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    if ((error as Error).name !== "AbortError") console.error("Fish Audio TTS request failed", error);
    return new Response("Voice is temporarily unavailable.", { status: 502 });
  }
}
