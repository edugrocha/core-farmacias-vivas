"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPerfil } from "@/lib/api/perfis";
import { Card } from "@/components/ui/Card";
import { FormField, SelectField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function NovoPerfilPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    telefone: "",
    instituicao: "",
    tipo_perfil: "COMUNIDADE",
    password: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  function set<K extends keyof typeof form>(campo: K, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      await createPerfil(form);
      router.push("/painel/perfis");
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-lg flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Novo perfil</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField label="Usuário" required value={form.username} onChange={(e) => set("username", e.target.value)} />
        <FormField
          label="E-mail"
          type="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nome" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
          <FormField label="Sobrenome" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
        </div>
        <FormField label="Telefone" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
        <FormField
          label="Instituição"
          value={form.instituicao}
          onChange={(e) => set("instituicao", e.target.value)}
        />
        <SelectField
          label="Tipo de perfil"
          value={form.tipo_perfil}
          onChange={(e) => set("tipo_perfil", e.target.value)}
          options={[
            { value: "COMUNIDADE", label: "Comunidade" },
            { value: "ESPECIALISTA", label: "Especialista" },
            { value: "ADMIN", label: "Administrador" },
          ]}
        />
        <FormField
          label="Senha"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
        />
        {erro && <ErrorBlock mensagem={erro} />}
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Criar perfil"}
        </Button>
      </form>
    </Card>
  );
}
