import type { ReactNode } from "react";

export type TestimonialCardProps = {
  name: string;
  role: string;
  testimonial: string;
};

/**
 * Adapted from a 21st.dev shadcn testimonial card into this project's own conventions (this repo
 * has no shadcn/Radix setup, so it's a plain component using our design tokens, not a port).
 * Deliberately drops the source component's star rating and avatar photo: we have no real
 * per-client rating and no photo for any of these three, and inventing either would be presenting
 * fabricated trust signals as real ones. The initial-in-a-circle avatar fallback is genuine.
 *
 * Surface uses foreground-relative tinting (`bg-foreground/x`), not a hardcoded white value: in
 * dark mode --foreground is white, so it lightens toward a visible panel; in light mode it's near
 * black, so the same class darkens toward one instead — one rule that's correct in both themes,
 * rather than a fixed white overlay that read as invisible against an already-light background.
 */
export default function TestimonialCard({ name, role, testimonial }: TestimonialCardProps): ReactNode {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-foreground/[0.1] bg-foreground/[0.055] p-6 md:p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_18px_40px_-18px_rgba(0,0,0,0.35)] transition-all hover:border-accent/40 hover:bg-foreground/[0.07] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_22px_50px_-18px_rgba(196,240,66,0.22)]">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-accent/70 via-accent/20 to-transparent" />
      <span aria-hidden className="absolute right-6 top-6 font-serif text-6xl text-accent/15 select-none">
        &rdquo;
      </span>

      <div className="relative flex h-full flex-col justify-between gap-6">
        <p className="text-base leading-relaxed text-foreground/90">{testimonial}</p>

        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/20 font-mono text-sm font-semibold text-accent"
          >
            {name[0]}
          </span>
          <div>
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-sm text-muted">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
