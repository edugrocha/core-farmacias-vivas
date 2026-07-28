export function formatarData(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function mensagemErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message;
  return "Ocorreu um erro inesperado.";
}
