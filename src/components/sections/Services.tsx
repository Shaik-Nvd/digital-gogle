"use client";

import { motion } from "framer-motion";
import { Monitor, Smartphone, Database, TrendingUp, Bot, Shield, Video, Terminal } from "lucide-react";
import { useState } from "react";

const services = [
  {
    id: "01",
    title: "Cybersecurity & Security Testing",
    description: "Security assessments and testing across your apps, APIs, and infrastructure.",
    tags: ["Website & Web Application Security", "Vulnerability Assessment & Scanning", "Penetration Testing", "Mobile Application Security Testing", "API Security Testing", "Infrastructure Security Testing", "Cloud Security Assessment"],
    label: "security.audit()",
    icon: Shield,
  },
  {
    id: "02",
    title: "AI Agents & Intelligent Automation",
    description: "Custom AI assistants and intelligent agents trained on your business knowledge.",
    tags: ["Custom AI Agents", "AI Chatbots & Virtual Assistants", "RAG-Based AI Solutions", "AI-Powered Business Automation", "Custom LLM Solutions", "AI Agent Integration with Business Systems", "Knowledge-Based AI Assistants"],
    label: "ai.deploy()",
    icon: Bot,
  },
  {
    id: "03",
    title: "Website & Software Development",
    description: "Custom websites, e-commerce platforms, and business software built around how you operate.",
    tags: ["Business Websites", "E-Commerce Websites", "CRM & Business Management Software", "Enterprise Software", "Custom Web Applications"],
    label: "build.software()",
    icon: Monitor,
  },
  {
    id: "04",
    title: "Mobile App Development",
    description: "Android and iOS apps designed and built around your business needs.",
    tags: ["Android & iOS Applications", "Custom Business Applications", "Mobile App Development"],
    label: "app.build()",
    icon: Smartphone,
  },
  {
    id: "05",
    title: "Web Data & Automation",
    description: "Structured data collection and workflow automation pulled from the web and your existing systems.",
    tags: ["Web Scraping", "Data Extraction", "Data Collection & Processing", "API Integration", "Data Automation"],
    label: "data.automate()",
    icon: Database,
  },
  {
    id: "06",
    title: "Lead Generation & Digital Marketing",
    description: "Marketing and outreach programs built to bring in and convert the right leads.",
    tags: ["Lead Generation", "SEO", "Social Media Marketing", "Email Marketing", "Online Advertising", "Digital Outreach"],
    label: "growth.scale()",
    icon: TrendingUp,
  },
  {
    id: "07",
    title: "Video Editing & Content Creation",
    description: "Video content edited for marketing, social, and brand storytelling.",
    tags: ["Professional Video Editing", "Promotional Videos", "Social Media Reels & Short Videos", "Business & Marketing Videos", "Custom Video Content"],
    label: "content.produce()",
    icon: Video,
  },
];

const ServiceRow = ({ service, index }: { service: any; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative border-b border-glass-border py-8 md:py-12 cursor-default overflow-hidden"
    >
      {/* Background Hover Glow */}
      <div className={`absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/[0.02] to-transparent transition-opacity duration-500 pointer-events-none ${isHovered ? "opacity-100" : "opacity-0"}`} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12 px-2 md:px-8">
        
        {/* Left side: Number & Icon */}
        <div className="flex items-center gap-6 lg:w-1/4 shrink-0">
          <span className={`text-2xl md:text-3xl font-mono transition-colors duration-300 ${isHovered ? "text-accent" : "text-muted opacity-50"}`}>
            {service.id}
          </span>
          <div className={`p-4 rounded-xl border transition-all duration-300 relative ${isHovered ? "border-accent/30 bg-accent/10 shadow-[0_0_30px_rgba(196,240,66,0.15)]" : "border-glass-border bg-glass"}`}>
            <service.icon size={32} className={`transition-colors duration-300 relative z-10 ${isHovered ? "text-accent drop-shadow-[0_0_10px_rgba(196,240,66,0.5)]" : "text-foreground"}`} />
          </div>
        </div>

        {/* Center: Title & Description */}
        <div className="flex flex-col lg:w-1/2">
          <h3 className={`text-2xl md:text-4xl font-bold tracking-tight mb-3 transition-colors duration-300 ${isHovered ? "text-foreground drop-shadow-md" : "text-foreground/80"}`}>
            {service.title}
          </h3>
          <p className="text-muted text-sm md:text-base leading-relaxed max-w-xl">
            {service.description}
          </p>
        </div>

        {/* Right: Terminal Label */}
        <div className="hidden lg:flex flex-1 justify-end">
          <code className={`flex items-center space-x-2 text-xs font-mono px-4 py-2 rounded-full border transition-colors duration-300 ${isHovered ? "border-accent/30 text-accent bg-accent/5 shadow-[0_0_15px_rgba(196,240,66,0.1)]" : "border-glass-border text-muted opacity-50"}`}>
            <Terminal size={12} />
            <span>{service.label}</span>
          </code>
        </div>
      </div>

      {/* Expandable Tags Section */}
      <motion.div
        initial={false}
        animate={{ height: isHovered ? "auto" : 0, opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="pt-8 px-2 md:px-8 lg:pl-[calc(25%+3rem)] pb-4">
          <div className="flex flex-wrap gap-2 md:gap-3">
            {service.tags.map((tag: string, tagIdx: number) => (
              <motion.span
                key={tagIdx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                transition={{ duration: 0.3, delay: isHovered ? tagIdx * 0.05 : 0 }}
                className="px-4 py-2 text-xs font-mono rounded-full border border-accent/20 bg-accent/5 text-accent/90 backdrop-blur-sm hover:bg-accent/20 hover:border-accent/50 transition-colors cursor-crosshair"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-32 relative z-10 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-glass-border pb-12"
        >
          <div>
            <p className="text-sm font-mono text-accent mb-4 tracking-widest uppercase">03 / CAPABILITIES</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
              Services Array.
            </h2>
          </div>
          <div className="md:text-right text-muted font-mono text-sm uppercase tracking-wider max-w-xs">
            Hover over a system module to expand architecture details.
          </div>
        </motion.div>

        <div className="flex flex-col border-t border-glass-border -mt-[1px]">
          {services.map((service, index) => (
            <ServiceRow key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
