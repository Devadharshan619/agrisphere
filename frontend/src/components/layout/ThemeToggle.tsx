"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 bg-card border border-border rounded-xl shadow-sm text-foreground hover:bg-muted transition-colors relative group"
    >
      <div className="relative overflow-hidden w-5 h-5">
        <motion.div
          initial={false}
          animate={{ y: theme === "dark" ? 0 : -28 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex flex-col gap-2"
        >
          <Moon size={20} className="text-accent" />
          <Sun size={20} className="text-primary" />
        </motion.div>
      </div>
    </motion.button>
  );
}
