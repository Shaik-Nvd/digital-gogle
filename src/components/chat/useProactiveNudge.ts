"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatContext, ChatSection } from "@/lib/chat-context";
import { nudgeFor, type Nudge } from "@/lib/chat-nudges";

const SHOWN_KEY = "dg-chat-nudged-sections";
const OFF_KEY = "dg-chat-nudges-off";
const MAX_PER_SESSION = 4;
const VISIBLE_MS = 14000;

type ActiveNudge = Nudge & { section: ChatSection };

function readShown(): ChatSection[] {
  try {
    const raw = sessionStorage.getItem(SHOWN_KEY);
    return raw ? (JSON.parse(raw) as ChatSection[]) : [];
  } catch {
    return [];
  }
}

const isOff = () => {
  try {
    return sessionStorage.getItem(OFF_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Surfaces one short, section-aware line from the assistant after a visitor settles on a
 * part of the page. At most one per section and four per session; dismissing it once
 * silences the rest of the session, and opening the chat ends it for good.
 */
export function useProactiveNudge(context: ChatContext, enabled: boolean) {
  const [nudge, setNudge] = useState<ActiveNudge | null>(null);
  const viewed = useRef<ChatSection[]>([]);
  const section = context.currentSection;

  useEffect(() => {
    viewed.current = context.viewedSections;
  });

  useEffect(() => {
    if (!enabled || isOff()) return;
    const shown = readShown();
    if (shown.includes(section) || shown.length >= MAX_PER_SESSION) return;
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...readShown(), section]));
      } catch { /* private mode: still show it this time */ }
      setNudge({ section, ...nudgeFor(section, viewed.current) });
    }, section === "hero" ? 9000 : 6500);
    return () => window.clearTimeout(timer);
  }, [enabled, section]);

  useEffect(() => {
    if (!nudge) return;
    const timer = window.setTimeout(() => setNudge(null), VISIBLE_MS);
    return () => window.clearTimeout(timer);
  }, [nudge]);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(OFF_KEY, "1");
    } catch { /* ignore */ }
    setNudge(null);
  }, []);

  const consume = useCallback(() => setNudge(null), []);

  // Only valid while the visitor is still on the section it was written for.
  const visible = enabled && nudge && nudge.section === section ? nudge : null;
  return { nudge: visible, dismiss, consume };
}
