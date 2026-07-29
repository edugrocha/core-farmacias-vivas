"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Button, LinkButton } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const links = [
  { href: "/", label: "Início" },
  { href: "/plantas", label: "Catálogo" },
  { href: "/hortos", label: "Hortos" },
];

export function Header() {
  const { usuario, isEspecialista, logout, carregando } = useAuth();
  const pathname = usePathname();

  const itens = isEspecialista ? [...links, { href: "/painel", label: "Painel" }] : links;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-primary-ink">
            🌿
          </span>
          <span>Farmácias Vivas</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-stone-200 bg-stone-50 p-1 text-sm dark:border-stone-800 dark:bg-stone-900 sm:flex">
          {itens.map((item) => {
            const ativo = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${
                  ativo
                    ? "bg-ink text-primary-ink"
                    : "text-stone-600 hover:bg-white dark:text-stone-300 dark:hover:bg-stone-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {carregando ? null : usuario ? (
            <>
              <Link
                href="/meu-perfil"
                className="hidden text-sm text-stone-600 hover:text-primary-700 dark:text-stone-300 sm:inline"
              >
                {usuario.nome || usuario.email}
              </Link>
              <Button variant="secondary" onClick={() => logout()}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost">
                Entrar
              </LinkButton>
              <LinkButton href="/registro" variant="primary">
                Cadastrar
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
