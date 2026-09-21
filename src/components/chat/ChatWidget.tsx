"use client";

import { FormEvent, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useDragControls, useMotionValue } from "framer-motion";
import { Bot, ChevronDown, Languages, Loader2, Mic, MicOff, Send, Square, Volume2, VolumeX, X } from "lucide-react";
import { nudgeFor, type Nudge } from "@/lib/chat-nudges";
import { scrollToSection } from "@/lib/scroll";
import { createSpeechChunker } from "@/lib/speech-chunks";
import { stripSpeechTags } from "@/lib/speech-tags";
import MessageContent from "./MessageContent";
import { useFishAudio } from "./useFishAudio";
import { usePageContext } from "./usePageContext";
import { useProactiveNudge } from "./useProactiveNudge";
import { useVoiceInput } from "./useVoiceInput";
import VoiceMeter from "./VoiceMeter";

type Mode = "voice" | "text";
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  inputMode?: Mode;
  translation?: string;
  showTranslation?: boolean;
  isTranslating?: boolean;
  failed?: boolean;
};

const uid = () => crypto.randomUUID();

function useMedia(query: string) {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function Avatar({ active }: { active: boolean }) {
  return (
    <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent/40 bg-accent text-black">
      {active && (
        <motion.span
          aria-hidden
          className="absolute -inset-1 rounded-2xl border border-accent/60"
          animate={{ scale: [1, 1.12, 1], opacity: [0.9, 0.2, 0.9] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      <Bot size={19} />
    </div>
  );
}

function TypingDots({ className = "" }: { className?: string }) {
  return (
    <span className={`flex gap-1 py-1 ${className}`} aria-label="Assistant is typing">
      {[0, 120, 240].map((delay) => (
        <i key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </span>
  );
}

/** Types-then-reveals so the proactive bubble reads like a person about to speak. */
function NudgeText({ text }: { text: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 900);
    return () => window.clearTimeout(timer);
  }, []);
  return ready ? <span className="block text-[13px] leading-snug text-foreground">{text}</span> : <TypingDots />;
}

const LEAD_INTENT = /project|website|app|automation|budget|quote|build|need|help/i;

export default function ChatWidget() {
  const mobile = useMedia("(max-width: 639px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const context = usePageContext();
  const voice = useVoiceInput();
  const speech = useFishAudio();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [voiceUsed, setVoiceUsed] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [seedChips, setSeedChips] = useState<string[] | null>(null);

  const history = useRef<Message[]>([]);
  const abort = useRef<AbortController | null>(null);
  const streamingRef = useRef(false);
  const last = useRef<Message | null>(null);
  const leadSent = useRef(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const bounds = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragControls = useDragControls();

  const isMin = minimized && !mobile;
  const { nudge, dismiss: dismissNudge, consume: consumeNudge } = useProactiveNudge(context, !open);
  const { isSpeaking, isLoadingAudio, enqueue, finish, cancel: cancelAudio, prime } = speech;
  const { isListening, isTranscribing, error: voiceError, analyser, start: startVoice, stop: stopVoice, cancel: cancelVoice } = voice;

  const setHistory = useCallback((change: (old: Message[]) => Message[]) => {
    setMessages((old) => {
      const next = change(old);
      history.current = next;
      return next;
    });
  }, []);

  const cancelAll = useCallback(() => {
    abort.current?.abort();
    abort.current = null;
    cancelAudio();
  }, [cancelAudio]);

  const close = useCallback(() => {
    cancelAll();
    cancelVoice();
    setOpen(false);
    setMinimized(false);
    x.set(0);
    y.set(0);
    requestAnimationFrame(() => launcher.current?.focus());
  }, [cancelAll, cancelVoice, x, y]);

  const goToSection = useCallback((id: string) => {
    scrollToSection(id);
    // The mobile sheet covers the page, so step aside; on desktop the panel stays put.
    if (mobile) close();
  }, [close, mobile]);

  useEffect(() => () => cancelAll(), [cancelAll]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, open]);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("textarea")?.focus();
    if (!mobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobile, open]);

  // Follow new content only while the reader is already at the bottom.
  useEffect(() => {
    const node = list.current;
    if (!node) return;
    if (node.scrollHeight - node.scrollTop - node.clientHeight < 90) {
      node.scrollTo({ top: node.scrollHeight, behavior: reduced ? "auto" : "smooth" });
      setHasNew(false);
    } else {
      setHasNew(true);
    }
  }, [messages, reduced]);

  useEffect(() => {
    if (open && !isMin) requestAnimationFrame(() => list.current?.scrollTo({ top: list.current.scrollHeight }));
  }, [isMin, open]);

  useEffect(() => {
    const field = area.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 104)}px`;
  }, [input]);

  // Keep the dragged panel fully on-screen after expanding from minimised, dragging, or resizing.
  const clampPanel = useCallback(() => {
    const rect = panel.current?.getBoundingClientRect();
    if (!rect) return;
    if (rect.top < 8) y.set(y.get() + 8 - rect.top);
    if (rect.left < 8) x.set(x.get() + 8 - rect.left);
    if (rect.right > window.innerWidth - 8) x.set(x.get() - (rect.right - window.innerWidth + 8));
    if (rect.bottom > window.innerHeight - 8) y.set(y.get() - (rect.bottom - window.innerHeight + 8));
  }, [x, y]);

  useEffect(() => {
    if (!open || mobile) return;
    const frame = requestAnimationFrame(clampPanel);
    window.addEventListener("resize", clampPanel);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", clampPanel);
    };
  }, [clampPanel, isMin, mobile, open]);

  const recordLead = useCallback((all: Message[]) => {
    if (leadSent.current) return;
    const text = all.map((message) => message.content).join(" ");
    const email = text.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0];
    const phone = text.match(/(?:\+?91[\s-]?)?[6-9]\d{9}/)?.[0];
    if ((!email && !phone) || !LEAD_INTENT.test(text)) return;
    const userText = all.filter((message) => message.role === "user").map((message) => message.content).join(" ");
    const name = userText.match(/\b(?:my name is|i am|i'm|this is)\s+([A-Za-z]{2,}(?: [A-Za-z]{2,})?)/i)?.[1];
    leadSent.current = true;
    void fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        summary: userText.slice(0, 400),
        transcript: all.map(({ role, content }) => ({ role, content })),
        context,
      }),
    });
  }, [context]);

  const send = useCallback(async (value: string, mode: Mode = "text") => {
    const text = value.trim();
    if (!text || streamingRef.current) return;
    cancelAll();
    setError(null);

    const user: Message = { id: uid(), role: "user", content: text, inputMode: mode };
    const assistant: Message = { id: uid(), role: "assistant", content: "", inputMode: mode };
    const next = [...history.current, user];
    last.current = user;
    setHistory(() => [...next, assistant]);
    setInput("");
    setStreaming(assistant.id);
    streamingRef.current = true;

    const controller = new AbortController();
    abort.current = controller;
    // Only spoken when the visitor spoke: typed messages always get a silent reply.
    const speakIt = mode === "voice" && !muted;
    const chunker = speakIt ? createSpeechChunker(enqueue) : null;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
          inputMode: mode,
          context,
        }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error(`Chat ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        raw += decoder.decode(chunk, { stream: true });
        const shown = mode === "voice" ? stripSpeechTags(raw) : raw;
        setHistory((old) => old.map((item) => (item.id === assistant.id ? { ...item, content: shown } : item)));
        chunker?.update(raw);
      }
      chunker?.update(raw, true);
      if (speakIt) finish();
      const finalText = mode === "voice" ? stripSpeechTags(raw) : raw;
      recordLead([...next, { ...assistant, content: finalText }]);
    } catch (cause) {
      if ((cause as Error).name === "AbortError") return;
      console.error("Chat request failed", cause);
      cancelAudio();
      setError("I couldn't send that just now. Please try again.");
      setHistory((old) =>
        old.map((item) => (item.id === assistant.id ? { ...item, content: "I couldn't send that just now.", failed: true } : item)),
      );
      setInput(text);
    } finally {
      if (abort.current === controller) abort.current = null;
      streamingRef.current = false;
      setStreaming(null);
    }
  }, [cancelAll, cancelAudio, context, enqueue, finish, muted, recordLead, setHistory]);

  const translate = async (message: Message) => {
    if (message.translation) {
      setHistory((old) => old.map((item) => (item.id === message.id ? { ...item, showTranslation: !item.showTranslation } : item)));
      return;
    }
    setHistory((old) => old.map((item) => (item.id === message.id ? { ...item, isTranslating: true } : item)));
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message.content }),
      });
      if (!response.ok) throw new Error("Translate failed");
      const data = (await response.json()) as { translation: string };
      setHistory((old) =>
        old.map((item) => (item.id === message.id ? { ...item, translation: data.translation, showTranslation: true, isTranslating: false } : item)),
      );
    } catch {
      setHistory((old) => old.map((item) => (item.id === message.id ? { ...item, isTranslating: false } : item)));
    }
  };

  const handleMic = () => {
    if (isTranscribing) return;
    if (isListening) {
      stopVoice();
      return;
    }
    cancelAll(); // barge-in: talking over the assistant stops it
    prime(); // this tap is the user gesture that unlocks audio for the spoken reply
    setVoiceUsed(true);
    void startVoice((text) => void send(text, "voice"));
  };

  const openChat = () => {
    dismissNudge();
    setEverOpened(true);
    setOpen(true);
  };

  /** Clicking the proactive bubble opens the chat with that line as Gogle's first message. */
  const openFromNudge = (active: Nudge) => {
    consumeNudge();
    setEverOpened(true);
    if (!history.current.length) setHistory(() => [{ id: uid(), role: "assistant", content: active.text, inputMode: "text" }]);
    setSeedChips(active.chips);
    setOpen(true);
  };

  const active = isListening || isTranscribing || isSpeaking || isLoadingAudio || Boolean(streaming);
  const status = isListening
    ? "Listening… tap the mic when you're done"
    : isTranscribing
      ? "Transcribing…"
      : isSpeaking
        ? "Speaking — tap stop to interrupt"
        : streaming || isLoadingAudio
          ? "Thinking it through"
          : "Digital Gogle Studio · online";
  const hasUserMessage = messages.some((message) => message.role === "user");
  const chips = seedChips ?? nudgeFor(context.currentSection, context.viewedSections).chips;
  const problem = error || voiceError;
  const iconButton = "grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-glass hover:text-foreground";

  return (
    <>
      <div ref={bounds} aria-hidden className="pointer-events-none fixed inset-0 z-[59]" />

      <div className="fixed bottom-3 right-4 z-[60] flex items-center gap-4 md:bottom-4 md:right-8">
        <AnimatePresence>
          {nudge && (
            <motion.div
              key={nudge.section}
              initial={{ opacity: 0, x: 14, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 14, scale: 0.96 }}
              transition={{ duration: reduced ? 0 : 0.22 }}
              className="relative max-w-[min(17rem,calc(100vw-12rem))] [filter:drop-shadow(0_0_1px_rgba(120,130,150,0.75))_drop-shadow(0_10px_18px_rgba(0,0,0,0.22))]"
            >
              <div className="relative z-10 flex items-start gap-1 rounded-[1.75rem] bg-background py-3 pl-4 pr-1.5">
              <button type="button" onClick={() => openFromNudge(nudge)} className="min-w-0 flex-1 text-left" aria-label="Open chat with Gogle">
                <span className="mb-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Gogle · Studio Desk
                </span>
                <NudgeText text={nudge.text} />
              </button>
              <button type="button" onClick={dismissNudge} aria-label="Dismiss suggestions" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:text-foreground">
                <X size={14} />
              </button>
              </div>
              {/* Cloud puffs: same fill as the bubble, so the drop-shadow traces one soft silhouette. */}
              <span aria-hidden className="absolute -top-2.5 left-6 h-7 w-7 rounded-full bg-background" />
              <span aria-hidden className="absolute -top-4 left-12 h-9 w-9 rounded-full bg-background" />
              <span aria-hidden className="absolute -top-2.5 right-10 h-7 w-7 rounded-full bg-background" />
              <span aria-hidden className="absolute -bottom-2 left-8 h-6 w-6 rounded-full bg-background" />
              <span aria-hidden className="absolute -left-2.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background" />
              {/* Thought trail leading to the launcher. */}
              <span aria-hidden className="absolute -bottom-2 -right-2.5 h-3.5 w-3.5 rounded-full bg-background" />
              <span aria-hidden className="absolute -bottom-4 -right-6 h-2 w-2 rounded-full bg-background" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.div
              ref={panel}
              role="dialog"
              aria-modal={mobile}
              aria-label="Gogle sales assistant"
              initial={mobile ? { opacity: 0, y: 40 } : { opacity: 0, scale: 0.98 }}
              animate={mobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
              exit={mobile ? { opacity: 0, y: 40 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: reduced ? 0 : 0.18 }}
              drag={!mobile}
              dragListener={false}
              dragControls={dragControls}
              dragMomentum={false}
              dragElastic={0.05}
              dragConstraints={bounds}
              onDragEnd={() => requestAnimationFrame(clampPanel)}
              style={mobile ? undefined : { x, y }}
              className={
                mobile
                  ? "fixed inset-x-0 bottom-0 flex h-[min(82dvh,720px)] flex-col overflow-hidden rounded-t-3xl border border-glass-border bg-background shadow-2xl"
                  : `fixed bottom-6 right-8 flex ${isMin ? "h-auto" : "h-[min(620px,calc(100dvh-3rem))]"} w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-glass-border bg-background shadow-2xl`
              }
            >
              {mobile && <button type="button" onClick={close} aria-label="Dismiss chat" className="mx-auto mt-2 h-2 w-12 shrink-0 rounded-full bg-glass-border" />}

              <header
                title={mobile ? undefined : "Drag to move"}
                onPointerDown={(event) => {
                  if (!mobile && !(event.target as HTMLElement).closest("button")) dragControls.start(event);
                }}
                className={`flex items-center gap-3 border-b border-glass-border px-4 py-3 ${mobile ? "" : "cursor-grab touch-none select-none active:cursor-grabbing"}`}
              >
                <Avatar active={active} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-foreground">Gogle / Studio Desk</p>
                  <p className="truncate text-xs text-muted">{isMin ? "Minimized — expand to continue" : status}</p>
                </div>
                {voiceUsed && (
                  <button
                    type="button"
                    onClick={() => {
                      setMuted((value) => !value);
                      cancelAudio();
                    }}
                    aria-label={muted ? "Unmute voice replies" : "Mute voice replies"}
                    aria-pressed={muted}
                    className={iconButton}
                  >
                    {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    cancelVoice();
                    setMinimized((value) => !value);
                  }}
                  aria-label={isMin ? "Expand chat" : "Minimize chat"}
                  className={`${iconButton} hidden md:grid`}
                >
                  <ChevronDown size={17} className={isMin ? "rotate-180" : ""} />
                </button>
                <button type="button" onClick={close} aria-label="Close chat" className={iconButton}>
                  <X size={18} />
                </button>
              </header>

              {!isMin && (
                <>
                  <div ref={list} role="log" aria-live="polite" aria-relevant="additions text" className="relative flex-1 space-y-4 overflow-y-auto px-4 py-5">
                    {messages.length === 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-foreground">What are you looking to build?</p>
                        <p className="mt-1 text-sm text-muted">Tell me the goal and I&apos;ll point you to the right service. Type, or tap the mic and just talk.</p>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div key={message.id} className={`group flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                            message.role === "user" ? "whitespace-pre-wrap border border-accent/35 bg-accent/10 text-foreground" : "border border-glass-border bg-glass text-foreground"
                          }`}
                        >
                          {message.content ? (
                            message.role === "assistant" ? (
                              <MessageContent text={message.showTranslation && message.translation ? message.translation : message.content} onSection={goToSection} />
                            ) : (
                              message.content
                            )
                          ) : message.id === streaming ? (
                            <TypingDots />
                          ) : null}
                        </div>
                        {message.role === "assistant" && message.content && message.id !== streaming && (
                          <button
                            type="button"
                            onClick={() => void translate(message)}
                            disabled={message.isTranslating}
                            className="mt-1 flex min-h-9 items-center gap-1 px-1 font-mono text-[10px] text-muted transition-opacity focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                          >
                            <Languages size={12} />
                            {message.isTranslating ? "Translating…" : message.showTranslation ? "Original" : "Translate to English"}
                          </button>
                        )}
                        {message.failed && (
                          <button type="button" onClick={() => last.current && void send(last.current.content, last.current.inputMode)} className="mt-1 font-mono text-xs text-accent underline">
                            Retry
                          </button>
                        )}
                      </div>
                    ))}

                    {!hasUserMessage && (
                      <div className="flex flex-wrap gap-2">
                        {chips.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => void send(chip)}
                            className="min-h-11 rounded-full border border-glass-border bg-glass px-3.5 text-left font-mono text-[11px] text-foreground transition-colors hover:border-accent/60 hover:text-accent"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}

                    {hasNew && (
                      <button
                        type="button"
                        onClick={() => {
                          list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
                          setHasNew(false);
                        }}
                        className="sticky bottom-1 mx-auto block rounded-full border border-glass-border bg-background px-3 py-2 font-mono text-xs text-accent shadow-lg"
                      >
                        New messages ↓
                      </button>
                    )}
                  </div>

                  {problem && <div role="alert" className="border-t border-glass-border px-4 py-2 text-xs text-muted">{problem}</div>}

                  {(streaming || isSpeaking) && (
                    <div className="flex gap-2 px-4 pb-2">
                      {streaming && (
                        <button type="button" onClick={cancelAll} className="flex min-h-10 items-center gap-2 rounded-lg border border-glass-border px-3 font-mono text-xs text-muted hover:border-accent hover:text-accent">
                          <Square size={12} /> Stop generating
                        </button>
                      )}
                      {isSpeaking && (
                        <button type="button" onClick={cancelAudio} className="flex min-h-10 items-center gap-2 rounded-lg border border-glass-border px-3 font-mono text-xs text-muted hover:border-accent hover:text-accent">
                          <Square size={12} /> Stop voice
                        </button>
                      )}
                    </div>
                  )}

                  {(isListening || isTranscribing) && (
                    <div className="mx-3 mb-2 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2">
                      {isListening ? <VoiceMeter analyser={analyser} /> : <Loader2 size={18} className="animate-spin text-accent" aria-hidden />}
                      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted">{isListening ? "Listening… I'll stop when you pause" : "Transcribing what you said…"}</span>
                      {isListening && (
                        <button type="button" onClick={cancelVoice} aria-label="Cancel recording" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:text-foreground">
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  )}

                  <form
                    onSubmit={(event: FormEvent) => {
                      event.preventDefault();
                      void send(input);
                    }}
                    className="flex items-end gap-2 border-t border-glass-border p-3"
                  >
                    <button
                      type="button"
                      onClick={handleMic}
                      disabled={!voice.isSupported || isTranscribing}
                      aria-label={isListening ? "Stop listening and send" : "Talk to Gogle"}
                      aria-pressed={isListening}
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors disabled:opacity-50 ${
                        isListening ? "border-accent bg-accent text-black" : "border-glass-border text-muted hover:border-accent hover:text-accent"
                      }`}
                    >
                      {voice.isSupported ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>
                    <textarea
                      ref={area}
                      rows={1}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void send(input);
                        }
                      }}
                      placeholder={isListening ? "Listening…" : "Describe your project…"}
                      aria-label="Message"
                      className="max-h-[104px] min-h-11 flex-1 resize-none bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted"
                    />
                    <button
                      type="submit"
                      disabled={Boolean(streaming) || !input.trim()}
                      aria-label="Send message"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/50 bg-accent/10 text-accent transition-colors disabled:border-glass-border disabled:bg-glass disabled:text-muted"
                    >
                      <Send size={17} />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          ref={launcher}
          type="button"
          onClick={() => (open ? close() : openChat())}
          aria-label={open ? "Close Gogle sales assistant" : "Open Gogle sales assistant"}
          className={`group relative flex h-[52px] items-center gap-2.5 rounded-full bg-accent pl-4 pr-5 text-black shadow-[0_10px_30px_-8px_var(--accent)] transition hover:scale-[1.04] active:scale-95 ${open ? "invisible" : ""}`}
        >
          {!everOpened && <span aria-hidden className="absolute inset-0 rounded-full bg-accent opacity-50 motion-safe:animate-ping" />}
          <Bot size={20} className="relative" />
          <span className="relative font-mono text-xs font-bold tracking-wide">Ask Gogle</span>
          <span
            aria-hidden
            className={`absolute -right-1 -top-1 grid place-items-center rounded-full ring-2 ring-background ${nudge ? "h-5 w-5 bg-black text-[10px] font-bold text-accent" : "h-3 w-3 bg-emerald-500"}`}
          >
            {nudge ? "1" : null}
          </span>
        </button>
      </div>
    </>
  );
}
