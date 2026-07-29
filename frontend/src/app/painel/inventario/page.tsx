"use client";

import { useEffect, useState } from "react";
import { listInventario, deleteItemInventario } from "@/lib/api/inventario";
import type { ItemInventario, Paginacao } from "@/lib/api/types";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { DisponibilidadeBadge } from "@/components/ui/Badge";
import { LinkButton, Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function InventarioPainelPage() {
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<Paginacao<ItemInventario> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraExcluir, setParaExcluir] = useState<ItemInventario | null>(null);

  function buscarDados() {
    return listInventario({ page: pagina })
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
      await deleteItemInventario(paraExcluir.id);
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
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Inventário</h1>
        <LinkButton href="/painel/inventario/novo">Novo item</LinkButton>
      </div>

      {erro && <ErrorBlock mensagem={erro} />}
      {carregando ? (
        <LoadingBlock />
      ) : (
        dados && (
          <div className="rounded-2xl border border-stone-200/70 bg-white overflow-hidden dark:border-stone-800 dark:bg-stone-900/40">
            <DataTable
              items={dados.resultados}
              keyField={(i) => i.id}
              columns={[
                { header: "Planta", render: (i) => i.planta_nome ?? i.planta },
                { header: "Horto", render: (i) => i.horto_nome ?? i.horto },
                {
                  header: "Disponibilidade",
                  render: (i) => <DisponibilidadeBadge valor={i.disponibilidade} />,
                },
                { header: "Qtd.", render: (i) => i.quantidade_estimada ?? "—" },
                {
                  header: "Ações",
                  render: (i) => (
                    <div className="flex gap-2">
                      <LinkButton href={`/painel/inventario/${i.id}/editar`} variant="secondary">
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
        titulo="Excluir item de inventário"
        descricao="Tem certeza que deseja remover este item?"
        onConfirmar={confirmarExclusao}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  );
}
