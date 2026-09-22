"use client";

import { animate, motion, useAnimationFrame, useMotionValue, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { projects } from "@/lib/projects";

const SCROLL_SPEED = 56; // px/second, auto-advance speed while idle
const RESUME_DELAY = 2200; // ms of stillness after a manual swipe before auto-advance resumes
const CLICK_DRAG_THRESHOLD = 6; // px of movement past which a "click" is really a swipe

export default function WorkGrid() {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const prefersReducedMotion = useReducedMotion();
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loopWidth = () => (trackRef.current ? trackRef.current.scrollWidth / 2 : 0);

  /** Distance between two consecutive cards (width + gap), measured live so it tracks each breakpoint. */
  const cardUnit = () => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return 0;
    const a = track.children[0] as HTMLElement;
    const b = track.children[1] as HTMLElement;
    return b.offsetLeft - a.offsetLeft;
  };

  /** Keeps x inside a single loop's width so the seam between the two duplicated sets never shows. */
  const wrap = useCallback((value: number) => {
    const width = loopWidth();
    if (!width) return value;
    let next = value;
    while (next <= -width) next += width;
    while (next > 0) next -= width;
    return next;
  }, []);

  useAnimationFrame((_, delta) => {
    if (isPaused || isDraggingRef.current || prefersReducedMotion) return;
    const width = loopWidth();
    if (!width) return;
    let next = x.get() - (SCROLL_SPEED * delta) / 1000;
    if (next <= -width) next += width;
    x.set(next);
  });

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), RESUME_DELAY);
  }, []);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  const handleDragEnd = useCallback((_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    isDraggingRef.current = false;
    dragDistanceRef.current = Math.abs(info.offset.x);

    // Snap to the nearest card so a swipe lands cleanly on one project instead of half-between two,
    // carrying a little of the release velocity so a fast flick reaches one card further.
    const unit = cardUnit();
    if (unit > 0) {
      const projected = x.get() + info.velocity.x * 0.12;
      const target = wrap(Math.round(projected / unit) * unit);
      x.stop();
      animate(x, target, { type: "spring", stiffness: 260, damping: 30 });
    } else {
      x.set(wrap(x.get()));
    }
    scheduleResume();
  }, [scheduleResume, wrap, x]);

  /** A card that was actually swiped shouldn't also navigate — only a near-stationary tap should. */
  const guardClick = (event: React.MouseEvent) => {
    if (dragDistanceRef.current > CLICK_DRAG_THRESHOLD) {
      event.preventDefault();
    }
    dragDistanceRef.current = 0;
  };

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

      <div
        className="relative flex overflow-x-hidden py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          ref={trackRef}
          style={{ x }}
          drag={prefersReducedMotion ? false : "x"}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="flex whitespace-nowrap gap-6 md:gap-10 px-4 cursor-grab active:cursor-grabbing touch-pan-y"
        >
          {[...projects, ...projects].map((project, index) => (
            <motion.a
              key={index}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={guardClick}
              whileHover={{ y: -10 }}
              whileTap={{ y: -4 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="group/card cursor-pointer shrink-0 block w-[85vw] sm:w-[400px] md:w-[500px] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 glass-panel border border-glass-border shadow-2xl transition-[box-shadow,border-color] duration-500 ease-out group-hover/card:border-accent/50 group-hover/card:shadow-[0_28px_70px_-24px_rgba(196,240,66,0.4)]">
                {/* Project Cover Image (falls back to a gradient tile if the screenshot service fails) */}
                {imageErrors[project.id] ? (
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} flex items-center justify-center transition-transform duration-700 ease-out group-hover/card:scale-110`}>
                    <span className="font-mono text-white/60 text-sm md:text-base px-6 text-center">
                      {project.tagline}
                    </span>
                  </div>
                ) : (
                  <Image
                    src={project.image || `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(project.url)}?w=800`}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 85vw, (max-width: 1200px) 400px, 500px"
                    className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                    onError={() => setImageErrors((prev) => ({ ...prev, [project.id]: true }))}
                  />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover/card:bg-black/10 transition-colors duration-500" />

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
