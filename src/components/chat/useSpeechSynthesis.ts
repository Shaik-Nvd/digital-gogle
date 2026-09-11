"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Thin wrapper around window.speechSynthesis (TTS).
 * Handles the async voice list (often empty until `voiceschanged` fires),
 * picks the closest voice for a BCP-47 language code, and exposes speak/cancel.
 */
export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setIsSupported(true);

    const synth = window.speechSynthesis;
    const loadVoices = () => {
      voicesRef.current = synth.getVoices();
    };
    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    return () => synth.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const pickVoice = useCallback((langCode: string) => {
    const voices = voicesRef.current;
    if (!voices.length) return null;
    const normalized = langCode.toLowerCase();
    const prefix = normalized.split("-")[0];
    return (
      voices.find((v) => v.lang.toLowerCase() === normalized) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
      null
    );
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, langCode: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const synth = window.speechSynthesis;
      // Barge-in: any new utterance immediately supersedes whatever is playing.
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      const voice = langCode && langCode !== "auto" ? pickVoice(langCode) : null;
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else if (langCode && langCode !== "auto") {
        utterance.lang = langCode;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      try {
        synth.speak(utterance);
      } catch {
        setIsSpeaking(false);
      }
    },
    [pickVoice]
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { isSupported, isSpeaking, speak, cancel };
}
