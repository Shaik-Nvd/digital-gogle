"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Mail, Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  // Standard mobile-overlay hygiene: lock the page behind it, close on Escape, keep focus
  // inside while open, and hand focus back to the button that opened it on close.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("a, button");
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) toggleRef.current?.focus();
  }, [isOpen]);

  return (
    <header className="fixed top-0 left-0 w-full z-40 glass-panel border-b border-glass-border">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl md:text-2xl tracking-tight relative z-50" onClick={close}>
          DIGITAL GOGLE STUDIO<span className="text-accent">.</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {LINKS.slice(0, -1).map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Link
            href="/#contact"
            className="px-5 py-2.5 bg-foreground text-background font-bold text-sm rounded-full hover:bg-accent hover:text-black transition-colors shadow-[0_0_15px_rgba(196,240,66,0)] hover:shadow-[0_0_15px_rgba(196,240,66,0.3)]"
          >
            START A PROJECT
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden relative z-50">
          <ThemeToggle />
          <button
            ref={toggleRef}
            className="grid h-11 w-11 place-items-center text-foreground"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.18 }}
                className="grid place-items-center"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Nav — full-bleed takeover, not a translucent dropdown: this is the same glass
          surface that ghosted section headings through it before scroll-padding-top was fixed,
          so an opaque panel here avoids that failure mode entirely for a surface this large. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
            className="md:hidden fixed inset-0 top-20 z-40 flex flex-col bg-background"
          >
            <nav className="flex-1 overflow-y-auto px-6 pt-8 pb-4">
              {LINKS.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.4, delay: reducedMotion ? 0 : 0.06 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-glass-border"
                >
                  <Link
                    href={link.href}
                    onClick={close}
                    className="group flex items-center justify-between py-5 min-h-11"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
                      <span className="text-3xl font-bold tracking-tight group-active:text-accent transition-colors">{link.label}</span>
                    </span>
                    <ArrowUpRight size={20} className="text-muted group-active:text-accent transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.4, delay: reducedMotion ? 0 : 0.3 }}
              className="px-6 pb-8 pt-2 border-t border-glass-border flex flex-col gap-4"
            >
              <div className="flex gap-3">
                <a
                  href="https://wa.me/918553627474"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full border border-glass-border text-sm font-medium active:border-accent/50 active:text-accent transition-colors"
                >
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <a
                  href="mailto:mail2nvd@gmail.com"
                  onClick={close}
                  className="flex-1 flex items-center justify-center gap-2 h-12 rounded-full border border-glass-border text-sm font-medium active:border-accent/50 active:text-accent transition-colors"
                >
                  <Mail size={16} /> Email
                </a>
              </div>
              <Link
                href="/#contact"
                onClick={close}
                className="flex items-center justify-center gap-2 h-14 rounded-full bg-accent text-black font-bold text-sm tracking-wide"
              >
                START A PROJECT
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
