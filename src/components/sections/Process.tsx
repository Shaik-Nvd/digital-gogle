"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Eyebrow, RevealLines } from "@/components/ui/Reveal";

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
  // Which stage sits in the middle of the screen right now (drives the sticky stage panel)
  const [active, setActive] = useState(0);
  const current = processSteps[active];

  return (
    <section id="process" className="py-24 md:py-32 relative z-10 bg-background overflow-x-clip">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <Eyebrow index="01" label="How we work" />
        <RevealLines
          className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-[1.1] max-w-3xl"
          lines={[
            <>Five stages,</>,
            <span key="hl" className="inline-block mt-2 bg-accent text-black px-2.5 md:px-4 pt-0.5 pb-1.5 rounded-md font-serif italic font-normal tracking-[-0.01em] text-[0.98em] sm:text-[1.08em] whitespace-nowrap">one engineered pipeline.</span>,
          ]}
        />

        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
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
                viewport={{ margin: "-45% 0px -45% 0px" }}
                onViewportEnter={() => setActive(index)}
                transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative pl-14 md:pl-24 transition-opacity duration-500 ${active === index ? "lg:opacity-100" : "lg:opacity-45"}`}
              >
                <span className="absolute left-0 top-0 grid h-9 w-9 md:h-12 md:w-12 place-items-center rounded-full border border-glass-border bg-background font-mono text-xs md:text-sm text-accent transition-all duration-500 group-hover:bg-accent group-hover:text-black group-hover:border-accent group-hover:shadow-[0_0_24px_rgba(196,240,66,0.45)]">
                  {step.num}
                </span>
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-8">
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight shrink-0 md:w-56 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">{step.title}</h3>
                  <p className="text-muted leading-relaxed max-w-xl mt-2 md:mt-0">{step.description}</p>
                </div>
                <code className="mt-4 inline-block font-mono text-[11px] text-accent/80">{step.label}</code>
              </motion.li>
            ))}
          </ol>
        </div>
        </div>

        {/* Gogle's third dock + the stage you're reading, pinned beside the timeline */}
        <aside className="hidden lg:block lg:col-span-5" aria-label="Current stage">
          <div className="sticky top-24 mt-20 flex h-[calc(100svh-7.5rem)] max-h-[760px] flex-col">
            <div className="relative flex-1 min-h-0">
              <div aria-hidden className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[90px]" />
              <div id="gogle-slot-process" aria-hidden className="absolute inset-x-0 top-10 bottom-4" />
            </div>
            <div className="glass-panel travel-border relative rounded-3xl p-6 xl:p-7 overflow-hidden">
              <div className="flex items-start justify-between gap-6">
                <div className="relative h-[5.5rem] w-28 overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={current.num}
                      initial={{ y: "100%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "-100%", opacity: 0 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="rm-reset absolute inset-0 font-serif italic text-[5.5rem] leading-none text-accent"
                    >
                      {current.num}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="flex-1 pt-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Now running</p>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={current.num}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="rm-reset"
                    >
                      <p className="mt-1 text-3xl font-bold tracking-tight">{current.title}</p>
                      <code className="mt-1 block font-mono text-[11px] text-accent/80">{current.label}</code>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-5 gap-1.5" aria-hidden>
                {processSteps.map((step, i) => (
                  <span key={step.num} className={`h-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-accent shadow-[0_0_8px_rgba(196,240,66,0.7)]" : "bg-glass-border"}`} />
                ))}
              </div>
            </div>
          </div>
        </aside>
        </div>
      </div>
    </section>
  );
}
