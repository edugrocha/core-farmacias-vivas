"use client";

import { PlantaForm } from "@/components/forms/PlantaForm";
import { createPlanta } from "@/lib/api/plantas";

export default function NovaPlantaPage() {
  return <PlantaForm titulo="Nova planta" onSalvar={(dados) => createPlanta(dados)} />;
}
