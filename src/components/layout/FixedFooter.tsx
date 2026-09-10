"use client";

import { useState } from "react";
import { Phone, MessageCircle, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FixedFooter() {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const whatsappUrl = "https://wa.me/918553627474?text=Hello%2C%20I%20would%20like%20to%20discuss%20a%20project.";

  return (
    <>
      {/* Floating WhatsApp Widget Container */}
      <div className="fixed bottom-28 right-4 md:right-8 z-50 flex flex-col items-end">
        {/* Expanded Widget */}
        <AnimatePresence>
          {isWidgetOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden w-72 mb-4 text-black border border-gray-200"
            >
              {/* Header */}
              <div className="bg-[#25D366] p-4 flex justify-between items-center text-white">
                <div className="flex items-center space-x-2 font-bold">
                  <MessageCircle size={20} fill="currentColor" />
                  <span>WhatsApp</span>
                </div>
                <button onClick={() => setIsWidgetOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Chat Body */}
              <div className="bg-[#F0F2F5] p-5">
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm inline-block max-w-[90%]">
                  Hello 👋<br/>Can we help you?
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-white flex flex-col space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white py-2.5 rounded-full font-bold text-sm flex justify-center items-center hover:bg-[#128C7E] transition-colors"
                >
                  Open WhatsApp Chat
                </a>
                <a
                  href="mailto:mail2nvd@gmail.com"
                  className="w-full bg-[#F0F2F5] text-gray-700 py-2.5 rounded-full font-bold text-sm flex justify-center items-center hover:bg-gray-200 transition-colors"
                >
                  Email Support
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsWidgetOpen(!isWidgetOpen)}
          className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all duration-300 flex items-center justify-center relative"
          aria-label="Toggle WhatsApp Chat"
        >
          {isWidgetOpen ? <X size={28} /> : <MessageCircle size={28} fill="currentColor" />}
        </button>
      </div>

      {/* Immersive Floating Bottom Pill */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-40">
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
