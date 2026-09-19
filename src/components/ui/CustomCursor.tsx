"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { damping: 30, stiffness: 400, mass: 0.3 });
  const y = useSpring(rawY, { damping: 30, stiffness: 400, mass: 0.3 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show custom cursor on desktop
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- gates client-only matchMedia read to avoid an SSR/CSR hydration mismatch
      setIsVisible(true);
    }

    const updateMousePosition = (e: MouseEvent) => {
      // Written to motion values directly (not React state) so cursor tracking
      // never triggers a re-render on every mousemove.
      rawX.set(e.clientX - 8);
      rawY.set(e.clientY - 8);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [rawX, rawY]);

  const trailX = useSpring(rawX, { damping: 40, stiffness: 200, mass: 0.8 });
  const trailY = useSpring(rawY, { damping: 40, stiffness: 200, mass: 0.8 });

  if (!isVisible) return null;

  return (
    <>
      {/* Ambient Spotlight Trail */}
      <motion.div
        className="hidden md:block fixed top-0 left-0 z-[-1] pointer-events-none rounded-full"
        style={{
          x: trailX,
          y: trailY,
          width: 600,
          height: 600,
          marginLeft: -300,
          marginTop: -300,
          background: "radial-gradient(circle, rgba(196,240,66,0.08) 0%, rgba(196,240,66,0) 70%)",
        }}
      />
      {/* Sharp Cursor */}
      <motion.div
        className="hidden md:block fixed top-0 left-0 z-[100] w-4 h-4 bg-accent rounded-full pointer-events-none mix-blend-difference"
        style={{ 
          x, 
          y
        }}
        animate={{
          scale: isHovered ? 2.5 : 1,
          opacity: 0.8,
        }}
        transition={{
          type: "tween",
          ease: "backOut",
          duration: 0.15,
        }}
      />
    </>
  );
}
