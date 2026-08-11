"use client";

import { useEffect, useState } from "react";
import { listFamilias, deleteFamilia } from "@/lib/api/familias";
import type { FamiliaBotanica, Paginacao } from "@/lib/api/types";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { LinkButton, Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function FamiliasPage() {
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<Paginacao<FamiliaBotanica> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<FamiliaBotanica | null>(null);

  function buscarDados() {
    return listFamilias({ page: pagina })
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
      await deleteFamilia(paraExcluir.id);
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
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Famílias botânicas</h1>
        <LinkButton href="/painel/familias/novo">Nova família</LinkButton>
      </div>

      {erro && <ErrorBlock mensagem={erro} />}
      {carregando ? (
        <LoadingBlock />
      ) : (
        dados && (
          <div className="rounded-2xl border border-stone-200/70 bg-white overflow-hidden dark:border-stone-800 dark:bg-stone-900/40">
            <DataTable
              items={dados.resultados}
              keyField={(f) => f.id}
              columns={[
                { header: "Nome", render: (f) => f.nome },
                { header: "Descrição", render: (f) => f.descricao || "—" },
                {
                  header: "Ações",
                  render: (f) => (
                    <div className="flex gap-2">
                      <LinkButton href={`/painel/familias/${f.id}/editar`} variant="secondary">
                        Editar
                      </LinkButton>
                      <Button variant="danger" onClick={() => setParaExcluir(f)}>
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
        titulo="Excluir família botânica"
        descricao={`Excluir "${paraExcluir?.nome}"? Falha se houver plantas vinculadas.`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  );
}
