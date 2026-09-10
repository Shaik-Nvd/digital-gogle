"use client";

import { motion } from "framer-motion";
import { Mail, MessageCircle, ArrowRight } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 relative z-10">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-mono text-accent mb-4">05 / CONTACT</p>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Let's build <br />
            <span className="text-muted italic font-light">something great.</span>
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <motion.a
            href="mailto:mail2nvd@gmail.com"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel p-8 rounded-2xl group hover:scale-[1.02] transition-transform flex flex-col items-start justify-between h-48 border border-glass-border hover:border-accent/30"
          >
            <div className="p-3 bg-white/5 rounded-full text-foreground group-hover:text-accent transition-colors">
              <Mail size={24} />
            </div>
            <div className="w-full">
              <p className="text-sm text-muted mb-1">Email us</p>
              <div className="flex justify-between items-center w-full">
                <p className="text-xl font-medium">mail2nvd@gmail.com</p>
                <ArrowRight size={20} className="text-muted group-hover:text-accent group-hover:-rotate-45 transition-all" />
              </div>
            </div>
          </motion.a>

          <motion.a
            href="https://wa.me/918553627474"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-8 rounded-2xl group hover:scale-[1.02] transition-transform flex flex-col items-start justify-between h-48 border border-glass-border hover:border-accent/30"
          >
            <div className="p-3 bg-white/5 rounded-full text-foreground group-hover:text-accent transition-colors">
              <MessageCircle size={24} />
            </div>
            <div className="w-full">
              <p className="text-sm text-muted mb-1">Chat on WhatsApp</p>
              <div className="flex justify-between items-center w-full">
                <p className="text-xl font-medium">+91 85536 27474</p>
                <ArrowRight size={20} className="text-muted group-hover:text-accent group-hover:-rotate-45 transition-all" />
              </div>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
