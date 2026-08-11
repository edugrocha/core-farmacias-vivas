"use client";

import { InstituicaoForm } from "@/components/forms/InstituicaoForm";
import { createInstituicao } from "@/lib/api/instituicoes";

export default function NovaInstituicaoPage() {
  return <InstituicaoForm titulo="Nova instituição" onSalvar={(dados) => createInstituicao(dados)} />;
}
