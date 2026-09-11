"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Mic, MicOff, Send, Radio, AlertCircle, Loader2 } from "lucide-react";
import { CHAT_LANGUAGES } from "@/lib/chat-languages";
import { useSpeechRecognition } from "./useSpeechRecognition";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function makeId() {
  return Math.random().toString(36).slice(2);
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("auto");
  const [continuousMode, setContinuousMode] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const {
    isSupported: sttSupported,
    isListening,
    interimTranscript,
    error: sttError,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition(language);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, interimTranscript]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setRequestError(null);
    const userMessage: Message = { id: makeId(), role: "user", content: trimmed };
    const assistantId = makeId();
    const nextMessages = [...messages, userMessage];

    setMessages([...nextMessages, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          language,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new Error(detail || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
        );
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setRequestError((err as Error).message || "Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function handleMicToggle() {
    if (isListening) {
      stopListening();
      return;
    }
    startListening({
      continuous: continuousMode,
      onFinalTranscript: (text) => {
        if (continuousMode) {
          sendMessage(text);
        } else {
          setInput((prev) => (prev ? `${prev} ${text}` : text));
        }
      },
    });
  }

  return (
    <div className="fixed bottom-48 right-4 md:right-8 z-[60] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[92vw] max-w-sm h-[clamp(320px,calc(100dvh_-_260px),600px)] rounded-2xl flex flex-col overflow-hidden bg-background border border-glass-border shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-glass-border bg-glass">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-black" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-semibold text-foreground truncate">AI Assistant</p>
              <p className="text-xs text-muted truncate">Ask anything, in your language</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full hover:bg-glass-border transition-colors"
            >
              <X size={18} className="text-muted" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border-b border-glass-border">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs bg-background border border-glass-border rounded-lg px-2 py-1.5 text-foreground flex-1 min-w-0 outline-none"
              aria-label="Reply language"
            >
              {CHAT_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-background text-foreground">
                  {l.label}
                </option>
              ))}
            </select>
            {sttSupported && (
              <button
                onClick={() => setContinuousMode((v) => !v)}
                title={continuousMode ? "Continuous listening on" : "Push-to-talk mode"}
                aria-pressed={continuousMode}
                aria-label="Toggle continuous listening"
                className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border transition-colors ${
                  continuousMode
                    ? "border-accent text-accent bg-accent/10"
                    : "border-glass-border text-muted hover:text-foreground"
                }`}
              >
                <Radio size={14} />
              </button>
            )}
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-background">
            {messages.length === 0 && (
              <p className="text-xs text-muted text-center mt-8 px-4">
                Type or tap the mic to start — Hindi, Tamil, Spanish, French and more all work.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-accent text-black"
                    : "mr-auto bg-glass border border-glass-border text-foreground"
                }`}
              >
                {m.content || (isStreaming && m.role === "assistant" ? (
                  <Loader2 size={14} className="animate-spin text-muted" />
                ) : "")}
              </div>
            ))}
            {interimTranscript && (
              <div className="ml-auto max-w-[85%] rounded-2xl px-3 py-2 text-sm italic text-muted border border-dashed border-glass-border">
                {interimTranscript}
              </div>
            )}
          </div>

          {(requestError || sttError) && (
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-red-400 border-t border-glass-border bg-background">
              <AlertCircle size={14} className="shrink-0" />
              <span>{requestError || sttError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 p-3 border-t border-glass-border bg-background"
          >
            {sttSupported ? (
              <button
                type="button"
                onClick={handleMicToggle}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
                aria-pressed={isListening}
                className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-full border transition-colors ${
                  isListening
                    ? "bg-red-500 border-red-500 text-white animate-pulse"
                    : "border-glass-border text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                <Mic size={18} />
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="Voice input isn't supported in this browser"
                aria-label="Voice input unavailable"
                className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full border border-glass-border text-muted opacity-50"
              >
                <MicOff size={18} />
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening…" : "Type a message…"}
              className="flex-1 min-w-0 h-11 px-3 rounded-full bg-glass border border-glass-border outline-none text-sm text-foreground placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              aria-label="Send message"
              className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-accent text-black disabled:opacity-40 transition-opacity"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        className="relative w-14 h-14 rounded-full bg-accent text-black flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-transform"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 bg-black text-accent text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded-full border-2 border-background">
            AI
          </span>
        )}
      </button>
    </div>
  );
}
