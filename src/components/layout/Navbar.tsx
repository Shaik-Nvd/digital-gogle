"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-40 glass-panel border-b border-glass-border">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl md:text-2xl tracking-tight z-50">
          DIGITAL GOGLE STUDIO<span className="text-accent">.</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/#work" className="hover:text-accent transition-colors">
            Work
          </Link>
          <Link href="/#services" className="hover:text-accent transition-colors">
            Services
          </Link>
          <Link href="/#process" className="hover:text-accent transition-colors">
            Process
          </Link>
          <Link href="/#testimonials" className="hover:text-accent transition-colors">
            Testimonials
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Link
            href="/#contact"
            className="px-5 py-2.5 bg-foreground text-background font-bold text-sm rounded-full hover:bg-accent hover:text-black transition-colors shadow-[0_0_15px_rgba(196,240,66,0)] hover:shadow-[0_0_15px_rgba(196,240,66,0.3)]"
          >
            START A PROJECT
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-glass-border">
          <nav className="flex flex-col px-6 py-6 space-y-6 text-lg font-medium">
            <Link href="/#work" onClick={() => setIsOpen(false)}>
              Work
            </Link>
            <Link href="/#services" onClick={() => setIsOpen(false)}>
              Services
            </Link>
            <Link href="/#process" onClick={() => setIsOpen(false)}>
              Process
            </Link>
            <Link href="/#testimonials" onClick={() => setIsOpen(false)}>
              Testimonials
            </Link>
            <Link href="/#contact" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
            <Link
              href="/#contact"
              onClick={() => setIsOpen(false)}
              className="mt-4 px-6 py-3 bg-foreground text-background text-center font-bold rounded-full w-full max-w-[200px]"
            >
              START A PROJECT
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
