import { normaliseSpeech, truncateSpeech } from "@/lib/speech";

export const runtime = "nodejs";
const FISH_ENDPOINT = "https://api.fish.audio/v1/tts";
const DEFAULT_MODEL = "s2.1-pro";

export async function POST(request: Request) {
  const key = process.env.FISH_AUDIO_API_KEY;
  const voiceId = process.env.FISH_AUDIO_VOICE_ID;
  if (!key || !voiceId) return new Response("Voice is unavailable.", { status: 503 });
  let body: { text?: unknown };
  try { body = await request.json(); } catch { return new Response("Invalid request.", { status: 400 }); }
  const text = typeof body.text === "string" ? truncateSpeech(normaliseSpeech(body.text)) : "";
  if (!text) return new Response("Text is required.", { status: 400 });

  try {
    const upstream = await fetch(FISH_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", model: process.env.FISH_AUDIO_MODEL || DEFAULT_MODEL },
      body: JSON.stringify({ text, reference_id: voiceId, format: "mp3", mp3_bitrate: 128, normalize: true, latency: "balanced", chunk_length: 120 }),
      signal: request.signal,
    });
    if (!upstream.ok || !upstream.body) {
      console.error("Fish Audio TTS failed", { status: upstream.status, detail: (await upstream.text()).slice(0, 500) });
      return new Response("Voice is temporarily unavailable.", { status: 502 });
    }
    return new Response(upstream.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    if ((error as Error).name !== "AbortError") console.error("Fish Audio TTS request failed", error);
    return new Response("Voice is temporarily unavailable.", { status: 502 });
  }
}
