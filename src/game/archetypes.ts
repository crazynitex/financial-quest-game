import type { GameState } from "./engine";

export type ArchetypeId =
  | "lancaChamas"
  | "fossilArCondicionado"
  | "freelaDependente"
  | "academicoPijama"
  | "tioSabido"
  | "influencerGaragem";

export interface Archetype {
  id: ArchetypeId;
  name: string;
  emoji: string;
  tagline: string;
  insight: string;
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  lancaChamas: {
    id: "lancaChamas",
    name: "O Lança-Chamas",
    emoji: "🔥",
    tagline: "Joga dinheiro no consórcio igual joga PIX em banca de aposta.",
    insight: "Lance é estratégia, não loteria. Sem reserva, quebra fluxo.",
  },
  fossilArCondicionado: {
    id: "fossilArCondicionado",
    name: "O Fóssil de Ar-Condicionado",
    emoji: "🦴",
    tagline: "Esperou tanto que o consórcio terminou e ele nem percebeu.",
    insight: "Consórcio recompensa quem joga ativo. Não quem só paga parcela.",
  },
  freelaDependente: {
    id: "freelaDependente",
    name: "O Freela-Dependente",
    emoji: "💸",
    tagline: "Faz Uber de manhã, iFood à tarde, e ainda compra hambúrguer no fim do dia.",
    insight: "Renda extra sem destino é só mais grana pra torrar. Consórcio dá destino.",
  },
  academicoPijama: {
    id: "academicoPijama",
    name: "O Acadêmico de Pijama",
    emoji: "🎓",
    tagline: "Sabe tudo sobre consórcio. Aplica nada. Tipo amigo que lê livro de dieta comendo brigadeiro.",
    insight: "Educação financeira sem prática é entretenimento.",
  },
  tioSabido: {
    id: "tioSabido",
    name: "O Tio Sabido",
    emoji: "👔",
    tagline: "19 anos com planilha de Excel. Nunca foi num show sem cupom.",
    insight: "Disciplina funciona. Mas dá pra ser disciplinado sem virar chato.",
  },
  influencerGaragem: {
    id: "influencerGaragem",
    name: "O Influencer de Garagem",
    emoji: "📸",
    tagline: "Câmera de R$ 8 mil pra gravar vídeo de 47 visualizações. Mas com lance vencedor, então tá ok.",
    insight: "Equipamento profissional via consórcio faz sentido SE tem plano de uso.",
  },
};

export function assignArchetype(state: GameState): ArchetypeId {
  const decisions = state.decisions || [];
  const lessonsCompleted = state.lessonsCompleted?.length || 0;
  const finScore = state.finScore || 50;
  const goal = state.character.goal;

  // Decision.type real do projeto: "good" | "bad" | "neutral".
  // Não há tipos "bid"/"hustle" — usamos heurísticas a partir do texto da choice/description.
  const matches = (d: { description?: string; choice?: string }, kw: string[]) => {
    const txt = `${d.description ?? ""} ${d.choice ?? ""}`.toLowerCase();
    return kw.some((k) => txt.includes(k));
  };
  const bidCount = decisions.filter((d) => matches(d, ["lance", "bid"])).length;
  const sideHustleCount = decisions.filter((d) =>
    matches(d, ["freela", "uber", "ifood", "renda extra", "hustle"])
  ).length;
  const cutExpensesCount = decisions.filter((d) =>
    matches(d, ["cortar", "corte", "reduzir", "economizar", "despesa"])
  ).length;

  if (goal === "professionalSetup" && bidCount >= 1) return "influencerGaragem";
  if (bidCount >= 3) return "lancaChamas";
  if (lessonsCompleted >= 4 && finScore < 60) return "academicoPijama";
  if (cutExpensesCount >= 4 && finScore >= 80 && bidCount === 0) return "tioSabido";
  if (sideHustleCount >= 5 && finScore < 65) return "freelaDependente";

  return "fossilArCondicionado";
}
