"use client";

/**
 * Theme Toggle Button Component
 *
 * This component provides a toggle button for switching between light and dark themes.
 * It includes:
 * - Sun/Moon icon based on current theme
 * - Smooth transitions between states
 * - Proper hydration handling
 * - Accessibility support
 *
 * Features:
 * - Client-side rendering with hydration check
 * - Icon transitions with smooth animations
 * - Disabled state during hydration
 * - Screen reader support
 */

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useEffect, useState } from "react";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle hydration to prevent SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show disabled state during hydration
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9"
    >
      {/* Show sun icon in dark mode, moon icon in light mode */}
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
