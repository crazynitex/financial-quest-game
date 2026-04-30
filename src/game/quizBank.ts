// Banco de perguntas para o jogo "Jornada do Consórcio".
// Cada pergunta tem dificuldade (que vira XP/progresso) e capítulo temático.

export type Difficulty = "easy" | "medium" | "hard" | "boss";

export interface QuizQuestion {
  id: string;
  chapter: number; // 1..4
  difficulty: Difficulty;
  emoji: string;
  question: string;
  options: { label: string; correct: boolean; explain: string }[];
  hint: string;
}

export const CHAPTERS = [
  { id: 1, title: "Fundamentos do Consórcio", emoji: "🤝", desc: "Entenda o básico: como funciona, sem juros." },
  { id: 2, title: "Lance & Contemplação", emoji: "🎯", desc: "Estratégias para receber sua carta antes." },
  { id: 3, title: "Carta de Crédito na Prática", emoji: "💳", desc: "Como usar a carta com mais poder." },
  { id: 4, title: "Mestre das Finanças", emoji: "🏆", desc: "Decisões avançadas e armadilhas comuns." },
];

const D = {
  easy: { xp: 15, progress: 2, cash: 80 },
  medium: { xp: 30, progress: 4, cash: 180 },
  hard: { xp: 60, progress: 7, cash: 350 },
  boss: { xp: 120, progress: 14, cash: 700 },
} as const;

export const reward = (d: Difficulty) => D[d];

export const QUIZ_BANK: QuizQuestion[] = [
  // ============ CAPÍTULO 1 — Fundamentos ============
  {
    id: "q1", chapter: 1, difficulty: "easy", emoji: "🤝",
    question: "O que é um consórcio?",
    hint: "Pense em um grupo de pessoas com um objetivo em comum.",
    options: [
      { label: "Um empréstimo bancário", correct: false, explain: "Empréstimo envolve juros. Consórcio é diferente." },
      { label: "Grupo de pessoas que se unem para comprar um bem", correct: true, explain: "Exato! Cada um contribui mensalmente e todo mês alguém é contemplado." },
      { label: "Investimento de renda variável", correct: false, explain: "Não é investimento — é uma forma de compra programada." },
    ],
  },
  {
    id: "q2", chapter: 1, difficulty: "easy", emoji: "💸",
    question: "O consórcio cobra juros?",
    hint: "Existe taxa, mas não é juros bancário.",
    options: [
      { label: "Sim, juros altos como financiamento", correct: false, explain: "Não — essa é uma confusão comum." },
      { label: "Não. Apenas taxa de administração", correct: true, explain: "Isso! A taxa de administração é diluída no prazo, geralmente entre 15-20%." },
      { label: "Sim, mas só nos primeiros meses", correct: false, explain: "Não há juros em nenhum momento do consórcio." },
    ],
  },
  {
    id: "q3", chapter: 1, difficulty: "medium", emoji: "📊",
    question: "Comparando R$ 80.000: financiamento (60x, 1.8% a.m.) vs consórcio (80x, 18% admin). Qual é mais barato no total?",
    hint: "Lembre-se: juros compostos são exponenciais.",
    options: [
      { label: "Financiamento (~R$ 140k total)", correct: false, explain: "Financiamento sai bem mais caro pelos juros compostos." },
      { label: "Consórcio (~R$ 94k total)", correct: true, explain: "Consórcio: R$ 80k + 18% = ~R$ 94k. Economia de quase R$ 46k!" },
      { label: "Custo igual nos dois", correct: false, explain: "Diferença é gigante a favor do consórcio." },
    ],
  },
  {
    id: "q4", chapter: 1, difficulty: "medium", emoji: "📅",
    question: "Quem pode ser contemplado em um consórcio?",
    hint: "Existem duas formas: uma depende de sorte, outra de estratégia.",
    options: [
      { label: "Apenas quem está no grupo há mais tempo", correct: false, explain: "Tempo no grupo não garante contemplação." },
      { label: "Por sorteio mensal OU por lance", correct: true, explain: "Todo mês há um sorteio, mas você também pode dar um lance para passar na frente." },
      { label: "Só quem paga 50% à vista", correct: false, explain: "Não é assim. Lances podem ser bem menores." },
    ],
  },
  {
    id: "q5", chapter: 1, difficulty: "hard", emoji: "🧮",
    question: "Sua renda é R$ 4.000. Qual é a parcela MÁXIMA recomendada para um consórcio?",
    hint: "Regra de ouro: comprometa no máximo 30% da renda com dívidas.",
    options: [
      { label: "R$ 2.000 (50%)", correct: false, explain: "Sufoca o orçamento e impede reserva de emergência." },
      { label: "R$ 1.200 (30%)", correct: true, explain: "30% é o teto saudável. Sobra para essenciais e imprevistos." },
      { label: "R$ 3.000 (75%)", correct: false, explain: "Inadimplência praticamente garantida." },
    ],
  },

  // ============ CAPÍTULO 2 — Lance & Contemplação ============
  {
    id: "q6", chapter: 2, difficulty: "easy", emoji: "🎯",
    question: "O que é um 'lance' no consórcio?",
    hint: "É uma forma de oferecer algo a mais para ser contemplado antes.",
    options: [
      { label: "Uma multa por atraso", correct: false, explain: "Lance é o oposto: é estratégia, não penalidade." },
      { label: "Oferta antecipada de parcelas para ser contemplado", correct: true, explain: "Quem dá o maior lance no mês ganha a carta de crédito." },
      { label: "Uma taxa extra mensal", correct: false, explain: "Não — lance é opcional e estratégico." },
    ],
  },
  {
    id: "q7", chapter: 2, difficulty: "medium", emoji: "💡",
    question: "Você tem R$ 5.000 sobrando. Vale a pena dar lance?",
    hint: "Lance não é gasto: ele abate parcelas futuras.",
    options: [
      { label: "Não, é dinheiro perdido", correct: false, explain: "Errado! O lance abate as parcelas finais — não é gasto." },
      { label: "Sim — antecipa o bem e reduz parcelas finais", correct: true, explain: "Dupla vantagem: você recebe o bem antes E paga menos no total." },
      { label: "Só se for valor alto (50% da carta)", correct: false, explain: "Mesmo lances pequenos podem ganhar em meses fracos." },
    ],
  },
  {
    id: "q8", chapter: 2, difficulty: "medium", emoji: "🆚",
    question: "Lance LIVRE vs lance EMBUTIDO — qual a diferença?",
    hint: "Um sai do seu bolso, o outro sai da carta de crédito.",
    options: [
      { label: "Livre: você paga. Embutido: usa parte da carta", correct: true, explain: "Embutido reduz o valor da carta efetiva, mas não exige desembolso." },
      { label: "São a mesma coisa", correct: false, explain: "Não — a origem do dinheiro muda completamente a estratégia." },
      { label: "Livre é só para imóveis", correct: false, explain: "Ambos servem para qualquer categoria." },
    ],
  },
  {
    id: "q9", chapter: 2, difficulty: "hard", emoji: "📈",
    question: "Em qual cenário o lance tem MAIOR chance de ganhar?",
    hint: "Pense na competição com outros consorciados.",
    options: [
      { label: "Em meses de fim de ano (Dez)", correct: false, explain: "Geralmente mais gente dá lance nessa época." },
      { label: "Quando poucos consorciados oferecem lance", correct: true, explain: "Lance funciona como leilão — menos competição = lance menor vence." },
      { label: "Sempre tem a mesma chance", correct: false, explain: "Não. A chance varia mês a mês conforme o grupo." },
    ],
  },
  {
    id: "q10", chapter: 2, difficulty: "boss", emoji: "👑",
    question: "BOSS QUIZ: Você quer comprar um carro de R$ 80k em até 24 meses. Melhor estratégia?",
    hint: "Combine sorteio mensal + lance estratégico.",
    options: [
      { label: "Esperar só pelo sorteio sem dar lance", correct: false, explain: "Sorte demora — pode levar 60+ meses." },
      { label: "Consórcio + reservar 5-10% para lance no mês 6-12", correct: true, explain: "Estratégia de pro: paga normalmente e usa lance assim que possível." },
      { label: "Financiamento direto, é mais rápido", correct: false, explain: "Mais rápido mas custa quase 2x mais em juros." },
    ],
  },

  // ============ CAPÍTULO 3 — Carta de Crédito ============
  {
    id: "q11", chapter: 3, difficulty: "easy", emoji: "💳",
    question: "Quando contemplado, o que é a 'carta de crédito'?",
    hint: "É o valor combinado para você comprar o bem.",
    options: [
      { label: "Um cartão de crédito comum", correct: false, explain: "Não confunda — não é cartão." },
      { label: "Valor liberado para você comprar o bem à vista", correct: true, explain: "A carta funciona como dinheiro à vista para você negociar." },
      { label: "Um vale-presente da consorciadora", correct: false, explain: "É bem mais poderoso que isso." },
    ],
  },
  {
    id: "q12", chapter: 3, difficulty: "medium", emoji: "🛒",
    question: "Você foi contemplado com R$ 80k. Como conseguir desconto extra?",
    hint: "Vendedores adoram pagamento à vista.",
    options: [
      { label: "Negociar 5-15% de desconto à vista", correct: true, explain: "Pagamento integral é arma de negociação. Desconto é praxe." },
      { label: "Aceitar o preço de tabela", correct: false, explain: "Está deixando dinheiro na mesa." },
      { label: "Parcelar mesmo com a carta", correct: false, explain: "Você perde todo o poder do pagamento à vista." },
    ],
  },
  {
    id: "q13", chapter: 3, difficulty: "medium", emoji: "🏠",
    question: "Carta de imóvel pode ser usada para qualquer imóvel?",
    hint: "A categoria limita, mas há muita flexibilidade dentro dela.",
    options: [
      { label: "Só em imóveis novos da construtora parceira", correct: false, explain: "Não — pode ser novo, usado, em qualquer cidade do Brasil." },
      { label: "Sim, novo ou usado, em qualquer cidade do Brasil", correct: true, explain: "Total liberdade dentro da categoria contratada." },
      { label: "Só imóveis de até R$ 500k", correct: false, explain: "O limite é o valor da sua carta, não um teto fixo." },
    ],
  },
  {
    id: "q14", chapter: 3, difficulty: "hard", emoji: "🔄",
    question: "Carta sobrando após a compra — o que fazer?",
    hint: "Não é dinheiro vivo na sua conta, mas tem usos válidos.",
    options: [
      { label: "Usar para quitar parcelas restantes do consórcio", correct: true, explain: "Excedente abate suas parcelas — reduz o tempo de pagamento." },
      { label: "Sacar como dinheiro vivo", correct: false, explain: "Não pode ser sacado, só usado dentro das regras." },
      { label: "Comprar outro bem de categoria diferente", correct: false, explain: "Categoria é fixa — carta de imóvel não vira carta de carro." },
    ],
  },

  // ============ CAPÍTULO 4 — Mestre das Finanças ============
  {
    id: "q15", chapter: 4, difficulty: "medium", emoji: "🛡️",
    question: "Quanto você deve ter de reserva de emergência ANTES de entrar num consórcio?",
    hint: "Pense em meses de despesas, não em valor fixo.",
    options: [
      { label: "1 mês de despesas", correct: false, explain: "Pouco — qualquer imprevisto te deixa inadimplente." },
      { label: "3 a 6 meses de despesas", correct: true, explain: "Padrão de ouro da educação financeira." },
      { label: "Não precisa de reserva", correct: false, explain: "Sem reserva, qualquer evento adverso vira tragédia." },
    ],
  },
  {
    id: "q16", chapter: 4, difficulty: "medium", emoji: "⚠️",
    question: "Alguém oferece 'investimento garantido' de 10% ao mês. O que fazer?",
    hint: "Compare com a Selic, que é o teto de retorno seguro.",
    options: [
      { label: "Investir tudo agora", correct: false, explain: "ARMADILHA. Promessa fixa de 10% a.m. é sempre pirâmide ou golpe." },
      { label: "Recusar — é golpe ou pirâmide", correct: true, explain: "Selic ronda 1% a.m. Qualquer 'garantia' acima é fraude." },
      { label: "Investir só metade", correct: false, explain: "Mesmo metade num golpe é dinheiro perdido." },
    ],
  },
  {
    id: "q17", chapter: 4, difficulty: "hard", emoji: "💼",
    question: "Você ganhou um bônus de R$ 5k. Melhor uso?",
    hint: "Pense em retorno financeiro de longo prazo.",
    options: [
      { label: "Lance no consórcio para antecipar contemplação", correct: true, explain: "Acelera objetivo + abate parcelas. Melhor ROI." },
      { label: "Trocar o celular novo", correct: false, explain: "Lifestyle inflation — derruba quem ganha bônus." },
      { label: "Deixar parado na conta corrente", correct: false, explain: "Inflação corrói. Faça o dinheiro trabalhar." },
    ],
  },
  {
    id: "q18", chapter: 4, difficulty: "hard", emoji: "🧠",
    question: "Regra 50/30/20 — o que significa?",
    hint: "Divisão clássica do orçamento mensal.",
    options: [
      { label: "50% essenciais, 30% desejos, 20% metas/investimento", correct: true, explain: "Padrão simples e poderoso para organizar finanças." },
      { label: "50% poupança, 30% lazer, 20% contas", correct: false, explain: "Inverteu a lógica — essenciais vêm primeiro." },
      { label: "50% renda, 30% gastos, 20% imposto", correct: false, explain: "Não é sobre como recebe — é sobre como divide." },
    ],
  },
  {
    id: "q19", chapter: 4, difficulty: "boss", emoji: "🏆",
    question: "BOSS FINAL: Cliente quer comprar uma casa em 5 anos. Estratégia ideal?",
    hint: "Combine educação financeira + ferramenta certa.",
    options: [
      { label: "Financiar — é mais rápido e prático", correct: false, explain: "Em 5 anos você paga quase 2x o valor em juros." },
      { label: "Consórcio + reserva + lance estratégico no meio do prazo", correct: true, explain: "Casamento perfeito: economia, planejamento e flexibilidade." },
      { label: "Poupar tudo na poupança", correct: false, explain: "Poupança perde até para a inflação. Demoraria décadas." },
    ],
  },
  {
    id: "q20", chapter: 4, difficulty: "boss", emoji: "🎓",
    question: "BOSS FINAL: A maior vantagem do consórcio sobre financiamento é:",
    hint: "Pense no custo total ao final do prazo.",
    options: [
      { label: "Você recebe o bem na hora", correct: false, explain: "Isso é vantagem do FINANCIAMENTO, não do consórcio." },
      { label: "Custo total muito menor (sem juros)", correct: true, explain: "Economia que pode chegar a 40-50% comparado a financiamento longo." },
      { label: "Não precisa de comprovação de renda", correct: false, explain: "Renda é avaliada também — embora análise seja mais flexível." },
    ],
  },
];

export const questionsByChapter = (chapter: number) =>
  QUIZ_BANK.filter((q) => q.chapter === chapter);

export const totalQuestions = QUIZ_BANK.length;
