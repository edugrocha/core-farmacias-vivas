"use client";

import { useEffect, useState } from "react";
import { getMeuPerfil, updateMeuPerfil } from "@/lib/api/perfis";
import type { Usuario } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { formatarData, mensagemErro } from "@/lib/format";

export default function MeuPerfilPage() {
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    getMeuPerfil()
      .then(setPerfil)
      .catch((e) => setErro(mensagemErro(e)))
      .finally(() => setCarregando(false));
  }, []);

  function set<K extends keyof Usuario>(campo: K, valor: Usuario[K]) {
    setPerfil((p) => (p ? { ...p, [campo]: valor } : p));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setSalvando(true);
    setErro(null);
    setSucesso(false);
    try {
      const atualizado = await updateMeuPerfil({
        email: perfil.email,
        first_name: perfil.first_name,
        last_name: perfil.last_name,
        telefone: perfil.telefone,
        instituicao: perfil.instituicao,
      });
      setPerfil(atualizado);
      setSucesso(true);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <LoadingBlock />;
  if (!perfil) return <ErrorBlock mensagem={erro ?? "Não foi possível carregar seu perfil."} />;

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Meu perfil</h1>
        <p className="text-sm text-stone-500">
          {perfil.username} · {perfil.tipo_perfil} · desde {formatarData(perfil.date_joined)}
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField
          label="E-mail"
          type="email"
          value={perfil.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nome" value={perfil.first_name} onChange={(e) => set("first_name", e.target.value)} />
          <FormField label="Sobrenome" value={perfil.last_name} onChange={(e) => set("last_name", e.target.value)} />
        </div>
        <FormField label="Telefone" value={perfil.telefone} onChange={(e) => set("telefone", e.target.value)} />
        <FormField
          label="Instituição"
          value={perfil.instituicao}
          onChange={(e) => set("instituicao", e.target.value)}
        />
        {erro && <ErrorBlock mensagem={erro} />}
        {sucesso && <p className="text-sm text-success">Perfil atualizado com sucesso.</p>}
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Card>
  );
}
