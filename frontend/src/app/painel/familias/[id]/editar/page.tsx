"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FamiliaForm } from "@/components/forms/FamiliaForm";
import { getFamilia, updateFamilia } from "@/lib/api/familias";
import type { FamiliaBotanica } from "@/lib/api/types";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function EditarFamiliaPage() {
  const { id } = useParams<{ id: string }>();
  const [familia, setFamilia] = useState<FamiliaBotanica | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getFamilia(id)
      .then(setFamilia)
      .catch((e) => setErro(mensagemErro(e)));
  }, [id]);

  if (erro) return <ErrorBlock mensagem={erro} />;
  if (!familia) return <LoadingBlock />;

  return (
    <FamiliaForm
      titulo={`Editar: ${familia.nome}`}
      inicial={familia}
      onSalvar={(dados) => updateFamilia(id, dados)}
    />
  );
}
