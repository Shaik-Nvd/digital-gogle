"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useFishAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.removeAttribute("src"); audio.load(); }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setIsLoadingAudio(false);
    setIsSpeaking(false);
  }, []);

  const prime = useCallback(() => {
    if (typeof Audio === "undefined") return;
    audioRef.current ??= new Audio();
  }, []);

  const speak = useCallback(async (text: string) => {
    cancel();
    prime();
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsLoadingAudio(true);
    try {
      const response = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }), signal: controller.signal });
      if (!response.ok) return;
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = url;
      audio.onended = () => cancel();
      audio.onerror = () => cancel();
      setIsLoadingAudio(false);
      try { await audio.play(); setIsSpeaking(true); } catch { cancel(); }
    } catch (error) {
      if ((error as Error).name !== "AbortError") console.error("Voice playback failed", error);
    } finally {
      if (!controller.signal.aborted) setIsLoadingAudio(false);
    }
  }, [cancel, prime]);

  useEffect(() => cancel, [cancel]);
  return { isSpeaking, isLoadingAudio, speak, cancel, prime };
}
