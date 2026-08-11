"use client";

import { useRef } from "react";
import Link from "next/link";
import type { FamiliaBotanica } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";

interface FamiliaCarouselProps {
  familias: FamiliaBotanica[];
}

export function FamiliaCarousel({ familias }: FamiliaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function rolar(direcao: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direcao * 280, behavior: "smooth" });
  }

  if (familias.length === 0) return null;

  return (
    <div className="relative">
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2">
        {familias.map((familia) => (
          <Link key={familia.id} href={`/plantas?familia=${familia.id}`} className="shrink-0">
            <Card className="flex h-32 w-64 flex-col justify-center gap-1 p-5 transition-shadow hover:shadow-md">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">{familia.nome}</h3>
              <p className="line-clamp-2 text-sm text-stone-500">
                {familia.descricao || "Família botânica do acervo"}
              </p>
            </Card>
          </Link>
        ))}
      </div>
      {familias.length > 3 && (
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => rolar(-1)}
            className="rounded-full border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100 cursor-pointer dark:border-stone-700"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Próximo"
            onClick={() => rolar(1)}
            className="rounded-full border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100 cursor-pointer dark:border-stone-700"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
