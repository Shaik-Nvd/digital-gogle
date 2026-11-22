"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, ChevronDown, Phone } from "lucide-react";
import { useLoading } from "@/components/providers/LoadingProvider";
import { services } from "@/lib/services";
import HeroField from "./HeroField";


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

  // Scroll-driven depth: three layers (background, headline, panel) each move and fade at their
  // own rate as the hero scrolls past, so leaving it reads as a cinematic exit rather than a cut —
  // the kind of scroll-storytelling agency sites use instead of a static, one-shot hero.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, -50]);
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
              "Is your website",
              <span key="accent" className="serif-accent text-[1.12em] leading-[0.95] tracking-[-0.02em]">costing you customers?</span>,
            ].map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]">
                <motion.span
                  className="block rm-reset"
                  initial={{ y: "110%", rotate: 2 }}
                  animate={shouldAnimate ? { y: "0%", rotate: 0 } : undefined}
                  transition={{ duration: reducedMotion ? 0.01 : 1, delay: reducedMotion ? 0 : 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p variants={itemVariants} className="text-[15px] md:text-lg text-muted mb-6 max-w-xl leading-relaxed">
            Slow pages, missed enquiries, and a site that looks like everyone else&apos;s. We build the websites, AI tools, and marketing that turn visitors into paying customers.
          </motion.p>

          {/* Trust line: three short proof points, separated by accent dots, over a fading hairline */}
          <motion.ul
            variants={itemVariants}
            className="relative mb-10 max-w-xl flex flex-wrap items-center gap-x-5 gap-y-2 pb-5 text-[13px] md:text-sm font-medium text-foreground/80 after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:bg-gradient-to-r after:from-foreground/15 after:to-transparent"
          >
            {["10+ live products shipped", "Free consultation", "Response within hours"].map((item, i) => (
              <li key={item} className="flex items-center gap-2 whitespace-nowrap">
                <span
                  aria-hidden
                  className={i === 0 ? "h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(196,240,66,0.8)]" : "h-1 w-1 rounded-full bg-foreground/30"}
                />
                {item}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-3 md:gap-2 md:flex-wrap w-full">
            <a
              href="#contact"
              className="btn-shine group w-full md:w-auto pl-7 md:pl-5 pr-2 md:text-[15px] py-2 bg-accent text-black font-bold transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 flex items-center justify-between md:justify-start gap-4 whitespace-nowrap rounded-full shadow-[0_0_20px_rgba(196,240,66,0.3)] hover:shadow-[0_14px_40px_-10px_rgba(196,240,66,0.6)]"
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
              className="group w-full md:w-auto px-8 md:px-6 py-3.5 md:py-4 md:text-[15px] bg-foreground/5 backdrop-blur-md border border-foreground/10 hover:bg-foreground/10 hover:border-accent/40 transition-all duration-300 flex items-center justify-center gap-3 whitespace-nowrap rounded-full font-medium"
            >
              <span>Talk on WhatsApp</span>
              <ArrowUpRight size={18} className="text-accent transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </a>
            <a
              href="tel:+918553627474"
              aria-label="Call us on +91 85536 27474"
              className="group w-full md:w-auto px-7 md:px-4 py-3.5 md:py-4 md:text-[15px] border border-foreground/10 hover:border-accent/40 hover:bg-foreground/5 transition-all duration-300 flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-medium"
            >
              <Phone size={16} className="text-accent transition-transform duration-300 group-hover:-rotate-12" aria-hidden />
              <span>Call Us</span>
            </a>
          </motion.div>
        </motion.div>
        </motion.div>

        {/* Right Side: Gogle's first dock. The 3D robot itself lives on the fixed GogleStage layer, which
            follows this box and then flies him on through the page as you scroll. */}
        <motion.div style={reducedMotion ? undefined : { y: panelY, opacity: panelOpacity }} className="lg:w-1/2 w-full lg:-mr-12 xl:-mr-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.8, delay: reducedMotion ? 0 : 0.2 }}
            className="relative h-[400px] sm:h-[460px] md:h-[540px] lg:h-[620px] w-full"
          >
            {/* Light pool the robot stands in */}
            <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[460px] md:h-[460px] rounded-full bg-accent/20 blur-[110px]" />
            <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[520px] md:h-[520px] rounded-full border border-glass-border opacity-40" />

            {/* Docking slot: the page-wide 3D stage (GogleStage) draws Gogle inside this box */}
            <div id="gogle-slot-hero" aria-hidden className="absolute inset-0" />

            {/* HUD chips floating over the scene */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.7, delay: reducedMotion ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute left-2 top-6 md:left-4 md:top-10 glass-panel rounded-2xl px-4 py-3 backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="font-mono text-[11px] text-foreground">Gogle is online</span>
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">
                {services.length} core services <span className="text-foreground/30">/</span> 5 step process
              </p>
            </motion.div>
            <motion.div
              animate={reducedMotion ? undefined : { y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute hidden sm:block top-8 right-2 md:top-14 md:right-8 glass-panel px-3 py-1 font-mono text-[10px] md:text-xs text-accent rounded backdrop-blur-md"
            >
              const idea = build(impact);
            </motion.div>
            <motion.div
              animate={reducedMotion ? undefined : { y: [5, -5, 5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="pointer-events-none absolute hidden sm:block bottom-6 right-2 md:bottom-12 md:right-10 glass-panel px-3 py-1 font-mono text-[10px] md:text-xs text-accent rounded backdrop-blur-md"
            >
              performance.optimize();
            </motion.div>
            {!reducedMotion && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={shouldAnimate ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 2.4, duration: 0.6 }}
                className="pointer-events-none absolute bottom-6 left-4 md:bottom-12 md:left-10 font-mono text-[10px] uppercase tracking-[0.2em] text-muted"
              >
                ( tap or click Gogle )
              </motion.span>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll invitation — fades out as soon as the visitor starts scrolling */}
      {!reducedMotion && (
        <motion.div
          style={{ opacity: scrollCueOpacity }}
          className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-10 hidden [@media(min-height:960px)]:flex flex-col items-center gap-2 pointer-events-none"
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
