"use client";

import { useEffect, useRef, useState } from "react";

export interface SearchSelectOption {
  value: number;
  label: string;
}

interface SearchSelectProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  valor: number | null;
  /** Rótulo do valor atual (ex: vindo dos dados já carregados ao editar), evita
   * uma busca extra só para exibir a seleção corrente. */
  valorLabel?: string;
  onChange: (valor: number | null) => void;
  buscar: (query: string) => Promise<SearchSelectOption[]>;
}

/**
 * Combobox com busca assíncrona no backend (debounced). Resolve o problema de
 * <select> nativo só carregar a primeira página: a opção selecionada sempre
 * fica visível (via `valorLabel`) mesmo que esteja fora do conjunto buscado.
 */
export function SearchSelect({
  label,
  required,
  placeholder = "Digite para buscar...",
  valor,
  valorLabel,
  onChange,
  buscar,
}: SearchSelectProps) {
  const [texto, setTexto] = useState(valorLabel ?? "");
  const [opcoes, setOpcoes] = useState<SearchSelectOption[]>([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  function buscarComDebounce(query: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCarregando(true);
      buscar(query)
        .then(setOpcoes)
        .finally(() => setCarregando(false));
    }, 300);
  }

  function aoDigitar(novoTexto: string) {
    setTexto(novoTexto);
    setAberto(true);
    if (valor !== null) onChange(null);
    buscarComDebounce(novoTexto);
  }

  function selecionar(opcao: SearchSelectOption) {
    onChange(opcao.value);
    setTexto(opcao.label);
    setAberto(false);
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1 text-sm">
      <span className="font-medium text-stone-700 dark:text-stone-300">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <input
        type="text"
        value={texto}
        placeholder={placeholder}
        onFocus={() => {
          setAberto(true);
          if (opcoes.length === 0) buscarComDebounce(texto);
        }}
        onChange={(e) => aoDigitar(e.target.value)}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:bg-stone-900 dark:border-stone-700"
      />
      {aberto && (
        <div className="absolute top-full z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-900">
          {carregando && <p className="p-3 text-sm text-stone-500">Buscando...</p>}
          {!carregando && opcoes.length === 0 && (
            <p className="p-3 text-sm text-stone-500">Nenhum resultado.</p>
          )}
          {!carregando &&
            opcoes.map((op) => (
              <button
                type="button"
                key={op.value}
                onClick={() => selecionar(op)}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-primary-50 cursor-pointer dark:hover:bg-stone-800 ${
                  op.value === valor ? "bg-primary-50 font-medium dark:bg-stone-800" : ""
                }`}
              >
                {op.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
