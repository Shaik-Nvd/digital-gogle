"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowUpRight, Bot, Database, Monitor, Shield, Smartphone, Terminal, TrendingUp, Video, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { services, type ServiceData } from "@/lib/services";
import { Eyebrow, RevealLines } from "@/components/ui/Reveal";

const icons: Record<string, LucideIcon> = {
  "01": Monitor,
  "02": Smartphone,
  "03": Bot,
  "04": Database,
  "05": TrendingUp,
  "06": Shield,
  "07": Video,
};

const EASE = [0.22, 1, 0.36, 1] as const;
const CYCLE_MS = 6500;

/** The full answer for one service: what's wrong, what we do about it, what's included, next step. */
function Detail({ service, compact = false }: { service: ServiceData; compact?: boolean }) {
  const Icon = icons[service.id];
  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-6">
        {/* Icon orb: a rotating conic halo around a glass core */}
        <div className="relative grid h-16 w-16 md:h-20 md:w-20 shrink-0 place-items-center">
          <span aria-hidden className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,var(--color-accent)_90deg,transparent_180deg)] opacity-80 motion-safe:animate-[spin_4s_linear_infinite]" />
          <span aria-hidden className="absolute inset-[2px] rounded-full bg-background" />
          <span aria-hidden className="absolute inset-2 rounded-full bg-accent/15 blur-md" />
          <Icon className="relative h-7 w-7 md:h-8 md:w-8 text-accent drop-shadow-[0_0_12px_rgba(196,240,66,0.6)]" />
        </div>
        <code className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 font-mono text-[11px] text-accent">
          <Terminal size={12} aria-hidden />
          {service.label}
        </code>
      </div>

      {/* In the inline (mobile) version the row above already shows the title */}
      {!compact && <h3 className="mt-6 text-3xl xl:text-[2.6rem] font-bold tracking-tight leading-[1.08]">{service.title}</h3>}
      <p className={`${compact ? "mt-5" : "mt-4"} text-muted leading-relaxed`}>{service.description}</p>
      {service.expandedExtra && <p className="mt-3 text-muted leading-relaxed">{service.expandedExtra}</p>}

      <ul className="mt-6 flex flex-wrap gap-2" aria-label="What's included">
        {service.tags.map((tag, i) => (
          <motion.li
            key={tag}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.05, ease: EASE }}
            className="rm-reset rounded-full border border-glass-border bg-foreground/[0.04] px-3.5 py-1.5 font-mono text-[11px] text-foreground/80"
          >
            {tag}
          </motion.li>
        ))}
      </ul>

      <a
        href="#contact"
        onClick={(e) => e.stopPropagation()}
        className="btn-shine group/cta mt-8 inline-flex items-center gap-3 rounded-full bg-accent pl-5 pr-1.5 py-1.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(196,240,66,0.25)] transition-[transform,box-shadow] duration-500 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-10px_rgba(196,240,66,0.6)]"
      >
        {service.cta}
        <span className="grid h-8 w-8 place-items-center rounded-full bg-black text-accent transition-transform duration-500 group-hover/cta:rotate-45">
          <ArrowUpRight size={16} aria-hidden />
        </span>
      </a>
    </div>
  );
}

export default function Services() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true); // stops for good after the visitor picks one
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "-20% 0px -20% 0px" });
  const current = services[active];

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only media query read
    setReduced(mql.matches);
  }, []);

  // Auto-advance through the services while the section is on screen and nobody is interacting
  const cycling = auto && !paused && inView && !reduced;
  useEffect(() => {
    if (!cycling) return;
    const id = window.setTimeout(() => setActive((i) => (i + 1) % services.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [cycling, active]);

  const pick = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      className="py-24 md:py-32 relative z-10 bg-background overflow-x-clip"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div aria-hidden className="pointer-events-none absolute right-0 top-1/3 h-[520px] w-[520px] rounded-full bg-accent/[0.06] blur-[140px]" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative">
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Eyebrow index="03" label="Services" />
            <RevealLines
              className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.02]"
              lines={[<>Problems we solve</>, <span key="a" className="serif-accent font-normal text-[1.1em]">for you.</span>]}
            />
          </div>
          <p className="md:text-right text-muted font-mono text-xs md:text-sm uppercase tracking-wider max-w-xs">
            Tap a row to see exactly how we fix it.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-14">
          {/* Index of problems */}
          <ol className="lg:col-span-5 border-t border-glass-border">
            {services.map((service, i) => {
              const isActive = i === active;
              return (
                <li key={service.id} className="border-b border-glass-border">
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={`service-panel-${service.id}`}
                    onClick={() => pick(i)}
                    onMouseEnter={() => window.matchMedia("(hover: hover) and (min-width: 1024px)").matches && pick(i)}
                    className="group relative flex w-full items-start gap-4 py-4 md:py-5 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 rounded-sm"
                  >
                    <span className={`font-mono text-xs pt-1.5 transition-colors duration-300 ${isActive ? "text-accent" : "text-muted"}`}>{service.id}</span>
                    <span className="flex-1">
                      <span
                        className={`block text-[15px] md:text-lg font-semibold leading-snug tracking-tight transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isActive ? "text-foreground lg:translate-x-2" : "text-foreground/55 group-hover:text-foreground/85"
                        }`}
                      >
                        {service.title}
                      </span>
                      <span className={`mt-1 block font-mono text-[10px] tracking-wide transition-colors ${isActive ? "text-accent/80" : "text-muted/70"}`}>{service.label}</span>
                    </span>
                    <ArrowUpRight
                      size={18}
                      aria-hidden
                      className={`mt-1 shrink-0 transition-all duration-500 ${isActive ? "rotate-45 text-accent" : "text-muted/50"}`}
                    />
                    {/* Auto-advance timer, drawn along the row's bottom edge */}
                    {isActive && (
                      <span aria-hidden className="absolute -bottom-px left-0 h-px w-full overflow-hidden">
                        <span
                          key={`${active}-${cycling}`}
                          className="block h-full w-full origin-left bg-accent shadow-[0_0_10px_rgba(196,240,66,0.8)]"
                          style={
                            {
                              transform: cycling ? undefined : "scaleX(1)",
                              animation: cycling ? `svc-progress ${CYCLE_MS}ms linear forwards` : undefined,
                            } as CSSProperties
                          }
                        />
                      </span>
                    )}
                  </button>

                  {/* Mobile / tablet: the answer opens inline under its row */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        id={`service-panel-${service.id}`}
                        key="m"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="rm-reset overflow-hidden lg:hidden"
                      >
                        <div className="pb-8 pt-2 pl-8">
                          <Detail service={service} compact />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>

          {/* Desktop: the answer on a pinned stage beside the index */}
          <div className="hidden lg:block lg:col-span-7">
            <div className="sticky top-28">
              <div
                className="spotlight glass-panel travel-border relative overflow-hidden rounded-[2rem] p-10 xl:p-12 min-h-[560px]"
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
              >
                {/* Giant serif index that rolls with each change */}
                <div aria-hidden className="pointer-events-none absolute -right-4 -top-10 h-[15rem] w-[18rem] overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={current.id}
                      initial={{ y: "60%", opacity: 0, rotate: 6 }}
                      animate={{ y: "0%", opacity: 1, rotate: 0 }}
                      exit={{ y: "-60%", opacity: 0, rotate: -6 }}
                      transition={{ duration: 0.7, ease: EASE }}
                      className="rm-reset absolute right-4 top-0 font-serif italic text-[13rem] leading-none text-foreground/[0.05]"
                    >
                      {current.id}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.id}
                    id="service-stage"
                    initial={{ opacity: 0, y: 28, filter: "blur(10px)", clipPath: "inset(0 0 100% 0)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)" }}
                    exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                    transition={{ duration: 0.55, ease: EASE }}
                    className="rm-reset relative"
                  >
                    <Detail service={current} />
                  </motion.div>
                </AnimatePresence>

                {/* Position dots */}
                <div className="absolute bottom-8 right-10 flex gap-1.5" aria-hidden>
                  {services.map((s, i) => (
                    <span key={s.id} className={`h-1 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-accent" : "w-1.5 bg-foreground/20"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
