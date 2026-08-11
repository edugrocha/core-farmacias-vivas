"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InventarioForm } from "@/components/forms/InventarioForm";
import { getItemInventario, updateItemInventario } from "@/lib/api/inventario";
import type { ItemInventario } from "@/lib/api/types";
import { LoadingBlock, ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function EditarItemInventarioPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ItemInventario | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    getItemInventario(id)
      .then(setItem)
      .catch((e) => setErro(mensagemErro(e)));
  }, [id]);

  if (erro) return <ErrorBlock mensagem={erro} />;
  if (!item) return <LoadingBlock />;

  return (
    <InventarioForm
      titulo={`Editar item: ${item.planta_nome}`}
      inicial={item}
      onSalvar={(dados) => updateItemInventario(id, dados)}
    />
  );
}
