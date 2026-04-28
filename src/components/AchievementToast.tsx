import { useEffect, useRef } from "react";
import { useGame } from "@/game/store";
import { ACHIEVEMENTS } from "@/game/engine";
import { toast } from "sonner";

export const AchievementWatcher = () => {
  const game = useGame();
  const setStateFn = useGame.setState;
  const seen = useRef<Set<string>>(new Set(game.achievements));

  useEffect(() => {
    seen.current = new Set(game.achievements);
  }, [game.achievements]);

  useEffect(() => {
    const newly: string[] = [];
    for (const a of ACHIEVEMENTS) {
      if (!seen.current.has(a.id) && a.check(game)) {
        newly.push(a.id);
        toast.success(`🏆 Conquista: ${a.title}`, {
          description: `${a.emoji} ${a.description}`,
          duration: 4000,
        });
      }
    }
    if (newly.length) {
      setStateFn((s) => ({ achievements: [...s.achievements, ...newly] }));
    }
  }, [game.cash, game.finScore, game.month, game.level, game.activeStrategy, game.strategyData?.contemplated, game.decisions.length, setStateFn, game]);

  return null;
};
