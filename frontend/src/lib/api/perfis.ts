import { apiFetch, buildQuery } from "./client";
import type { Paginacao, Usuario } from "./types";

export interface FiltrosPerfis {
  tipo_perfil?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
}

export function listPerfis(filtros: FiltrosPerfis = {}) {
  return apiFetch<Paginacao<Usuario>>(`/perfis/${buildQuery(filtros)}`);
}

export function getPerfil(id: number | string) {
  return apiFetch<Usuario>(`/perfis/${id}/`);
}

export interface CriarPerfilPayload {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  telefone?: string;
  instituicao?: string;
  tipo_perfil: string;
  password: string;
}

export function createPerfil(dados: CriarPerfilPayload) {
  return apiFetch<Usuario>(`/perfis/`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function updatePerfil(id: number | string, dados: Partial<Usuario>) {
  return apiFetch<Usuario>(`/perfis/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export function desativarPerfil(id: number | string) {
  return apiFetch<void>(`/perfis/${id}/`, { method: "DELETE" });
}

export function getMeuPerfil() {
  return apiFetch<Usuario>(`/meu-perfil/`);
}

export function updateMeuPerfil(dados: Partial<Usuario>) {
  return apiFetch<Usuario>(`/meu-perfil/`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}
