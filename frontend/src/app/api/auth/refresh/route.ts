import { NextResponse } from "next/server";
import { atualizarTokens, lerSessao, limparSessao } from "@/lib/auth/session.server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export async function POST() {
  const { refresh } = await lerSessao();

  if (!refresh) {
    return NextResponse.json({ detail: "Sem sessão ativa." }, { status: 401 });
  }

  const djangoRes = await fetch(`${API_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!djangoRes.ok) {
    await limparSessao();
    return NextResponse.json({ detail: "Sessão expirada." }, { status: 401 });
  }

  const data = await djangoRes.json();
  // ROTATE_REFRESH_TOKENS=True no backend: cada refresh emite um novo refresh
  // token e invalida o anterior (BLACKLIST_AFTER_ROTATION=True) — é preciso
  // persistir os dois, não só o access.
  await atualizarTokens(data.access, data.refresh);

  return NextResponse.json({ access: data.access });
}
