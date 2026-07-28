"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Horto, StatusHorto } from "@/lib/api/types";
import { listInstituicoes } from "@/lib/api/instituicoes";
import { listPerfis } from "@/lib/api/perfis";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { FormField, SelectField, TextareaField } from "@/components/ui/FormField";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { ImageField } from "@/components/ui/ImageField";
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
  onSalvar: (dados: Partial<Horto> | FormData) => Promise<unknown>;
  titulo: string;
}

export function HortoForm({ inicial, onSalvar, titulo }: HortoFormProps) {
  const { usuario, isAdmin } = useAuth();
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
  const [foto, setFoto] = useState<File | null>(null);
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

      if (foto) {
        const dadosComArquivo = new FormData();
        for (const [chave, valor] of Object.entries(payload)) {
          if (valor === null || valor === undefined) continue;
          dadosComArquivo.append(chave, typeof valor === "object" ? JSON.stringify(valor) : String(valor));
        }
        dadosComArquivo.append("foto", foto);
        await onSalvar(dadosComArquivo);
      } else {
        await onSalvar(payload);
      }
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
        <ImageField label="Foto do horto" fotoAtual={inicial?.foto} onChange={setFoto} />
        <FormField label="Nome" required value={form.nome} onChange={(e) => set("nome", e.target.value)} />
        <TextareaField label="Descrição" value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />

        <SearchSelect
          label="Instituição"
          required
          placeholder="Buscar instituição..."
          valor={form.instituicao || null}
          valorLabel={inicial?.instituicao_nome}
          onChange={(v) => set("instituicao", v ?? 0)}
          buscar={(query) =>
            listInstituicoes({ search: query, page_size: 20 }).then((r) =>
              r.resultados.map((i) => ({ value: i.id, label: i.nome }))
            )
          }
        />

        {isAdmin && (
          <SearchSelect
            label="Responsável"
            placeholder="Buscar especialista (opcional)..."
            valor={form.responsavel ?? null}
            valorLabel={inicial?.responsavel_nome}
            onChange={(v) => set("responsavel", v)}
            buscar={(query) =>
              listPerfis({ search: query, tipo_perfil: "ESPECIALISTA", page_size: 20 }).then((r) =>
                r.resultados.map((u) => ({ value: u.id, label: `${u.first_name} ${u.last_name} (${u.username})` }))
              )
            }
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
