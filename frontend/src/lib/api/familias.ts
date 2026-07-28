import { apiFetch, buildQuery } from "./client";
import type { FamiliaBotanica, Paginacao } from "./types";

export function listFamilias(params: { search?: string; page?: number } = {}) {
  return apiFetch<Paginacao<FamiliaBotanica>>(`/familias/${buildQuery(params)}`);
}

export function getFamilia(id: number | string) {
  return apiFetch<FamiliaBotanica>(`/familias/${id}/`);
}

export function createFamilia(dados: Partial<FamiliaBotanica>) {
  return apiFetch<FamiliaBotanica>(`/familias/`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function updateFamilia(id: number | string, dados: Partial<FamiliaBotanica>) {
  return apiFetch<FamiliaBotanica>(`/familias/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export function deleteFamilia(id: number | string) {
  return apiFetch<void>(`/familias/${id}/`, { method: "DELETE" });
}
