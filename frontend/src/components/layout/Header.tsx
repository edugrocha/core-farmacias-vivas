"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Button, LinkButton } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  const { usuario, isEspecialista, logout, carregando } = useAuth();

  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary-700 dark:text-primary-500">
          <span>🌿</span>
          <span>Farmácias Vivas</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-300">
          <Link href="/" className="hover:text-primary-700">
            Início
          </Link>
          <Link href="/plantas" className="hover:text-primary-700">
            Catálogo
          </Link>
          <Link href="/hortos" className="hover:text-primary-700">
            Hortos
          </Link>
          {isEspecialista && (
            <Link href="/painel" className="hover:text-primary-700">
              Painel
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {carregando ? null : usuario ? (
            <>
              <Link href="/meu-perfil" className="text-sm text-stone-600 hover:text-primary-700 dark:text-stone-300">
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
