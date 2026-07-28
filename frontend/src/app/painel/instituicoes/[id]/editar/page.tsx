"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InstituicaoForm } from "@/components/forms/InstituicaoForm";
import { getInstituicao, updateInstituicao } from "@/lib/api/instituicoes";
import type { Instituicao } from "@/lib/api/types";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function EditarInstituicaoPage() {
  const { id } = useParams<{ id: string }>();
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getInstituicao(id)
      .then(setInstituicao)
      .catch((e) => setErro(mensagemErro(e)));
  }, [id]);

  if (erro) return <ErrorBlock mensagem={erro} />;
  if (!instituicao) return <LoadingBlock />;

  return (
    <InstituicaoForm
      titulo={`Editar: ${instituicao.nome}`}
      inicial={instituicao}
      onSalvar={(dados) => updateInstituicao(id, dados)}
    />
  );
}
