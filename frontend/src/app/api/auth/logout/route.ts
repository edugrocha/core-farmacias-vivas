import { NextResponse } from "next/server";
import { lerSessao, limparSessao } from "@/lib/auth/session.server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export async function POST() {
  const { access, refresh } = await lerSessao();

  if (access && refresh) {
    try {
      await fetch(`${API_URL}/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Mesmo se o backend falhar, a sessão local é limpa abaixo.
    }
  }

  await limparSessao();
  return NextResponse.json({ ok: true });
}
