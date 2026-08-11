"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await login(username, password);
      router.push(searchParams.get("next") ?? "/");
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Entrar</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField label="Usuário" required value={username} onChange={(e) => setUsername(e.target.value)} />
        <FormField
          label="Senha"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {erro && <ErrorBlock mensagem={erro} />}
        <Button type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <p className="text-center text-sm text-stone-500">
        Não tem conta?{" "}
        <Link href="/registro" className="text-primary-700 underline">
          Cadastre-se
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
