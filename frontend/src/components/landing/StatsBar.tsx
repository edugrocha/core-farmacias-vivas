"use client";

import { useEffect, useState } from "react";
import { listPlantas } from "@/lib/api/plantas";
import { listHortos } from "@/lib/api/hortos";
import { listInstituicoes } from "@/lib/api/instituicoes";

interface Stat {
  label: string;
  descricao: string;
  valor: number | null;
}

export function StatsBar() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "Plantas catalogadas", descricao: "Acervo publicado e curado", valor: null },
    { label: "Hortos ativos", descricao: "Monitorados pelo projeto", valor: null },
    { label: "Instituições parceiras", descricao: "Mantendo hortos medicinais", valor: null },
  ]);

  useEffect(() => {
    Promise.allSettled([
      listPlantas({ status: "PUBLICADO", page_size: 1 }),
      listHortos({ status: "ATIVO", page_size: 1 }),
      listInstituicoes({ page: 1 }),
    ]).then(([plantas, hortos, instituicoes]) => {
      setStats((atual) => [
        { ...atual[0], valor: plantas.status === "fulfilled" ? plantas.value.paginacao.total : 0 },
        { ...atual[1], valor: hortos.status === "fulfilled" ? hortos.value.paginacao.total : 0 },
        {
          ...atual[2],
          valor: instituicoes.status === "fulfilled" ? instituicoes.value.paginacao.total : 0,
        },
      ]);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`rounded-2xl p-5 ${
            i === 0
              ? "bg-primary-500 text-primary-ink"
              : "border border-stone-200/70 bg-white dark:border-stone-800 dark:bg-stone-900/40"
          }`}
        >
          <p className={`text-3xl font-bold ${i === 0 ? "" : "text-stone-900 dark:text-stone-100"}`}>
            {stat.valor ?? "—"}
          </p>
          <p className={`mt-1 text-sm font-medium ${i === 0 ? "" : "text-stone-700 dark:text-stone-300"}`}>
            {stat.label}
          </p>
          <p className={`text-xs ${i === 0 ? "opacity-80" : "text-stone-500"}`}>{stat.descricao}</p>
        </div>
      ))}
    </div>
  );
}
