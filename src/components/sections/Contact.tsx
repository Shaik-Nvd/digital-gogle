"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, ArrowRight, Send } from "lucide-react";

const CONTACT_EMAIL = "mail2nvd@gmail.com";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const canSubmit = name.trim() && email.trim() && message.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const subject = `New project inquiry from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
  };

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
            Let&apos;s build <br />
            <span className="text-muted italic font-light">something great.</span>
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mb-6">
          <motion.a
            href={`mailto:${CONTACT_EMAIL}`}
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
                <p className="text-xl font-medium">{CONTACT_EMAIL}</p>
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

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto glass-panel p-6 md:p-8 rounded-2xl border border-glass-border"
        >
          <p className="text-sm text-muted mb-6">
            Tell us what's not working on your website or in your business. We'll reply with a free website check.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-mono text-muted mb-2 uppercase tracking-wider">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/60 placeholder:text-muted/60"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-mono text-muted mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/60 placeholder:text-muted/60"
              />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="contact-message" className="block text-xs font-mono text-muted mb-2 uppercase tracking-wider">
              Project details
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What are you looking to build?"
              className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/60 placeholder:text-muted/60 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-bold text-sm rounded-full hover:bg-accent hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send message
            <Send size={16} />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
