"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listPlantas } from "@/lib/api/plantas";
import { listFamilias } from "@/lib/api/familias";
import { listHortos } from "@/lib/api/hortos";
import type { FamiliaBotanica, Horto, Planta } from "@/lib/api/types";
import { PlantaCard } from "@/components/PlantaCard";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { StatsBar } from "@/components/landing/StatsBar";
import { FamiliaCarousel } from "@/components/landing/FamiliaCarousel";
import { HortoDestaqueCard } from "@/components/landing/HortoDestaqueCard";
import { Faq } from "@/components/landing/Faq";
import { LinkButton } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/Spinner";

export default function HomePage() {
  const [destaques, setDestaques] = useState<Planta[] | null>(null);
  const [recentes, setRecentes] = useState<Planta[] | null>(null);
  const [familias, setFamilias] = useState<FamiliaBotanica[]>([]);
  const [hortos, setHortos] = useState<Horto[]>([]);

  useEffect(() => {
    listPlantas({ ordering: "-created_at", page_size: 5 }).then((r) => setRecentes(r.resultados));
    listPlantas({ page_size: 6 }).then((r) => setDestaques(r.resultados));
    listFamilias({ page: 1 }).then((r) => setFamilias(r.resultados));
    listHortos({ status: "ATIVO", page_size: 6 }).then((r) => setHortos(r.resultados));
  }, []);

  return (
    <div className="flex flex-col gap-20">
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-bold leading-tight text-stone-900 dark:text-stone-100 sm:text-4xl">
            O catálogo vivo das plantas medicinais do IFPE
          </h1>
          <p className="max-w-lg text-base text-stone-600 dark:text-stone-400">
            Consulte usos terapêuticos curados por especialistas, encontre o horto parceiro mais
            próximo de você e acompanhe o inventário de plantas medicinais do projeto de extensão
            Farmácias Vivas, alinhado às diretrizes do SUS e da Anvisa.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/plantas">Explorar catálogo</LinkButton>
            <LinkButton href="/registro" variant="secondary">
              Cadastrar
            </LinkButton>
          </div>
        </div>
        {recentes ? <HeroCarousel plantas={recentes} /> : <LoadingBlock />}
      </section>

      {/* Stats */}
      <section className="rounded-2xl bg-cream p-8 dark:bg-stone-900/40">
        <StatsBar />
      </section>

      {/* Plantas em destaque */}
      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              Plantas em destaque
            </h2>
            <p className="text-sm text-stone-500">Últimas adições ao acervo científico</p>
          </div>
          <Link href="/plantas" className="text-sm font-medium text-primary-700 hover:underline">
            Ver catálogo completo →
          </Link>
        </div>
        {destaques ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((planta) => (
              <PlantaCard key={planta.id} planta={planta} />
            ))}
          </div>
        ) : (
          <LoadingBlock />
        )}
      </section>

      {/* Famílias botânicas */}
      {familias.length > 0 && (
        <section className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              Famílias botânicas
            </h2>
            <p className="text-sm text-stone-500">Explore o catálogo por classificação científica</p>
          </div>
          <FamiliaCarousel familias={familias} />
        </section>
      )}

      {/* Hortos em destaque */}
      {hortos.length > 0 && (
        <section className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              Hortos parceiros
            </h2>
            <p className="text-sm text-stone-500">Instituições que mantêm hortos medicinais ativos</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hortos.map((horto) => (
              <HortoDestaqueCard key={horto.id} horto={horto} />
            ))}
          </div>
          <Link href="/hortos" className="self-end text-sm font-medium text-primary-700 hover:underline">
            Ver mapa de hortos →
          </Link>
        </section>
      )}

      {/* Valor / institucional */}
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          Mais do que um catálogo
        </h2>
        <p className="text-stone-600 dark:text-stone-400">
          O Farmácias Vivas é um projeto de extensão do IFPE Jaboatão dos Guararapes que conecta
          comunidade, especialistas e hortos medicinais parceiros, centralizando o conhecimento
          científico sobre fitoterapia com curadoria técnica e responsável.
        </p>
        <LinkButton href="/registro">Cadastrar gratuitamente</LinkButton>
      </section>

      {/* FAQ */}
      <section className="flex flex-col gap-6">
        <h2 className="text-center text-2xl font-semibold text-stone-900 dark:text-stone-100">
          Perguntas frequentes
        </h2>
        <Faq />
      </section>

      {/* CTA final */}
      <section className="flex flex-col items-center gap-4 rounded-2xl bg-primary-500 p-10 text-center">
        <h2 className="text-2xl font-bold text-primary-ink">
          Faça parte da comunidade Farmácias Vivas
        </h2>
        <p className="max-w-md text-primary-ink/80">
          Crie sua conta e acompanhe o catálogo de plantas medicinais e os hortos parceiros do
          projeto.
        </p>
        <LinkButton href="/registro" variant="secondary">
          Criar conta gratuita
        </LinkButton>
      </section>
    </div>
  );
}
