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
 */
export default function TestimonialCard({ name, role, testimonial }: TestimonialCardProps): ReactNode {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] dark:bg-white/[0.045] p-6 md:p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_16px_40px_-20px_rgba(0,0,0,0.55)] transition-all hover:border-accent/30 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_20px_50px_-20px_rgba(196,240,66,0.25)]">
      <span aria-hidden className="absolute right-6 top-4 font-serif text-6xl text-foreground/10 select-none">
        &rdquo;
      </span>

      <div className="relative flex h-full flex-col justify-between gap-6">
        <p className="text-base leading-relaxed text-foreground/90">{testimonial}</p>

        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/15 font-mono text-sm font-semibold text-accent"
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
