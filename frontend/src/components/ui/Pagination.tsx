import type { Paginacao } from "@/lib/api/types";

interface PaginationProps {
  paginacao: Paginacao<unknown>["paginacao"];
  onChange: (page: number) => void;
}

export function Pagination({ paginacao, onChange }: PaginationProps) {
  if (paginacao.paginas <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3 text-sm dark:border-stone-800">
      <span className="text-stone-500">
        Página {paginacao.pagina_atual} de {paginacao.paginas} · {paginacao.total} resultados
      </span>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-stone-300 px-3 py-1 disabled:opacity-40 dark:border-stone-700"
          disabled={!paginacao.anterior}
          onClick={() => onChange(paginacao.pagina_atual - 1)}
        >
          Anterior
        </button>
        <button
          className="rounded-lg border border-stone-300 px-3 py-1 disabled:opacity-40 dark:border-stone-700"
          disabled={!paginacao.proxima}
          onClick={() => onChange(paginacao.pagina_atual + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
