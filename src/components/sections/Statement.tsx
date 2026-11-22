"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { Eyebrow } from "@/components/ui/Reveal";

/**
 * The studio's pitch in one sentence, read at scroll speed: the section pins for a few screens and
 * each word lights up as you scroll, while Gogle (docked in the left column) watches it happen.
 * Serif-italic phrases carry the two ideas that matter: the problem and the payoff.
 */
const SENTENCE: { text: string; accent?: boolean }[] = [
  { text: "Most" }, { text: "websites" }, { text: "look" }, { text: "fine" }, { text: "and" },
  { text: "do", accent: true }, { text: "nothing.", accent: true },
  { text: "Ours" }, { text: "load" }, { text: "in" }, { text: "a" }, { text: "blink," },
  { text: "show" }, { text: "up" }, { text: "on" }, { text: "Google," }, { text: "and" },
  { text: "turn" }, { text: "quiet" }, { text: "visitors" }, { text: "into" },
  { text: "enquiries,", accent: true }, { text: "bookings", accent: true }, { text: "and", accent: true }, { text: "sales.", accent: true },
];

const PILLARS = [
  { n: "01", title: "Fast", body: "Pages that load before people give up." },
  { n: "02", title: "Found", body: "SEO foundations built in, not bolted on." },
  { n: "03", title: "Converting", body: "Every page leads to one clear next step." },
];

/** 0→1 progress of `v` through [a, b], clamped. Transforms are written as functions on purpose:
 *  framer-motion hands array-form opacity/transform maps to a native ScrollTimeline, which reads
 *  this pinned (sticky) section's progress wrongly and ran the reveal backwards. */
const prog = (v: number, [a, b]: [number, number]) => Math.min(1, Math.max(0, (v - a) / (b - a)));

function Word({ progress, range, text, accent }: { progress: MotionValue<number>; range: [number, number]; text: string; accent?: boolean }) {
  const opacity = useTransform(progress, (v) => 0.12 + 0.88 * prog(v, range));
  const y = useTransform(progress, (v) => `${(1 - prog(v, range)) * 0.18}em`);
  const blur = useTransform(progress, (v) => `blur(${(1 - prog(v, range)) * 4}px)`);
  return (
    <motion.span
      style={{ opacity, y, filter: blur }}
      className={`rm-reset inline-block mr-[0.24em] ${accent ? "serif-accent text-accent text-[1.1em] leading-[0.9]" : ""}`}
    >
      {text}
    </motion.span>
  );
}

function Pillar({ progress, index, n, title, body }: { progress: MotionValue<number>; index: number; n: string; title: string; body: string }) {
  const start = 0.74 + index * 0.05;
  const opacity = useTransform(progress, (v) => prog(v, [start, start + 0.08]));
  const y = useTransform(progress, (v) => (1 - prog(v, [start, start + 0.08])) * 24);
  return (
    <motion.li style={{ opacity, y }} className="rm-reset border-t border-glass-border pt-4">
      <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-muted">({n})</p>
      <p className="mt-2 text-base sm:text-xl md:text-2xl font-bold tracking-tight">{title}</p>
      <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">{body}</p>
    </motion.li>
  );
}

export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = useTransform(scrollYProgress, (v) => v);
  const percent = useTransform(scrollYProgress, (v) => `${String(Math.round(v * 100)).padStart(3, "0")}%`);

  const span = 0.66;
  const step = span / SENTENCE.length;

  return (
    <section ref={ref} id="manifesto" aria-label="What we do, in one sentence" className="relative z-10 h-[300vh] bg-background">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Atmosphere: an accent pool behind Gogle and a giant serif index in the background */}
        <div aria-hidden className="absolute left-[8%] top-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-accent/10 blur-[120px]" />
        <span aria-hidden className="pointer-events-none absolute -right-6 -bottom-16 select-none font-serif italic text-[38vw] leading-none text-foreground/[0.025]">
          00
        </span>

        <div className="container relative mx-auto flex h-full flex-col justify-center px-6 pt-20 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-0">
          {/* Gogle's second dock */}
          <div className="relative h-[26svh] sm:h-[32svh] lg:col-span-4 lg:h-[64svh]">
            <div id="gogle-slot-statement" aria-hidden className="absolute inset-0" />
          </div>

          <div className="lg:col-span-8">
            <Eyebrow index="00" label="The short version" />
            <p className="text-[1.85rem] sm:text-4xl md:text-5xl xl:text-[4rem] font-semibold leading-[1.12] tracking-[-0.03em]">
              {SENTENCE.map((w, i) => (
                <Word key={i} progress={scrollYProgress} range={[0.04 + i * step, 0.04 + i * step + step * 2.5]} text={w.text} accent={w.accent} />
              ))}
            </p>

            <ul className="mt-8 md:mt-14 grid grid-cols-3 gap-4 md:gap-8 max-w-3xl">
              {PILLARS.map((p, i) => (
                <Pillar key={p.n} progress={scrollYProgress} index={i} {...p} />
              ))}
            </ul>
          </div>
        </div>

        {/* Reading progress for this section */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="container mx-auto flex items-center gap-4 px-6 pb-6">
            <motion.span className="font-mono text-[10px] tracking-[0.2em] text-muted">{percent}</motion.span>
            <div className="relative h-px flex-1 bg-glass-border">
              <motion.div style={{ scaleX: bar }} className="absolute inset-0 origin-left bg-accent shadow-[0_0_10px_rgba(196,240,66,0.7)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
