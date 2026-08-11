"use client";

import { InventarioForm } from "@/components/forms/InventarioForm";
import { createItemInventario } from "@/lib/api/inventario";

export default function NovoItemInventarioPage() {
  return <InventarioForm titulo="Novo item de inventário" onSalvar={(dados) => createItemInventario(dados)} />;
}
