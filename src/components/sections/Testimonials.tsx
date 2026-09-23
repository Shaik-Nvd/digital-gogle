"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Digital Gogle Studio delivered an exceptional booking system that scaled perfectly with our growth. The UI is incredibly immersive.",
    author: "Arun K.",
    role: "CEO, PrimeOra Realtors",
  },
  {
    quote: "Their 5D methodology is flawless. We saw a 300% increase in conversions after they modernized our e-commerce platform.",
    author: "Sara V.",
    role: "Director, Fhoneify",
  },
  {
    quote: "A true engineering partner. The architectural approach they took for our security scanning tool was world-class.",
    author: "Rahul M.",
    role: "Founder, UrlScan",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32 relative z-10 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black tracking-tighter mb-16 md:mb-24 max-w-2xl"
        >
          What clients say, not what we do.
        </motion.h2>

        <div className="max-w-5xl">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className={`flex flex-col md:flex-row md:items-start gap-3 md:gap-10 py-10 md:py-12 border-t border-glass-border ${idx === testimonials.length - 1 ? "border-b" : ""}`}
            >
              <div className="md:w-48 shrink-0">
                <p className="font-bold text-base">{t.author}</p>
                <p className="text-muted text-sm font-mono mt-1">{t.role}</p>
              </div>
              <p className="text-xl md:text-2xl font-medium leading-snug tracking-tight max-w-2xl">
                {t.quote}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
