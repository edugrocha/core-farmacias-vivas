"use client";

import { useEffect, useState } from "react";
import { listPlantas } from "@/lib/api/plantas";
import { listHortos } from "@/lib/api/hortos";
import { listInstituicoes } from "@/lib/api/instituicoes";

interface Stat {
  label: string;
  valor: number | null;
}

export function StatsBar() {
  const [stats, setStats] = useState<Stat[]>([
    { label: "Plantas catalogadas", valor: null },
    { label: "Hortos ativos", valor: null },
    { label: "Instituições parceiras", valor: null },
  ]);

  useEffect(() => {
    Promise.allSettled([
      listPlantas({ status: "PUBLICADO", page_size: 1 }),
      listHortos({ status: "ATIVO", page_size: 1 }),
      listInstituicoes({ page: 1 }),
    ]).then(([plantas, hortos, instituicoes]) => {
      setStats([
        {
          label: "Plantas catalogadas",
          valor: plantas.status === "fulfilled" ? plantas.value.paginacao.total : 0,
        },
        {
          label: "Hortos ativos",
          valor: hortos.status === "fulfilled" ? hortos.value.paginacao.total : 0,
        },
        {
          label: "Instituições parceiras",
          valor: instituicoes.status === "fulfilled" ? instituicoes.value.paginacao.total : 0,
        },
      ]);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="text-3xl font-bold text-primary-700">{stat.valor ?? "—"}</p>
          <p className="text-sm text-stone-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
