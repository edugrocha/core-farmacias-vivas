"use client";

import { useEffect, useState } from "react";
import { listPlantas, deletePlanta, publicarPlanta } from "@/lib/api/plantas";
import type { Planta, Paginacao } from "@/lib/api/types";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPlantaBadge, ToxicidadeBadge } from "@/components/ui/Badge";
import { LinkButton, Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function PlantasPainelPage() {
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<Paginacao<Planta> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Planta | null>(null);

  function buscarDados() {
    return listPlantas({ page: pagina })
      .then((d) => {
        setDados(d);
        setErro(null);
      })
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    buscarDados();
  }, [pagina]);

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    try {
      await deletePlanta(paraExcluir.id);
      setParaExcluir(null);
      setCarregando(true);
      buscarDados();
    } catch (e) {
      setErro(mensagemErro(e));
      setParaExcluir(null);
    }
  }

  async function onPublicar(id: number) {
    try {
      await publicarPlanta(id);
      setCarregando(true);
      buscarDados();
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Plantas</h1>
        <LinkButton href="/painel/plantas/novo">Nova planta</LinkButton>
      </div>

      {erro && <ErrorBlock mensagem={erro} />}
      {carregando ? (
        <LoadingBlock />
      ) : (
        dados && (
          <div className="rounded-2xl border border-stone-200/70 bg-white overflow-hidden dark:border-stone-800 dark:bg-stone-900/40">
            <DataTable
              items={dados.resultados}
              keyField={(p) => p.id}
              columns={[
                { header: "Nome popular", render: (p) => p.nome_popular },
                {
                  header: "Nome científico",
                  render: (p) => <span className="font-cientifico">{p.nome_cientifico}</span>,
                },
                { header: "Toxicidade", render: (p) => <ToxicidadeBadge nivel={p.nivel_toxicidade} /> },
                {
                  header: "Status",
                  render: (p) => (p.status ? <StatusPlantaBadge status={p.status} /> : "—"),
                },
                {
                  header: "Ações",
                  render: (p) => (
                    <div className="flex flex-wrap gap-2">
                      <LinkButton href={`/painel/plantas/${p.id}/editar`} variant="secondary">
                        Editar
                      </LinkButton>
                      {p.status !== "PUBLICADO" && (
                        <Button variant="primary" onClick={() => onPublicar(p.id)}>
                          Publicar
                        </Button>
                      )}
                      <Button variant="danger" onClick={() => setParaExcluir(p)}>
                        Arquivar
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
            <Pagination
              paginacao={dados.paginacao}
              onChange={(p) => {
                setCarregando(true);
                setPagina(p);
              }}
            />
          </div>
        )
      )}

      <ConfirmModal
        aberto={!!paraExcluir}
        titulo="Arquivar planta"
        descricao={`Arquivar "${paraExcluir?.nome_popular}"? Ela deixa de aparecer no catálogo público.`}
        confirmarLabel="Arquivar"
        onConfirmar={confirmarExclusao}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  );
}
