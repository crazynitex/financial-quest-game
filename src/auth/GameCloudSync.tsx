import { useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { useGame } from "@/game/store";

/** Sincroniza o estado do jogo com a nuvem para o usuário logado. */
export const GameCloudSync = () => {
  const { user } = useAuth();
  const game = useGame();
  const lastUserRef = useRef<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const justLoadedRef = useRef(false);

  // Carrega na nuvem quando o usuário muda
  useEffect(() => {
    if (!user) {
      lastUserRef.current = null;
      return;
    }
    if (lastUserRef.current === user.id) return;
    lastUserRef.current = user.id;
    justLoadedRef.current = true;
    game.loadFromCloud(user.id).then(() => {
      // breve delay pra evitar disparar save imediatamente
      setTimeout(() => { justLoadedRef.current = false; }, 500);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Salva debounce após qualquer mudança relevante
  useEffect(() => {
    if (!user || !game.hydrated || justLoadedRef.current) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      game.saveToCloud(user.id);
    }, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user?.id,
    game.hydrated,
    game.character,
    game.cash,
    game.month,
    game.xp,
    game.level,
    game.finScore,
    game.decisions.length,
    game.activeStrategy,
    game.strategyData?.monthsPaid,
    game.strategyData?.contemplated,
    game.finished,
  ]);

  return null;
};
