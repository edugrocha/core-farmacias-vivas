"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Instituicao } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

interface InstituicaoFormProps {
  inicial?: Partial<Instituicao>;
  onSalvar: (dados: Partial<Instituicao>) => Promise<unknown>;
  titulo: string;
}

export function InstituicaoForm({ inicial, onSalvar, titulo }: InstituicaoFormProps) {
  const [form, setForm] = useState({
    nome: inicial?.nome ?? "",
    tipo: inicial?.tipo ?? "",
    site: inicial?.site ?? "",
    email_contato: inicial?.email_contato ?? "",
    telefone: inicial?.telefone ?? "",
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
      await onSalvar(form);
      router.push("/painel/instituicoes");
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-lg flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">{titulo}</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField label="Nome" required value={form.nome} onChange={(e) => set("nome", e.target.value)} />
        <FormField
          label="Tipo"
          required
          placeholder="Ex: Instituto Federal, UBS, ONG"
          value={form.tipo}
          onChange={(e) => set("tipo", e.target.value)}
        />
        <FormField label="Site" type="url" value={form.site} onChange={(e) => set("site", e.target.value)} />
        <FormField
          label="E-mail de contato"
          type="email"
          value={form.email_contato}
          onChange={(e) => set("email_contato", e.target.value)}
        />
        <FormField label="Telefone" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
        {erro && <ErrorBlock mensagem={erro} />}
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Card>
  );
}
