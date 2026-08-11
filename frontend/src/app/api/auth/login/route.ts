import { NextResponse } from "next/server";
import { salvarSessao } from "@/lib/auth/session.server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const djangoRes = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await djangoRes.json().catch(() => null);

  if (!djangoRes.ok) {
    return NextResponse.json(
      { detail: data?.detail ?? "Usuário ou senha inválidos." },
      { status: djangoRes.status }
    );
  }

  await salvarSessao(data.access, data.refresh, data.usuario);

  return NextResponse.json({ usuario: data.usuario, access: data.access });
}
