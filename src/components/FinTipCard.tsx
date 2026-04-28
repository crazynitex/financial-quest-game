import { useEffect, useState } from "react";
import { pickRandomTip, type FinTip } from "@/game/engine";
import { Lightbulb, X, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CATEGORY_LABELS: Record<FinTip["category"], string> = {
  consorcio: "Consórcio",
  investimento: "Investimento",
  credito: "Crédito",
  mindset: "Mindset",
  planejamento: "Planejamento",
};

export const FinTipCard = ({ trigger }: { trigger?: number }) => {
  const [tip, setTip] = useState<FinTip>(() => pickRandomTip());
  const [open, setOpen] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (trigger === undefined) return;
    setTip(pickRandomTip());
    setOpen(true);
    setKey((k) => k + 1);
  }, [trigger]);

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setTip(pickRandomTip());
          setOpen(true);
          setKey((k) => k + 1);
        }}
        className="gap-2"
      >
        <Lightbulb className="w-4 h-4 text-warning" /> Dica financeira
      </Button>
    );
  }

  return (
    <Card
      key={key}
      className="relative overflow-hidden p-4 border-2 border-warning/30 bg-gradient-to-br from-warning/5 via-background to-accent animate-slide-in-right"
    >
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <div className="relative flex items-start gap-3">
        <div className="text-3xl animate-wiggle">{tip.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-warning/20 text-warning-foreground/90">
              {CATEGORY_LABELS[tip.category]}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Você sabia?
            </span>
          </div>
          <h4 className="font-display font-bold text-sm leading-tight mb-1">{tip.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{tip.body}</p>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => {
              setTip(pickRandomTip());
              setKey((k) => k + 1);
            }}
            className="p-1 rounded-md hover:bg-accent transition-smooth"
            aria-label="Outra dica"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-md hover:bg-accent transition-smooth"
            aria-label="Fechar"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </Card>
  );
};
