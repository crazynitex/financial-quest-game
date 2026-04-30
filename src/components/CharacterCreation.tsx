import { useState } from "react";
import { useGame } from "@/game/store";
import { GOAL_INFO, type GoalType } from "@/game/engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import iconHouse from "@/assets/icon-house.png";
import iconCar from "@/assets/icon-car.png";
import iconTravel from "@/assets/icon-travel.png";
import iconMoto from "@/assets/icon-moto.png";
import heroImg from "@/assets/hero-character.jpg";
import { ArrowRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const goalIcons: Record<GoalType, string> = {
  house: iconHouse,
  car: iconCar,
  motorcycle: iconMoto,
  travel: iconTravel,
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const CharacterCreation = () => {
  const initGame = useGame((s) => s.initGame);
  const [name, setName] = useState("");
  const [age, setAge] = useState([28]);
  const [income, setIncome] = useState([4000]);
  const [goal, setGoal] = useState<GoalType>("house");

  const canStart = name.trim().length >= 2;
  const expectedExpenses = Math.round(income[0] * 0.65);
  const monthlyNet = income[0] - expectedExpenses;
  const ageStage = age[0] < 25 ? "Jovem início de carreira" : age[0] < 40 ? "Carreira em ascensão" : age[0] < 55 ? "Estabilidade & legado" : "Pré-aposentadoria";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-gradient-hero">
        <header className="container py-3 sm:py-4 flex items-center justify-between">
          <Logo />
          <UserMenu />
        </header>

        <main className="container grid lg:grid-cols-2 gap-8 lg:gap-12 items-center pb-10 sm:pb-16">
          {/* Left: Hero */}
          <div className="space-y-4 sm:space-y-6 animate-slide-up text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-accent border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider">
                Ademi Conecta • Hackathon Edition
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Aprenda consórcio<br />
              <span className="text-primary">jogando de verdade</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
              Viva uma jornada financeira real, faça lições rápidas, supere imprevistos
              e descubra como o consórcio pode mudar seu futuro — guiado por uma IA mentora.
            </p>
            <img
              src={heroImg}
              alt="Personagem do jogo"
              className="rounded-3xl shadow-elegant w-full max-w-xs sm:max-w-md mx-auto lg:mx-0 animate-float hidden sm:block"
              width={1280}
              height={896}
            />
          </div>

          {/* Right: Form */}
          <Card className="p-5 sm:p-8 lg:p-10 shadow-elegant border-2 bg-gradient-card animate-scale-in">
            <h2 className="font-display text-xl sm:text-2xl font-bold mb-1">Crie seu personagem</h2>
            <p className="text-sm text-muted-foreground mb-6 sm:mb-8">
              Suas escolhas moldarão a aventura.
            </p>

            <div className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do jogador</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="h-11 sm:h-12 text-base"
                />
              </div>

              {/* AGE SLIDER */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <Label className="flex items-center gap-1.5">
                    Idade
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-primary transition-smooth">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">A idade afeta o tempo até suas metas — quanto antes começar, mais o consórcio rende.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div key={age[0]} className="flex items-baseline gap-1 animate-count-up">
                    <span className="font-display text-2xl sm:text-3xl font-bold text-primary tabular-nums">{age[0]}</span>
                    <span className="text-xs text-muted-foreground">anos</span>
                  </div>
                </div>
                <Slider value={age} onValueChange={setAge} min={18} max={65} step={1} />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">18</span>
                  <span key={ageStage} className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-accent animate-pop-in">
                    {ageStage}
                  </span>
                  <span className="text-[10px] text-muted-foreground">65</span>
                </div>
              </div>

              {/* INCOME SLIDER */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <Label className="flex items-center gap-1.5">
                    Renda mensal
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-primary transition-smooth">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[220px]">Renda determina suas despesas iniciais (~65%) e qual parcela cabe no seu bolso. Você pode aumentar com freelas no jogo.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div key={income[0]} className="font-display text-xl sm:text-2xl font-bold text-primary tabular-nums animate-count-up">
                    {formatBRL(income[0])}
                  </div>
                </div>
                <Slider value={income} onValueChange={setIncome} min={1500} max={20000} step={500} />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>R$ 1.500</span><span>R$ 20.000</span>
                </div>
                <div key={monthlyNet} className="grid grid-cols-2 gap-2 mt-2 animate-pop-in">
                  <div className="p-2 rounded-lg bg-secondary text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Despesas est.</p>
                    <p className="text-sm font-bold tabular-nums">{formatBRL(expectedExpenses)}</p>
                  </div>
                  <div className={`p-2 rounded-lg text-center ${monthlyNet >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sobra/mês</p>
                    <p className={`text-sm font-bold tabular-nums ${monthlyNet >= 0 ? "text-success" : "text-destructive"}`}>
                      {formatBRL(monthlyNet)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Seu objetivo principal</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {(Object.keys(GOAL_INFO) as GoalType[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`p-3 sm:p-4 rounded-2xl border-2 transition-bounce flex flex-col items-center gap-1.5 sm:gap-2 ${
                        goal === g
                          ? "border-primary bg-accent shadow-soft scale-105 animate-pop-in"
                          : "border-border hover:border-primary/40 hover:-translate-y-0.5"
                      }`}
                    >
                      {g === "house" || g === "car" || g === "moto" || g === "motorcycle" ? (
                        <img src={goalIcons[g]} alt={GOAL_INFO[g].label} className="w-9 h-9 sm:w-12 sm:h-12 object-contain" loading="lazy" />
                      ) : (
                        <img src={goalIcons[g]} alt={GOAL_INFO[g].label} className="w-9 h-9 sm:w-12 sm:h-12 object-contain" loading="lazy" />
                      )}
                      <span className="text-[11px] sm:text-xs font-semibold text-center leading-tight">{GOAL_INFO[g].label}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">{formatBRL(GOAL_INFO[g].value)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold bg-gradient-primary hover:opacity-90 shadow-elegant"
                disabled={!canStart}
                onClick={() => initGame({ name: name.trim(), age: age[0], income: income[0], goal })}
              >
                Começar a jornada
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </main>

        <footer className="container py-6 sm:py-8 text-center text-xs text-muted-foreground border-t">
          Desenvolvido pela <span className="font-semibold text-foreground">Equipe Code</span> •
          Powered by <span className="font-semibold text-primary">Ademicon</span>
        </footer>
      </div>
    </TooltipProvider>
  );
};
