// context/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// -------------------- Theme Colors Interface --------------------
export interface IThemeColors {
  background: string;
  text: string;
  textMuted: string;
  primary: string;
  secondary: string;
  card: string;
  border: string;
  like: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

// -------------------- Light & Dark Themes --------------------
const LightThemeColors: IThemeColors = {
  background: "#FFFFFF",
  text: "#1A1A1A",
  textMuted: "#666666",
  primary: "#D81E5B",
  secondary: "#9C27B0",
  card: "#F9F9F9",
  border: "#E0E0E0",
  like: "#FF6347",
  error: "#D32F2F",
  success: "#4CAF50",
  warning: "#FF9800",
  info: "#2196F3",
};

const DarkThemeColors: IThemeColors = {
  background: "#121212",
  text: "#FFFFFF",
  textMuted: "#B0B0B0",
  primary: "#ff8fb3",
  secondary: "#D7A7E8",
  card: "#1E1E1E",
  border: "#333333",
  like: "#FFB6C1",
  error: "#EF9A9A",
  success: "#A5D6A7",
  warning: "#FFCC80",
  info: "#90CAF9",
};

// -------------------- Context Types --------------------
interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  colors: IThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// -------------------- Provider Component --------------------
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const colors = darkMode ? DarkThemeColors : LightThemeColors;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// -------------------- Hook for consuming context --------------------
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside a ThemeProvider");
  return context;
};
