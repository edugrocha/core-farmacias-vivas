import Link from "next/link";
import type { Horto } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { StatusHortoBadge } from "@/components/ui/Badge";

export function HortoDestaqueCard({ horto }: { horto: Horto }) {
  return (
    <Link href={`/hortos#horto-${horto.id}`}>
      <Card className="flex h-full flex-col gap-2 p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">{horto.nome}</h3>
          <StatusHortoBadge status={horto.status} />
        </div>
        <p className="text-sm text-stone-500">{horto.instituicao_nome}</p>
        <p className="text-sm text-stone-500">
          {horto.municipio}/{horto.uf}
        </p>
      </Card>
    </Link>
  );
}
