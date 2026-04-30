import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, Check, X, Sparkles } from "lucide-react";
import type { MiniGame } from "@/game/engine";

interface Props {
  game: MiniGame | null;
  onClose: (won: boolean) => void;
}

export const MiniGameModal = ({ game, onClose }: Props) => {
  const [picked, setPicked] = useState<number | null>(null);

  if (!game) return null;
  const correct = picked != null && game.options[picked].correct;
  const showResult = picked != null;

  const handleClose = () => {
    onClose(correct);
    setPicked(null);
  };

  return (
    <Dialog open={!!game} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-3xl animate-wiggle">{game.emoji}</span>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-primary flex items-center gap-1">
                <Brain className="w-3 h-3" /> Quiz Relâmpago
              </p>
              <span className="text-base">{game.question}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {game.options.map((opt, i) => {
            const selected = picked === i;
            const reveal = showResult;
            return (
              <button
                key={i}
                disabled={showResult}
                onClick={() => setPicked(i)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-smooth flex items-center justify-between gap-2 ${
                  reveal && opt.correct
                    ? "border-success bg-success/10 animate-pop-in"
                    : reveal && selected && !opt.correct
                    ? "border-destructive bg-destructive/10"
                    : selected
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/40 hover:-translate-y-0.5"
                }`}
              >
                <span className="text-sm font-medium">{opt.label}</span>
                {reveal && opt.correct && <Check className="w-5 h-5 text-success shrink-0" />}
                {reveal && selected && !opt.correct && <X className="w-5 h-5 text-destructive shrink-0" />}
              </button>
            );
          })}
        </div>

        {showResult && (
          <Card className={`p-3 animate-slide-up ${correct ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"}`}>
            <p className="text-xs font-bold mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {correct ? "Correto!" : "Quase!"}
            </p>
            <p className="text-xs text-muted-foreground">{game.options[picked].explain}</p>
            {correct && (
              <p className="text-xs font-bold mt-2 text-success">
                +{game.reward.xp} XP • +R$ {game.reward.cash} • +{game.reward.score} score
              </p>
            )}
          </Card>
        )}

        <Button onClick={handleClose} className="w-full bg-gradient-primary" disabled={!showResult}>
          Continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
};
