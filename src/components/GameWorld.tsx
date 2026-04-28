import { useState } from "react";
import { useGame } from "@/game/store";
import { GOAL_INFO, pickRandomEvent, type LifeEvent } from "@/game/engine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "./Logo";
import { MentorChat } from "./MentorChat";
import { StrategyPicker } from "./StrategyPicker";
import { Dashboard } from "./Dashboard";
import { Wallet, TrendingUp, Trophy, Calendar, Sparkles, RotateCcw, Award } from "lucide-react";
import { toast } from "sonner";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const GameWorld = () => {
  const game = useGame();
  const [currentEvent, setCurrentEvent] = useState<LifeEvent | null>(null);

  if (game.finished) return <Dashboard />;

  const goal = GOAL_INFO[game.character.goal];
  const strat = game.strategyData;
  const progress = strat
    ? game.activeStrategy === "savings"
      ? Math.min(100, (strat.monthsPaid / strat.monthsTotal) * 100)
      : strat.contemplated
      ? Math.min(100, ((strat.monthsPaid) / strat.monthsTotal) * 100)
      : Math.min(95, (strat.monthsPaid / strat.monthsTotal) * 100)
    : 0;

  const triggerEvent = () => {
    setCurrentEvent(pickRandomEvent());
  };

  const advanceMonth = () => {
    if (game.activeStrategy !== "none" && strat) {
      if (game.cash < strat.monthlyPayment) {
        toast.error("Saldo insuficiente para a parcela!", {
          description: "Sua reserva acabou. Cuidado com a inadimplência.",
        });
        game.applyEvent(0, -10, 5);
        return;
      }
      game.payMonth();
      // Verifica conclusão
      if (strat.monthsPaid + 1 >= strat.monthsTotal || (game.activeStrategy === "consortium" && strat.contemplated)) {
        if (strat.contemplated || strat.monthsPaid + 1 >= strat.monthsTotal) {
          toast.success(`🎉 Você conquistou: ${goal.label}!`, {
            description: "Missão cumprida com sucesso!",
          });
          game.applyEvent(game.character.income, 20, 200);
          setTimeout(() => game.finish(), 1500);
          return;
        }
      }
      if (game.activeStrategy === "consortium" && strat.contemplated && strat.monthsPaid === 0) {
        toast.success("🎊 Você foi contemplado!", {
          description: "Sua carta de crédito está disponível!",
        });
      }
    }
    // 50% chance de evento de vida
    if (Math.random() < 0.6) {
      triggerEvent();
    } else {
      game.applyEvent(game.character.income - Math.round(game.character.income * 0.7), 1, 15);
      toast("Mês tranquilo", { description: "Receita - despesas básicas computadas." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container py-4 flex items-center justify-between border-b">
        <Logo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => game.finish()}>
            <Award className="w-4 h-4 mr-1.5" /> Ver Dashboard
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { game.resetGame(); }}>
            <RotateCcw className="w-4 h-4 mr-1.5" /> Reiniciar
          </Button>
        </div>
      </header>

      <main className="container py-6 grid lg:grid-cols-3 gap-6">
        {/* Left: Game */}
        <div className="lg:col-span-2 space-y-4">
          {/* Player stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Wallet />} label="Saldo" value={formatBRL(game.cash)} />
            <StatCard icon={<Calendar />} label="Mês" value={`${game.month}`} />
            <StatCard icon={<TrendingUp />} label="Score Fin." value={`${game.finScore}/100`} accent />
            <StatCard icon={<Trophy />} label="Nível" value={`${game.level}`} accent />
          </div>

          {/* Mission card */}
          <Card className="p-6 bg-gradient-card border-2 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                  Missão atual
                </p>
                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl">{goal.emoji}</span> {goal.label}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Valor alvo: {formatBRL(goal.value)}
                </p>
              </div>
              {game.activeStrategy !== "none" && (
                <span className="text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground font-semibold uppercase">
                  {game.activeStrategy === "consortium" ? "Consórcio" : game.activeStrategy === "financing" ? "Financiamento" : "Poupança"}
                </span>
              )}
            </div>

            {strat && (
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-semibold">
                    {strat.monthsPaid}/{strat.monthsTotal} meses • {formatBRL(strat.monthlyPayment)}/mês
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                {game.activeStrategy === "consortium" && (
                  <div className={`text-sm font-semibold flex items-center gap-1.5 ${strat.contemplated ? "text-success" : "text-muted-foreground"}`}>
                    <Sparkles className="w-4 h-4" />
                    {strat.contemplated ? "✓ Contemplado! Carta disponível" : "Aguardando sorteio..."}
                  </div>
                )}
              </div>
            )}

            {game.activeStrategy === "none" ? (
              <StrategyPicker onPick={() => toast.success("Estratégia ativada! Avance os meses.")} />
            ) : (
              <Button onClick={advanceMonth} size="lg" className="w-full h-14 bg-gradient-primary text-base font-semibold shadow-elegant">
                <Calendar className="w-5 h-5 mr-2" /> Avançar 1 mês
              </Button>
            )}
          </Card>

          {/* Event modal */}
          {currentEvent && (
            <Card className="p-6 border-2 border-primary shadow-elegant animate-scale-in bg-gradient-card">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-4xl">{currentEvent.emoji}</span>
                <div>
                  <h3 className="font-display font-bold text-xl">{currentEvent.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentEvent.description}</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {currentEvent.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      game.applyEvent(opt.cashImpact, opt.scoreImpact, opt.xpGain);
                      game.addDecision({
                        month: game.month,
                        description: currentEvent.title,
                        choice: opt.label,
                        impact: opt.cashImpact,
                        scoreImpact: opt.scoreImpact,
                        type: opt.type,
                      });
                      const toastFn = opt.type === "good" ? toast.success : opt.type === "bad" ? toast.error : toast;
                      toastFn(opt.feedback);
                      setCurrentEvent(null);
                    }}
                    className="w-full text-left p-4 rounded-xl border-2 hover:border-primary hover:bg-accent transition-smooth flex justify-between items-center group"
                  >
                    <span className="font-medium text-sm">{opt.label}</span>
                    <span className={`text-sm font-display font-bold ${opt.cashImpact >= 0 ? "text-success" : "text-destructive"}`}>
                      {opt.cashImpact >= 0 ? "+" : ""}{formatBRL(opt.cashImpact)}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Mentor */}
        <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <MentorChat />
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) => (
  <Card className={`p-4 ${accent ? "border-primary/30 bg-accent" : "bg-gradient-card"}`}>
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
      <span className={accent ? "text-primary" : ""}>{icon}</span>
      <span className="uppercase tracking-wider font-semibold">{label}</span>
    </div>
    <div className="font-display text-xl font-bold">{value}</div>
  </Card>
);
