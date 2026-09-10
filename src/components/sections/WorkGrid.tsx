"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "UrlScan Online",
    category: "Security & URL Analysis",
    tagline: "security.scan({ target: 'url' })",
    color: "from-blue-900 to-slate-900",
    url: "https://www.urlscanonline.com/",
  },
  {
    id: 2,
    title: "Homes and Rents",
    category: "Real Estate Platform",
    tagline: "platform.build({ type: 'real-estate' })",
    color: "from-emerald-900 to-slate-900",
    url: "https://www.homesandrents.com/",
  },
  {
    id: 3,
    title: "PrimeOra Realtors",
    category: "Property Management",
    tagline: "web.deploy({ niche: 'realty' })",
    color: "from-purple-900 to-slate-900",
    url: "https://www.primeorarealtors.com/",
  },
  {
    id: 4,
    title: "Fhoneify",
    category: "E-Commerce Platform",
    tagline: "commerce.init({ sector: 'tech' })",
    color: "from-orange-900 to-slate-900",
    url: "https://www.fhoneify.in/",
  },
  {
    id: 5,
    title: "Mirai Events",
    category: "Event Management",
    tagline: "events.manage({ scale: 'global' })",
    color: "from-pink-900 to-slate-900",
    url: "https://www.miraievents.com/",
  },
  {
    id: 6,
    title: "Arohana Devanahalli Square",
    category: "Real Estate Project",
    tagline: "project.launch({ category: 'property' })",
    color: "from-teal-900 to-slate-900",
    url: "https://www.arohanadevanahallisquare.com/",
  },
  {
    id: 7,
    title: "Fhonekart",
    category: "E-Commerce Platform",
    tagline: "commerce.scale({ market: 'electronics' })",
    color: "from-indigo-900 to-slate-900",
    url: "https://www.fhonekart.in/",
  },
  {
    id: 8,
    title: "Jamia UK",
    category: "Educational Institution",
    tagline: "edu.platform({ region: 'uk' })",
    color: "from-fuchsia-900 to-slate-900",
    url: "https://www.jamiauk.in/",
  },
  {
    id: 9,
    title: "Victory Academy",
    category: "Educational Platform",
    tagline: "edu.scale({ platform: 'academy' })",
    color: "from-cyan-900 to-slate-900",
    url: "https://www.victoryacademy.live/",
    image: "/victory-academy.png",
  },
];

export default function WorkGrid() {
  return (
    <section id="work" className="py-24 md:py-32 relative z-10">
      <div className="container mx-auto px-6 mb-16 md:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-mono text-accent mb-4">02 / SELECTED WORK</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Featured Projects
          </h2>
        </motion.div>
      </div>

      <div className="relative flex overflow-x-hidden group py-4">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          className="flex whitespace-nowrap gap-6 md:gap-10 px-4 group-hover:[animation-play-state:paused]"
        >
          {[...projects, ...projects].map((project, index) => (
            <motion.a
              key={index}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/card cursor-pointer shrink-0 block w-[85vw] sm:w-[400px] md:w-[500px]"
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 glass-panel border border-glass-border shadow-2xl">
                {/* Project Cover Image */}
                <img 
                  src={(project as any).image || `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(project.url)}?w=800`} 
                  alt={project.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 group-hover/card:bg-transparent transition-colors duration-500" />
                
                {/* LIVE Badge */}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-2 border border-glass-border z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-medium tracking-wide">LIVE</span>
                </div>

                {/* Hover Pseudo-code Tagline */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 backdrop-blur-sm z-10 whitespace-normal text-center">
                  <p className="font-mono text-accent text-sm md:text-base translate-y-4 group-hover/card:translate-y-0 transition-transform duration-300">
                    {project.tagline}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-start whitespace-normal">
                <div>
                  <p className="text-sm text-muted mb-2">{project.category}</p>
                  <h3 className="text-2xl font-bold group-hover/card:text-accent transition-colors">
                    {project.title}
                  </h3>
                </div>
                <div className="w-10 h-10 shrink-0 rounded-full border border-glass-border flex items-center justify-center group-hover/card:bg-accent group-hover/card:text-black group-hover/card:border-accent transition-all duration-300">
                  <ArrowUpRight size={20} className="group-hover/card:rotate-45 transition-transform" />
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
