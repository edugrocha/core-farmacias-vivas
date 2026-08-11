import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAMES } from "@/lib/auth/session.server";
import type { UsuarioSessao } from "@/lib/api/types";

// Checagem otimista: só lê os cookies, sem chamar o backend. A autorização
// real continua sendo garantida pelas permissões do Django em cada endpoint.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/painel")) {
    return NextResponse.next();
  }

  const refresh = request.cookies.get(SESSION_COOKIE_NAMES.refresh)?.value;
  if (!refresh) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const usuarioRaw = request.cookies.get(SESSION_COOKIE_NAMES.usuario)?.value;
  let usuario: UsuarioSessao | null = null;
  try {
    usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
  } catch {
    usuario = null;
  }

  const isEspecialista =
    usuario?.tipo_perfil === "ESPECIALISTA" || usuario?.tipo_perfil === "ADMIN";

  if (!isEspecialista) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/painel/perfis") && usuario?.tipo_perfil !== "ADMIN") {
    return NextResponse.redirect(new URL("/painel", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/painel/:path*",
};
