"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Card } from "@/components/ui/Card";

const cartoes = [
  { href: "/painel/plantas", titulo: "Plantas", descricao: "Catálogo científico e curadoria" },
  { href: "/painel/familias", titulo: "Famílias botânicas", descricao: "Classificação das plantas" },
  { href: "/painel/hortos", titulo: "Hortos", descricao: "Localização e status dos hortos" },
  { href: "/painel/instituicoes", titulo: "Instituições", descricao: "Parceiros responsáveis pelos hortos" },
  { href: "/painel/inventario", titulo: "Inventário", descricao: "Disponibilidade de plantas por horto" },
];

export default function PainelHubPage() {
  const { usuario, isAdmin } = useAuth();

  const itens = isAdmin
    ? [...cartoes, { href: "/painel/perfis", titulo: "Perfis", descricao: "Gestão de usuários (admin)" }]
    : cartoes;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Painel de gestão</h1>
        <p className="text-sm text-stone-500">Bem-vindo(a), {usuario?.nome || usuario?.email}.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="flex h-full flex-col gap-1 p-4 transition-shadow hover:shadow-md">
              <h2 className="font-semibold text-stone-900 dark:text-stone-100">{item.titulo}</h2>
              <p className="text-sm text-stone-500">{item.descricao}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
