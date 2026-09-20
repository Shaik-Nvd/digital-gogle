"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLoading } from "@/components/providers/LoadingProvider";

export default function Hero() {
  const { isLoading } = useLoading();
  const [reducedMotion, setReducedMotion] = useState(false);

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

  return (
    <section className="relative min-h-screen pt-32 pb-40 md:pb-16 overflow-hidden flex flex-col justify-center">
      {/* Immersive Architectural Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.02]" 
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} 
      />
      <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between">
        
        {/* Left Side: Typography */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={shouldAnimate ? "visible" : "hidden"}
          className="lg:w-1/2 mb-12 lg:mb-0 w-full"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] md:leading-[1.15] mb-6"
          >
            Is your website <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-muted to-foreground italic font-light box-decoration-clone py-2">costing you customers?</span>
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

        {/* Right Side: 3D Lab */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={shouldAnimate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{
            duration: reducedMotion ? 0.01 : 1,
            delay: reducedMotion ? 0 : 0.35,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
          className="lg:w-1/2 relative h-[350px] md:h-[500px] flex items-center justify-center code-cube-container w-full"
        >
          {/* Energy Rings */}
          <div className="absolute w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full border border-glass-border opacity-50 shadow-[0_0_50px_rgba(196,240,66,0.05)]" />
          <div className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-glass-border opacity-20" />

          {/* 3D Cube */}
          <div className="code-cube scale-75 md:scale-100">
            <div className="cube-face face-front">&lt;/&gt;</div>
            <div className="cube-face face-back">JS</div>
            <div className="cube-face face-right">API</div>
            <div className="cube-face face-left">CSS</div>
            <div className="cube-face face-top">UI</div>
            <div className="cube-face face-bottom">DB</div>
          </div>

          {/* Orbit 1 */}
          <div className="absolute inset-0 flex items-center justify-center scale-75 md:scale-100">
            <div className="orbit-item" style={{ animation: "orbit 10s linear infinite" }}>HTML</div>
            <div className="orbit-item" style={{ animation: "orbit 10s linear infinite", animationDelay: "-2.5s" }}>{`{JS}`}</div>
            <div className="orbit-item" style={{ animation: "orbit 10s linear infinite", animationDelay: "-5s" }}>#CSS</div>
            <div className="orbit-item" style={{ animation: "orbit 10s linear infinite", animationDelay: "-7.5s" }}>API</div>
          </div>

          {/* Orbit 2 */}
          <div className="absolute inset-0 flex items-center justify-center scale-75 md:scale-100">
            <div className="orbit-item" style={{ animation: "orbitReverse 15s linear infinite" }}>UX</div>
            <div className="orbit-item" style={{ animation: "orbitReverse 15s linear infinite", animationDelay: "-3.75s" }}>DB</div>
            <div className="orbit-item" style={{ animation: "orbitReverse 15s linear infinite", animationDelay: "-7.5s" }}>SEO</div>
            <div className="orbit-item" style={{ animation: "orbitReverse 15s linear infinite", animationDelay: "-11.25s" }}>3D</div>
          </div>

          {/* Floating Pseudo Code */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 right-4 md:top-10 md:right-10 glass-panel px-3 py-1 font-mono text-[10px] md:text-xs text-accent rounded backdrop-blur-md"
          >
            const idea = build(impact);
          </motion.div>
          <motion.div
            animate={{ y: [5, -5, 5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-4 left-4 md:bottom-10 md:left-10 glass-panel px-3 py-1 font-mono text-[10px] md:text-xs text-accent rounded backdrop-blur-md"
          >
            performance.optimize();
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
