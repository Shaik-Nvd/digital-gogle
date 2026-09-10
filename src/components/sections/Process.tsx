"use client";

import { motion } from "framer-motion";
import { Compass, PenTool, Settings, Globe, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const processSteps = [
  {
    num: "01",
    title: "Discover",
    description: "Goals, audience, content and the exact action visitors should take.",
    label: "analyze()",
    icon: Compass,
  },
  {
    num: "02",
    title: "Design",
    description: "Visual direction, hierarchy, motion language and responsive behaviour.",
    label: "system.compose()",
    icon: PenTool,
  },
  {
    num: "03",
    title: "Develop",
    description: "Production code, functionality, integrations and device testing.",
    label: "build.test()",
    icon: Settings,
  },
  {
    num: "04",
    title: "Distribute",
    description: "Deploying across fast edge networks for global reach.",
    label: "edge.deploy()",
    icon: Globe,
  },
  {
    num: "05",
    title: "Deliver",
    description: "Security checks, performance pass, and final handover.",
    label: "handover.zip",
    icon: Package,
  },
];

export default function Process() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current && window.innerWidth < 1024) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollContainerRef.current.scrollBy({ left: clientWidth * 0.85, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section id="process" className="py-24 md:py-32 relative z-10 bg-background overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-mono text-accent mb-4 tracking-widest uppercase">01 / METHODOLOGY</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-[1.2] md:leading-tight">
            The <span className="bg-accent text-background px-3 md:px-4 py-1 rounded-sm ml-1 md:ml-2 inline-block whitespace-nowrap mt-2 md:mt-0">5D System</span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Our engineered pipeline to build scalable digital experiences.
          </p>
        </motion.div>

        {/* Horizontal Pipeline */}
        <div className="relative max-w-7xl mx-auto mt-24">
          {/* Animated Line */}
          <div className="absolute top-[4.5rem] left-0 right-0 h-px bg-glass-border hidden lg:block">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-accent shadow-[0_0_15px_rgba(196,240,66,1)]"
            />
          </div>

          <div 
            ref={scrollContainerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => {
              // slight delay before resuming auto-scroll after touch
              setTimeout(() => setIsPaused(false), 2000);
            }}
            className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-4 lg:gap-8 pb-8 lg:pb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 lg:px-0 -mx-6 lg:mx-0"
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative flex flex-col group mt-8 lg:mt-0 w-[85vw] md:w-[45vw] lg:w-auto shrink-0 snap-center"
              >
                {/* Timeline Dot for Desktop */}
                <div className="absolute -top-[1.125rem] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-accent hidden lg:flex items-center justify-center z-10 transition-transform group-hover:scale-150 shadow-[0_0_10px_rgba(196,240,66,0.5)]">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                </div>

                <div className="glass-panel p-6 rounded-2xl relative text-center flex flex-col items-center h-full hover:scale-105 transition-transform duration-300 hover:border-accent/50 backdrop-blur-xl border-accent/10 shadow-[0_0_30px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_30px_rgba(196,240,66,0.1)]">
                  
                  {/* Glowing Wireframe-style Icon */}
                  <div className="w-16 h-16 lg:w-20 lg:h-20 mb-6 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
                    <step.icon 
                      size={40} 
                      className="text-accent drop-shadow-[0_0_12px_rgba(196,240,66,0.8)] relative z-10 group-hover:scale-110 transition-transform duration-300 stroke-1 lg:w-12 lg:h-12" 
                    />
                    {/* Background wireframe number */}
                    <span className="absolute -bottom-2 -right-2 text-5xl lg:text-6xl font-black text-white/5 z-0 font-mono select-none pointer-events-none group-hover:text-accent/10 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg lg:text-xl font-bold mb-3 tracking-wide">{step.title}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-6 flex-grow">
                    {step.description}
                  </p>
                  <code className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded w-full">
                    {step.label}
                  </code>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
