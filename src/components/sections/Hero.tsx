"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Bot, ChevronDown } from "lucide-react";
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
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] md:leading-[1.15] mb-6"
          >
            Is your website <br className="hidden md:block" />
            <span className="text-muted italic font-light">costing you customers?</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-[15px] md:text-lg text-muted mb-10 max-w-xl leading-relaxed">
            Slow pages, missed enquiries, and a site that looks like everyone else&apos;s. We build the websites, AI tools, and marketing that turn visitors into paying customers.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-4 w-full">
            <a
              href="#contact"
              className="w-full md:w-auto px-8 py-3.5 md:py-4 bg-accent text-black font-bold hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3 rounded-full shadow-[0_0_20px_rgba(196,240,66,0.3)] hover:shadow-[0_0_30px_rgba(196,240,66,0.5)]"
            >
              <span>Get a free website check</span>
              <span className="text-xl">↓</span>
            </a>
            <a
              href="https://wa.me/918553627474"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-8 py-3.5 md:py-4 bg-foreground/5 backdrop-blur-md border border-foreground/10 hover:bg-foreground/10 hover:border-foreground/20 transition-all duration-300 flex items-center justify-center space-x-3 rounded-full font-medium"
            >
              <span>Talk on WhatsApp</span>
              <span className="text-accent text-xl">↗</span>
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
          {/* Energy Rings */}
          <div className="absolute w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full border border-glass-border opacity-50 shadow-[0_0_50px_rgba(196,240,66,0.05)]" />
          <div className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-glass-border opacity-20" />

          <motion.div
            onMouseMove={handlePanelMove}
            onMouseLeave={resetPanel}
            style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
            className="glass-panel relative z-10 w-full max-w-[340px] rounded-3xl p-6 md:p-7 mx-6"
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
