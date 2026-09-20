"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Shield, Bot, Monitor, Smartphone, TrendingUp, Video, 
  Search, Share2, FileText, Mail, ShoppingCart, ArrowRight 
} from "lucide-react";
import WebsitePricingModal from "./WebsitePricingModal";

const pricingTiers = [
  {
    name: "Cybersecurity testing",
    price: "₹30,000 to ₹2,00,000",
    unit: "per service",
    desc: "Identify and patch vulnerabilities before they become a problem.",
    icon: Shield,
  },
  {
    name: "AI agents",
    price: "₹50,000 to ₹15,00,000",
    unit: "per solution",
    desc: "Custom intelligent assistants that automate support and workflows.",
    icon: Bot,
  },
  {
    name: "Website development",
    price: "₹10,000 to ₹50,00,000",
    unit: "per project",
    desc: "High-performance custom web applications built for conversion.",
    icon: Monitor,
  },
  {
    name: "Mobile app development",
    price: "₹30,000 to ₹15,00,000",
    unit: "per app",
    desc: "Engaging native iOS and Android experiences for your customers.",
    icon: Smartphone,
  },
  {
    name: "Lead generation",
    price: "₹5,000 to ₹1,00,000",
    unit: "per campaign",
    desc: "Data-driven outreach systems designed to scale your pipeline.",
    icon: TrendingUp,
  },
  {
    name: "Video editing",
    price: "₹5,000 to ₹2,00,000",
    unit: "per video",
    desc: "High-retention social reels and promotional brand videos.",
    icon: Video,
  },
  {
    name: "SEO Services",
    price: "₹8,000 to ₹50,000",
    unit: "per month",
    desc: "Rank higher on Google and dominate search for your niche.",
    icon: Search,
  },
  {
    name: "Social Media Marketing",
    price: "₹7,000 to ₹35,000",
    unit: "per month",
    desc: "Build an audience, engage followers, and drive organic sales.",
    icon: Share2,
  },
  {
    name: "Content Marketing",
    price: "₹1,500 to ₹5,000",
    unit: "per post",
    desc: "Authority-building written content that educates and converts.",
    icon: FileText,
  },
  {
    name: "Email Marketing",
    price: "₹3,000 to ₹10,000",
    unit: "per month",
    desc: "Nurture leads and drive repeat sales with automated sequences.",
    icon: Mail,
  },
  {
    name: "E-commerce Development",
    price: "₹30,000 to ₹1,50,000",
    unit: "per project",
    desc: "Custom, lightning-fast digital storefronts engineered to sell.",
    icon: ShoppingCart,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function PricingClient() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  return (
    <div className="pt-32 pb-24 md:pb-32 container mx-auto px-6 max-w-7xl min-h-screen relative z-10">
      <WebsitePricingModal 
        isOpen={selectedTier === "Website development"} 
        onClose={() => setSelectedTier(null)} 
      />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-glass-border pb-12"
      >
        <div>
          <p className="text-sm font-mono text-accent mb-4 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Investment
          </p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            Transparent <br className="hidden md:block" /> Pricing.
          </h1>
        </div>
        <div className="md:text-right text-muted font-mono text-sm uppercase tracking-wider max-w-xs">
          Built for scale and customized to your exact business requirements.
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {pricingTiers.map((tier, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            onClick={() => tier.name === "Website development" ? setSelectedTier(tier.name) : null}
            className={`group relative glass-panel p-8 rounded-3xl border border-glass-border hover:border-accent/50 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[300px] ${tier.name === "Website development" ? "cursor-pointer" : ""}`}
          >
            {/* Background Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-2xl bg-foreground/5 border border-glass-border group-hover:border-accent/30 group-hover:bg-accent/10 transition-colors duration-300">
                  <tier.icon size={24} className="text-foreground group-hover:text-accent transition-colors duration-300" />
                </div>
                <div className="text-xs font-mono text-muted py-1 px-3 rounded-full border border-glass-border group-hover:border-accent/30 group-hover:text-accent transition-colors duration-300">
                  {tier.unit}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-accent transition-colors duration-300">
                {tier.name}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {tier.desc}
              </p>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-glass-border group-hover:border-accent/20 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted mb-1 uppercase tracking-wider font-mono">Starts from</div>
                  <div className="text-2xl font-bold text-foreground group-hover:drop-shadow-[0_0_10px_rgba(196,240,66,0.3)] transition-all duration-300">
                    {tier.price.split(' to ')[0]}
                  </div>
                </div>
                <ArrowRight className="text-muted opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent transition-all duration-300" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mt-24 text-center glass-panel p-12 md:p-16 rounded-[2.5rem] border border-glass-border relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Ready to scale?</h2>
        <p className="text-lg text-muted mb-10 max-w-xl mx-auto leading-relaxed">
          Get a precise, customized quote based on your exact business goals and technical requirements.
        </p>
        <Link 
          href="/#contact" 
          className="inline-flex items-center px-8 py-4 md:px-10 md:py-5 bg-accent text-black font-bold text-sm md:text-base rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(196,240,66,0.2)] hover:shadow-[0_0_40px_rgba(196,240,66,0.5)]"
        >
          START YOUR PROJECT <ArrowRight size={20} className="ml-2" />
        </Link>
      </motion.div>
    </div>
  );
}
