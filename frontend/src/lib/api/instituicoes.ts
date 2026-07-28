import { apiFetch, buildQuery } from "./client";
import type { Instituicao, Paginacao } from "./types";

export function listInstituicoes(params: { search?: string; page?: number } = {}) {
  return apiFetch<Paginacao<Instituicao>>(`/instituicoes/${buildQuery(params)}`);
}

export function getInstituicao(id: number | string) {
  return apiFetch<Instituicao>(`/instituicoes/${id}/`);
}

export function createInstituicao(dados: Partial<Instituicao>) {
  return apiFetch<Instituicao>(`/instituicoes/`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function updateInstituicao(id: number | string, dados: Partial<Instituicao>) {
  return apiFetch<Instituicao>(`/instituicoes/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export function deleteInstituicao(id: number | string) {
  return apiFetch<void>(`/instituicoes/${id}/`, { method: "DELETE" });
}
