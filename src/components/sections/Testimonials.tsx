"use client";

import { motion } from "framer-motion";
import TestimonialCard from "@/components/ui/TestimonialCard";

const testimonials = [
  {
    name: "Arun K.",
    role: "CEO, PrimeOra Realtors",
    testimonial: "Digital Gogle Studio delivered an exceptional booking system that scaled perfectly with our growth. The UI is incredibly immersive.",
  },
  {
    name: "Sara V.",
    role: "Director, Fhoneify",
    testimonial: "Their 5D methodology is flawless. We saw a 300% increase in conversions after they modernized our e-commerce platform.",
  },
  {
    name: "Rahul M.",
    role: "Founder, UrlScan",
    testimonial: "A true engineering partner. The architectural approach they took for our security scanning tool was world-class.",
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
            >
              <TestimonialCard {...t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
