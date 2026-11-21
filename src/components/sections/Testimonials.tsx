"use client";

import { motion } from "framer-motion";
import TestimonialCard from "@/components/ui/TestimonialCard";
import { Eyebrow, RevealLines } from "@/components/ui/Reveal";

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
        <Eyebrow index="04" label="Testimonials" />
        <RevealLines
          className="text-4xl md:text-6xl font-black tracking-tighter mb-16 md:mb-24 max-w-3xl leading-[1.05]"
          lines={[<>What clients say,</>, <span key="a" className="serif-accent font-normal text-[1.1em]">not what we do.</span>]}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40, rotateX: 8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1000 }}
              className="h-full"
            >
              <TestimonialCard {...t} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
