export default function Footer() {
  return (
    <footer className="border-t border-glass-border py-12 mt-20 relative z-10 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h3 className="font-bold text-2xl tracking-tight mb-2">
              DIGITAL GOGLE STUDIO<span className="text-accent">.</span>
            </h3>
            <p className="text-muted text-sm max-w-xs">
              Multi-discipline digital services studio crafting premium digital experiences.
            </p>
          </div>
          <div className="flex space-x-6 text-sm font-medium">
            <a href="#" className="hover:text-accent transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              LinkedIn
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              Instagram
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              GitHub
            </a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted pt-8 border-t border-glass-border">
          <p>&copy; {new Date().getFullYear()} Digital Gogle Studio. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
