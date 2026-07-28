"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

const links = [
  { href: "/painel", label: "Visão geral", exact: true },
  { href: "/painel/plantas", label: "Plantas" },
  { href: "/painel/familias", label: "Famílias botânicas" },
  { href: "/painel/hortos", label: "Hortos" },
  { href: "/painel/instituicoes", label: "Instituições" },
  { href: "/painel/inventario", label: "Inventário" },
];

export function PainelSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const itens = isAdmin ? [...links, { href: "/painel/perfis", label: "Perfis (admin)" }] : links;

  return (
    <aside className="w-56 shrink-0 border-r border-stone-200 py-6 pr-4 dark:border-stone-800">
      <nav className="flex flex-col gap-1 text-sm">
        {itens.map((item) => {
          const ativo = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 transition-colors ${
                ativo
                  ? "bg-primary-100 text-primary-700 font-medium dark:bg-primary-700/20"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
