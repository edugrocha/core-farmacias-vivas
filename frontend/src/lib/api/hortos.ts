import { apiFetch, buildQuery } from "./client";
import type { Horto, HortosProximosResponse, Paginacao } from "./types";

export interface FiltrosHortos {
  status?: string;
  uf?: string;
  municipio?: string;
  instituicao?: number;
  search?: string;
  page?: number;
}

export function listHortos(filtros: FiltrosHortos = {}) {
  return apiFetch<Paginacao<Horto>>(`/hortos/${buildQuery(filtros)}`);
}

export function getHorto(id: number | string) {
  return apiFetch<Horto>(`/hortos/${id}/`);
}

export function createHorto(dados: Partial<Horto>) {
  return apiFetch<Horto>(`/hortos/`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function updateHorto(id: number | string, dados: Partial<Horto>) {
  return apiFetch<Horto>(`/hortos/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export function deleteHorto(id: number | string) {
  return apiFetch<void>(`/hortos/${id}/`, { method: "DELETE" });
}

export interface FiltrosProximos {
  lat: number;
  lon: number;
  planta_id?: number;
  municipio?: string;
  uf?: string;
}

export function hortosProximos(filtros: FiltrosProximos) {
  return apiFetch<HortosProximosResponse>(`/hortos/proximos/${buildQuery(filtros)}`);
}
