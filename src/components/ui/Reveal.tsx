"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Masked line reveal: each line slides up from behind its own clipping box as it enters view —
 * the editorial "type rising into place" motion used on high-end studio sites, instead of the
 * whole block fading in at once. Reduced-motion visitors get the text immediately, no movement.
 */
export function RevealLines({
  lines,
  className = "",
  lineClassName = "",
  delay = 0,
  as: Tag = "h2",
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const reduced = useReducedMotion();
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        // pb/-mb keeps descenders and italic overhang from being clipped by the mask
        <span key={i} className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] ${lineClassName}`}>
          <motion.span
            className="block"
            initial={reduced ? false : { y: "110%", rotate: 2 }}
            whileInView={{ y: "0%", rotate: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: delay + i * 0.09, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** "(02) ── Featured work" — small mono index above a section heading, with a drawn rule. */
export function Eyebrow({ index, label, className = "" }: { index: string; label: string; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className={`eyebrow flex items-center gap-3 mb-6 md:mb-8 ${className}`}
    >
      <span className="text-accent">({index})</span>
      <motion.span
        aria-hidden
        className="h-px w-10 md:w-16 bg-current origin-left opacity-50"
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
      />
      <span>{label}</span>
    </motion.div>
  );
}

/** Generic fade-and-rise for blocks (cards, paragraphs) entering view. */
export function FadeUp({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
