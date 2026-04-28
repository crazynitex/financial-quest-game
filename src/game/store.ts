import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character, Decision, GameState } from "./engine";

interface GameStore extends GameState {
  initGame: (character: Character) => void;
  resetGame: () => void;
  addDecision: (d: Decision) => void;
  applyEvent: (cashImpact: number, scoreImpact: number, xpGain: number) => void;
  startStrategy: (
    strategy: "savings" | "financing" | "consortium",
    data: { monthlyPayment: number; monthsTotal: number; targetValue: number; totalCost: number }
  ) => void;
  payMonth: () => void;
  finish: () => void;
}

const initial: GameState = {
  character: { name: "", age: 25, income: 4000, goal: "house" },
  cash: 5000,
  savings: 0,
  month: 1,
  level: 1,
  xp: 0,
  finScore: 50,
  decisions: [],
  achievements: [],
  activeStrategy: "none",
  finished: false,
};

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initial,
      initGame: (character) =>
        set({
          ...initial,
          character,
          cash: Math.round(character.income * 1.5),
        }),
      resetGame: () => set(initial),
      addDecision: (d) =>
        set((s) => ({
          decisions: [...s.decisions, d],
          xp: s.xp + 20,
          level: Math.floor((s.xp + 20) / 100) + 1,
        })),
      applyEvent: (cashImpact, scoreImpact, xpGain) =>
        set((s) => {
          const newXp = s.xp + xpGain;
          return {
            cash: Math.max(0, s.cash + cashImpact),
            finScore: Math.max(0, Math.min(100, s.finScore + scoreImpact)),
            xp: newXp,
            level: Math.floor(newXp / 100) + 1,
            month: s.month + 1,
          };
        }),
      startStrategy: (strategy, data) =>
        set({
          activeStrategy: strategy,
          strategyData: {
            ...data,
            monthsPaid: 0,
            contemplated: strategy === "financing",
          },
        }),
      payMonth: () =>
        set((s) => {
          if (!s.strategyData) return s;
          const paid = s.strategyData.monthsPaid + 1;
          // Sorteio para consórcio: chance crescente
          let contemplated = s.strategyData.contemplated;
          if (s.activeStrategy === "consortium" && !contemplated) {
            const chance = paid / s.strategyData.monthsTotal;
            if (Math.random() < chance * 0.15) contemplated = true;
          }
          return {
            cash: Math.max(0, s.cash - s.strategyData.monthlyPayment),
            strategyData: { ...s.strategyData, monthsPaid: paid, contemplated },
          };
        }),
      finish: () => set({ finished: true }),
    }),
    { name: "consorcio-quest-state" }
  )
);
