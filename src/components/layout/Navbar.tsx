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
          <Link href="#work" className="hover:text-accent transition-colors">
            Work
          </Link>
          <Link href="#services" className="hover:text-accent transition-colors">
            Services
          </Link>
          <Link href="#process" className="hover:text-accent transition-colors">
            Process
          </Link>
          <Link href="#contact" className="hover:text-accent transition-colors">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Link
            href="#contact"
            className="px-5 py-2.5 bg-foreground text-background font-medium text-sm rounded-full hover:bg-accent hover:text-black transition-colors shadow-[0_0_15px_rgba(196,240,66,0)] hover:shadow-[0_0_15px_rgba(196,240,66,0.3)]"
          >
            Start a project
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-glass-border">
          <nav className="flex flex-col px-6 py-4 space-y-4 text-lg">
            <Link href="#work" onClick={() => setIsOpen(false)}>
              Work
            </Link>
            <Link href="#services" onClick={() => setIsOpen(false)}>
              Services
            </Link>
            <Link href="#process" onClick={() => setIsOpen(false)}>
              Process
            </Link>
            <Link href="#contact" onClick={() => setIsOpen(false)}>
              Contact
            </Link>
            <Link
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="text-accent font-bold mt-4"
            >
              Start a project
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
