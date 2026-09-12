"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Strips common markdown so TTS doesn't read out literal `**`, `#`, `-`, etc. */
function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "") // fenced code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url)
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/^\s*[-*+]\s+/gm, "") // bullet markers
    .replace(/^\s*\d+\.\s+/gm, "") // numbered list markers
    .replace(/\n{2,}/g, ". ") // paragraph breaks -> pause
    .replace(/\n/g, " ")
    .trim();
}

/**
 * Scripts where a wrong/default voice doesn't just sound accented — it reads
 * nonsense, because the phoneme rules don't apply at all. For these, we only
 * ever speak if a real matching system voice exists; otherwise we stay silent
 * rather than force a mispronunciation.
 */
const NON_LATIN_SCRIPTS: Array<{ test: RegExp; lang: string }> = [
  { test: /[ऀ-ॿ]/, lang: "hi" }, // Devanagari (Hindi, Marathi)
  { test: /[ঀ-৿]/, lang: "bn" }, // Bengali
  { test: /[஀-௿]/, lang: "ta" }, // Tamil
  { test: /[ఀ-౿]/, lang: "te" }, // Telugu
  { test: /[ಀ-೿]/, lang: "kn" }, // Kannada
  { test: /[ഀ-ൿ]/, lang: "ml" }, // Malayalam
  { test: /[਀-੿]/, lang: "pa" }, // Gurmukhi (Punjabi)
  { test: /[઀-૿]/, lang: "gu" }, // Gujarati
  { test: /[؀-ۿ]/, lang: "ur" }, // Arabic script (Urdu)
  { test: /[Ѐ-ӿ]/, lang: "ru" }, // Cyrillic (Russian)
];

/** Guesses a language from the reply text itself, used only in "auto" mode. */
function detectNonLatinLang(text: string): string | null {
  for (const { test, lang } of NON_LATIN_SCRIPTS) {
    if (test.test(text)) return lang;
  }
  return null;
}

/**
 * Thin wrapper around window.speechSynthesis (TTS).
 * Handles the async voice list (often empty until `voiceschanged` fires),
 * picks the closest voice for a BCP-47 language code, and exposes speak/cancel.
 * Only ever speaks a language the browser actually has a voice for — it never
 * forces a script through a mismatched voice, which mangles the pronunciation
 * instead of just sounding accented.
 */
export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates client-only feature detection to avoid an SSR/CSR hydration mismatch
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
      const trimmed = stripMarkdownForSpeech(text);
      if (!trimmed) return;

      const synth = window.speechSynthesis;
      // Barge-in: any new utterance immediately supersedes whatever is playing.
      synth.cancel();

      // Prefer an explicit selection; in "auto" mode, guess from the text's script.
      const explicitLang = langCode && langCode !== "auto" ? langCode : null;
      const effectiveLang = explicitLang ?? detectNonLatinLang(trimmed);
      const isRiskyScript = effectiveLang
        ? NON_LATIN_SCRIPTS.some((s) => s.lang === effectiveLang.split("-")[0])
        : false;
      const voice = effectiveLang ? pickVoice(effectiveLang) : null;

      // Never force a risky script through a voice that can't actually read it —
      // that produces nonsense, not just an accent. Stay silent instead.
      if (isRiskyScript && !voice) return;

      const utterance = new SpeechSynthesisUtterance(trimmed);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else if (effectiveLang) {
        // Latin-script language (e.g. Spanish/French) with no exact voice match —
        // still hint the OS speech engine via `lang`, which usually reads it fine.
        utterance.lang = effectiveLang;
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
