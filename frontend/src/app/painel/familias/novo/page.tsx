"use client";

import { FamiliaForm } from "@/components/forms/FamiliaForm";
import { createFamilia } from "@/lib/api/familias";

export default function NovaFamiliaPage() {
  return <FamiliaForm titulo="Nova família botânica" onSalvar={(dados) => createFamilia(dados)} />;
}
