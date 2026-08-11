"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

const links = [
  { href: "/painel", label: "Visão geral", icon: "🏠", exact: true },
  { href: "/painel/plantas", label: "Plantas", icon: "🌿" },
  { href: "/painel/familias", label: "Famílias botânicas", icon: "🧬" },
  { href: "/painel/hortos", label: "Hortos", icon: "📍" },
  { href: "/painel/instituicoes", label: "Instituições", icon: "🏛️" },
  { href: "/painel/inventario", label: "Inventário", icon: "📦" },
];

export function PainelSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const itens = isAdmin
    ? [...links, { href: "/painel/perfis", label: "Perfis (admin)", icon: "👤" }]
    : links;

  return (
    <aside className="w-60 shrink-0 py-6 pr-4">
      <nav className="flex flex-col gap-1 rounded-2xl border border-stone-200/70 bg-white p-2 text-sm shadow-[0_1px_2px_rgba(16,20,12,0.04),0_8px_24px_-12px_rgba(16,20,12,0.12)] dark:border-stone-800 dark:bg-stone-900/40">
        {itens.map((item) => {
          const ativo = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors ${
                ativo
                  ? "bg-ink text-primary-ink font-medium"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
