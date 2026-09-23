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

      {/* Immersive Floating Bottom Pill — desktop/tablet only. On mobile this
          duplicated the Hero's own inline CTAs and sat fixed on top of them
          in the first viewport, so it's dropped there in favor of those. */}
      <div className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-40">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-16 rounded-full overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/10 backdrop-blur-xl bg-black/60"
        >
          <a
            href="#contact"
            className="w-1/2 bg-accent hover:bg-[#c4f042] text-black flex items-center justify-center space-x-2 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="font-bold tracking-wide text-sm relative z-10">ENQUIRE NOW</span>
            <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="tel:8553627474"
            className="w-1/2 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center space-x-2 transition-all group"
          >
            <Phone size={16} className="group-hover:-rotate-12 group-hover:scale-110 transition-all text-accent" />
            <span className="font-bold tracking-wide text-sm">8553627474</span>
          </a>
        </motion.div>
      </div>
    </>
  );
}
