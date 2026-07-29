"use client";

import { useEffect, useState } from "react";
import { listPlantas } from "@/lib/api/plantas";
import type { Planta, Paginacao } from "@/lib/api/types";
import { PlantaCard } from "@/components/PlantaCard";
import { Pagination } from "@/components/ui/Pagination";
import { Pills } from "@/components/ui/Pills";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

const toxicidadeOptions = [
  { value: "", label: "Todas" },
  { value: "SEGURA", label: "Segura" },
  { value: "ATENCAO", label: "Atenção" },
  { value: "RESTRITA", label: "Restrita" },
  { value: "CONTRAINDICADA", label: "Contraindicada" },
];

export default function CatalogoPage() {
  const [busca, setBusca] = useState("");
  const [toxicidade, setToxicidade] = useState("");
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<Paginacao<Planta> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listPlantas({ search: busca || undefined, toxicidade: toxicidade || undefined, page: pagina })
      .then((d) => {
        setDados(d);
        setErro(null);
      })
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }, [busca, toxicidade, pagina]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          Catálogo de plantas medicinais
        </h1>
        <p className="max-w-2xl text-sm text-stone-600 dark:text-stone-400">
          Consulte o acervo científico do projeto Farmácias Vivas — usos terapêuticos, modo de
          preparo e nível de toxicidade, curados por especialistas do IFPE.
        </p>
      </section>

      <div className="flex flex-col gap-3">
        <input
          type="search"
          placeholder="Buscar por nome popular, científico ou uso terapêutico..."
          value={busca}
          onChange={(e) => {
            setCarregando(true);
            setPagina(1);
            setBusca(e.target.value);
          }}
          className="w-full max-w-md rounded-full border border-stone-200 bg-white px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-stone-700 dark:bg-stone-900"
        />
        <Pills
          options={toxicidadeOptions}
          ativo={toxicidade}
          onChange={(v) => {
            setCarregando(true);
            setPagina(1);
            setToxicidade(v);
          }}
        />
      </div>

      {carregando && <LoadingBlock />}
      {erro && <ErrorBlock mensagem={erro} />}

      {dados && !carregando && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dados.resultados.map((planta) => (
              <PlantaCard key={planta.id} planta={planta} />
            ))}
          </div>
          {dados.resultados.length === 0 && (
            <p className="py-12 text-center text-sm text-stone-500">Nenhuma planta encontrada.</p>
          )}
          <Pagination
            paginacao={dados.paginacao}
            onChange={(p) => {
              setCarregando(true);
              setPagina(p);
            }}
          />
        </>
      )}
    </div>
  );
}
