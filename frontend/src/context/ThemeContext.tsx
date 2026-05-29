import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  dark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  return <ThemeContext.Provider value={{ dark, toggleDark }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
