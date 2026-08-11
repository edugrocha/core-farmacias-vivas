"use client";

import { Button } from "./Button";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  descricao?: string;
  confirmarLabel?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmModal({
  aberto,
  titulo,
  descricao,
  confirmarLabel = "Confirmar",
  onConfirmar,
  onCancelar,
}: ModalProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-stone-900">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{titulo}</h2>
        {descricao && <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{descricao}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirmar}>
            {confirmarLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
