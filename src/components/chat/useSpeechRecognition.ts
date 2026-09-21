"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function browserLocale() { return typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US"; }

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const continuousModeRef = useRef(false);
  const mountedRef = useRef(true);
  const immediateEndsRef = useRef(0);
  const onFinalRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates client-only feature detection to avoid an SSR/CSR hydration mismatch
    setIsSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  const stop = useCallback(() => {
    continuousModeRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(
    (opts: { continuous: boolean; onFinalTranscript: (text: string) => void }) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        setError("Speech recognition isn't supported in this browser. Try Chrome or Edge.");
        return;
      }

      setError(null);
      onFinalRef.current = opts.onFinalTranscript;
      continuousModeRef.current = opts.continuous;

      const recognition = new Ctor();
      let triedFallbackLocale = false;
      recognition.lang = browserLocale();
      recognition.continuous = opts.continuous;
      recognition.interimResults = true;

      let gotUsefulResult = false;
      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result.isFinal) {
            if (transcript.trim()) gotUsefulResult = true;
            onFinalRef.current(transcript.trim());
            setInterimTranscript("");
          } else {
            interim += transcript;
          }
        }
        if (interim) setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech" || event.error === "aborted") return;
        setError(
          event.error === "not-allowed"
            ? "Microphone access was denied."
            : `Speech recognition error: ${event.error}`
        );
        setIsListening(false);
      };

      recognition.onend = () => {
        setInterimTranscript("");
        if (continuousModeRef.current && mountedRef.current) {
          if (!gotUsefulResult && !triedFallbackLocale && recognition.lang !== "en-US") {
            triedFallbackLocale = true;
            recognition.lang = "en-US";
            try { recognition.start(); return; } catch { /* continue with normal recovery */ }
          }
          immediateEndsRef.current = gotUsefulResult ? 0 : immediateEndsRef.current + 1;
          if (immediateEndsRef.current >= 3) {
            continuousModeRef.current = false;
            setIsListening(false);
            setError("The microphone stopped listening. Please check permission and try again.");
            return;
          }
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setError("Couldn't start the microphone.");
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      continuousModeRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return { isSupported, isListening, interimTranscript, error, start, stop };
}
