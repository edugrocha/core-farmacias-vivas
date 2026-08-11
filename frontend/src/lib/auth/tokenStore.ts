"use client";

import type { UsuarioSessao } from "@/lib/api/types";

type Listener = (usuario: UsuarioSessao | null) => void;

let accessToken: string | null = null;
let usuario: UsuarioSessao | null = null;
const listeners = new Set<Listener>();

export const tokenStore = {
  getAccessToken(): string | null {
    return accessToken;
  },
  getUsuario(): UsuarioSessao | null {
    return usuario;
  },
  set(novoAccessToken: string | null, novoUsuario: UsuarioSessao | null) {
    accessToken = novoAccessToken;
    usuario = novoUsuario;
    listeners.forEach((listener) => listener(usuario));
  },
  clear() {
    accessToken = null;
    usuario = null;
    listeners.forEach((listener) => listener(null));
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
