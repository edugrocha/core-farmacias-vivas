"use client";

import { tokenStore } from "@/lib/auth/tokenStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

/** Extrai uma mensagem legível do formato padrão de erro de validação do DRF:
 * `{"campo": ["mensagem"], "outro_campo": ["mensagem"]}`. */
function mensagemDeErroDeCampos(detail: unknown): string | null {
  if (typeof detail !== "object" || detail === null || Array.isArray(detail)) return null;
  const partes = Object.entries(detail as Record<string, unknown>)
    .filter(([chave]) => chave !== "detail")
    .map(([campo, mensagens]) => {
      const texto = Array.isArray(mensagens) ? mensagens.join(" ") : String(mensagens);
      return `${campo}: ${texto}`;
    });
  return partes.length > 0 ? partes.join(" | ") : null;
}

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(
      typeof detail === "string"
        ? detail
        : ((detail as { detail?: string })?.detail ??
          mensagemDeErroDeCampos(detail) ??
          `Erro HTTP ${status}`)
    );
    this.status = status;
    this.detail = detail;
  }
}

async function tentarRenovarToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    tokenStore.set(data.access, tokenStore.getUsuario());
    return data.access as string;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  { retry = true }: { retry?: boolean } = {}
): Promise<T> {
  const token = tokenStore.getAccessToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const novoToken = await tentarRenovarToken();
    if (novoToken) {
      return apiFetch<T>(path, options, { retry: false });
    }
    tokenStore.clear();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Sessão expirada.");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : null;

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
}

/** Permite que as funções de create/update aceitem tanto um objeto (JSON)
 * quanto um FormData (quando há upload de arquivo) sem duplicar lógica. */
export function corpoRequisicao(dados: unknown): BodyInit {
  return dados instanceof FormData ? dados : JSON.stringify(dados);
}

export function buildQuery<T extends object>(params: T): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}
