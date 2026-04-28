import { useState } from "react";
import { useGame } from "@/game/store";
import { GOAL_INFO, simulateConsortium, simulateFinancing, simulateSavings } from "@/game/engine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, TrendingDown, Clock, Award } from "lucide-react";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const StrategyPicker = ({ onPick }: { onPick: () => void }) => {
  const game = useGame();
  const target = GOAL_INFO[game.character.goal].value;
  const monthlyBudget = Math.round(game.character.income * 0.3);

  const fin = simulateFinancing(target, 60);
  const cons = simulateConsortium(target, 80);
  const sav = simulateSavings(target, monthlyBudget);

  const [tab, setTab] = useState<"consortium" | "financing" | "savings">("consortium");

  const handleStart = (type: "consortium" | "financing" | "savings") => {
    const data =
      type === "consortium"
        ? { ...cons, targetValue: target }
        : type === "financing"
        ? { ...fin, targetValue: target }
        : { ...sav, targetValue: target };
    game.startStrategy(type, data);
    game.addDecision({
      month: game.month,
      description: `Escolheu ${type === "consortium" ? "Consórcio" : type === "financing" ? "Financiamento" : "Poupança"}`,
      choice: type,
      impact: 0,
      scoreImpact: type === "consortium" ? 15 : type === "savings" ? 8 : -5,
      type: type === "financing" ? "bad" : "good",
    });
    onPick();
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="font-display text-2xl font-bold">Como vai conquistar seu objetivo?</h2>
        <p className="text-sm text-muted-foreground">
          Objetivo: <span className="font-semibold text-foreground">{GOAL_INFO[game.character.goal].label}</span> •{" "}
          {formatBRL(target)}
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid grid-cols-3 w-full h-12">
          <TabsTrigger value="consortium" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-1.5" /> Consórcio
          </TabsTrigger>
          <TabsTrigger value="financing">Financiamento</TabsTrigger>
          <TabsTrigger value="savings">Poupança</TabsTrigger>
        </TabsList>

        <TabsContent value="consortium" className="mt-4">
          <Card className="p-6 space-y-4 border-2 border-primary/30 bg-gradient-card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-xl flex items-center gap-2">
                  Consórcio Ademicon
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">
                    RECOMENDADO
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sem juros. Apenas taxa de administração. Contemplação por sorteio ou lance.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Parcela" value={formatBRL(cons.monthlyPayment)} icon={<Clock className="w-4 h-4" />} />
              <Stat label="Prazo" value={`${cons.monthsTotal}m`} icon={<Clock className="w-4 h-4" />} />
              <Stat label="Custo extra" value={formatBRL(cons.interest)} icon={<TrendingUp className="w-4 h-4 text-success" />} positive />
            </div>
            <Button onClick={() => handleStart("consortium")} className="w-full bg-gradient-primary h-12 text-base font-semibold">
              Entrar no consórcio
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="financing" className="mt-4">
          <Card className="p-6 space-y-4 bg-gradient-card">
            <div>
              <h3 className="font-display font-bold text-xl">Financiamento bancário</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Bem na hora. Mas com juros altos compostos.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Parcela" value={formatBRL(fin.monthlyPayment)} icon={<Clock className="w-4 h-4" />} />
              <Stat label="Prazo" value={`${fin.monthsTotal}m`} icon={<Clock className="w-4 h-4" />} />
              <Stat label="Juros pagos" value={formatBRL(fin.interest)} icon={<TrendingDown className="w-4 h-4 text-destructive" />} />
            </div>
            <Button onClick={() => handleStart("financing")} variant="outline" className="w-full h-12">
              Financiar mesmo assim
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="mt-4">
          <Card className="p-6 space-y-4 bg-gradient-card">
            <div>
              <h3 className="font-display font-bold text-xl">Poupar por conta própria</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Disciplina pura. Sem juros pagos, mas demora mais.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Mensal" value={formatBRL(sav.monthlyPayment)} icon={<Clock className="w-4 h-4" />} />
              <Stat label="Tempo" value={`${sav.monthsTotal}m`} icon={<Clock className="w-4 h-4" />} />
              <Stat label="Custo extra" value="R$ 0" icon={<Award className="w-4 h-4 text-success" />} positive />
            </div>
            <Button onClick={() => handleStart("savings")} variant="outline" className="w-full h-12">
              Começar a poupar
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Stat = ({ label, value, icon, positive }: { label: string; value: string; icon: React.ReactNode; positive?: boolean }) => (
  <div className="bg-background rounded-xl p-3 border">
    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`font-display font-bold text-base ${positive ? "text-success" : ""}`}>{value}</div>
  </div>
);
