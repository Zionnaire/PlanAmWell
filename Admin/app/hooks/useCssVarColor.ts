"use client";

import { useEffect, useState } from "react";

/**
 * Resolves a CSS custom property to its computed color value, and re-resolves
 * whenever the theme changes (ThemeToggle flips `data-theme` on <html>, or the
 * OS `prefers-color-scheme` changes while no explicit theme is set). Needed
 * for canvas-based charts (chart.js) — unlike SVG/CSS, canvas can't consume
 * `var(--x)` directly, so the color has to be resolved to an actual value.
 */
export function useCssVarColor(varName: string, fallback = "#000000") {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const resolve = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (value) setColor(value);
    };

    resolve();

    const observer = new MutationObserver(resolve);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", resolve);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", resolve);
    };
  }, [varName]);

  return color;
}
