"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registrar } from "@/lib/api/auth";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorBlock } from "@/components/ui/Spinner";
import { mensagemErro } from "@/lib/format";

export default function RegistroPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    telefone: "",
    password: "",
    password2: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  function set<K extends keyof typeof form>(campo: K, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await registrar(form);
      setSucesso(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">Criar conta</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField label="Usuário" required value={form.username} onChange={(e) => set("username", e.target.value)} />
        <FormField
          label="E-mail"
          type="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nome" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
          <FormField label="Sobrenome" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
        </div>
        <FormField label="Telefone" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
        <FormField
          label="Senha"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
        />
        <FormField
          label="Confirmar senha"
          type="password"
          required
          value={form.password2}
          onChange={(e) => set("password2", e.target.value)}
        />
        {erro && <ErrorBlock mensagem={erro} />}
        {sucesso && <p className="text-sm text-success">Conta criada! Redirecionando para o login...</p>}
        <Button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Cadastrar"}
        </Button>
      </form>
      <p className="text-center text-sm text-stone-500">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary-700 underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
