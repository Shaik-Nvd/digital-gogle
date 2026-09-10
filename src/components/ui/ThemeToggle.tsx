"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { PillToggle } from "./PillToggle";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[84px] h-[46px]" />;
  }

  const options = [
    { value: "light", icon: <Sun size={18} /> },
    { value: "dark", icon: <Moon size={18} /> },
  ];

  return (
    <PillToggle
      options={options}
      value={theme === "light" ? "light" : "dark"}
      onChange={(val) => setTheme(val)}
    />
  );
}
