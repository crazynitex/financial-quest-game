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
}

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
];

export function pickRandomEvent(): LifeEvent {
  return LIFE_EVENTS[Math.floor(Math.random() * LIFE_EVENTS.length)];
}
