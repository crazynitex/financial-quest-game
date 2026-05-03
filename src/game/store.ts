import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Character, Decision, GameState } from "./engine";
import { supabase } from "@/integrations/supabase/client";

interface GameStore extends GameState, QuizState {
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
  startNewCycle: () => void;
  sellAsset: (value: number) => void;
  awardMiniGame: (xp: number, cash: number, score: number) => void;
  // Quiz Journey
  quizCorrectAnswer: (id: string, gain: { xp: number; progress: number; cash: number }) => void;
  quizWrongAnswer: (id: string) => void;
  quizUseHint: () => boolean;
  quizUseFiftyFifty: () => boolean;
  quizUseRevealTrap: () => boolean;
  quizUseSkipChapter: () => boolean;
  quizRefillLives: () => void;
  quizAdvanceChapter: () => void;
  quizResetRun: () => void;
  loadFromCloud: (userId: string) => Promise<void>;
  saveToCloud: (userId: string) => Promise<void>;
  clearLocal: () => void;
}

interface QuizState {
  goalProgress: number; // 0..100 rumo ao bem
  lives: number; // 0..3
  combo: number; // acertos seguidos
  bestCombo: number;
  answeredIds: string[];
  wrongIds: string[];
  currentChapter: number; // 1..4
  hintsLeft: number;
  fiftyLeft: number;
  totalAnswered: number;
  totalCorrect: number;
}

const initialQuiz: QuizState = {
  goalProgress: 0,
  lives: 3,
  combo: 0,
  bestCombo: 0,
  answeredIds: [],
  wrongIds: [],
  currentChapter: 1,
  hintsLeft: 3,
  fiftyLeft: 2,
  totalAnswered: 0,
  totalCorrect: 0,
};

const initial: GameState & QuizState = {
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
  ...initialQuiz,
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
      startNewCycle: () =>
        set((s) => ({
          activeStrategy: "none",
          strategyData: undefined,
          xp: s.xp + 100,
          finScore: Math.min(100, s.finScore + 10),
          achievements: s.achievements.includes("scaler") ? s.achievements : [...s.achievements, "scaler"],
        })),
      sellAsset: (value) =>
        set((s) => ({
          cash: s.cash + value,
          activeStrategy: "none",
          strategyData: undefined,
          xp: s.xp + 50,
        })),
      awardMiniGame: (xp, cash, score) =>
        set((s) => ({
          cash: s.cash + cash,
          xp: s.xp + xp,
          finScore: Math.min(100, s.finScore + score),
          level: Math.floor((s.xp + xp) / 100) + 1,
        })),
      // ====== QUIZ JOURNEY ======
      quizCorrectAnswer: (id, gain) =>
        set((s) => {
          const newCombo = s.combo + 1;
          const comboMult = 1 + Math.min(0.5, (newCombo - 1) * 0.1); // até +50%
          const xpEarned = Math.round(gain.xp * comboMult);
          const progressEarned = gain.progress * comboMult;
          const cashEarned = Math.round(gain.cash * comboMult);
          const newXp = s.xp + xpEarned;
          const newProg = Math.min(100, s.goalProgress + progressEarned);
          const finished = newProg >= 100;
          return {
            combo: newCombo,
            bestCombo: Math.max(s.bestCombo, newCombo),
            answeredIds: [...s.answeredIds, id],
            totalAnswered: s.totalAnswered + 1,
            totalCorrect: s.totalCorrect + 1,
            xp: newXp,
            level: Math.floor(newXp / 100) + 1,
            cash: s.cash + cashEarned,
            finScore: Math.min(100, s.finScore + 2),
            goalProgress: newProg,
            finished: finished || s.finished,
          };
        }),
      quizWrongAnswer: (id) =>
        set((s) => {
          const newLives = Math.max(0, s.lives - 1);
          return {
            lives: newLives,
            combo: 0,
            answeredIds: [...s.answeredIds, id],
            wrongIds: [...s.wrongIds, id],
            totalAnswered: s.totalAnswered + 1,
            finScore: Math.max(0, s.finScore - 1),
            gameOver: newLives <= 0,
            gameOverReason: newLives <= 0 ? "Você perdeu todas as vidas! Estude mais sobre consórcio na Academy e tente de novo." : s.gameOverReason,
          };
        }),
      quizUseHint: () => {
        const s = get();
        if (s.hintsLeft <= 0) return false;
        set({ hintsLeft: s.hintsLeft - 1 });
        return true;
      },
      quizUseFiftyFifty: () => {
        const s = get();
        if (s.fiftyLeft <= 0) return false;
        set({ fiftyLeft: s.fiftyLeft - 1 });
        return true;
      },
      quizRefillLives: () =>
        set((s) => ({ lives: Math.min(3, s.lives + 1) })),
      quizAdvanceChapter: () =>
        set((s) => ({
          currentChapter: Math.min(4, s.currentChapter + 1),
          hintsLeft: Math.min(3, s.hintsLeft + 1),
          fiftyLeft: Math.min(2, s.fiftyLeft + 1),
        })),
      quizResetRun: () =>
        set({ ...initialQuiz, finished: false, gameOver: false, gameOverReason: undefined }),
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
