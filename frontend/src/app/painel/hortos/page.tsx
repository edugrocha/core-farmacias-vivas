"use client";

import { useEffect, useState } from "react";
import { listHortos, deleteHorto } from "@/lib/api/hortos";
import type { Horto, Paginacao } from "@/lib/api/types";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { StatusHortoBadge } from "@/components/ui/Badge";
import { LinkButton, Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function HortosPainelPage() {
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<Paginacao<Horto> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Horto | null>(null);

  function buscarDados() {
    return listHortos({ page: pagina })
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
      await deleteHorto(paraExcluir.id);
      setParaExcluir(null);
      setCarregando(true);
      buscarDados();
    } catch (e) {
      setErro(mensagemErro(e));
      setParaExcluir(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Hortos</h1>
        <LinkButton href="/painel/hortos/novo">Novo horto</LinkButton>
      </div>

      {erro && <ErrorBlock mensagem={erro} />}
      {carregando ? (
        <LoadingBlock />
      ) : (
        dados && (
          <div className="rounded-2xl border border-stone-200/70 bg-white overflow-hidden dark:border-stone-800 dark:bg-stone-900/40">
            <DataTable
              items={dados.resultados}
              keyField={(h) => h.id}
              columns={[
                { header: "Nome", render: (h) => h.nome },
                { header: "Instituição", render: (h) => h.instituicao_nome ?? "—" },
                { header: "Município/UF", render: (h) => `${h.municipio}/${h.uf}` },
                { header: "Status", render: (h) => <StatusHortoBadge status={h.status} /> },
                {
                  header: "Ações",
                  render: (h) => (
                    <div className="flex gap-2">
                      <LinkButton href={`/painel/hortos/${h.id}/editar`} variant="secondary">
                        Editar
                      </LinkButton>
                      <Button variant="danger" onClick={() => setParaExcluir(h)}>
                        Excluir
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
        titulo="Excluir horto"
        descricao={`Excluir "${paraExcluir?.nome}"? Requer ser o responsável ou administrador.`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  );
}
