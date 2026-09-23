"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const processSteps = [
  {
    num: "01",
    title: "Discover",
    description: "Goals, audience, content and the exact action visitors should take.",
    label: "analyze()",
  },
  {
    num: "02",
    title: "Design",
    description: "Visual direction, hierarchy, motion language and responsive behaviour.",
    label: "system.compose()",
  },
  {
    num: "03",
    title: "Develop",
    description: "Production code, functionality, integrations and device testing.",
    label: "build.test()",
  },
  {
    num: "04",
    title: "Distribute",
    description: "Deploying across fast edge networks for global reach.",
    label: "edge.deploy()",
  },
  {
    num: "05",
    title: "Deliver",
    description: "Security checks, performance pass, and final handover.",
    label: "handover.zip",
  },
];

export default function Process() {
  const railRef = useRef<HTMLDivElement>(null);
  // The line fills as the rail itself scrolls through view, not on a generic whileInView trigger —
  // it reads as a pipeline actually running rather than a decoration that plays once and sits still.
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start 0.75", "end 0.4"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process" className="py-24 md:py-32 relative z-10 bg-background overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-[1.2] md:leading-tight max-w-2xl"
        >
          Five stages, <span className="bg-accent text-background px-3 md:px-4 py-1 rounded-sm inline-block whitespace-nowrap mt-2 md:mt-0">one engineered pipeline.</span>
        </motion.h2>

        {/* Timeline: a running line connects each stage — order here is the actual information,
            not decoration, so it earns the numbering a card grid never would. */}
        <div ref={railRef} className="relative max-w-5xl mt-20 md:mt-28">
          <div className="absolute left-[18px] md:left-6 top-2 bottom-2 w-px bg-glass-border" aria-hidden />
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute left-[18px] md:left-6 top-2 bottom-2 w-px origin-top bg-accent shadow-[0_0_12px_rgba(196,240,66,0.8)]"
            aria-hidden
          />

          <ol className="flex flex-col gap-14 md:gap-16">
            {processSteps.map((step, index) => (
              <motion.li
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="relative pl-14 md:pl-24"
              >
                <span className="absolute left-0 top-0 grid h-9 w-9 md:h-12 md:w-12 place-items-center rounded-full border border-glass-border bg-background font-mono text-xs md:text-sm text-accent">
                  {step.num}
                </span>
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-8">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight shrink-0 md:w-40">{step.title}</h3>
                  <p className="text-muted leading-relaxed max-w-xl mt-2 md:mt-0">{step.description}</p>
                </div>
                <code className="mt-4 inline-block font-mono text-[11px] text-accent/80">{step.label}</code>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
