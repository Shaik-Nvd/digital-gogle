"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type QueueItem = { audio: Promise<Blob | null> };

// 0.1s of silence; playing it inside a user gesture unlocks the audio element for later replies.
const SILENCE =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

/**
 * Plays a spoken reply as a queue of sentence-sized clips. Every clip is requested as soon
 * as it is enqueued (so the next one is usually ready before the current one ends) and
 * played strictly in order, one at a time. `cancel()` stops everything, including in-flight
 * requests, and invalidates any clip that arrives late.
 */
export function useFishAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const playingRef = useRef(false);
  const endedRef = useRef(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const cancel = useCallback(() => {
    generationRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    queueRef.current = [];
    playingRef.current = false;
    endedRef.current = true;
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setIsLoadingAudio(false);
    setIsSpeaking(false);
  }, []);

  const ensureAudio = useCallback(() => {
    if (typeof Audio === "undefined") return null;
    return (audioRef.current ??= new Audio());
  }, []);

  /** Call from a click/tap handler (the mic button) so later autoplay is allowed. */
  const prime = useCallback(() => {
    const audio = ensureAudio();
    if (!audio || playingRef.current) return;
    audio.src = SILENCE;
    audio.play().catch(() => {});
  }, [ensureAudio]);

  const drain = useCallback(async (generation: number) => {
    if (playingRef.current) return;
    playingRef.current = true;
    const audio = ensureAudio();
    while (audio && generation === generationRef.current) {
      const item = queueRef.current.shift();
      if (!item) break;
      const blob = await item.audio;
      if (generation !== generationRef.current) return;
      if (!blob || blob.size === 0) continue;

      const url = URL.createObjectURL(blob);
      audio.src = url;
      const finished = await new Promise<boolean>((resolve) => {
        audio.onended = () => resolve(true);
        audio.onerror = () => resolve(false);
        audio.play().then(
          () => {
            setIsLoadingAudio(false);
            setIsSpeaking(true);
          },
          () => resolve(false),
        );
      });
      URL.revokeObjectURL(url);
      if (generation !== generationRef.current) return;
      // A clip that fails to play (autoplay blocked, bad data) is skipped; the rest still get their turn.
      if (!finished) continue;
    }
    if (generation !== generationRef.current) return;
    playingRef.current = false;
    // Idle only once the reply has finished streaming AND nothing is left to play.
    setIsLoadingAudio(false);
    if (endedRef.current) setIsSpeaking(false);
  }, [ensureAudio]);

  /** Add one chunk of a reply. Starts speaking immediately if nothing is playing. */
  const enqueue = useCallback((text: string) => {
    ensureAudio();
    if (endedRef.current) {
      // First chunk of a new reply: start from a clean slate.
      cancel();
      endedRef.current = false;
    }
    const controller = (controllerRef.current ??= new AbortController());
    const generation = generationRef.current;
    const audio = fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
      .then((response) => (response.ok && response.status !== 204 ? response.blob() : null))
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") console.error("Voice request failed", error);
        return null;
      });
    queueRef.current.push({ audio });
    if (!playingRef.current) setIsLoadingAudio(true);
    void drain(generation);
  }, [cancel, drain, ensureAudio]);

  /** Tell the queue no more chunks are coming, so it can go idle after the last clip. */
  const finish = useCallback(() => {
    // Chunks may not have started (nothing enqueued): just make sure we don't hang in "loading".
    if (!playingRef.current && !queueRef.current.length) {
      endedRef.current = true;
      setIsLoadingAudio(false);
      setIsSpeaking(false);
      return;
    }
    endedRef.current = true;
  }, []);

  /** Convenience: speak one complete piece of text. */
  const speak = useCallback((text: string) => {
    cancel();
    enqueue(text);
    finish();
  }, [cancel, enqueue, finish]);

  useEffect(() => cancel, [cancel]);
  return { isSpeaking, isLoadingAudio, enqueue, finish, speak, cancel, prime };
}
