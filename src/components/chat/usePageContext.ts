"use client";

import { useEffect, useRef, useState } from "react";
import { CHAT_SECTIONS, type ChatContext, type ChatSection } from "@/lib/chat-context";

const initial: ChatContext = { currentSection: "hero", viewedSections: [], dwellSeconds: {}, pathname: "/", referrer: "", isReturning: false, localTime: "" };

export function usePageContext() {
  const [context, setContext] = useState<ChatContext>(initial);
  const activeRef = useRef<ChatSection>("hero");
  const enteredAt = useRef(0);
  const dwell = useRef<Partial<Record<ChatSection, number>>>({});

  useEffect(() => {
    const getElement = (section: ChatSection): Element | null => section === "hero" ? document.querySelector("main") : document.getElementById(section);
    const candidates: Array<readonly [ChatSection, Element | null]> = CHAT_SECTIONS.map((section) => [section, getElement(section)] as const);
    const elements: Array<readonly [ChatSection, Element]> = candidates.filter((entry): entry is readonly [ChatSection, Element] => entry[1] !== null);
    const publish = (section: ChatSection) => {
      const now = Date.now(); const previous = activeRef.current;
      dwell.current[previous] = (dwell.current[previous] ?? 0) + (now - enteredAt.current) / 1000;
      activeRef.current = section; enteredAt.current = now;
      setContext({ currentSection: section, viewedSections: Array.from(new Set([...Object.keys(dwell.current), section])) as ChatSection[], dwellSeconds: { ...dwell.current }, pathname: window.location.pathname, referrer: document.referrer, isReturning: sessionStorage.getItem("dg-visited") === "true", localTime: new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date()) });
    };
    enteredAt.current = Date.now();
    sessionStorage.setItem("dg-visited", "true");
    const observer = new IntersectionObserver((entries) => {
      const mostVisible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (mostVisible) { const match = elements.find(([, element]) => element === mostVisible.target); if (match && match[0] !== activeRef.current) publish(match[0]); }
    }, { rootMargin: "-35% 0px -40% 0px", threshold: [0.05, 0.25, 0.5] });
    elements.forEach(([, element]) => observer.observe(element));
    publish("hero");
    const timer = window.setInterval(() => publish(activeRef.current), 5000);
    return () => { observer.disconnect(); window.clearInterval(timer); };
  }, []);
  return context;
}
