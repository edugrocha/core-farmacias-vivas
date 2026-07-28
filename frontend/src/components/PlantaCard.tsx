import Link from "next/link";
import { ToxicidadeBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Planta } from "@/lib/api/types";

export function PlantaCard({ planta }: { planta: Planta }) {
  const familiaNome =
    typeof planta.familia === "object" ? planta.familia.nome : planta.familia_nome;

  return (
    <Link href={`/plantas/${planta.id}`}>
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-video w-full bg-primary-50 dark:bg-stone-800">
          {planta.foto_principal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={planta.foto_principal}
              alt={planta.nome_popular}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl">🌿</div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">{planta.nome_popular}</h3>
            <ToxicidadeBadge nivel={planta.nivel_toxicidade} />
          </div>
          <p className="font-cientifico text-sm text-stone-500">{planta.nome_cientifico}</p>
          {familiaNome && <p className="text-xs text-stone-400">{familiaNome}</p>}
          <p className="line-clamp-2 text-sm text-stone-600 dark:text-stone-400">
            {planta.usos_terapeuticos}
          </p>
        </div>
      </Card>
    </Link>
  );
}
