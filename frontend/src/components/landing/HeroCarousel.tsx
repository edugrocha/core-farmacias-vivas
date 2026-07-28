"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Planta } from "@/lib/api/types";
import { ToxicidadeBadge } from "@/components/ui/Badge";

interface HeroCarouselProps {
  plantas: Planta[];
}

export function HeroCarousel({ plantas }: HeroCarouselProps) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (plantas.length < 2) return;
    const intervalo = setInterval(() => {
      setIndice((i) => (i + 1) % plantas.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [plantas.length]);

  if (plantas.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-primary-50 text-6xl">
        🌿
      </div>
    );
  }

  const planta = plantas[indice];
  const familiaNome = typeof planta.familia === "object" ? planta.familia.nome : planta.familia_nome;

  function anterior() {
    setIndice((i) => (i - 1 + plantas.length) % plantas.length);
  }

  function proximo() {
    setIndice((i) => (i + 1) % plantas.length);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary-50 shadow-sm">
      <Link href={`/plantas/${planta.id}`} className="block">
        <div className="aspect-[4/3] w-full">
          {planta.foto_principal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={planta.foto_principal}
              alt={planta.nome_popular}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">🌿</div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
          <div className="flex items-center gap-2">
            <ToxicidadeBadge nivel={planta.nivel_toxicidade} />
            {familiaNome && <span className="text-xs opacity-80">{familiaNome}</span>}
          </div>
          <h3 className="text-xl font-semibold">{planta.nome_popular}</h3>
          <p className="font-cientifico text-sm opacity-90">{planta.nome_cientifico}</p>
        </div>
      </Link>

      {plantas.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Planta anterior"
            onClick={anterior}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-stone-900 shadow hover:bg-white cursor-pointer"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Próxima planta"
            onClick={proximo}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-stone-900 shadow hover:bg-white cursor-pointer"
          >
            →
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {plantas.map((p, i) => (
              <button
                key={p.id}
                aria-label={`Ir para slide ${i + 1}`}
                onClick={() => setIndice(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === indice ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
