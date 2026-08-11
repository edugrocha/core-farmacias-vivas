"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { buscarSessao, login as loginRequest, logout as logoutRequest } from "@/lib/api/auth";
import { tokenStore } from "./tokenStore";
import type { UsuarioSessao } from "@/lib/api/types";

interface AuthContextValue {
  usuario: UsuarioSessao | null;
  carregando: boolean;
  isEspecialista: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = tokenStore.subscribe(setUsuario);

    buscarSessao()
      .then(({ usuario, access }) => {
        tokenStore.set(access, usuario);
      })
      .finally(() => setCarregando(false));

    return unsubscribe;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { access, usuario } = await loginRequest(username, password);
    tokenStore.set(access, usuario);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    tokenStore.clear();
    router.push("/login");
  }, [router]);

  const isEspecialista = usuario?.tipo_perfil === "ESPECIALISTA" || usuario?.tipo_perfil === "ADMIN";
  const isAdmin = usuario?.tipo_perfil === "ADMIN";

  return (
    <AuthContext.Provider value={{ usuario, carregando, isEspecialista, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
