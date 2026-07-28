"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Disponibilidade, ItemInventario } from "@/lib/api/types";
import { listHortos } from "@/lib/api/hortos";
import { listPlantas } from "@/lib/api/plantas";
import { Card } from "@/components/ui/Card";
import { FormField, SelectField, TextareaField } from "@/components/ui/FormField";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { Button } from "@/components/ui/Button";
import { ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

const disponibilidadeOptions: { value: Disponibilidade; label: string }[] = [
  { value: "ABUNDANTE", label: "Abundante" },
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "ESCASSA", label: "Escassa" },
  { value: "INDISPONIVEL", label: "Indisponível" },
];

interface InventarioFormProps {
  inicial?: Partial<ItemInventario>;
  onSalvar: (dados: Partial<ItemInventario>) => Promise<unknown>;
  titulo: string;
}

export function InventarioForm({ inicial, onSalvar, titulo }: InventarioFormProps) {
  const [form, setForm] = useState({
    horto: inicial?.horto ?? 0,
    planta: inicial?.planta ?? 0,
    disponibilidade: inicial?.disponibilidade ?? ("DISPONIVEL" as Disponibilidade),
    quantidade_estimada: inicial?.quantidade_estimada ?? null,
    observacoes: inicial?.observacoes ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  function set<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar(form);
      router.push("/painel/inventario");
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
        <SearchSelect
          label="Horto"
          required
          placeholder="Buscar horto..."
          valor={form.horto || null}
          valorLabel={inicial?.horto_nome}
          onChange={(v) => set("horto", v ?? 0)}
          buscar={(query) =>
            listHortos({ search: query, page_size: 20 }).then((r) =>
              r.resultados.map((h) => ({ value: h.id, label: h.nome }))
            )
          }
        />
        <SearchSelect
          label="Planta"
          required
          placeholder="Buscar planta..."
          valor={form.planta || null}
          valorLabel={inicial?.planta_nome}
          onChange={(v) => set("planta", v ?? 0)}
          buscar={(query) =>
            listPlantas({ search: query, page_size: 20 }).then((r) =>
              r.resultados.map((p) => ({ value: p.id, label: p.nome_popular }))
            )
          }
        />
        <SelectField
          label="Disponibilidade"
          value={form.disponibilidade}
          onChange={(e) => set("disponibilidade", e.target.value as Disponibilidade)}
          options={disponibilidadeOptions}
        />
        <FormField
          label="Quantidade estimada"
          type="number"
          min={0}
          value={form.quantidade_estimada ?? ""}
          onChange={(e) => set("quantidade_estimada", e.target.value ? Number(e.target.value) : null)}
        />
        <TextareaField
          label="Observações"
          value={form.observacoes}
          onChange={(e) => set("observacoes", e.target.value)}
        />
        {erro && <ErrorBlock mensagem={erro} />}
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Card>
  );
}
