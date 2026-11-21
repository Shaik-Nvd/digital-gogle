"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Bot, ChevronDown } from "lucide-react";
import { useLoading } from "@/components/providers/LoadingProvider";
import { services } from "@/lib/services";
import HeroField from "./HeroField";

const PROCESS_STEPS = ["Discover", "Design", "Develop", "Distribute", "Deliver"];
const PULSE_HEIGHTS = [45, 80, 55, 95, 65, 35];

export default function Hero() {
  const { isLoading } = useLoading();
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gates client-only matchMedia read to avoid an SSR/CSR hydration mismatch
    setReducedMotion(mql.matches);
  }, []);

  // Entrance plays once, right as the preloader dismisses (not before).
  const shouldAnimate = !isLoading;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0.01 : 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  // A light tilt on the studio panel, following the cursor — off for touch/reduced-motion visitors,
  // who never fire mousemove here anyway. Motion values so the tilt doesn't trigger React renders.
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 16 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 16 });
  const handlePanelMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateY.set(((event.clientX - rect.left) / rect.width - 0.5) * 14);
    rotateX.set(((event.clientY - rect.top) / rect.height - 0.5) * -14);
  };
  const resetPanel = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  // Scroll-driven depth: three layers (background, headline, panel) each move and fade at their
  // own rate as the hero scrolls past, so leaving it reads as a cinematic exit rather than a cut —
  // the kind of scroll-storytelling agency sites use instead of a static, one-shot hero.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const panelScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const panelOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scrollCueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-screen pt-32 pb-44 md:pb-16 overflow-hidden flex flex-col justify-center">
      {/* Background layer: grid + particle field drift slower than the page scroll, for depth */}
      <motion.div className="absolute inset-0 z-0" style={reducedMotion ? undefined : { y: bgY }}>
        {/* Immersive Architectural Grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Live constellation field — the whole scene reacts to the cursor, not just the panel */}
        <HeroField />
        {/* Soft top light + a fade into the next section, so the hero hands off instead of cutting */}
        <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-accent/[0.07] blur-[140px] pointer-events-none" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background pointer-events-none" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between">

        {/* Left Side: Typography — scroll layer wraps the (unrelated) entrance-animation layer */}
        <motion.div style={reducedMotion ? undefined : { y: textY, opacity: textOpacity }} className="lg:w-1/2 mb-12 lg:mb-0 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={shouldAnimate ? "visible" : "hidden"}
          className="w-full"
        >
          <motion.div variants={itemVariants} className="mb-7 md:mb-8">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-glass-border bg-foreground/[0.04] backdrop-blur-md pl-2.5 pr-4 py-1.5 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-muted">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Digital Gogle Studio <span className="text-foreground/30">/</span> Bangalore
            </span>
          </motion.div>

          {/* Masked line reveal: each line rises from behind its own clip as the preloader lifts */}
          <h1 className="text-[2.9rem] leading-[1.02] sm:text-6xl md:text-7xl xl:text-[5.4rem] font-bold tracking-[-0.035em] mb-7">
            {[
              <>Is your website</>,
              <span className="serif-accent text-[1.12em] leading-[0.95] tracking-[-0.02em]">costing you customers?</span>,
            ].map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                <motion.span
                  className="block"
                  initial={reducedMotion ? false : { y: "110%", rotate: 2 }}
                  animate={shouldAnimate ? { y: "0%", rotate: 0 } : undefined}
                  transition={{ duration: reducedMotion ? 0.01 : 1, delay: reducedMotion ? 0 : 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p variants={itemVariants} className="text-[15px] md:text-lg text-muted mb-10 max-w-xl leading-relaxed">
            Slow pages, missed enquiries, and a site that looks like everyone else&apos;s. We build the websites, AI tools, and marketing that turn visitors into paying customers.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-4 w-full">
            <a
              href="#contact"
              className="btn-shine group w-full md:w-auto pl-7 pr-2 py-2 bg-accent text-black font-bold transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 flex items-center justify-between md:justify-start gap-4 rounded-full shadow-[0_0_20px_rgba(196,240,66,0.3)] hover:shadow-[0_14px_40px_-10px_rgba(196,240,66,0.6)]"
            >
              <span>Get a free website check</span>
              <span className="relative grid h-10 w-10 md:h-11 md:w-11 place-items-center rounded-full bg-black text-accent overflow-hidden">
                <ArrowDown size={18} className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[150%]" aria-hidden />
                <ArrowDown size={18} className="absolute -translate-y-[150%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" aria-hidden />
              </span>
            </a>
            <a
              href="https://wa.me/918553627474"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full md:w-auto px-8 py-3.5 md:py-4 bg-foreground/5 backdrop-blur-md border border-foreground/10 hover:bg-foreground/10 hover:border-accent/40 transition-all duration-300 flex items-center justify-center gap-3 rounded-full font-medium"
            >
              <span>Talk on WhatsApp</span>
              <ArrowUpRight size={18} className="text-accent transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </a>
          </motion.div>
        </motion.div>
        </motion.div>

        {/* Right Side: Live Studio Panel — scroll layer wraps the entrance-animation layer */}
        <motion.div style={reducedMotion ? undefined : { y: panelY, scale: panelScale, opacity: panelOpacity }} className="lg:w-1/2 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={shouldAnimate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{
            duration: reducedMotion ? 0.01 : 1,
            delay: reducedMotion ? 0 : 0.35,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="relative h-[350px] md:h-[460px] flex items-center justify-center w-full"
        >
          {/* Accent glow pooled under the panel, so it sits in light rather than floating on flat black */}
          <div aria-hidden className="absolute w-[260px] h-[260px] md:w-[380px] md:h-[380px] rounded-full bg-accent/15 blur-[90px]" />
          {/* Energy Rings */}
          <div className="absolute w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full border border-glass-border opacity-50 shadow-[0_0_50px_rgba(196,240,66,0.05)]" />
          <div className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-glass-border opacity-20" />

          <motion.div
            onMouseMove={handlePanelMove}
            onMouseLeave={resetPanel}
            style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
            className="glass-panel travel-border relative z-10 w-full max-w-[340px] rounded-3xl p-6 md:p-7 mx-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="font-mono text-xs text-foreground">Gogle is online</span>
              </div>
              <Bot size={16} className="text-accent" aria-hidden />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-3xl font-bold tracking-tight">{services.length}</p>
                <p className="text-[11px] text-muted font-mono uppercase tracking-wide">Core services</p>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{PROCESS_STEPS.length}</p>
                <p className="text-[11px] text-muted font-mono uppercase tracking-wide">Step process</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {PROCESS_STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-muted w-4 shrink-0">{String(index + 1).padStart(2, "0")}</span>
                  <div className="h-1 flex-1 rounded-full bg-glass-border overflow-hidden">
                    <motion.div
                      className="h-full bg-accent origin-left"
                      initial={{ scaleX: 0 }}
                      animate={shouldAnimate ? { scaleX: 1 } : { scaleX: 0 }}
                      transition={{ duration: reducedMotion ? 0.01 : 0.6, delay: reducedMotion ? 0 : 0.7 + index * 0.08 }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-muted shrink-0">{step}</span>
                </div>
              ))}
            </div>

            <div className="flex items-end gap-1 h-8" aria-hidden>
              {PULSE_HEIGHTS.map((height, index) => (
                <motion.span
                  key={index}
                  className="flex-1 rounded-sm bg-accent/70"
                  style={{ height: `${height}%` }}
                  animate={reducedMotion ? undefined : { height: [`${height}%`, `${100 - height}%`, `${height}%`] }}
                  transition={{ duration: 1.4 + index * 0.15, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted uppercase tracking-wide">Always building, always listening</p>
          </motion.div>

          {/* Floating Pseudo Code */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 right-4 md:top-6 md:right-6 glass-panel px-3 py-1 font-mono text-[10px] md:text-xs text-accent rounded backdrop-blur-md"
          >
            const idea = build(impact);
          </motion.div>
          <motion.div
            animate={{ y: [5, -5, 5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-4 left-4 md:bottom-6 md:left-6 glass-panel px-3 py-1 font-mono text-[10px] md:text-xs text-accent rounded backdrop-blur-md"
          >
            performance.optimize();
          </motion.div>
        </motion.div>
        </motion.div>
      </div>

      {/* Scroll invitation — fades out as soon as the visitor starts scrolling */}
      {!reducedMotion && (
        <motion.div
          style={{ opacity: scrollCueOpacity }}
          className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none"
        >
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Scroll to explore</span>
          <span className="relative flex h-9 w-5 items-start justify-center rounded-full border border-glass-border p-1.5">
            <motion.span
              animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-accent"
            />
          </span>
          <ChevronDown size={14} className="text-muted -mt-1" aria-hidden />
        </motion.div>
      )}
    </section>
  );
}
