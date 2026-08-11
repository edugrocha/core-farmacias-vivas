"use client";

import { HortoForm } from "@/components/forms/HortoForm";
import { createHorto } from "@/lib/api/hortos";

export default function NovoHortoPage() {
  return <HortoForm titulo="Novo horto" onSalvar={(dados) => createHorto(dados)} />;
}
