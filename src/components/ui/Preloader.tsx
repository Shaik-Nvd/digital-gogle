"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "@/components/providers/LoadingProvider";

const BUILD_LINES = [
  "> installing dependencies...",
  "> compiling assets...",
  "> optimizing build...",
  "> ready.",
];

/** Eases 0→100 with a fast start, a brief mid-point hold, then a fast finish. */
function easedPercent(p: number) {
  const stops: Array<[number, number]> = [
    [0, 0],
    [0.32, 58],
    [0.55, 62],
    [1, 100],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, v0] = stops[i];
    const [t1, v1] = stops[i + 1];
    if (p >= t0 && p <= t1) {
      const local = t1 === t0 ? 1 : (p - t0) / (t1 - t0);
      const cubic = 1 - Math.pow(1 - local, 3);
      return v0 + (v1 - v0) * cubic;
    }
  }
  return 100;
}

export default function Preloader() {
  const { finishLoading } = useLoading();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<"boot" | "reveal">("boot");
  const doneRef = useRef(false);
  const bootDoneRef = useRef({ lines: false, percent: false });

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDismissed(true);
    finishLoading();
  }, [finishLoading]);

  // Respect reduced-motion: skip straight to a simple fade.
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    if (mql.matches) {
      const t = setTimeout(finish, 250);
      return () => clearTimeout(t);
    }
  }, [finish]);

  const maybeAdvanceToReveal = useCallback(() => {
    if (bootDoneRef.current.lines && bootDoneRef.current.percent) {
      setPhase("reveal");
    }
  }, []);

  // Typewriter effect for the build-log lines.
  useEffect(() => {
    if (reducedMotion || phase !== "boot") return;
    if (lineIndex >= BUILD_LINES.length) {
      bootDoneRef.current.lines = true;
      maybeAdvanceToReveal();
      return;
    }
    const currentLine = BUILD_LINES[lineIndex];
    if (charIndex < currentLine.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), 14 + Math.random() * 16);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLineIndex((i) => i + 1);
      setCharIndex(0);
    }, 160);
    return () => clearTimeout(t);
  }, [lineIndex, charIndex, phase, reducedMotion, maybeAdvanceToReveal]);

  // Simulated, eased percentage counter.
  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const duration = 1650;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setPercent(Math.round(easedPercent(p)));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        bootDoneRef.current.percent = true;
        maybeAdvanceToReveal();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, maybeAdvanceToReveal]);

  // Hold on the glitch reveal briefly, then dismiss.
  useEffect(() => {
    if (reducedMotion || phase !== "reveal") return;
    const t = setTimeout(finish, 850);
    return () => clearTimeout(t);
  }, [phase, reducedMotion, finish]);

  // Safety net: never trap the user here even if a timer/rAF chain stalls
  // (e.g. the tab was backgrounded during boot).
  useEffect(() => {
    const t = setTimeout(finish, 6000);
    return () => clearTimeout(t);
  }, [finish]);

  // Tap / click / keypress anywhere skips the sequence — never trap the user here.
  useEffect(() => {
    if (dismissed) return;
    const handler = () => finish();
    window.addEventListener("pointerdown", handler);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [finish, dismissed]);

  const visibleLines = BUILD_LINES.slice(0, lineIndex);
  const typingLine = lineIndex < BUILD_LINES.length ? BUILD_LINES[lineIndex].slice(0, charIndex) : null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          role="status"
          aria-label="Loading Digital Gogle Studio"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050607] overflow-hidden cursor-pointer select-none"
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.25 : 0.5, ease: "easeInOut" }}
        >
          {/* Subtle glowing sphere backdrop, à la Unseen Studio */}
          <div
            className="absolute w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full opacity-30 blur-[80px]"
            style={{ background: "radial-gradient(circle, rgba(196,240,66,0.35), transparent 70%)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {reducedMotion ? (
            <div className="relative z-10 font-mono text-sm tracking-[0.3em] uppercase text-[#c4f042]">
              Digital Gogle Studio
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {phase === "boot" && (
                  <motion.div
                    key="terminal"
                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative z-10 w-[92%] max-w-xl border border-[#c4f042]/20 rounded-xl bg-black/50 backdrop-blur-2xl flex flex-col overflow-hidden shadow-[0_0_80px_rgba(196,240,66,0.08)] ring-1 ring-white/5"
                  >
                    {/* Terminal header */}
                    <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-[#c4f042]/10 bg-black/60">
                      <div className="flex space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c4f042]/30" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c4f042]/30" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c4f042]/30" />
                      </div>
                      <div className="font-mono text-[10px] md:text-xs text-white/40 tracking-wider">
                        naveed@digitalgogle:~/production
                      </div>
                      <div className="font-mono text-[10px] md:text-xs text-[#c4f042] tabular-nums w-9 text-right">
                        {percent}%
                      </div>
                    </div>

                    {/* Terminal body */}
                    <div className="p-4 md:p-6 font-mono text-[11px] md:text-sm text-[#c4f042] min-h-[140px] leading-relaxed">
                      <p className="text-white/70 mb-2">$ naveed build --production</p>
                      {visibleLines.map((line) => (
                        <p key={line} className="opacity-90">
                          {line}
                        </p>
                      ))}
                      {typingLine !== null && (
                        <p className="opacity-90">
                          {typingLine}
                          <span className="inline-block w-[6px] h-[1em] align-[-2px] bg-[#c4f042] ml-0.5 animate-pulse" />
                        </p>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="px-4 md:px-6 pb-4 md:pb-5 flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c4f042] animate-pulse" />
                      <div className="flex-1 h-px bg-white/10 relative overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-[#c4f042] shadow-[0_0_10px_rgba(196,240,66,0.8)]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {phase === "reveal" && (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 flex items-center justify-center px-6"
                  >
                    <span
                      className="dg-glitch text-center text-2xl md:text-5xl font-black tracking-tight text-white"
                      data-text="DIGITAL GOGLE STUDIO"
                    >
                      DIGITAL GOGLE STUDIO
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[9px] md:text-[10px] text-white/30 tracking-[0.3em] uppercase">
                Tap anywhere to skip
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
