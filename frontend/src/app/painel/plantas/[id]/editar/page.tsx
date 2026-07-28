"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PlantaForm } from "@/components/forms/PlantaForm";
import { getPlanta, updatePlanta } from "@/lib/api/plantas";
import type { Planta } from "@/lib/api/types";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function EditarPlantaPage() {
  const { id } = useParams<{ id: string }>();
  const [planta, setPlanta] = useState<Planta | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getPlanta(id)
      .then(setPlanta)
      .catch((e) => setErro(mensagemErro(e)));
  }, [id]);

  if (erro) return <ErrorBlock mensagem={erro} />;
  if (!planta) return <LoadingBlock />;

  return (
    <PlantaForm titulo={`Editar: ${planta.nome_popular}`} inicial={planta} onSalvar={(dados) => updatePlanta(id, dados)} />
  );
}
