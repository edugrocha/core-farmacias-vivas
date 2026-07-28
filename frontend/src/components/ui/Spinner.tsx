export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );
}

export function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  );
}

export function ErrorBlock({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{mensagem}</div>
  );
}
