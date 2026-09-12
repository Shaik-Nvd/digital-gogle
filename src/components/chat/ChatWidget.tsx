"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  X,
  Mic,
  MicOff,
  Send,
  Radio,
  AlertCircle,
  Loader2,
  Minus,
  Volume2,
  VolumeX,
  Languages,
} from "lucide-react";
import { motion, useDragControls, type PanInfo } from "framer-motion";
import { CHAT_LANGUAGES } from "@/lib/chat-languages";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useSpeechSynthesis } from "./useSpeechSynthesis";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  translation?: string;
  showTranslation?: boolean;
  isTranslating?: boolean;
};

function makeId() {
  return Math.random().toString(36).slice(2);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates client-only matchMedia read to avoid an SSR/CSR hydration mismatch
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/** Small "alive" avatar: idle breathing pulse, extra glow while speaking. */
function ChatAvatar({ isSpeaking, size = 32 }: { isSpeaking: boolean; size?: number }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {!reducedMotion && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-accent/50"
          animate={
            isSpeaking
              ? { scale: [1, 1.45, 1], opacity: [0.55, 0.15, 0.55] }
              : { scale: [1, 1.15, 1], opacity: [0.35, 0.15, 0.35] }
          }
          transition={{
            duration: isSpeaking ? 0.9 : 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      <motion.div
        className="absolute inset-0 rounded-full bg-accent flex items-center justify-center"
        animate={!reducedMotion && !isSpeaking ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 2.6, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
      >
        <Sparkles size={Math.round(size * 0.5)} className="text-black" />
      </motion.div>
    </div>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("auto");
  const [continuousMode, setContinuousMode] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const {
    isSupported: sttSupported,
    isListening,
    interimTranscript,
    error: sttError,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition(language);

  const { isSupported: ttsSupported, isSpeaking, speak, cancel: cancelSpeech } = useSpeechSynthesis();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, interimTranscript]);

  // Reset the dragged position whenever the panel is closed, so reopening
  // anchors back to the default bottom-right spot (no persistence needed).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets drag position only on the isOpen transition, not every render
    if (!isOpen) setPanelOffset({ x: 0, y: 0 });
  }, [isOpen]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    if (isSpeaking) cancelSpeech();
    setRequestError(null);
    const userMessage: Message = { id: makeId(), role: "user", content: trimmed };
    const assistantId = makeId();
    const nextMessages = [...messages, userMessage];

    setMessages([...nextMessages, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);
    setStreamingId(assistantId);

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

      // Speak only once the full reply has streamed in — never partial chunks.
      if (ttsEnabled && ttsSupported && acc.trim()) {
        speak(acc, language);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setRequestError((err as Error).message || "Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
      setStreamingId(null);
      abortRef.current = null;
    }
  }

  async function toggleTranslate(id: string) {
    const target = messages.find((m) => m.id === id);
    if (!target || !target.content) return;

    if (target.translation) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, showTranslation: !m.showTranslation } : m))
      );
      return;
    }

    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isTranslating: true } : m)));

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: target.content }),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => "Translation failed"));
      const { translation } = (await res.json()) as { translation: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, translation, showTranslation: true, isTranslating: false } : m
        )
      );
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isTranslating: false } : m)));
    }
  }

  function handleMicToggle() {
    if (isListening) {
      stopListening();
      return;
    }
    // Barge-in: starting a new recording cuts off any in-progress speech.
    if (isSpeaking) cancelSpeech();
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

  function handleClose() {
    if (isSpeaking) cancelSpeech();
    setIsOpen(false);
    setIsMinimized(false);
  }

  function handleMinimizeToggle() {
    setIsMinimized((v) => !v);
  }

  function handleDragStart(event: React.PointerEvent<HTMLDivElement>) {
    dragControls.start(event);
  }

  function handleDragEnd(_e: unknown, info: PanInfo) {
    setPanelOffset((prev) => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }));
  }

  const headerControls = useMemo(
    () => (
      <>
        {ttsSupported && (
          <button
            type="button"
            onClick={() => {
              setTtsEnabled((v) => {
                const next = !v;
                if (!next) cancelSpeech();
                return next;
              });
            }}
            aria-label={ttsEnabled ? "Mute voice replies" : "Unmute voice replies"}
            aria-pressed={ttsEnabled}
            title={ttsEnabled ? "Voice replies on" : "Voice replies off"}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-glass-border transition-colors text-muted"
          >
            {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        )}
        <button
          type="button"
          onClick={handleMinimizeToggle}
          aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-glass-border transition-colors text-muted"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close chat"
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-glass-border transition-colors text-muted"
        >
          <X size={16} />
        </button>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ttsSupported, ttsEnabled, isMinimized]
  );

  return (
    <>
      {/* Invisible full-viewport frame used only to bound the drag gesture. */}
      <div ref={viewportRef} className="fixed inset-0 pointer-events-none z-[59]" aria-hidden />

      <div className="fixed bottom-44 right-4 md:right-8 z-[60] flex flex-col items-end gap-3">
        {isOpen && (
          <motion.div
            drag
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.06}
            dragConstraints={viewportRef}
            onDragEnd={handleDragEnd}
            initial={false}
            animate={{ x: panelOffset.x, y: panelOffset.y }}
            className="w-[92vw] max-w-sm rounded-2xl flex flex-col overflow-hidden bg-background border border-glass-border shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            style={
              isMinimized
                ? undefined
                : { height: "clamp(320px, calc(100dvh - 260px), 600px)" }
            }
          >
            <div
              onPointerDown={handleDragStart}
              className="flex items-center gap-2.5 px-4 py-3 border-b border-glass-border bg-glass cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <ChatAvatar isSpeaking={isSpeaking} />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-semibold text-foreground truncate">AI Assistant</p>
                <p className="text-xs text-muted truncate">
                  {isMinimized ? "Minimized — tap to expand" : "Ask anything, in your language"}
                </p>
              </div>
              {headerControls}
            </div>

            {!isMinimized && (
              <>
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
                  {messages.map((m) => {
                    const isThisStreaming = m.id === streamingId;
                    const displayText = m.showTranslation && m.translation ? m.translation : m.content;
                    return (
                      <div key={m.id} className={`max-w-[85%] flex flex-col ${m.role === "user" ? "items-end ml-auto" : "items-start mr-auto"}`}>
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                            m.role === "user"
                              ? "bg-accent text-black"
                              : "bg-glass border border-glass-border text-foreground"
                          }`}
                        >
                          {displayText || (isThisStreaming ? <Loader2 size={14} className="animate-spin text-muted" /> : "")}
                        </div>
                        {m.content && !isThisStreaming && (
                          <button
                            type="button"
                            onClick={() => toggleTranslate(m.id)}
                            disabled={m.isTranslating}
                            title={m.showTranslation ? "Show original text" : "Translate to English"}
                            aria-label={m.showTranslation ? "Show original text" : "Translate message to English"}
                            className="mt-1 flex items-center gap-1 px-1 text-[10px] text-muted/40 hover:text-accent transition-colors disabled:opacity-50"
                          >
                            {m.isTranslating ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <Languages size={11} />
                            )}
                            <span>{m.showTranslation ? "Original" : "Translate"}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
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
              </>
            )}
          </motion.div>
        )}

        <button
          onClick={() => (isOpen ? handleClose() : setIsOpen(true))}
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
    </>
  );
}
