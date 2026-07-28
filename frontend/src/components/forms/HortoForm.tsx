"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Horto, Instituicao, StatusHorto, Usuario } from "@/lib/api/types";
import { listInstituicoes } from "@/lib/api/instituicoes";
import { listPerfis } from "@/lib/api/perfis";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { FormField, SelectField, TextareaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

const statusOptions: { value: StatusHorto; label: string }[] = [
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
  { value: "MANUTENCAO", label: "Em manutenção" },
];

interface HortoFormProps {
  inicial?: Partial<Horto>;
  onSalvar: (dados: Partial<Horto>) => Promise<unknown>;
  titulo: string;
}

export function HortoForm({ inicial, onSalvar, titulo }: HortoFormProps) {
  const { usuario, isAdmin } = useAuth();
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [especialistas, setEspecialistas] = useState<Usuario[]>([]);
  const [form, setForm] = useState({
    nome: inicial?.nome ?? "",
    descricao: inicial?.descricao ?? "",
    instituicao: inicial?.instituicao ?? 0,
    responsavel: inicial?.responsavel ?? null,
    logradouro: inicial?.logradouro ?? "",
    municipio: inicial?.municipio ?? "Jaboatão dos Guararapes",
    uf: inicial?.uf ?? "PE",
    cep: inicial?.cep ?? "",
    status: inicial?.status ?? ("ATIVO" as StatusHorto),
    horario_funcionamento: inicial?.horario_funcionamento ?? "",
  });
  const [lat, setLat] = useState(inicial?.localizacao ? String(inicial.localizacao.coordinates[1]) : "");
  const [lon, setLon] = useState(inicial?.localizacao ? String(inicial.localizacao.coordinates[0]) : "");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    listInstituicoes({ page: 1 }).then((r) => setInstituicoes(r.resultados));
    if (isAdmin) {
      listPerfis({ tipo_perfil: "ESPECIALISTA" }).then((r) => setEspecialistas(r.resultados));
    }
  }, [isAdmin]);

  function set<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setErro("Informe latitude e longitude válidas.");
      setSalvando(false);
      return;
    }
    try {
      const payload: Partial<Horto> = {
        ...form,
        localizacao: { type: "Point", coordinates: [longitude, latitude] },
      };
      if (!inicial && !isAdmin && usuario) {
        payload.responsavel = usuario.id;
      }
      await onSalvar(payload);
      router.push("/painel/hortos");
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
        <FormField label="Nome" required value={form.nome} onChange={(e) => set("nome", e.target.value)} />
        <TextareaField label="Descrição" value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />

        <SelectField
          label="Instituição"
          required
          placeholder="Selecione..."
          value={form.instituicao || ""}
          onChange={(e) => set("instituicao", Number(e.target.value))}
          options={instituicoes.map((i) => ({ value: i.id, label: i.nome }))}
        />

        {isAdmin && (
          <SelectField
            label="Responsável"
            placeholder="Sem responsável definido"
            value={form.responsavel ?? ""}
            onChange={(e) => set("responsavel", e.target.value ? Number(e.target.value) : null)}
            options={especialistas.map((u) => ({ value: u.id, label: `${u.first_name} ${u.last_name} (${u.username})` }))}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Município" value={form.municipio} onChange={(e) => set("municipio", e.target.value)} />
          <FormField label="UF" maxLength={2} value={form.uf} onChange={(e) => set("uf", e.target.value.toUpperCase())} />
        </div>
        <FormField label="Logradouro" value={form.logradouro} onChange={(e) => set("logradouro", e.target.value)} />
        <FormField label="CEP" value={form.cep} onChange={(e) => set("cep", e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Latitude"
            type="number"
            step="any"
            required
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="-8.167"
          />
          <FormField
            label="Longitude"
            type="number"
            step="any"
            required
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="-35.012"
          />
        </div>

        <SelectField
          label="Status"
          value={form.status}
          onChange={(e) => set("status", e.target.value as StatusHorto)}
          options={statusOptions}
        />
        <FormField
          label="Horário de funcionamento"
          value={form.horario_funcionamento}
          onChange={(e) => set("horario_funcionamento", e.target.value)}
        />

        {erro && <ErrorBlock mensagem={erro} />}
        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Card>
  );
}
