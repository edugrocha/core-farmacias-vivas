"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPerfil, updatePerfil } from "@/lib/api/perfis";
import type { Usuario } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { FormField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function EditarPerfilPage() {
  const { id } = useParams<{ id: string }>();
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getPerfil(id)
      .then(setPerfil)
      .catch((e) => setErro(mensagemErro(e)));
  }, [id]);

  function set<K extends keyof Usuario>(campo: K, valor: Usuario[K]) {
    setPerfil((p) => (p ? { ...p, [campo]: valor } : p));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setSalvando(true);
    setErro(null);
    try {
      await updatePerfil(id, {
        email: perfil.email,
        first_name: perfil.first_name,
        last_name: perfil.last_name,
        telefone: perfil.telefone,
        instituicao: perfil.instituicao,
        tipo_perfil: perfil.tipo_perfil,
        is_active: perfil.is_active,
      });
      router.push("/painel/perfis");
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  if (erro && !perfil) return <ErrorBlock mensagem={erro} />;
  if (!perfil) return <LoadingBlock />;

  return (
    <Card className="mx-auto flex w-full max-w-lg flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Editar: {perfil.username}</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField label="E-mail" type="email" value={perfil.email} onChange={(e) => set("email", e.target.value)} />
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
        <SelectField
          label="Tipo de perfil"
          value={perfil.tipo_perfil}
          onChange={(e) => set("tipo_perfil", e.target.value as Usuario["tipo_perfil"])}
          options={[
            { value: "COMUNIDADE", label: "Comunidade" },
            { value: "ESPECIALISTA", label: "Especialista" },
            { value: "ADMIN", label: "Administrador" },
          ]}
        />
        <SelectField
          label="Ativo"
          value={perfil.is_active ? "true" : "false"}
          onChange={(e) => set("is_active", e.target.value === "true")}
          options={[
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ]}
        />
        {erro && <ErrorBlock mensagem={erro} />}
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Card>
  );
}
