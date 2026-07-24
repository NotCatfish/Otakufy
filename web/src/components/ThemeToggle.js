"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Apply Seasonal Theme for Light Mode Accents
    const month = new Date().getMonth() + 1;
    let seasonClass = "";
    if (month >= 3 && month <= 5) seasonClass = "theme-spring";
    else if (month === 6) seasonClass = "theme-early-summer";
    else if (month === 7 || month === 8) seasonClass = "theme-late-summer";
    else if (month >= 9 && month <= 11) seasonClass = "theme-autumn";
    else seasonClass = "theme-winter";
    
    if (seasonClass && seasonClass !== "theme-spring") {
      root.classList.add(seasonClass);
    }

    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      root.classList.remove("dark");
      setIsDark(false);
    } else if (storedTheme === "dark") {
      root.classList.add("dark");
      setIsDark(true);
    } else {
      setIsDark(root.classList.contains("dark"));
    }

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    // Stage 1: Wait for canvas to finish fading, then trigger the DOM switch
    const onCanvasFaded = () => {
      window.removeEventListener("canvas-faded-out", onCanvasFaded);
      
      const root = window.document.documentElement;

      const toggleDOM = () => {
        if (isDark) {
          root.classList.remove("dark");
          localStorage.setItem("theme", "light");
          setIsDark(false);
        } else {
          root.classList.add("dark");
          localStorage.setItem("theme", "dark");
          setIsDark(true);
        }
      };

      const finishTransition = () => {
        // Stage 3: Wait 2.5s for fast DOM transition to finish, then fade canvas back in
        setTimeout(() => {
          document.body.classList.remove("theme-eclipse-transition");
          window.dispatchEvent(new CustomEvent("sakura-control", { detail: { action: "fade_in" } }));
          setIsTransitioning(false);
        }, 2500);
      };

      if (document.startViewTransition) {
        document.startViewTransition(() => {
          toggleDOM();
        });
        finishTransition();
      } else {
        // Fallback for older browsers
        document.body.classList.add("theme-eclipse-transition");
        toggleDOM();
        finishTransition();
      }
    };

    // Stage 2: Add listener FIRST so we don't miss a synchronous reply
    window.addEventListener("canvas-faded-out", onCanvasFaded);

    // Stage 3: Tell canvas to smoothly fade out all particles
    window.dispatchEvent(new CustomEvent("sakura-control", { detail: { action: "fade_out" } }));
  };

  return (
    <button
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={`p-2 rounded-full glass-panel transition-all flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] shadow-lg border border-white/20 ${isTransitioning ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-110'}`}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label="Toggle Theme"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
