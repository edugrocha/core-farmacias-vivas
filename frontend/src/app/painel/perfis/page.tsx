"use client";

import { useEffect, useState } from "react";
import { listPerfis, desativarPerfil } from "@/lib/api/perfis";
import type { Usuario, Paginacao } from "@/lib/api/types";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { LinkButton, Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormField";
import { ConfirmModal } from "@/components/ui/Modal";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function PerfisPage() {
  const [pagina, setPagina] = useState(1);
  const [tipoPerfil, setTipoPerfil] = useState("");
  const [dados, setDados] = useState<Paginacao<Usuario> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paraDesativar, setParaDesativar] = useState<Usuario | null>(null);

  function buscarDados() {
    return listPerfis({ page: pagina, tipo_perfil: tipoPerfil || undefined })
      .then((d) => {
        setDados(d);
        setErro(null);
      })
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    buscarDados();
  }, [pagina, tipoPerfil]);

  async function confirmarDesativacao() {
    if (!paraDesativar) return;
    try {
      await desativarPerfil(paraDesativar.id);
      setParaDesativar(null);
      setCarregando(true);
      buscarDados();
    } catch (e) {
      setErro(mensagemErro(e));
      setParaDesativar(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Perfis</h1>
        <LinkButton href="/painel/perfis/novo">Novo perfil</LinkButton>
      </div>

      <div className="max-w-xs">
        <SelectField
          label="Filtrar por tipo"
          placeholder="Todos"
          value={tipoPerfil}
          onChange={(e) => {
            setCarregando(true);
            setPagina(1);
            setTipoPerfil(e.target.value);
          }}
          options={[
            { value: "COMUNIDADE", label: "Comunidade" },
            { value: "ESPECIALISTA", label: "Especialista" },
            { value: "ADMIN", label: "Administrador" },
          ]}
        />
      </div>

      {erro && <ErrorBlock mensagem={erro} />}
      {carregando ? (
        <LoadingBlock />
      ) : (
        dados && (
          <div className="rounded-xl border border-stone-200 dark:border-stone-800">
            <DataTable
              items={dados.resultados}
              keyField={(u) => u.id}
              columns={[
                { header: "Usuário", render: (u) => u.username },
                { header: "Nome", render: (u) => `${u.first_name} ${u.last_name}`.trim() || "—" },
                { header: "E-mail", render: (u) => u.email },
                { header: "Tipo", render: (u) => u.tipo_perfil },
                { header: "Ativo", render: (u) => (u.is_active ? "Sim" : "Não") },
                {
                  header: "Ações",
                  render: (u) => (
                    <div className="flex gap-2">
                      <LinkButton href={`/painel/perfis/${u.id}/editar`} variant="secondary">
                        Editar
                      </LinkButton>
                      {u.is_active && (
                        <Button variant="danger" onClick={() => setParaDesativar(u)}>
                          Desativar
                        </Button>
                      )}
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
        aberto={!!paraDesativar}
        titulo="Desativar perfil"
        descricao={`Desativar "${paraDesativar?.username}"? O usuário não conseguirá mais acessar o sistema.`}
        confirmarLabel="Desativar"
        onConfirmar={confirmarDesativacao}
        onCancelar={() => setParaDesativar(null)}
      />
    </div>
  );
}
