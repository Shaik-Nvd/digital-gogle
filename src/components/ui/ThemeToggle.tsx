"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { PillToggle } from "./PillToggle";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mounted-gate pattern (next-themes docs) to avoid an SSR/CSR hydration mismatch
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[84px] h-[46px]" />;
  }

  const options = [
    { value: "light", icon: <Sun size={18} />, label: "Light mode" },
    { value: "dark", icon: <Moon size={18} />, label: "Dark mode" },
  ];

  return (
    <PillToggle
      options={options}
      value={theme === "light" ? "light" : "dark"}
      onChange={(val) => setTheme(val)}
    />
  );
}
