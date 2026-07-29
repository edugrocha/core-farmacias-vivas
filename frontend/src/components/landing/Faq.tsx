const perguntas = [
  {
    pergunta: "Como funciona a curadoria de uma planta?",
    resposta:
      "Toda planta cadastrada por um especialista entra como rascunho. Ela só aparece no catálogo público depois de ser revisada e publicada por um especialista técnico, garantindo que as informações terapêuticas sejam confiáveis.",
  },
  {
    pergunta: "Quem pode ser especialista no sistema?",
    resposta:
      "Contas de especialista e administrador são atribuídas manualmente pela equipe técnica do projeto. Qualquer pessoa pode se cadastrar como usuário da comunidade e, depois, ser promovida conforme seu vínculo com o projeto.",
  },
  {
    pergunta: "Como encontro o horto medicinal mais próximo de mim?",
    resposta:
      "Na página de Hortos, você pode permitir o acesso à sua localização (ou informar latitude/longitude manualmente) para ver todos os hortos ativos ordenados por distância real, com mapa interativo.",
  },
  {
    pergunta: "Como faço parte da comunidade Farmácias Vivas?",
    resposta:
      "Basta criar uma conta gratuita na página de cadastro. Você poderá consultar o catálogo completo, seu perfil e acompanhar os hortos parceiros do projeto de extensão do IFPE.",
  },
];

export function Faq() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-2">
      {perguntas.map((item) => (
        <details
          key={item.pergunta}
          className="group rounded-2xl border border-stone-200/70 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/40"
        >
          <summary className="cursor-pointer list-none font-medium text-stone-900 marker:content-none dark:text-stone-100">
            <span className="mr-2 inline-block text-primary-700 transition-transform group-open:rotate-90">
              ▸
            </span>
            {item.pergunta}
          </summary>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">{item.resposta}</p>
        </details>
      ))}
    </div>
  );
}
