"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24 text-center md:text-left"
        >
          <p className="text-sm font-mono text-accent mb-4 tracking-widest uppercase">04 / TESTIMONIALS</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
            Client Success
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="glass-panel p-8 md:p-10 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <Quote className="text-accent mb-6 w-10 h-10 opacity-50" />
                <p className="text-lg md:text-xl font-medium leading-relaxed mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div>
                <p className="font-bold text-lg">{t.author}</p>
                <p className="text-muted text-sm font-mono mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
