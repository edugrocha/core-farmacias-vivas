"use client";

import { useState } from "react";

interface ImageFieldProps {
  label: string;
  fotoAtual?: string | null;
  onChange: (arquivo: File | null) => void;
}

export function ImageField({ label, fotoAtual, onChange }: ImageFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);

  function aoSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0] ?? null;
    onChange(arquivo);
    if (arquivo) {
      setPreview(URL.createObjectURL(arquivo));
    } else {
      setPreview(null);
    }
  }

  const imagemExibida = preview ?? fotoAtual;

  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-stone-700 dark:text-stone-300">{label}</span>
      {imagemExibida && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagemExibida}
          alt={`Pré-visualização de ${label}`}
          className="h-32 w-32 rounded-lg object-cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={aoSelecionar}
        className="text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-ink hover:file:bg-primary-500 dark:text-stone-400"
      />
    </label>
  );
}
