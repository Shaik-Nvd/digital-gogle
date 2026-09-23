import type Lenis from "lenis";

let lenis: Lenis | null = null;

/** SmoothScroll registers its Lenis instance so programmatic jumps don't fight it. */
export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function scrollToSection(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Matches the site's scroll-padding-top (navbar height + breathing room) so a Lenis-driven
  // jump from the chat widget lands in the same place a native #anchor click would.
  if (lenis) lenis.scrollTo(target, { offset: -112, duration: 1.4, immediate: reduced });
  else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  return true;
}
