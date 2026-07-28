"use client";

import { useEffect, useState } from "react";
import { listInstituicoes, deleteInstituicao } from "@/lib/api/instituicoes";
import type { Instituicao, Paginacao } from "@/lib/api/types";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { LinkButton, Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function InstituicoesPage() {
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<Paginacao<Instituicao> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Instituicao | null>(null);

  function buscarDados() {
    return listInstituicoes({ page: pagina })
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
      await deleteInstituicao(paraExcluir.id);
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
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Instituições</h1>
        <LinkButton href="/painel/instituicoes/novo">Nova instituição</LinkButton>
      </div>

      {erro && <ErrorBlock mensagem={erro} />}
      {carregando ? (
        <LoadingBlock />
      ) : (
        dados && (
          <div className="rounded-xl border border-stone-200 dark:border-stone-800">
            <DataTable
              items={dados.resultados}
              keyField={(i) => i.id}
              columns={[
                { header: "Nome", render: (i) => i.nome },
                { header: "Tipo", render: (i) => i.tipo },
                { header: "Contato", render: (i) => i.email_contato || i.telefone || "—" },
                {
                  header: "Ações",
                  render: (i) => (
                    <div className="flex gap-2">
                      <LinkButton href={`/painel/instituicoes/${i.id}/editar`} variant="secondary">
                        Editar
                      </LinkButton>
                      <Button variant="danger" onClick={() => setParaExcluir(i)}>
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
        titulo="Excluir instituição"
        descricao={`Excluir "${paraExcluir?.nome}"? Falha se houver hortos vinculados.`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  );
}
