import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
}

export default function Marquee({ items, reverse = false }: MarqueeProps) {
  // Double the items to create a seamless loop
  const displayItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full overflow-hidden border-y border-accent/20 bg-glass backdrop-blur-md py-4 group flex items-center relative shadow-[0_0_30px_rgba(196,240,66,0.05)] my-12">
      {/* Subtle overlay glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      
      <div
        className={`flex whitespace-nowrap items-center group-hover:[animation-play-state:paused] ${
          reverse ? "animate-[marquee-slow_reverse]" : "animate-[marquee]"
        }`}
        style={{ animationDuration: "25s", animationTimingFunction: "linear", animationIterationCount: "infinite" }}
      >
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center px-6 md:px-10 text-sm md:text-sm font-mono uppercase tracking-[0.2em] font-bold text-accent drop-shadow-[0_0_8px_rgba(196,240,66,0.5)]"
          >
            <span>{item}</span>
            <span className="mx-6 md:mx-10 text-accent opacity-80 flex items-center justify-center">
              <Plus size={14} strokeWidth={3} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
