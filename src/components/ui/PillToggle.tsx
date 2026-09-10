"use client";

import { motion } from "framer-motion";
import { useId } from "react";

interface Option<T> {
  value: T;
  icon: React.ReactNode;
}

interface PillToggleProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function PillToggle<T extends string | number>({ options, value, onChange, className = "" }: PillToggleProps<T>) {
  const layoutId = useId();

  return (
    <div className={`relative flex items-center p-1 bg-glass backdrop-blur-md rounded-full border border-glass-border shadow-inner ${className}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            className={`relative w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'text-background' : 'text-muted hover:text-foreground'}`}
          >
            {isActive && (
              <motion.div
                layoutId={`active-pill-${layoutId}`}
                className="absolute inset-0 bg-foreground rounded-full shadow-md z-0"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">
              {option.icon}
            </span>
          </button>
        );
      })}
    </div>
  );
}
