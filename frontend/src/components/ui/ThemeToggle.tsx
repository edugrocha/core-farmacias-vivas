"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";

export function ThemeToggle() {
  const { tema, alternarTema } = useTheme();

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={tema === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      title={tema === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-stone-100 cursor-pointer dark:hover:bg-stone-800"
    >
      {tema === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
