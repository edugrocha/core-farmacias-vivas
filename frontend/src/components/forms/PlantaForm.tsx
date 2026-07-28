"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FamiliaBotanica, NivelToxicidade, Planta } from "@/lib/api/types";
import { listFamilias } from "@/lib/api/familias";
import { Card } from "@/components/ui/Card";
import { FormField, SelectField, TextareaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

const toxicidadeOptions: { value: NivelToxicidade; label: string }[] = [
  { value: "SEGURA", label: "Segura para uso geral" },
  { value: "ATENCAO", label: "Requer atenção (gestantes, crianças)" },
  { value: "RESTRITA", label: "Uso restrito — apenas com orientação" },
  { value: "CONTRAINDICADA", label: "Contraindicada para uso popular" },
];

interface PlantaFormProps {
  inicial?: Partial<Planta>;
  onSalvar: (dados: Partial<Planta>) => Promise<unknown>;
  titulo: string;
}

export function PlantaForm({ inicial, onSalvar, titulo }: PlantaFormProps) {
  const [familias, setFamilias] = useState<FamiliaBotanica[]>([]);
  const familiaInicial =
    typeof inicial?.familia === "object" ? inicial.familia?.id : inicial?.familia;

  const [form, setForm] = useState({
    nome_popular: inicial?.nome_popular ?? "",
    outros_nomes: inicial?.outros_nomes ?? "",
    nome_cientifico: inicial?.nome_cientifico ?? "",
    familia: familiaInicial ?? 0,
    descricao: inicial?.descricao ?? "",
    parte_utilizada: inicial?.parte_utilizada ?? "",
    usos_terapeuticos: inicial?.usos_terapeuticos ?? "",
    modo_preparo: inicial?.modo_preparo ?? "",
    contraindicacoes: inicial?.contraindicacoes ?? "",
    interacoes_medicamentosas: inicial?.interacoes_medicamentosas ?? "",
    nivel_toxicidade: inicial?.nivel_toxicidade ?? ("ATENCAO" as NivelToxicidade),
    regiao_ocorrencia: inicial?.regiao_ocorrencia ?? "",
    origem: inicial?.origem ?? "",
    referencias_bibliograficas: inicial?.referencias_bibliograficas ?? "",
    registro_anvisa: inicial?.registro_anvisa ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    listFamilias({ page: 1 }).then((r) => setFamilias(r.resultados));
  }, []);

  function set<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar(form);
      router.push("/painel/plantas");
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">{titulo}</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Nome popular"
            required
            value={form.nome_popular}
            onChange={(e) => set("nome_popular", e.target.value)}
          />
          <FormField
            label="Nome científico"
            required
            value={form.nome_cientifico}
            onChange={(e) => set("nome_cientifico", e.target.value)}
          />
        </div>
        <FormField
          label="Outros nomes"
          placeholder="Separados por vírgula"
          value={form.outros_nomes}
          onChange={(e) => set("outros_nomes", e.target.value)}
        />
        <SelectField
          label="Família botânica"
          required
          placeholder="Selecione..."
          value={form.familia || ""}
          onChange={(e) => set("familia", Number(e.target.value))}
          options={familias.map((f) => ({ value: f.id, label: f.nome }))}
        />
        <TextareaField
          label="Descrição"
          required
          value={form.descricao}
          onChange={(e) => set("descricao", e.target.value)}
        />
        <FormField
          label="Parte utilizada"
          required
          placeholder="Ex: folhas, raízes, casca do caule"
          value={form.parte_utilizada}
          onChange={(e) => set("parte_utilizada", e.target.value)}
        />
        <TextareaField
          label="Usos terapêuticos"
          required
          value={form.usos_terapeuticos}
          onChange={(e) => set("usos_terapeuticos", e.target.value)}
        />
        <TextareaField
          label="Modo de preparo"
          value={form.modo_preparo}
          onChange={(e) => set("modo_preparo", e.target.value)}
        />
        <TextareaField
          label="Contraindicações"
          value={form.contraindicacoes}
          onChange={(e) => set("contraindicacoes", e.target.value)}
        />
        <TextareaField
          label="Interações medicamentosas"
          value={form.interacoes_medicamentosas}
          onChange={(e) => set("interacoes_medicamentosas", e.target.value)}
        />
        <SelectField
          label="Nível de toxicidade"
          value={form.nivel_toxicidade}
          onChange={(e) => set("nivel_toxicidade", e.target.value as NivelToxicidade)}
          options={toxicidadeOptions}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Região de ocorrência"
            value={form.regiao_ocorrencia}
            onChange={(e) => set("regiao_ocorrencia", e.target.value)}
          />
          <FormField label="Origem" value={form.origem} onChange={(e) => set("origem", e.target.value)} />
        </div>
        <TextareaField
          label="Referências bibliográficas"
          value={form.referencias_bibliograficas}
          onChange={(e) => set("referencias_bibliograficas", e.target.value)}
        />
        <FormField
          label="Registro Anvisa"
          value={form.registro_anvisa}
          onChange={(e) => set("registro_anvisa", e.target.value)}
        />

        {erro && <ErrorBlock mensagem={erro} />}
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Card>
  );
}
