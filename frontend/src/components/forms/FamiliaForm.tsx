"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FamiliaBotanica } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { FormField, TextareaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

interface FamiliaFormProps {
  inicial?: Partial<FamiliaBotanica>;
  onSalvar: (dados: Partial<FamiliaBotanica>) => Promise<unknown>;
  titulo: string;
}

export function FamiliaForm({ inicial, onSalvar, titulo }: FamiliaFormProps) {
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar({ nome, descricao });
      router.push("/painel/familias");
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
        <FormField label="Nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
        <TextareaField label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        {erro && <ErrorBlock mensagem={erro} />}
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Card>
  );
}
