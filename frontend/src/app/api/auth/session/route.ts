import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth/session.server";

export async function GET() {
  const { access, usuario } = await lerSessao();

  if (!access || !usuario) {
    return NextResponse.json({ usuario: null, access: null }, { status: 200 });
  }

  return NextResponse.json({ usuario, access });
}
