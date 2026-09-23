"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Send } from "lucide-react";

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
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-12 max-w-6xl mx-auto">
          {/* Left: heading + direct methods, plain links rather than duplicated cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Let&apos;s build <br />
              <span className="text-muted italic font-light">something great.</span>
            </h2>
            <p className="text-muted text-base leading-relaxed mb-10 max-w-sm">
              Tell us what&apos;s not working on your website or in your business. We&apos;ll reply with a free website check.
            </p>

            <div className="flex flex-col divide-y divide-glass-border border-t border-glass-border max-w-sm">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group flex items-center justify-between py-5"
              >
                <div>
                  <p className="text-xs text-muted font-mono uppercase tracking-wider mb-1">Email</p>
                  <p className="text-lg font-medium group-hover:text-accent transition-colors">{CONTACT_EMAIL}</p>
                </div>
                <ArrowUpRight size={20} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </a>
              <a
                href="https://wa.me/918553627474"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-5"
              >
                <div>
                  <p className="text-xs text-muted font-mono uppercase tracking-wider mb-1">WhatsApp</p>
                  <p className="text-lg font-medium group-hover:text-accent transition-colors">+91 85536 27474</p>
                </div>
                <ArrowUpRight size={20} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </a>
            </div>
          </motion.div>

          {/* Right: the form — the one legitimate use of a bordered surface here, since it's the
              actual interactive artifact, not a stand-in for content */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-panel p-6 md:p-8 rounded-2xl border border-glass-border h-fit"
          >
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
      </div>
    </section>
  );
}
