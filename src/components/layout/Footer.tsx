"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#contact", label: "Contact" },
];

const CONTACT = [
  { href: "https://wa.me/918553627474", label: "WhatsApp", value: "+91 85536 27474", external: true },
  { href: "tel:+918553627474", label: "Call", value: "+91 85536 27474" },
  { href: "mailto:mail2nvd@gmail.com", label: "Email", value: "mail2nvd@gmail.com" },
];

/** Pulls toward the cursor while hovered, springs back on leave. */
function Magnetic({ children, className = "", href }: { children: ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <a ref={ref} href={href} onMouseMove={move} onMouseLeave={leave} className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${className}`}>
      {children}
    </a>
  );
}

/** Studio local time, ticking — rendered only on the client so the server HTML never disagrees. */
function StudioClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{now ?? "--:--:--"}</span>;
}

export default function Footer() {
  const markRef = useRef<HTMLParagraphElement>(null);

  // Cursor position (relative to the wordmark) feeds its lime spotlight
  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = markRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--fx", `${e.clientX - r.left}px`);
    el.style.setProperty("--fy", `${e.clientY - r.top}px`);
  };

  return (
    <footer
      onMouseMove={onMove}
      className="relative z-10 mt-20 overflow-hidden border-t border-glass-border bg-background pt-20 pb-32 md:pb-28"
    >
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-[140px]" />

      <div className="container relative mx-auto px-6">
        {/* Closing call to action */}
        <div className="flex flex-col gap-10 border-b border-glass-border pb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow mb-6 flex items-center gap-3">
              <span className="text-accent">(06)</span>
              <span className="h-px w-10 bg-current opacity-50" />
              <span>Next step</span>
            </p>
            {/* Observed on the heading itself: the line spans start fully clipped, so they never "intersect" */}
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="text-4xl md:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.02]"
            >
              {["Let's make your", "website work"].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                  <motion.span
                    className="rm-reset block"
                    variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
                    transition={{ duration: 0.9, delay: i * 0.1, ease: EASE }}
                  >
                    {line}
                    {i === 1 && <span className="serif-accent font-normal text-accent"> harder.</span>}
                  </motion.span>
                </span>
              ))}
            </motion.h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Magnetic
              href="/#contact"
              className="btn-shine group inline-flex items-center gap-4 rounded-full bg-accent py-2 pl-7 pr-2 text-base font-bold text-black shadow-[0_0_30px_rgba(196,240,66,0.3)]"
            >
              Start a project
              <span className="grid h-12 w-12 place-items-center rounded-full bg-black text-accent transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight size={20} aria-hidden />
              </span>
            </Magnetic>
            <Magnetic
              href="https://wa.me/918553627474"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-4 text-sm font-semibold hover:border-accent/50"
            >
              WhatsApp us <ArrowUpRight size={16} className="text-accent" aria-hidden />
            </Magnetic>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-3 text-xl font-bold tracking-tight">
              DIGITAL GOGLE STUDIO<span className="text-accent">.</span>
            </h3>
            <p className="max-w-xs text-sm text-muted">Multi-discipline digital services studio crafting premium digital experiences.</p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow mb-4">Navigate</p>
            <ul className="space-y-2.5">
              {NAV.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="group relative inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-accent transition-colors">
                    <span className="h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-4" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-4">Contact</p>
            <ul className="space-y-3">
              {CONTACT.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group block text-sm"
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{c.label}</span>
                    <span className="text-foreground/85 transition-colors group-hover:text-accent break-all">{c.value}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className="eyebrow mb-4">Studio</p>
            <p className="text-sm text-foreground/85">Bangalore, India</p>
            <p className="mt-3 flex items-center gap-2 font-mono text-sm text-foreground/85">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <StudioClock /> <span className="text-muted">IST</span>
            </p>
          </div>
        </div>

        {/* Oversized wordmark: wipes up into view, and a lime light follows the cursor across it */}
        <motion.p
          ref={markRef}
          aria-hidden
          initial={{ clipPath: "inset(100% 0 0 0)", y: 40 }}
          whileInView={{ clipPath: "inset(0% 0 0 0)", y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, ease: EASE }}
          className="rm-reset select-none [--fx:50%] [--fy:60%] text-center font-bold tracking-[-0.06em] leading-[0.82] text-[17vw] md:text-[15vw] xl:text-[13rem] bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "radial-gradient(380px circle at var(--fx) var(--fy), rgba(196,240,66,0.9), transparent 62%), linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 16%, transparent), transparent)",
          }}
        >
          Digital <span className="font-serif italic font-normal tracking-[-0.03em]">Gogle</span>
        </motion.p>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-glass-border pt-8 text-xs text-muted md:flex-row">
          <p>&copy; {new Date().getFullYear()} Digital Gogle Studio. All rights reserved.</p>
          <button
            type="button"
            onClick={() => {
              const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number) => void } }).__lenis;
              if (lenis) lenis.scrollTo(0);
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group inline-flex items-center gap-3 font-mono uppercase tracking-[0.18em] hover:text-accent transition-colors"
          >
            Back to top
            <span className="grid h-9 w-9 place-items-center rounded-full border border-glass-border transition-all duration-500 group-hover:-translate-y-1 group-hover:border-accent/60 group-hover:bg-accent group-hover:text-black">
              <ArrowUp size={14} aria-hidden />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
