export default function Footer() {
  return (
    <footer className="border-t border-glass-border py-12 mt-20 relative z-10 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-8 text-center md:text-left">
          <h3 className="font-bold text-2xl tracking-tight mb-2">
            DIGITAL GOGLE STUDIO<span className="text-accent">.</span>
          </h3>
          <p className="text-muted text-sm max-w-xs">
            Multi-discipline digital services studio crafting premium digital experiences.
          </p>
        </div>
        {/* Oversized sign-off wordmark — editorial close to the page, purely decorative */}
        <p
          aria-hidden
          className="select-none text-center font-bold tracking-[-0.06em] leading-[0.8] text-[17vw] md:text-[15vw] xl:text-[13rem] mb-6 bg-gradient-to-b from-foreground/[0.14] to-transparent bg-clip-text text-transparent"
        >
          Digital <span className="font-serif italic font-normal tracking-[-0.03em]">Gogle</span>
        </p>
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted pt-8 border-t border-glass-border">
          <p>&copy; {new Date().getFullYear()} Digital Gogle Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
