"use client";

import { motion } from "framer-motion";
import { Monitor, Smartphone, Database, TrendingUp, Bot, Shield, Video, Terminal, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { services, type ServiceData } from "@/lib/services";

const icons: Record<string, LucideIcon> = {
  "01": Monitor,
  "02": Smartphone,
  "03": Bot,
  "04": Database,
  "05": TrendingUp,
  "06": Shield,
  "07": Video,
};

type Service = ServiceData & { icon: LucideIcon };

const ServiceRow = ({ service, index }: { service: Service; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isOpen = isHovered || isExpanded;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded((v) => !v)}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsExpanded((v) => !v);
        }
      }}
      className="group relative border-b border-glass-border py-8 md:py-12 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50"
    >
      {/* Background Hover Glow */}
      <div className={`absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/[0.02] to-transparent transition-opacity duration-500 pointer-events-none ${isOpen ? "opacity-100" : "opacity-0"}`} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12 px-2 md:px-8">

        {/* Left side: Number & Icon */}
        <div className="flex items-center gap-6 lg:w-1/4 shrink-0">
          <span className={`text-2xl md:text-3xl font-mono transition-colors duration-300 ${isOpen ? "text-accent" : "text-muted opacity-50"}`}>
            {service.id}
          </span>
          <div className={`p-4 rounded-xl border transition-all duration-300 relative ${isOpen ? "border-accent/30 bg-accent/10 shadow-[0_0_30px_rgba(196,240,66,0.15)]" : "border-glass-border bg-glass"}`}>
            <service.icon size={32} className={`transition-colors duration-300 relative z-10 ${isOpen ? "text-accent drop-shadow-[0_0_10px_rgba(196,240,66,0.5)]" : "text-foreground"}`} />
          </div>
        </div>

        {/* Center: Title & Description */}
        <div className="flex flex-col lg:w-1/2">
          <h3 className={`text-2xl md:text-4xl font-bold tracking-tight mb-3 transition-colors duration-300 ${isOpen ? "text-foreground drop-shadow-md" : "text-foreground/80"}`}>
            {service.title}
          </h3>
          <p className="text-muted text-sm md:text-base leading-relaxed max-w-xl mb-4">
            {service.description}
          </p>
          <div>
            <a 
              href="#contact" 
              className="inline-flex items-center text-sm font-semibold text-accent hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {service.cta} <span className="ml-2">→</span>
            </a>
          </div>
        </div>

        {/* Right: Terminal Label */}
        <div className="hidden lg:flex flex-1 justify-end">
          <code className={`flex items-center space-x-2 text-xs font-mono px-4 py-2 rounded-full border transition-colors duration-300 ${isOpen ? "border-accent/30 text-accent bg-accent/5 shadow-[0_0_15px_rgba(196,240,66,0.1)]" : "border-glass-border text-muted opacity-50"}`}>
            <Terminal size={12} />
            <span>{service.label}</span>
          </code>
        </div>
      </div>

      {/* Expandable Tags Section */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="pt-8 px-2 md:px-8 lg:pl-[calc(25%+3rem)] pb-4">
          {service.expandedExtra && (
            <p className="text-muted text-sm md:text-base leading-relaxed max-w-xl mb-6">
              {service.expandedExtra}
            </p>
          )}
          <div className="flex flex-wrap gap-2 md:gap-3">
            {service.tags.map((tag: string, tagIdx: number) => (
              <motion.span
                key={tagIdx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -10 }}
                transition={{ duration: 0.3, delay: isOpen ? tagIdx * 0.05 : 0 }}
                className="px-4 py-2 text-xs font-mono rounded-full border border-accent/20 bg-accent/5 text-accent/90 backdrop-blur-sm hover:bg-accent/20 hover:border-accent/50 transition-colors cursor-crosshair"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-32 relative z-10 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-glass-border pb-12"
        >
          <div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
              Problems we solve for you.
            </h2>
          </div>
          <div className="md:text-right text-muted font-mono text-sm uppercase tracking-wider max-w-xs">
            Tap a row to see exactly how we fix it.
          </div>
        </motion.div>

        <div className="flex flex-col border-t border-glass-border -mt-[1px]">
          {services.map((service, index) => (
            <ServiceRow key={service.id} service={{ ...service, icon: icons[service.id] }} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
