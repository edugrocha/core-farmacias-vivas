"use client";

import { createContext, useContext, useState } from "react";

type Tema = "light" | "dark";

interface ThemeContextValue {
  tema: Tema;
  alternarTema: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const CHAVE_ARMAZENAMENTO = "fv_tema";

// Mantém em sincronia com o script inline em app/layout.tsx, que já aplica
// a classe "dark" no <html> antes da hidratação (evita flash de tema errado).
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Leitura preguiçosa: no primeiro render do cliente (inclusive durante a
  // hidratação), reflete a classe que o script anti-flash já aplicou no
  // <html>. No servidor, document não existe — assume "light" (irrelevante,
  // pois o HTML do servidor não depende deste estado).
  const [tema, setTema] = useState<Tema>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  function alternarTema() {
    const novoTema: Tema = tema === "dark" ? "light" : "dark";
    setTema(novoTema);
    document.documentElement.classList.toggle("dark", novoTema === "dark");
    localStorage.setItem(CHAVE_ARMAZENAMENTO, novoTema);
  }

  return <ThemeContext.Provider value={{ tema, alternarTema }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>");
  return ctx;
}
