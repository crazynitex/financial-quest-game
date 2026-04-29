export type GoalType = "house" | "car" | "travel";

export interface Character {
  name: string;
  age: number;
  income: number; // monthly income
  goal: GoalType;
}

export interface GameState {
  character: Character;
  cash: number;
  savings: number;
  invested: number;
  monthlyExpenses: number; // gastos fixos mensais
  month: number;
  level: number;
  xp: number;
  finScore: number; // 0-100
  decisions: Decision[];
  achievements: string[];
  activeStrategy: "none" | "savings" | "financing" | "consortium";
  strategyData?: {
    monthlyPayment: number;
    monthsTotal: number;
    monthsPaid: number;
    totalCost: number;
    targetValue: number;
    contemplated?: boolean;
  };
  finished: boolean;
  gameOver: boolean;
  gameOverReason?: string;
  lessonsCompleted: string[];
}

// Mini-lições interativas sobre consórcio
export interface Lesson {
  id: string;
  title: string;
  emoji: string;
  duration: string;
  steps: { title: string; body: string }[];
  quiz: { question: string; options: string[]; correct: number; explain: string };
  xpReward: number;
}

export const LESSONS: Lesson[] = [
  {
    id: "l1",
    title: "O que é um consórcio?",
    emoji: "🤝",
    duration: "2 min",
    xpReward: 80,
    steps: [
      { title: "A ideia central", body: "Consórcio é um grupo de pessoas que se unem para comprar o mesmo tipo de bem (imóvel, carro, viagem). Cada um paga uma parcela mensal e, todo mês, alguém é contemplado." },
      { title: "Como recebo o bem?", body: "Há duas formas: sorteio (todo mês um participante é sorteado) ou lance (você oferece um valor extra para passar na frente)." },
      { title: "E os juros?", body: "Não existem juros. Só uma taxa de administração diluída ao longo do prazo — geralmente entre 15% e 20%, muito menor que financiamento." },
    ],
    quiz: {
      question: "Qual é a maior diferença entre consórcio e financiamento?",
      options: ["Consórcio tem juros menores", "Consórcio não tem juros, só taxa de administração", "Financiamento é mais barato"],
      correct: 1,
      explain: "Exato! Consórcio substitui juros por uma taxa de administração diluída, o que reduz o custo total significativamente.",
    },
  },
  {
    id: "l2",
    title: "Lance: como acelerar a contemplação",
    emoji: "🎯",
    duration: "2 min",
    xpReward: 80,
    steps: [
      { title: "O que é lance?", body: "Lance é uma oferta antecipada de parcelas. Quem oferece o maior lance no mês é contemplado, mesmo sem ter sido sorteado." },
      { title: "Tipos de lance", body: "Lance livre (você decide o valor), lance fixo (% definido pelo grupo) e lance embutido (usa parte da carta de crédito como lance)." },
      { title: "Estratégia", body: "Se você tem uma reserva, dar lance pode adiantar o objetivo em meses ou anos. O valor do lance ainda abate as suas parcelas finais." },
    ],
    quiz: {
      question: "Se você tem R$ 5.000 sobrando, vale a pena dar lance?",
      options: ["Não, é dinheiro perdido", "Sim, antecipa a contemplação e abate parcelas", "Só se for lance embutido"],
      correct: 1,
      explain: "Lance é estratégico: antecipa o bem e ainda reduz o saldo devedor. Não é gasto, é antecipação.",
    },
  },
  {
    id: "l3",
    title: "Carta de crédito: dinheiro vivo",
    emoji: "💳",
    duration: "2 min",
    xpReward: 80,
    steps: [
      { title: "O que é?", body: "A carta de crédito é o valor total que você combinou (ex: R$ 80.000 para um carro). Quando contemplado, você usa esse valor para comprar." },
      { title: "Poder de compra à vista", body: "Como vendedores recebem o valor todo de uma vez, você consegue descontos de 5% a 15% — é como pagar à vista." },
      { title: "Flexibilidade", body: "Carro, imóvel ou serviço: a carta pode ser usada em qualquer marca, modelo ou imobiliária da categoria contratada." },
    ],
    quiz: {
      question: "A carta de crédito serve apenas em uma loja específica?",
      options: ["Sim, só na empresa do consórcio", "Não, vale como dinheiro à vista em qualquer loja", "Só em concessionárias parceiras"],
      correct: 1,
      explain: "A carta funciona como pagamento à vista — você escolhe onde gastar dentro da categoria.",
    },
  },
  {
    id: "l4",
    title: "Quando consórcio NÃO é a melhor opção",
    emoji: "⚖️",
    duration: "2 min",
    xpReward: 80,
    steps: [
      { title: "Urgência", body: "Se você precisa do bem agora (ex: carro para trabalhar amanhã), consórcio pode não ser ideal — pode levar meses até ser contemplado." },
      { title: "Disciplina financeira", body: "É um compromisso de longo prazo. Se sua renda é instável, planeje uma reserva antes de entrar." },
      { title: "Solução híbrida", body: "Muitos combinam consórcio + reserva de emergência: você paga as parcelas e dá um lance quando juntar dinheiro extra." },
    ],
    quiz: {
      question: "Qual é o principal cuidado antes de entrar em um consórcio?",
      options: ["Ter o bem em mente", "Ter reserva e prazo compatível com sua urgência", "Escolher a maior parcela possível"],
      correct: 1,
      explain: "Compatibilidade é tudo: alinhar prazo, parcela e urgência evita inadimplência.",
    },
  },
];

export interface Decision {
  month: number;
  description: string;
  choice: string;
  impact: number; // cash change
  scoreImpact: number; // fin score change
  type: "good" | "bad" | "neutral";
}

export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  emoji: string;
  options: EventOption[];
}

export interface EventOption {
  label: string;
  cashImpact: number;
  scoreImpact: number;
  xpGain: number;
  feedback: string;
  type: "good" | "bad" | "neutral";
}

export const GOAL_INFO: Record<GoalType, { label: string; value: number; emoji: string }> = {
  house: { label: "Casa Própria", value: 250000, emoji: "🏠" },
  car: { label: "Carro Novo", value: 80000, emoji: "🚗" },
  travel: { label: "Viagem dos Sonhos", value: 25000, emoji: "✈️" },
};

// Simulações financeiras realistas (baseadas em mercado)
export function simulateFinancing(target: number, months = 60) {
  // CET ~ 1.8% ao mês (realista para crédito longo)
  const rate = 0.018;
  const monthlyPayment = (target * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  return {
    monthlyPayment: Math.round(monthlyPayment),
    monthsTotal: months,
    totalCost: Math.round(monthlyPayment * months),
    interest: Math.round(monthlyPayment * months - target),
  };
}

export function simulateConsortium(target: number, months = 80) {
  // Taxa de admin Ademicon ~18% diluída
  const adminFee = 0.18;
  const totalWithFee = target * (1 + adminFee);
  const monthlyPayment = totalWithFee / months;
  return {
    monthlyPayment: Math.round(monthlyPayment),
    monthsTotal: months,
    totalCost: Math.round(totalWithFee),
    interest: Math.round(totalWithFee - target),
  };
}

export function simulateSavings(target: number, monthlyAmount: number) {
  // Poupança ~0.5% ao mês
  const rate = 0.005;
  let saved = 0;
  let months = 0;
  while (saved < target && months < 600) {
    saved = saved * (1 + rate) + monthlyAmount;
    months++;
  }
  return {
    monthlyPayment: monthlyAmount,
    monthsTotal: months,
    totalCost: monthlyAmount * months,
    interest: 0,
  };
}

export interface FinTip {
  id: string;
  title: string;
  body: string;
  emoji: string;
  category: "consorcio" | "investimento" | "credito" | "mindset" | "planejamento";
}

export const FIN_TIPS: FinTip[] = [
  { id: "t1", emoji: "💡", category: "consorcio", title: "O que é consórcio?", body: "Grupo de pessoas que se unem para comprar um bem em comum. Sem juros — apenas taxa de administração, geralmente entre 15% e 20% diluída no prazo." },
  { id: "t2", emoji: "📉", category: "credito", title: "Juros compostos contra você", body: "Em um financiamento de 60 meses a 1.8% a.m., você pode pagar quase 2x o valor do bem. Compare sempre o CET (Custo Efetivo Total)." },
  { id: "t3", emoji: "🎯", category: "consorcio", title: "Lance no consórcio", body: "Um lance é uma oferta antecipada de parcelas. Quem oferece o maior lance é contemplado e pode usar a carta de crédito imediatamente." },
  { id: "t4", emoji: "🛡️", category: "planejamento", title: "Reserva de emergência", body: "Tenha de 3 a 6 meses de despesas guardados antes de assumir grandes compromissos. Isso te protege em demissões e imprevistos." },
  { id: "t5", emoji: "📊", category: "investimento", title: "Poupança rende pouco", body: "Poupança rende ~0.5% ao mês. Tesouro Selic, CDBs e LCIs costumam render mais com a mesma segurança." },
  { id: "t6", emoji: "🧠", category: "mindset", title: "Compras por impulso", body: "Espere 24h antes de qualquer compra acima de 10% da sua renda mensal. Esse hábito sozinho pode economizar milhares por ano." },
  { id: "t7", emoji: "💳", category: "credito", title: "Cartão rotativo é cilada", body: "Os juros do rotativo do cartão chegam a 400% ao ano. Sempre pague a fatura integral ou negocie um parcelamento." },
  { id: "t8", emoji: "🏠", category: "consorcio", title: "Carta de crédito é dinheiro vivo", body: "Ao ser contemplado, você recebe uma carta de crédito que funciona como pagamento à vista — você pode até negociar descontos." },
  { id: "t9", emoji: "💼", category: "planejamento", title: "Regra 50/30/20", body: "50% do salário em essenciais, 30% em desejos, 20% em metas e investimentos. Simples e poderoso." },
  { id: "t10", emoji: "🚀", category: "mindset", title: "Pequenas decisões importam", body: "Economizar R$ 200/mês investidos a 1% a.m. viram quase R$ 70.000 em 15 anos. Disciplina vence renda alta." },
];

export function pickRandomTip(): FinTip {
  return FIN_TIPS[Math.floor(Math.random() * FIN_TIPS.length)];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  check: (s: GameState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_step", title: "Primeiro Passo", description: "Escolheu uma estratégia", emoji: "🎬", check: (s) => s.activeStrategy !== "none" },
  { id: "saver", title: "Poupador Nato", description: "Saldo acima de 10k", emoji: "💰", check: (s) => s.cash >= 10000 },
  { id: "wise", title: "Mente Sábia", description: "Score financeiro 80+", emoji: "🧠", check: (s) => s.finScore >= 80 },
  { id: "veteran", title: "Veterano", description: "12 meses jogados", emoji: "📅", check: (s) => s.month >= 12 },
  { id: "decider", title: "Decidido", description: "10 decisões tomadas", emoji: "⚡", check: (s) => s.decisions.length >= 10 },
  { id: "contemplated", title: "Contemplado!", description: "Ganhou a carta de crédito", emoji: "🎊", check: (s) => !!s.strategyData?.contemplated },
  { id: "level5", title: "Nível 5", description: "Alcançou o nível 5", emoji: "⭐", check: (s) => s.level >= 5 },
];

export const LIFE_EVENTS: LifeEvent[] = [
  {
    id: "promotion",
    title: "Promoção no trabalho!",
    description: "Você foi promovido e ganhou um aumento de R$ 800/mês. O que fazer com o extra?",
    emoji: "🎉",
    options: [
      { label: "Aumentar contribuição mensal", cashImpact: 800, scoreImpact: 10, xpGain: 50, feedback: "Excelente! Investir o aumento acelera seus objetivos.", type: "good" },
      { label: "Comemorar com um jantar caro", cashImpact: -400, scoreImpact: -3, xpGain: 10, feedback: "Comemorar é ok, mas com moderação.", type: "neutral" },
      { label: "Comprar um celular novo", cashImpact: -3000, scoreImpact: -8, xpGain: 5, feedback: "Cuidado com gastos por impulso após aumentos.", type: "bad" },
    ],
  },
  {
    id: "emergency",
    title: "Emergência médica",
    description: "Você precisa de R$ 2.500 para um tratamento urgente.",
    emoji: "🏥",
    options: [
      { label: "Usar reserva de emergência", cashImpact: -2500, scoreImpact: 8, xpGain: 40, feedback: "Por isso a reserva existe! Decisão sábia.", type: "good" },
      { label: "Parcelar no cartão (10x)", cashImpact: -3500, scoreImpact: -10, xpGain: 5, feedback: "Juros do cartão são altíssimos. Evite quando possível.", type: "bad" },
      { label: "Pegar empréstimo pessoal", cashImpact: -3200, scoreImpact: -5, xpGain: 10, feedback: "Melhor que cartão, mas ainda caro.", type: "neutral" },
    ],
  },
  {
    id: "opportunity",
    title: "Oportunidade: lance no consórcio",
    description: "Você pode dar um lance e antecipar a contemplação. Vale R$ 5.000.",
    emoji: "💎",
    options: [
      { label: "Dar o lance", cashImpact: -5000, scoreImpact: 12, xpGain: 60, feedback: "Lance estratégico! Pode antecipar muito o objetivo.", type: "good" },
      { label: "Continuar pelo sorteio", cashImpact: 0, scoreImpact: 0, xpGain: 15, feedback: "Decisão neutra. Sorteio é grátis e válido.", type: "neutral" },
    ],
  },
  {
    id: "blackfriday",
    title: "Black Friday 🛒",
    description: "Promoções por todo lado. Como reagir?",
    emoji: "🛍️",
    options: [
      { label: "Manter o orçamento", cashImpact: 0, scoreImpact: 8, xpGain: 30, feedback: "Disciplina financeira no nível máximo!", type: "good" },
      { label: "Comprar 1 item planejado", cashImpact: -800, scoreImpact: 2, xpGain: 15, feedback: "Compra planejada é saudável.", type: "neutral" },
      { label: "Parcelar várias compras", cashImpact: -4500, scoreImpact: -12, xpGain: 5, feedback: "Black Friday é a armadilha do consumismo.", type: "bad" },
    ],
  },
  {
    id: "joblost",
    title: "Demissão inesperada",
    description: "Você perdeu o emprego. Tem 3 meses de desafio pela frente.",
    emoji: "😰",
    options: [
      { label: "Cortar gastos e usar reserva", cashImpact: -3000, scoreImpact: 10, xpGain: 50, feedback: "Foi para isso que você se preparou. Bem feito.", type: "good" },
      { label: "Parar de pagar consórcio", cashImpact: -1500, scoreImpact: -8, xpGain: 10, feedback: "Cuidado: parar pode afastar sua contemplação.", type: "bad" },
    ],
  },
  {
    id: "13thsalary",
    title: "13º salário 💰",
    description: "Chegou o 13º! São 3.500 reais extras.",
    emoji: "💰",
    options: [
      { label: "Adiantar parcelas do consórcio", cashImpact: 3500, scoreImpact: 10, xpGain: 50, feedback: "Antecipar reduz o prazo total. Ótima jogada!", type: "good" },
      { label: "Investir tudo", cashImpact: 3500, scoreImpact: 12, xpGain: 60, feedback: "Investimento é sempre uma das melhores opções.", type: "good" },
      { label: "Trocar o sofá da sala", cashImpact: -3500, scoreImpact: -5, xpGain: 5, feedback: "Gastar 100% do 13º não é a melhor estratégia.", type: "bad" },
    ],
  },
  {
    id: "friend_loan",
    title: "Amigo pedindo empréstimo",
    description: "Seu melhor amigo pede R$ 2.000 emprestados, sem prazo definido.",
    emoji: "🤝",
    options: [
      { label: "Emprestar tudo", cashImpact: -2000, scoreImpact: -6, xpGain: 10, feedback: "Empréstimo a amigos sem prazo costuma virar presente.", type: "bad" },
      { label: "Emprestar metade com prazo", cashImpact: -1000, scoreImpact: 2, xpGain: 25, feedback: "Ajudou e protegeu suas finanças. Equilíbrio!", type: "neutral" },
      { label: "Explicar que não pode agora", cashImpact: 0, scoreImpact: 5, xpGain: 30, feedback: "Dizer 'não' também é cuidar de você.", type: "good" },
    ],
  },
  {
    id: "investment_offer",
    title: "Oferta de investimento 'milagroso' 🚨",
    description: "Um conhecido oferece 10% ao mês garantido em criptomoeda.",
    emoji: "⚠️",
    options: [
      { label: "Investir R$ 5.000", cashImpact: -5000, scoreImpact: -15, xpGain: 5, feedback: "Promessa de retorno garantido alto = pirâmide. Cuidado!", type: "bad" },
      { label: "Recusar e pesquisar", cashImpact: 0, scoreImpact: 12, xpGain: 50, feedback: "Excelente! Educação financeira evita golpes.", type: "good" },
    ],
  },
  {
    id: "tax_return",
    title: "Restituição do IR",
    description: "Você recebeu R$ 1.800 da Receita Federal!",
    emoji: "🏦",
    options: [
      { label: "Aportar no consórcio", cashImpact: 1800, scoreImpact: 10, xpGain: 45, feedback: "Aporte extra reduz prazo e taxa total!", type: "good" },
      { label: "Investir no Tesouro", cashImpact: 1800, scoreImpact: 10, xpGain: 45, feedback: "Tesouro Selic é seguro e rende mais que poupança.", type: "good" },
      { label: "Comprar eletrônicos", cashImpact: -1800, scoreImpact: -6, xpGain: 8, feedback: "Restituição é dinheiro seu, mas use com propósito.", type: "bad" },
    ],
  },
  {
    id: "course_opportunity",
    title: "Curso de qualificação",
    description: "Um curso de R$ 1.200 pode aumentar seu salário em 20%.",
    emoji: "📚",
    options: [
      { label: "Investir no curso", cashImpact: -1200, scoreImpact: 8, xpGain: 50, feedback: "Investir em si mesmo tem o melhor retorno!", type: "good" },
      { label: "Buscar conteúdo grátis", cashImpact: 0, scoreImpact: 4, xpGain: 30, feedback: "YouTube e cursos gratuitos também funcionam.", type: "neutral" },
      { label: "Deixar pra depois", cashImpact: 0, scoreImpact: -3, xpGain: 5, feedback: "Procrastinar carreira custa caro a longo prazo.", type: "bad" },
    ],
  },
  {
    id: "car_breakdown",
    title: "Carro quebrou 🔧",
    description: "Conserto urgente de R$ 1.500.",
    emoji: "🚙",
    options: [
      { label: "Pagar com reserva", cashImpact: -1500, scoreImpact: 6, xpGain: 35, feedback: "Para isso serve a reserva. Bem feito.", type: "good" },
      { label: "Parcelar em 12x no cartão", cashImpact: -2100, scoreImpact: -8, xpGain: 8, feedback: "Juros do cartão devoram o orçamento.", type: "bad" },
    ],
  },
  {
    id: "wedding_invite",
    title: "Casamento de amigo 💒",
    description: "Você foi convidado para um casamento destino. Custo total: R$ 3.000.",
    emoji: "💍",
    options: [
      { label: "Ir e curtir tudo", cashImpact: -3000, scoreImpact: -8, xpGain: 10, feedback: "Eventos sociais são caros. Avalie prioridades.", type: "bad" },
      { label: "Ir só na cerimônia local", cashImpact: -400, scoreImpact: 3, xpGain: 20, feedback: "Presença sem desequilibrar finanças. Bem pensado.", type: "good" },
      { label: "Mandar presente e não ir", cashImpact: -200, scoreImpact: 2, xpGain: 15, feedback: "Presente honesto e sem culpa.", type: "neutral" },
    ],
  },
  {
    id: "side_hustle",
    title: "Renda extra: freela",
    description: "Apareceu um freela que paga R$ 2.500 mas exige 2 fins de semana.",
    emoji: "💻",
    options: [
      { label: "Aceitar o freela", cashImpact: 2500, scoreImpact: 10, xpGain: 55, feedback: "Renda extra acelera demais qualquer meta!", type: "good" },
      { label: "Recusar e descansar", cashImpact: 0, scoreImpact: 0, xpGain: 10, feedback: "Descanso também tem valor, mas pondere.", type: "neutral" },
    ],
  },
  {
    id: "rent_increase",
    title: "Aluguel aumentou 📈",
    description: "Seu aluguel subiu R$ 400/mês com o reajuste do IGPM.",
    emoji: "🏘️",
    options: [
      { label: "Negociar com proprietário", cashImpact: -200, scoreImpact: 6, xpGain: 35, feedback: "Negociar funciona em 70% dos casos!", type: "good" },
      { label: "Mudar para imóvel mais barato", cashImpact: -800, scoreImpact: 5, xpGain: 30, feedback: "Custo de mudança hoje, economia grande amanhã.", type: "good" },
      { label: "Aceitar e cortar lazer", cashImpact: -400, scoreImpact: -2, xpGain: 15, feedback: "Aceitar sem negociar deixa dinheiro na mesa.", type: "neutral" },
    ],
  },
];

export function pickRandomEvent(): LifeEvent {
  return LIFE_EVENTS[Math.floor(Math.random() * LIFE_EVENTS.length)];
}
