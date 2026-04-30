import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGame } from "@/game/store";
import { GOAL_INFO } from "@/game/engine";
import { Sparkles, TrendingUp, RotateCw, Target } from "lucide-react";
import { toast } from "sonner";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const PostContemplationCard = () => {
  const game = useGame();
  const goal = GOAL_INFO[game.character.goal];

  const handleNewCycle = () => {
    game.startNewCycle();
    toast.success("🚀 Novo ciclo iniciado! Escala patrimonial em andamento.");
  };

  const handleSell = () => {
    const value = Math.round(goal.value * 0.85);
    game.sellAsset(value);
    toast.success(`💵 ${goal.label} vendido por ${formatBRL(value)}!`, {
      description: "O patrimônio virou caixa. Use com sabedoria.",
    });
  };

  return (
    <Card className="p-5 bg-gradient-primary text-primary-foreground border-2 border-primary shadow-elegant animate-pop-in">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 animate-pulse" />
        <p className="text-[10px] uppercase tracking-wider font-bold opacity-90">Patrimônio Conquistado</p>
      </div>
      <h3 className="font-display text-2xl font-bold mb-1 flex items-center gap-2">
        <span className="text-3xl">{goal.emoji}</span> {goal.label}
      </h3>
      <p className="text-sm opacity-90 mb-4">
        Valor estimado do bem: <span className="font-bold">{formatBRL(goal.value)}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button
          variant="secondary"
          onClick={handleNewCycle}
          className="bg-background text-foreground hover:bg-background/90"
        >
          <Target className="w-4 h-4 mr-1" /> Próxima meta
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            game.doInvest(Math.min(game.cash, 2000));
            toast.success("📈 Aporte feito no Tesouro Selic!");
          }}
          className="bg-background text-foreground hover:bg-background/90"
          disabled={game.cash < 500}
        >
          <TrendingUp className="w-4 h-4 mr-1" /> Investir 2k
        </Button>
        <Button
          variant="outline"
          onClick={handleSell}
          className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
        >
          <RotateCw className="w-4 h-4 mr-1" /> Vender bem
        </Button>
      </div>
    </Card>
  );
};
