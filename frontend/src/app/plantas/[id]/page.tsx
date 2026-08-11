"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPlanta } from "@/lib/api/plantas";
import type { Planta } from "@/lib/api/types";
import { ToxicidadeBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

function Secao({ titulo, texto }: { titulo: string; texto?: string }) {
  if (!texto) return null;
  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold text-stone-700 dark:text-stone-300">{titulo}</h2>
      <p className="whitespace-pre-line text-sm text-stone-600 dark:text-stone-400">{texto}</p>
    </div>
  );
}

export default function PlantaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const [planta, setPlanta] = useState<Planta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getPlanta(id)
      .then(setPlanta)
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) return <LoadingBlock />;
  if (erro) return <ErrorBlock mensagem={erro} />;
  if (!planta) return null;

  const familiaNome = typeof planta.familia === "object" ? planta.familia.nome : planta.familia_nome;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/plantas" className="text-sm text-primary-700 hover:underline">
        ← Voltar ao catálogo
      </Link>

      <Card className="overflow-hidden">
        <div className="aspect-[3/1] w-full bg-primary-50 dark:bg-stone-800">
          {planta.foto_principal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={planta.foto_principal} alt={planta.nome_popular} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">🌿</div>
          )}
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
                {planta.nome_popular}
              </h1>
              <p className="font-cientifico text-stone-500">{planta.nome_cientifico}</p>
              {familiaNome && <p className="text-sm text-stone-400">Família: {familiaNome}</p>}
            </div>
            <ToxicidadeBadge nivel={planta.nivel_toxicidade} />
          </div>

          {planta.outros_nomes && (
            <p className="text-sm text-stone-500">Também conhecida como: {planta.outros_nomes}</p>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Secao titulo="Descrição" texto={planta.descricao} />
            <Secao titulo="Parte utilizada" texto={planta.parte_utilizada} />
            <Secao titulo="Usos terapêuticos" texto={planta.usos_terapeuticos} />
            <Secao titulo="Modo de preparo" texto={planta.modo_preparo} />
            <Secao titulo="Contraindicações" texto={planta.contraindicacoes} />
            <Secao titulo="Interações medicamentosas" texto={planta.interacoes_medicamentosas} />
            <Secao titulo="Região de ocorrência" texto={planta.regiao_ocorrencia} />
            <Secao titulo="Origem" texto={planta.origem} />
          </div>
        </div>
      </Card>
    </div>
  );
}
