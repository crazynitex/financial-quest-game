import { useEffect, useState } from "react";
import { useGame } from "@/game/store";
import { GOAL_INFO, pickRandomEvent, ACHIEVEMENTS, type LifeEvent } from "@/game/engine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "./Logo";
import { MentorChat } from "./MentorChat";
import { StrategyPicker } from "./StrategyPicker";
import { Dashboard } from "./Dashboard";
import { Wallet, TrendingUp, Trophy, Calendar, Sparkles, Award, ArrowUp, ArrowDown, Zap } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { toast } from "sonner";
import { FinTipCard } from "./FinTipCard";
import { Confetti } from "./Confetti";
import { AchievementWatcher } from "./AchievementToast";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const GameWorld = () => {
  const game = useGame();
  const [currentEvent, setCurrentEvent] = useState<LifeEvent | null>(null);
  const [tipTrigger, setTipTrigger] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [cashFlash, setCashFlash] = useState<"up" | "down" | null>(null);
  const [prevCash, setPrevCash] = useState(game.cash);

  useEffect(() => {
    if (game.cash !== prevCash) {
      setCashFlash(game.cash > prevCash ? "up" : "down");
      setPrevCash(game.cash);
      const t = setTimeout(() => setCashFlash(null), 700);
      return () => clearTimeout(t);
    }
  }, [game.cash, prevCash]);

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

  const xpInLevel = game.xp % 100;
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => game.achievements.includes(a.id));

  const triggerEvent = () => setCurrentEvent(pickRandomEvent());

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
      if (strat.monthsPaid + 1 >= strat.monthsTotal || (game.activeStrategy === "consortium" && strat.contemplated)) {
        if (strat.contemplated || strat.monthsPaid + 1 >= strat.monthsTotal) {
          toast.success(`🎉 Você conquistou: ${goal.label}!`, {
            description: "Missão cumprida com sucesso!",
          });
          setConfettiTrigger((t) => t + 1);
          game.applyEvent(game.character.income, 20, 200);
          setTimeout(() => game.finish(), 1500);
          return;
        }
      }
      if (game.activeStrategy === "consortium" && strat.contemplated && strat.monthsPaid === 0) {
        toast.success("🎊 Você foi contemplado!", {
          description: "Sua carta de crédito está disponível!",
        });
        setConfettiTrigger((t) => t + 1);
      }
    }
    if (Math.random() < 0.6) {
      triggerEvent();
    } else {
      game.applyEvent(game.character.income - Math.round(game.character.income * 0.7), 1, 15);
      toast("Mês tranquilo", { description: "Receita - despesas básicas computadas." });
      // a cada mês tranquilo, mostra uma nova dica
      setTipTrigger((t) => t + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      <AchievementWatcher />
      <div className="relative">
        <Confetti trigger={confettiTrigger} />
      </div>

      <header className="container py-3 flex items-center justify-between border-b bg-background/70 backdrop-blur sticky top-0 z-20">
        <Logo />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => game.finish()}>
            <Award className="w-4 h-4 mr-1.5" /> <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <UserMenu />
        </div>
      </header>

      <main className="container py-6 grid lg:grid-cols-3 gap-6">
        {/* Left: Game */}
        <div className="lg:col-span-2 space-y-4">
          {/* Player stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={<Wallet />}
              label="Saldo"
              value={formatBRL(game.cash)}
              flash={cashFlash}
            />
            <StatCard icon={<Calendar />} label="Mês" value={`${game.month}`} />
            <StatCard icon={<TrendingUp />} label="Score Fin." value={`${game.finScore}/100`} accent />
            <StatCard icon={<Trophy />} label="Nível" value={`${game.level}`} accent />
          </div>

          {/* XP bar */}
          <Card className="p-3 bg-gradient-card border">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-warning" /> XP — Nível {game.level}
              </span>
              <span className="text-muted-foreground tabular-nums">{xpInLevel}/100 XP</span>
            </div>
            <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-primary transition-all duration-500 ease-out"
                style={{ width: `${xpInLevel}%` }}
              />
              <div className="absolute inset-0 shimmer" />
            </div>
          </Card>

          {/* Dica financeira animada */}
          <FinTipCard trigger={tipTrigger} />

          {/* Mission card */}
          <Card className="p-6 bg-gradient-card border-2 shadow-card relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                  Missão atual
                </p>
                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                  <span className="text-3xl animate-float inline-block">{goal.emoji}</span> {goal.label}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Valor alvo: {formatBRL(goal.value)}
                </p>
              </div>
              {game.activeStrategy !== "none" && (
                <span className="text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground font-semibold uppercase animate-pop-in">
                  {game.activeStrategy === "consortium" ? "Consórcio" : game.activeStrategy === "financing" ? "Financiamento" : "Poupança"}
                </span>
              )}
            </div>

            {strat && (
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-semibold tabular-nums">
                    {strat.monthsPaid}/{strat.monthsTotal} meses • {formatBRL(strat.monthlyPayment)}/mês
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                {game.activeStrategy === "consortium" && (
                  <div className={`text-sm font-semibold flex items-center gap-1.5 ${strat.contemplated ? "text-success animate-pop-in" : "text-muted-foreground"}`}>
                    <Sparkles className={`w-4 h-4 ${!strat.contemplated && "animate-pulse"}`} />
                    {strat.contemplated ? "✓ Contemplado! Carta disponível" : "Aguardando sorteio..."}
                  </div>
                )}
              </div>
            )}

            {game.activeStrategy === "none" ? (
              <StrategyPicker onPick={() => toast.success("Estratégia ativada! Avance os meses.")} />
            ) : (
              <Button
                onClick={advanceMonth}
                size="lg"
                className="w-full h-14 bg-gradient-primary text-base font-semibold shadow-elegant hover:shadow-glow transition-smooth hover:-translate-y-0.5"
              >
                <Calendar className="w-5 h-5 mr-2" /> Avançar 1 mês
              </Button>
            )}
          </Card>

          {/* Conquistas */}
          {unlockedAchievements.length > 0 && (
            <Card className="p-4 bg-gradient-card border">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-warning" />
                <h3 className="text-xs uppercase tracking-wider font-bold">
                  Conquistas ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {ACHIEVEMENTS.map((a) => {
                  const got = game.achievements.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      title={`${a.title} — ${a.description}`}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-smooth ${
                        got
                          ? "bg-warning/10 border-warning/30 text-foreground animate-pop-in"
                          : "bg-secondary border-border text-muted-foreground opacity-50 grayscale"
                      }`}
                    >
                      <span className="text-base">{a.emoji}</span>
                      <span className="hidden sm:inline">{a.title}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Event modal */}
          {currentEvent && (
            <Card className="p-6 border-2 border-primary shadow-elegant animate-pop-in bg-gradient-card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
              <div className="flex items-start gap-3 mb-3">
                <span className="text-5xl animate-wiggle">{currentEvent.emoji}</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">
                    Evento da vida
                  </p>
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
                      if (opt.type === "good" && opt.cashImpact >= 0) setConfettiTrigger((t) => t + 1);
                      setTipTrigger((t) => t + 1);
                      setCurrentEvent(null);
                    }}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="w-full text-left p-4 rounded-xl border-2 hover:border-primary hover:bg-accent transition-smooth flex justify-between items-center group animate-slide-in-right hover:-translate-y-0.5"
                  >
                    <span className="font-medium text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-secondary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-[11px] font-bold transition-smooth">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt.label}
                    </span>
                    <span className={`text-sm font-display font-bold flex items-center gap-1 ${opt.cashImpact >= 0 ? "text-success" : "text-destructive"}`}>
                      {opt.cashImpact >= 0 ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                      {formatBRL(Math.abs(opt.cashImpact))}
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

const StatCard = ({
  icon,
  label,
  value,
  accent,
  flash,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  flash?: "up" | "down" | null;
}) => (
  <Card
    className={`p-4 tilt-card transition-smooth ${accent ? "border-primary/30 bg-accent" : "bg-gradient-card"} ${
      flash === "up" ? "ring-2 ring-success/50" : flash === "down" ? "ring-2 ring-destructive/50" : ""
    }`}
  >
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
      <span className={accent ? "text-primary" : ""}>{icon}</span>
      <span className="uppercase tracking-wider font-semibold">{label}</span>
    </div>
    <div key={value} className="font-display text-xl font-bold animate-count-up tabular-nums">
      {value}
    </div>
  </Card>
);
