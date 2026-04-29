import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character, Decision, GameState } from "./engine";
import { supabase } from "@/integrations/supabase/client";

interface GameStore extends GameState {
  hydrated: boolean;
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
  triggerGameOver: (reason: string) => void;
  // Ações livres
  doSideHustle: () => void;
  doInvest: (amount: number) => void;
  doCutExpenses: () => void;
  doStudyMore: () => void;
  doBidConsortium: (amount: number) => boolean;
  completeLesson: (lessonId: string, xp: number) => void;
  loadFromCloud: (userId: string) => Promise<void>;
  saveToCloud: (userId: string) => Promise<void>;
  clearLocal: () => void;
}

const initial: GameState = {
  character: { name: "", age: 25, income: 4000, goal: "house" },
  cash: 5000,
  savings: 0,
  invested: 0,
  monthlyExpenses: 2800,
  month: 1,
  level: 1,
  xp: 0,
  finScore: 50,
  decisions: [],
  achievements: [],
  activeStrategy: "none",
  finished: false,
  gameOver: false,
  lessonsCompleted: [],
};

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initial,
      hydrated: false,
      initGame: (character) =>
        set({
          ...initial,
          hydrated: true,
          character,
          cash: Math.round(character.income * 1.5),
          // despesas baseadas em renda (~65% para realismo)
          monthlyExpenses: Math.round(character.income * 0.65),
        }),
      resetGame: () => set({ ...initial, hydrated: true }),
      clearLocal: () => set({ ...initial, hydrated: false }),
      addDecision: (d) =>
        set((s) => ({
          decisions: [...s.decisions, d],
          xp: s.xp + 20,
          level: Math.floor((s.xp + 20) / 100) + 1,
        })),
      applyEvent: (cashImpact, scoreImpact, xpGain) =>
        set((s) => {
          const newXp = s.xp + xpGain;
          const newCash = Math.max(0, s.cash + cashImpact);
          return {
            cash: newCash,
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
      triggerGameOver: (reason) => set({ gameOver: true, gameOverReason: reason }),

      doSideHustle: () =>
        set((s) => {
          const earned = Math.round(s.character.income * 0.25 + Math.random() * 600);
          return {
            cash: s.cash + earned,
            xp: s.xp + 25,
            finScore: Math.min(100, s.finScore + 2),
            level: Math.floor((s.xp + 25) / 100) + 1,
          };
        }),
      doInvest: (amount) =>
        set((s) => {
          if (s.cash < amount) return s;
          return {
            cash: s.cash - amount,
            invested: s.invested + amount,
            xp: s.xp + 15,
            finScore: Math.min(100, s.finScore + 4),
          };
        }),
      doCutExpenses: () =>
        set((s) => {
          const cut = Math.round(s.monthlyExpenses * 0.1);
          return {
            monthlyExpenses: Math.max(Math.round(s.character.income * 0.3), s.monthlyExpenses - cut),
            xp: s.xp + 20,
            finScore: Math.min(100, s.finScore + 6),
          };
        }),
      doStudyMore: () =>
        set((s) => ({
          xp: s.xp + 30,
          finScore: Math.min(100, s.finScore + 3),
          level: Math.floor((s.xp + 30) / 100) + 1,
        })),
      doBidConsortium: (amount) => {
        const s = get();
        if (!s.strategyData || s.activeStrategy !== "consortium" || s.strategyData.contemplated) return false;
        if (s.cash < amount) return false;
        // chance proporcional ao lance vs parcela mensal
        const successChance = Math.min(0.85, (amount / (s.strategyData.monthlyPayment * 6)) * 0.5);
        const success = Math.random() < successChance;
        set({
          cash: s.cash - amount,
          strategyData: {
            ...s.strategyData,
            contemplated: success,
            monthsPaid: success ? s.strategyData.monthsPaid : s.strategyData.monthsPaid,
          },
          xp: s.xp + 30,
        });
        return success;
      },
      completeLesson: (lessonId, xp) =>
        set((s) => {
          if (s.lessonsCompleted.includes(lessonId)) return s;
          return {
            lessonsCompleted: [...s.lessonsCompleted, lessonId],
            xp: s.xp + xp,
            finScore: Math.min(100, s.finScore + 5),
            level: Math.floor((s.xp + xp) / 100) + 1,
          };
        }),
      loadFromCloud: async (userId) => {
        const { data, error } = await supabase
          .from("game_saves")
          .select("state")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) {
          console.error("Failed to load save:", error);
          set({ hydrated: true });
          return;
        }
        if (data?.state && Object.keys(data.state).length > 0) {
          set({ ...initial, ...(data.state as any), hydrated: true });
        } else {
          set({ ...initial, hydrated: true });
        }
      },
      saveToCloud: async (userId) => {
        const state = get();
        const { hydrated, ...toSave } = state as any;
        const cleanState = JSON.parse(JSON.stringify(toSave));
        const { error } = await supabase
          .from("game_saves")
          .upsert({ user_id: userId, state: cleanState }, { onConflict: "user_id" });
        if (error) console.error("Failed to save:", error);
      },
    }),
    { name: "consorcio-quest-state" }
  )
);
