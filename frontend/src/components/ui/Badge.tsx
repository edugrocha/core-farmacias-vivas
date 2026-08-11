import type { NivelToxicidade, StatusCuracao, StatusHorto, Disponibilidade } from "@/lib/api/types";

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

const toxicidadeStyles: Record<NivelToxicidade, string> = {
  SEGURA: "bg-success/15 text-success",
  ATENCAO: "bg-warning/15 text-warning",
  RESTRITA: "bg-orange-500/15 text-orange-600",
  CONTRAINDICADA: "bg-danger/15 text-danger",
};

const toxicidadeLabel: Record<NivelToxicidade, string> = {
  SEGURA: "Segura",
  ATENCAO: "Atenção",
  RESTRITA: "Restrita",
  CONTRAINDICADA: "Contraindicada",
};

export function ToxicidadeBadge({ nivel }: { nivel: NivelToxicidade }) {
  return <Badge label={toxicidadeLabel[nivel]} className={toxicidadeStyles[nivel]} />;
}

const statusPlantaStyles: Record<StatusCuracao, string> = {
  RASCUNHO: "bg-stone-200 text-stone-700",
  EM_REVISAO: "bg-info/15 text-info",
  PUBLICADO: "bg-success/15 text-success",
  ARQUIVADO: "bg-stone-300 text-stone-600",
};

const statusPlantaLabel: Record<StatusCuracao, string> = {
  RASCUNHO: "Rascunho",
  EM_REVISAO: "Em revisão",
  PUBLICADO: "Publicado",
  ARQUIVADO: "Arquivado",
};

export function StatusPlantaBadge({ status }: { status: StatusCuracao }) {
  return <Badge label={statusPlantaLabel[status]} className={statusPlantaStyles[status]} />;
}

const statusHortoStyles: Record<StatusHorto, string> = {
  ATIVO: "bg-success/15 text-success",
  INATIVO: "bg-stone-300 text-stone-600",
  MANUTENCAO: "bg-warning/15 text-warning",
};

const statusHortoLabel: Record<StatusHorto, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  MANUTENCAO: "Em manutenção",
};

export function StatusHortoBadge({ status }: { status: StatusHorto }) {
  return <Badge label={statusHortoLabel[status]} className={statusHortoStyles[status]} />;
}

const disponibilidadeStyles: Record<Disponibilidade, string> = {
  ABUNDANTE: "bg-success/15 text-success",
  DISPONIVEL: "bg-primary-100 text-primary-700",
  ESCASSA: "bg-warning/15 text-warning",
  INDISPONIVEL: "bg-danger/15 text-danger",
};

const disponibilidadeLabel: Record<Disponibilidade, string> = {
  ABUNDANTE: "Abundante",
  DISPONIVEL: "Disponível",
  ESCASSA: "Escassa",
  INDISPONIVEL: "Indisponível",
};

export function DisponibilidadeBadge({ valor }: { valor: Disponibilidade }) {
  return <Badge label={disponibilidadeLabel[valor]} className={disponibilidadeStyles[valor]} />;
}
