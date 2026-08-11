import "server-only";
import { cookies } from "next/headers";
import type { UsuarioSessao } from "@/lib/api/types";

const ACCESS_COOKIE = "fv_access";
const REFRESH_COOKIE = "fv_refresh";
const USUARIO_COOKIE = "fv_usuario";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function salvarSessao(
  access: string,
  refresh: string,
  usuario: UsuarioSessao
) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, access, { ...cookieOptions, maxAge: 60 * 60 * 8 });
  cookieStore.set(REFRESH_COOKIE, refresh, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 });
  cookieStore.set(USUARIO_COOKIE, JSON.stringify(usuario), {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function atualizarAccessToken(access: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, access, { ...cookieOptions, maxAge: 60 * 60 * 8 });
}

export async function atualizarTokens(access: string, refresh: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, access, { ...cookieOptions, maxAge: 60 * 60 * 8 });
  cookieStore.set(REFRESH_COOKIE, refresh, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 });
}

export async function limparSessao() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  cookieStore.delete(USUARIO_COOKIE);
}

export async function lerSessao(): Promise<{
  access: string | null;
  refresh: string | null;
  usuario: UsuarioSessao | null;
}> {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_COOKIE)?.value ?? null;
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value ?? null;
  const usuarioRaw = cookieStore.get(USUARIO_COOKIE)?.value;
  let usuario: UsuarioSessao | null = null;
  if (usuarioRaw) {
    try {
      usuario = JSON.parse(usuarioRaw);
    } catch {
      usuario = null;
    }
  }
  return { access, refresh, usuario };
}

export function temSessaoCookie(request: { cookies: { get(name: string): { value: string } | undefined } }) {
  return Boolean(request.cookies.get(REFRESH_COOKIE)?.value);
}

export const SESSION_COOKIE_NAMES = {
  access: ACCESS_COOKIE,
  refresh: REFRESH_COOKIE,
  usuario: USUARIO_COOKIE,
};
