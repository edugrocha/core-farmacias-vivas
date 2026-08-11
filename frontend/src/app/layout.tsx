import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Aplica a classe "dark" antes da primeira pintura, evitando flash de tema
// incorreto. Prioriza a preferência salva pelo usuário; sem ela, segue o
// prefers-color-scheme do sistema.
const scriptAntiFlash = `
(function() {
  try {
    var salvo = localStorage.getItem('fv_tema');
    var escuro = salvo ? salvo === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', escuro);
  } catch (e) {}
})();
`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farmácias Vivas — Catálogo Botânico",
  description: "Catálogo de plantas medicinais e hortos do projeto de extensão IFPE Jaboatão dos Guararapes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="anti-flash-tema"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: scriptAntiFlash }}
        />
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
