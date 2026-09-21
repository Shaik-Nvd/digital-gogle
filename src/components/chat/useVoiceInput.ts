"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type Phase = "idle" | "listening" | "transcribing";
type Session = { stop: () => void; cancel: () => void };

const SPEECH_LEVEL = 0.018; // RMS above this counts as the visitor speaking
const SILENCE_MS = 1400; // stop this long after they finish
const NO_SPEECH_MS = 9000; // give up if nothing was said
const MAX_MS = 30000;

const MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

function extensionFor(mime: string) {
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

const subscribeNothing = () => () => {};
const detectSupport = () =>
  typeof MediaRecorder !== "undefined" && typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

/**
 * Records the microphone, stops on its own when the visitor goes quiet, and transcribes
 * server-side (Whisper). Unlike the browser's built-in recogniser this works in every
 * browser and detects the spoken language itself.
 */
export function useVoiceInput() {
  const isSupported = useSyncExternalStore(subscribeNothing, detectSupport, () => false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => sessionRef.current?.stop(), []);

  const cancel = useCallback(() => {
    sessionRef.current?.cancel();
    requestRef.current?.abort();
    requestRef.current = null;
    setPhase("idle");
  }, []);

  const start = useCallback(async (onTranscript: (text: string, language: string | null) => void) => {
    if (sessionRef.current) return;
    setError(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (cause) {
      const denied = (cause as DOMException).name === "NotAllowedError";
      setError(denied ? "Microphone access is blocked. Allow it in your browser to talk to me." : "I couldn't find a microphone.");
      return;
    }

    const mimeType = MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];

    const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const context = AudioContextCtor ? new AudioContextCtor() : null;
    const node = context?.createAnalyser() ?? null;
    if (context && node) {
      node.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(node);
    }

    const state = { cancelled: false, heardSpeech: false, startedAt: Date.now(), lastVoiceAt: Date.now() };
    const samples = node ? new Float32Array(node.fftSize) : null;
    const finish = () => {
      if (recorder.state !== "inactive") recorder.stop();
    };

    // setInterval (not rAF) so silence detection keeps working in a backgrounded tab.
    const tick = window.setInterval(() => {
      const now = Date.now();
      if (node && samples) {
        node.getFloatTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) sum += sample * sample;
        if (Math.sqrt(sum / samples.length) > SPEECH_LEVEL) {
          state.heardSpeech = true;
          state.lastVoiceAt = now;
        }
      } else {
        state.heardSpeech = true; // no analyser available: rely on the manual stop / max length
      }
      if (state.heardSpeech && node && now - state.lastVoiceAt > SILENCE_MS) finish();
      else if (!state.heardSpeech && now - state.startedAt > NO_SPEECH_MS) { state.cancelled = true; finish(); }
      else if (now - state.startedAt > MAX_MS) finish();
    }, 60);

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = async () => {
      window.clearInterval(tick);
      stream.getTracks().forEach((track) => track.stop());
      void context?.close();
      setAnalyser(null);
      sessionRef.current = null;

      if (state.cancelled || !state.heardSpeech) {
        setPhase("idle");
        return;
      }
      setPhase("transcribing");
      const controller = new AbortController();
      requestRef.current = controller;
      try {
        const type = recorder.mimeType || "audio/webm";
        const form = new FormData();
        form.set("audio", new Blob(chunks, { type }), `voice.${extensionFor(type)}`);
        const response = await fetch("/api/stt", { method: "POST", body: form, signal: controller.signal });
        if (!response.ok) throw new Error(`STT ${response.status}`);
        const result = (await response.json()) as { text?: string; language?: string | null };
        if (result.text) onTranscript(result.text, result.language ?? null);
        else setError("I didn't catch that. Tap the mic and try again.");
      } catch (cause) {
        if ((cause as Error).name !== "AbortError") setError("I couldn't process that. Please try again or type your message.");
      } finally {
        if (requestRef.current === controller) requestRef.current = null;
        setPhase("idle");
      }
    };

    sessionRef.current = {
      stop: finish,
      cancel: () => {
        state.cancelled = true;
        finish();
      },
    };
    setAnalyser(node);
    setPhase("listening");
    recorder.start(250);
  }, []);

  useEffect(() => cancel, [cancel]);

  return { isSupported, isListening: phase === "listening", isTranscribing: phase === "transcribing", error, analyser, start, stop, cancel };
}
