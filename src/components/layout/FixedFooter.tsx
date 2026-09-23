"use client";

import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function FixedFooter() {
  const whatsappUrl = "https://wa.me/918553627474?text=Hello%2C%20I%20would%20like%20to%20discuss%20a%20project.";

  return (
    <>
      {/* Direct WhatsApp link. No expanding popup — the AI assistant already offers a WhatsApp
          handoff mid-conversation, so a second floating card here was two competing bottom-right
          launchers and a hardcoded light theme that never matched the rest of the site. */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        className="fixed bottom-24 right-4 md:right-8 z-50 grid h-14 w-14 place-items-center rounded-full glass-panel text-accent shadow-xl transition hover:scale-105 hover:border-accent/50 active:scale-95"
      >
        <MessageCircle size={24} />
      </a>

      {/* Compact enquire pill — mobile/small only. Opposite corner from the WhatsApp/chat cluster
          on purpose, so nothing on a narrow screen ever competes for the same space. */}
      <motion.a
        href="#contact"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="md:hidden fixed bottom-4 left-4 z-40 flex h-12 items-center gap-2 rounded-full bg-accent pl-4 pr-3 text-black shadow-[0_10px_30px_-8px_rgba(196,240,66,0.5)] active:scale-95 transition-transform"
      >
        <span className="font-bold text-sm tracking-wide">Enquire Now</span>
        <ArrowRight size={16} />
      </motion.a>

      {/* Immersive floating bottom bar — desktop/tablet. Token-based (foreground/background,
          not literal black/white) so it reads correctly whichever theme is active, matching
          how the Navbar's own CTA already does this. */}
      <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-40">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-16 rounded-full overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-glass-border bg-foreground/95 backdrop-blur-xl"
        >
          <a
            href="#contact"
            className="w-1/2 bg-accent hover:brightness-110 text-black flex items-center justify-center gap-2.5 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="font-bold tracking-wide text-sm relative z-10">Enquire Now</span>
            <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="tel:8553627474"
            className="w-1/2 hover:bg-background/10 text-background flex items-center justify-center gap-2.5 transition-colors group"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-background/10 text-accent group-hover:bg-background/15 group-hover:-rotate-12 group-hover:scale-105 transition-all">
              <Phone size={14} />
            </span>
            <span className="font-bold tracking-wide text-sm">8553627474</span>
          </a>
        </motion.div>
      </div>
    </>
  );
}
