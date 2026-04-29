import { useState } from "react";
import { useGame } from "@/game/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Briefcase, PiggyBank, Scissors, BookOpen, Target, Sparkles } from "lucide-react";
import { toast } from "sonner";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

interface Props {
  onOpenAcademy: () => void;
}

export const ActionsPanel = ({ onOpenAcademy }: Props) => {
  const game = useGame();
  const [investOpen, setInvestOpen] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState("500");
  const [bidAmount, setBidAmount] = useState("3000");

  const handleInvest = () => {
    const amount = parseInt(investAmount) || 0;
    if (amount <= 0 || game.cash < amount) {
      toast.error("Valor inválido ou saldo insuficiente.");
      return;
    }
    game.doInvest(amount);
    toast.success(`💼 ${formatBRL(amount)} investido! +XP +Score`);
    setInvestOpen(false);
  };

  const handleBid = () => {
    const amount = parseInt(bidAmount) || 0;
    if (amount <= 0 || game.cash < amount) {
      toast.error("Saldo insuficiente para o lance.");
      return;
    }
    const success = game.doBidConsortium(amount);
    if (success) {
      toast.success("🎊 Lance vencedor! Você foi contemplado!");
    } else {
      toast("Lance não venceu este mês.", { description: "O valor foi devolvido às suas parcelas futuras." });
    }
    setBidOpen(false);
  };

  const canBid = game.activeStrategy === "consortium" && game.strategyData && !game.strategyData.contemplated;

  const actions = [
    {
      icon: <Briefcase className="w-5 h-5" />,
      label: "Pegar freela",
      desc: "+25% renda extra",
      onClick: () => {
        game.doSideHustle();
        toast.success("💼 Freela concluído! Dinheiro extra na conta.");
      },
    },
    {
      icon: <PiggyBank className="w-5 h-5" />,
      label: "Investir",
      desc: "Tirar do caixa",
      onClick: () => setInvestOpen(true),
    },
    {
      icon: <Scissors className="w-5 h-5" />,
      label: "Cortar gastos",
      desc: "−10% despesas",
      onClick: () => {
        game.doCutExpenses();
        toast.success("✂️ Gastos reduzidos! Despesa mensal menor.");
      },
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Estudar",
      desc: "+30 XP",
      onClick: () => {
        game.doStudyMore();
        toast.success("📚 Você estudou finanças. +XP +Score");
      },
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: "Academy",
      desc: "Aulas + Quiz",
      onClick: onOpenAcademy,
    },
    ...(canBid ? [{
      icon: <Target className="w-5 h-5" />,
      label: "Dar lance",
      desc: "Antecipar contemplação",
      onClick: () => setBidOpen(true),
      highlight: true,
    }] : []),
  ];

  return (
    <>
      <Card className="p-4 bg-gradient-card border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Ações livres deste mês
          </h3>
          <span className="text-[10px] text-muted-foreground">Use antes de avançar</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {actions.map((a, i) => (
            <button
              key={i}
              onClick={a.onClick}
              className={`p-3 rounded-xl border-2 text-left transition-bounce hover:-translate-y-0.5 ${
                (a as any).highlight
                  ? "border-primary bg-gradient-primary text-primary-foreground shadow-elegant animate-pulse-glow"
                  : "border-border bg-background hover:border-primary hover:bg-accent"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                {a.icon}
                <span className="text-sm font-bold">{a.label}</span>
              </div>
              <span className="text-[11px] opacity-80">{a.desc}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Invest dialog */}
      <Dialog open={investOpen} onOpenChange={setInvestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>💼 Quanto investir?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Investir tira dinheiro do caixa, mas aumenta seu Score Financeiro e patrimônio.
            Saldo disponível: <span className="font-bold text-foreground">{formatBRL(game.cash)}</span>
          </p>
          <Input
            type="number"
            value={investAmount}
            onChange={(e) => setInvestAmount(e.target.value)}
            placeholder="500"
            className="h-12 text-lg"
          />
          <div className="flex gap-2">
            {[500, 1000, 2000].map((v) => (
              <Button key={v} variant="outline" size="sm" onClick={() => setInvestAmount(String(v))}>
                {formatBRL(v)}
              </Button>
            ))}
          </div>
          <Button onClick={handleInvest} className="w-full bg-gradient-primary h-12">
            Investir {formatBRL(parseInt(investAmount) || 0)}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Bid dialog */}
      <Dialog open={bidOpen} onOpenChange={setBidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎯 Dar lance no consórcio</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Quanto maior o lance, maior a chance de ser contemplado este mês.
            Saldo: <span className="font-bold text-foreground">{formatBRL(game.cash)}</span>
          </p>
          <Input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="h-12 text-lg"
          />
          <div className="flex gap-2">
            {[2000, 5000, 10000].map((v) => (
              <Button key={v} variant="outline" size="sm" onClick={() => setBidAmount(String(v))}>
                {formatBRL(v)}
              </Button>
            ))}
          </div>
          <Button onClick={handleBid} className="w-full bg-gradient-primary h-12">
            Lançar {formatBRL(parseInt(bidAmount) || 0)}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
