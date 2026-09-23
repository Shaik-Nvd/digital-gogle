"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

const LINK_DISTANCE = 130;
const CURSOR_RADIUS = 170;
const FALLBACK_ACCENT = "196, 240, 66";

/**
 * Canvas can't read a CSS custom property per-frame, and the accent is a different, deliberately
 * darker hex in light mode (`--accent: #84cc16`) than in dark (`#c4f042`) — using the dark value
 * unconditionally was why this field read as invisible in light mode: a low-alpha version of the
 * *dark* lime is close to white-on-white against a light background. Read the real one instead.
 */
function readAccentRgb(): string {
  if (typeof window === "undefined") return FALLBACK_ACCENT;
  const hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return FALLBACK_ACCENT;
  const value = match[1];
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * A quiet constellation of particles behind the hero — connects neighbours with faint lines and
 * brightens whatever drifts near the cursor, so the scene reads as a live system rather than
 * a static illustration. Pure canvas, no dependency: cheap enough to run under the existing
 * body-level aurora without competing with it for attention.
 */
export default function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let accent = readAccentRgb();
    const mouse = { x: -9999, y: -9999 };

    const seed = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Density scales with area, capped so a huge monitor doesn't pay for hundreds of nodes.
      const count = Math.min(70, Math.max(24, Math.round((width * height) / 22000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.6,
      }));
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgba(${accent}, 0.5)`;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > LINK_DISTANCE) continue;
          ctx.strokeStyle = `rgba(${accent}, ${0.16 * (1 - dist / LINK_DISTANCE)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const near = dist < CURSOR_RADIUS ? 1 - dist / CURSOR_RADIUS : 0;
        ctx.fillStyle = `rgba(${accent}, ${0.42 + near * 0.55})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + near * 1.2, 0, Math.PI * 2);
        ctx.fill();
        if (near > 0) {
          ctx.strokeStyle = `rgba(${accent}, ${near * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      frame = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    let resizeFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        seed();
        if (reduced) drawStatic();
      });
    };

    seed();
    if (reduced) {
      drawStatic();
    } else {
      frame = requestAnimationFrame(draw);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", onResize);

    // Stop spending frames once the hero scrolls off, and whenever the tab isn't visible.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (reduced) return;
        if (entry.isIntersecting && document.visibilityState === "visible") {
          if (!frame) frame = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0 },
    );
    observer.observe(container);
    const onVisibility = () => {
      if (reduced) return;
      if (document.visibilityState === "visible" && !frame) frame = requestAnimationFrame(draw);
      else if (document.visibilityState !== "visible") {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ThemeToggle flips a class on <html>; re-read the accent when that happens so switching
    // theme updates the field's color immediately instead of needing a reload.
    const themeObserver = new MutationObserver(() => {
      accent = readAccentRgb();
      if (reduced) drawStatic();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
