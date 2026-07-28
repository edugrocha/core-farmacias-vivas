"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { HortoForm } from "@/components/forms/HortoForm";
import { getHorto, updateHorto } from "@/lib/api/hortos";
import type { Horto } from "@/lib/api/types";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function EditarHortoPage() {
  const { id } = useParams<{ id: string }>();
  const [horto, setHorto] = useState<Horto | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getHorto(id)
      .then(setHorto)
      .catch((e) => setErro(mensagemErro(e)));
  }, [id]);

  if (erro) return <ErrorBlock mensagem={erro} />;
  if (!horto) return <LoadingBlock />;

  return <HortoForm titulo={`Editar: ${horto.nome}`} inicial={horto} onSalvar={(dados) => updateHorto(id, dados)} />;
}
