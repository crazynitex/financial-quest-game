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
import { GameOverScreen } from "./GameOverScreen";
import { AcademyModal } from "./AcademyModal";
import { ActionsPanel } from "./ActionsPanel";
import { CTABanner } from "./CTABanner";
import { Wallet, TrendingUp, Trophy, Calendar, Sparkles, Award, ArrowUp, ArrowDown, Zap, Receipt, PiggyBank } from "lucide-react";
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
  const [academyOpen, setAcademyOpen] = useState(false);
  const [zeroMonths, setZeroMonths] = useState(0);

  useEffect(() => {
    if (game.cash !== prevCash) {
      setCashFlash(game.cash > prevCash ? "up" : "down");
      setPrevCash(game.cash);
      const t = setTimeout(() => setCashFlash(null), 700);
      return () => clearTimeout(t);
    }
  }, [game.cash, prevCash]);

  if (game.gameOver) return <GameOverScreen />;
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
  const monthlyNet = game.character.income - game.monthlyExpenses;

  const triggerEvent = () => setCurrentEvent(pickRandomEvent());

  const advanceMonth = () => {
    // 1. Aplicar fluxo mensal real: renda - despesas
    let cashAfter = game.cash + monthlyNet;
    let scoreDelta = 0;
    let messages: string[] = [`💰 Renda: ${formatBRL(game.character.income)} • 🧾 Despesas: ${formatBRL(game.monthlyExpenses)}`];

    // 2. Pagar parcela da estratégia se houver
    if (game.activeStrategy !== "none" && strat) {
      if (cashAfter < strat.monthlyPayment) {
        // não pode pagar
        toast.error("⚠️ Saldo insuficiente para a parcela do consórcio!", {
          description: "Score caiu. Cuidado com a inadimplência.",
        });
        scoreDelta -= 12;
        const newZero = zeroMonths + 1;
        setZeroMonths(newZero);
        game.applyEvent(monthlyNet, scoreDelta, 5);
        if (newZero >= 2) {
          setTimeout(() => game.triggerGameOver("Você ficou 2 meses sem conseguir pagar suas parcelas. A inadimplência interrompeu sua jornada."), 600);
        }
        return;
      }
      cashAfter -= strat.monthlyPayment;
      game.payMonth();
      messages.push(`📄 Parcela paga: ${formatBRL(strat.monthlyPayment)}`);

      const wasContemplated = strat.contemplated;
      const willBeContemplatedNow = game.activeStrategy === "consortium" && !wasContemplated;

      // sucesso final
      if (strat.monthsPaid + 1 >= strat.monthsTotal) {
        toast.success(`🎉 Você conquistou: ${goal.label}!`, {
          description: "Missão cumprida com sucesso!",
        });
        setConfettiTrigger((t) => t + 1);
        game.applyEvent(monthlyNet, 20, 200);
        setTimeout(() => game.finish(), 1500);
        return;
      }
    }

    // 3. Verificar saldo zerado (sem estratégia ativa)
    if (cashAfter <= 0) {
      const newZero = zeroMonths + 1;
      setZeroMonths(newZero);
      toast.error("💸 Você ficou sem dinheiro!", {
        description: newZero >= 2 ? "Game Over iminente." : "Reaja: pegue um freela ou corte gastos!",
      });
      scoreDelta -= 8;
      if (newZero >= 2) {
        game.applyEvent(monthlyNet, scoreDelta, 10);
        setTimeout(() => game.triggerGameOver("Suas finanças entraram em colapso por 2 meses seguidos. Sem reserva para imprevistos, a jornada terminou aqui."), 600);
        return;
      }
    } else {
      setZeroMonths(0);
    }

    // 4. Evento aleatório (60% chance) ou mês tranquilo
    if (Math.random() < 0.6) {
      // aplica fluxo e mostra evento
      game.applyEvent(monthlyNet - (strat?.monthlyPayment ?? 0), scoreDelta + 1, 15);
      triggerEvent();
    } else {
      game.applyEvent(monthlyNet - (strat?.monthlyPayment ?? 0), scoreDelta + 2, 18);
      toast(messages[0], { description: messages[1] ?? "Mês tranquilo. Saldo atualizado." });
      setTipTrigger((t) => t + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      <AchievementWatcher />
      <AcademyModal open={academyOpen} onOpenChange={setAcademyOpen} />
      <div className="relative">
        <Confetti trigger={confettiTrigger} />
      </div>

      <header className="container py-3 flex items-center justify-between gap-2 border-b bg-background/70 backdrop-blur sticky top-0 z-20">
        <Logo />
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setAcademyOpen(true)} className="px-2 sm:px-3">
            <Sparkles className="w-4 h-4 sm:mr-1.5 text-primary" /> <span className="hidden sm:inline">Academy</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => game.finish()} className="px-2 sm:px-3">
            <Award className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <UserMenu />
        </div>
      </header>

      <main className="container py-4 sm:py-6 grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Game */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 min-w-0">
          {/* Player stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
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

          {/* Fluxo mensal */}
          <Card className="p-3 bg-gradient-card border">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Fluxo mensal</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${monthlyNet >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                {monthlyNet >= 0 ? "+" : ""}{formatBRL(monthlyNet)}/mês
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] sm:text-xs">
              <div className="flex flex-col">
                <span className="flex items-center gap-1 text-muted-foreground"><ArrowUp className="w-3 h-3 text-success" /> Renda</span>
                <span className="font-bold tabular-nums">{formatBRL(game.character.income)}</span>
              </div>
              <div className="flex flex-col">
                <span className="flex items-center gap-1 text-muted-foreground"><Receipt className="w-3 h-3 text-destructive" /> Despesas</span>
                <span className="font-bold tabular-nums">{formatBRL(game.monthlyExpenses)}</span>
              </div>
              <div className="flex flex-col">
                <span className="flex items-center gap-1 text-muted-foreground"><PiggyBank className="w-3 h-3 text-primary" /> Investido</span>
                <span className="font-bold tabular-nums">{formatBRL(game.invested)}</span>
              </div>
            </div>
          </Card>

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
                    {strat.contemplated ? "✓ Contemplado! Carta disponível" : "Aguardando sorteio... (ou dê um lance)"}
                  </div>
                )}
              </div>
            )}

            {game.activeStrategy === "none" ? (
              <StrategyPicker onPick={() => toast.success("Estratégia ativada! Use as ações livres e avance os meses.")} />
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

          {/* Painel de ações livres */}
          {game.activeStrategy !== "none" && (
            <ActionsPanel onOpenAcademy={() => setAcademyOpen(true)} />
          )}

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

          {/* CTA Ademicon */}
          <CTABanner compact />

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
