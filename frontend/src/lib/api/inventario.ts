import { apiFetch, buildQuery } from "./client";
import type { ItemInventario, Paginacao } from "./types";

export interface FiltrosInventario {
  horto?: number;
  planta?: number;
  disponibilidade?: string;
  page?: number;
}

export function listInventario(filtros: FiltrosInventario = {}) {
  return apiFetch<Paginacao<ItemInventario>>(`/inventario/${buildQuery(filtros)}`);
}

export function getItemInventario(id: number | string) {
  return apiFetch<ItemInventario>(`/inventario/${id}/`);
}

export function createItemInventario(dados: Partial<ItemInventario>) {
  return apiFetch<ItemInventario>(`/inventario/`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function updateItemInventario(id: number | string, dados: Partial<ItemInventario>) {
  return apiFetch<ItemInventario>(`/inventario/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export function deleteItemInventario(id: number | string) {
  return apiFetch<void>(`/inventario/${id}/`, { method: "DELETE" });
}
