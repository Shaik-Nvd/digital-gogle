import { Plus } from "lucide-react";

interface MarqueeProps {
  items: string[];
  reverse?: boolean;
  /** Large editorial type instead of the mono code rail. */
  variant?: "code" | "display";
}

export default function Marquee({ items, reverse = false, variant = "code" }: MarqueeProps) {
  // Double the items to create a seamless loop
  const displayItems = [...items, ...items, ...items, ...items];

  if (variant === "display") {
    return (
      <div className="relative w-full overflow-hidden py-10 md:py-14 group" aria-label={items.join(", ")}>
        <div className="section-hairline absolute top-0" aria-hidden />
        <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <div
          aria-hidden
          className="flex whitespace-nowrap items-center animate-[marquee] group-hover:[animation-play-state:paused]"
          style={{
            animationDuration: "60s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {displayItems.map((item, index) => (
            <div key={index} className="flex items-center px-5 md:px-8 text-5xl md:text-8xl leading-none">
              <span className={index % 2 === 0 ? "font-serif italic text-foreground/90" : "font-bold tracking-[-0.04em] text-outline"}>
                {item}
              </span>
              <span className="ml-10 md:ml-16 text-accent text-3xl md:text-5xl" aria-hidden>&#10033;</span>
            </div>
          ))}
        </div>
        <div className="section-hairline absolute bottom-0" aria-hidden />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border-y border-accent/20 bg-glass backdrop-blur-md py-4 group flex items-center relative shadow-[0_0_30px_rgba(196,240,66,0.05)] my-12">
      {/* Subtle overlay glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      
      <div
        className="flex whitespace-nowrap items-center animate-[marquee] group-hover:[animation-play-state:paused]"
        style={{
          animationDuration: "25s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDirection: reverse ? "reverse" : "normal",
        }}
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
