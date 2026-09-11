"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Mic, MicOff, Send, Radio, AlertCircle } from "lucide-react";
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
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="glass-panel w-[92vw] max-w-sm h-[70vh] max-h-[600px] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border">
            <div>
              <p className="font-mono text-sm font-semibold text-foreground">Digital Gogle Assistant</p>
              <p className="text-xs text-muted">Ask anything, in your language</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="p-1.5 rounded-full hover:bg-glass-border transition-colors"
            >
              <X size={18} className="text-muted" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border-b border-glass-border">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs bg-transparent border border-glass-border rounded-lg px-2 py-1 text-foreground flex-1 outline-none"
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
                className={`p-1.5 rounded-lg border border-glass-border transition-colors ${
                  continuousMode ? "text-accent" : "text-muted"
                }`}
              >
                <Radio size={14} />
              </button>
            )}
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-muted text-center mt-8">
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
                {m.content || (isStreaming && m.role === "assistant" ? "…" : "")}
              </div>
            ))}
            {interimTranscript && (
              <div className="ml-auto max-w-[85%] rounded-2xl px-3 py-2 text-sm italic text-muted border border-dashed border-glass-border">
                {interimTranscript}
              </div>
            )}
          </div>

          {(requestError || sttError) && (
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-red-400 border-t border-glass-border">
              <AlertCircle size={14} className="shrink-0" />
              <span>{requestError || sttError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 p-3 border-t border-glass-border"
          >
            {sttSupported && (
              <button
                type="button"
                onClick={handleMicToggle}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
                className={`p-2 rounded-full border border-glass-border transition-colors ${
                  isListening ? "bg-accent text-black" : "text-muted hover:text-foreground"
                }`}
              >
                {isListening ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening…" : "Type a message…"}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              aria-label="Send message"
              className="p-2 rounded-full bg-accent text-black disabled:opacity-40 transition-opacity"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        className="w-14 h-14 rounded-full bg-accent text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
