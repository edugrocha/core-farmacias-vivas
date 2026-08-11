import { apiFetch } from "./client";
import type { UsuarioSessao } from "./types";

export interface LoginResponse {
  access: string;
  usuario: UsuarioSessao;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.detail ?? "Usuário ou senha inválidos.");
  }
  return data as LoginResponse;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export interface SessaoAtual {
  usuario: UsuarioSessao | null;
  access: string | null;
}

export async function buscarSessao(): Promise<SessaoAtual> {
  const res = await fetch("/api/auth/session");
  if (!res.ok) return { usuario: null, access: null };
  return res.json();
}

export interface RegistroPayload {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  telefone?: string;
  password: string;
  password2: string;
}

export function registrar(dados: RegistroPayload) {
  return apiFetch(`/auth/registro/`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}
