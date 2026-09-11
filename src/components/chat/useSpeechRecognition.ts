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

export function useSpeechRecognition(lang: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const continuousModeRef = useRef(false);
  const onFinalRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
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
      recognition.lang = lang === "auto" ? "en-US" : lang;
      recognition.continuous = opts.continuous;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          if (result.isFinal) {
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
        if (continuousModeRef.current) {
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
    [lang]
  );

  useEffect(() => {
    return () => {
      continuousModeRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  return { isSupported, isListening, interimTranscript, error, start, stop };
}
