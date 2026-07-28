import { apiFetch, buildQuery, corpoRequisicao } from "./client";
import type { Paginacao, Planta } from "./types";

export interface FiltrosPlantas {
  nome?: string;
  familia?: number;
  toxicidade?: string;
  status?: string;
  uso?: string;
  regiao?: string;
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export function listPlantas(filtros: FiltrosPlantas = {}) {
  return apiFetch<Paginacao<Planta>>(`/plantas/${buildQuery(filtros)}`);
}

export function getPlanta(id: number | string) {
  return apiFetch<Planta>(`/plantas/${id}/`);
}

export function createPlanta(dados: Partial<Planta> | FormData) {
  return apiFetch<Planta>(`/plantas/`, {
    method: "POST",
    body: corpoRequisicao(dados),
  });
}

export function updatePlanta(id: number | string, dados: Partial<Planta> | FormData) {
  return apiFetch<Planta>(`/plantas/${id}/`, {
    method: "PATCH",
    body: corpoRequisicao(dados),
  });
}

export function deletePlanta(id: number | string) {
  return apiFetch<void>(`/plantas/${id}/`, { method: "DELETE" });
}

export function publicarPlanta(id: number | string) {
  return apiFetch<Planta>(`/plantas/${id}/publicar/`, { method: "POST" });
}
