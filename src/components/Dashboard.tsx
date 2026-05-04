import { useGame } from "@/game/store";
import { GOAL_INFO, simulateConsortium, simulateFinancing } from "@/game/engine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "./Logo";
import { Trophy, TrendingUp, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { CTABanner } from "./CTABanner";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const Dashboard = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const game = useGame();
  const goal = GOAL_INFO[game.character.goal];

  const goodDecisions = game.decisions.filter((d) => d.type === "good").length;
  const badDecisions = game.decisions.filter((d) => d.type === "bad").length;
  const totalImpact = game.decisions.reduce((sum, d) => sum + d.impact, 0);

  const fin = simulateFinancing(goal.value);
  const cons = simulateConsortium(goal.value);
  const savedVsFinancing = fin.totalCost - cons.totalCost;

  const rating = game.finScore >= 75 ? "EXCELENTE" : game.finScore >= 50 ? "BOM" : "EM EVOLUÇÃO";
  const ratingColor = game.finScore >= 75 ? "text-success" : game.finScore >= 50 ? "text-primary" : "text-warning";

  return (
    <div className={embedded ? "" : "min-h-screen bg-gradient-hero"}>
      {!embedded && (
        <header className="container py-3 flex items-center justify-between border-b bg-background/60 backdrop-blur sticky top-0 z-10">
          <Logo />
          <UserMenu />
        </header>
      )}

      <main className={embedded ? "max-w-5xl mx-auto" : "container py-8 max-w-5xl"}>
        {/* Hero */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex w-20 h-20 rounded-full bg-gradient-primary items-center justify-center mb-4 shadow-glow animate-pulse-glow">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">
            {embedded ? `Painel de ${game.character.name}` : `Jornada de ${game.character.name} concluída`}
          </h1>
          <p className="text-lg text-muted-foreground">
            Inteligência financeira: <span className={`font-bold ${ratingColor}`}>{rating}</span>
          </p>
        </div>

        {/* Top metrics */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-elegant">
            <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Score Final</p>
            <div className="font-display text-4xl font-bold">{game.finScore}/100</div>
            <p className="text-sm opacity-90 mt-1">Inteligência Financeira</p>
          </Card>
          <Card className="p-6 bg-gradient-card border-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Nível atingido</p>
            <div className="font-display text-4xl font-bold text-primary">{game.level}</div>
            <p className="text-sm text-muted-foreground mt-1">{game.xp} XP acumulado</p>
          </Card>
          <Card className="p-6 bg-gradient-card border-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Quiz</p>
            <div className="font-display text-4xl font-bold text-primary">{game.totalCorrect}/{game.totalAnswered}</div>
            <p className="text-sm text-muted-foreground mt-1">acertos • combo máx. x{game.bestCombo}</p>
          </Card>
        </div>

        {/* Comparison */}
        <Card className="p-8 bg-gradient-card border-2 mb-6 shadow-card">
          <h2 className="font-display text-2xl font-bold mb-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Consórcio vs Financiamento
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Comparação para seu objetivo: {goal.label} ({formatBRL(goal.value)})
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border-2 border-primary bg-accent">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-lg">Consórcio</span>
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <Row label="Parcela" value={formatBRL(cons.monthlyPayment)} />
              <Row label="Prazo" value={`${cons.monthsTotal} meses`} />
              <Row label="Custo total" value={formatBRL(cons.totalCost)} highlight />
              <Row label="Custo extra" value={formatBRL(cons.interest)} positive />
            </div>

            <div className="p-5 rounded-2xl border-2 bg-background">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-bold text-lg">Financiamento</span>
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <Row label="Parcela" value={formatBRL(fin.monthlyPayment)} />
              <Row label="Prazo" value={`${fin.monthsTotal} meses`} />
              <Row label="Custo total" value={formatBRL(fin.totalCost)} highlight />
              <Row label="Juros pagos" value={formatBRL(fin.interest)} negative />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-gradient-primary text-primary-foreground text-center">
            <p className="text-sm opacity-90">Você economizaria com o consórcio:</p>
            <p className="font-display text-3xl font-bold mt-1">{formatBRL(savedVsFinancing)}</p>
          </div>
        </Card>

        {/* Decisions log */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="p-6 bg-gradient-card border-2">
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" /> Decisões boas
            </h3>
            <div className="font-display text-4xl font-bold text-success">{goodDecisions}</div>
            <p className="text-sm text-muted-foreground mt-1">Escolhas inteligentes</p>
          </Card>
          <Card className="p-6 bg-gradient-card border-2">
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" /> Decisões ruins
            </h3>
            <div className="font-display text-4xl font-bold text-destructive">{badDecisions}</div>
            <p className="text-sm text-muted-foreground mt-1">Para aprender</p>
          </Card>
        </div>

        {/* Decision history */}
        {game.decisions.length > 0 && (
          <Card className="p-6 bg-gradient-card border-2 mb-6">
            <h3 className="font-display font-bold text-lg mb-4">Histórico de decisões</h3>
            <div className="space-y-2 max-h-96 overflow-auto">
              {game.decisions.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border">
                  <div>
                    <p className="text-sm font-medium">{d.description}</p>
                    <p className="text-xs text-muted-foreground">Mês {d.month} • {d.choice}</p>
                  </div>
                  <span className={`text-sm font-display font-bold ${d.impact >= 0 ? "text-success" : "text-destructive"}`}>
                    {d.impact >= 0 ? "+" : ""}{formatBRL(d.impact)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <CTABanner />

        <div className="text-center mt-8">
          <Button size="lg" onClick={() => game.resetGame()} className="bg-gradient-primary h-14 px-8 shadow-elegant">
            Jogar novamente
          </Button>
        </div>

        <footer className="text-center text-xs text-muted-foreground mt-12 pt-8 border-t">
          Desenvolvido pela <span className="font-semibold text-foreground">Equipe Code</span> •
          Powered by <span className="font-semibold text-primary">Ademicon</span>
        </footer>
      </main>
    </div>
  );
};

const Row = ({ label, value, highlight, positive, negative }: { label: string; value: string; highlight?: boolean; positive?: boolean; negative?: boolean }) => (
  <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm font-semibold ${highlight ? "font-display text-base" : ""} ${positive ? "text-success" : ""} ${negative ? "text-destructive" : ""}`}>
      {value}
    </span>
  </div>
);
