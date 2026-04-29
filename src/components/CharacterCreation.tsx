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
import heroImg from "@/assets/hero-character.jpg";
import { ArrowRight } from "lucide-react";

const goalIcons: Record<GoalType, string> = {
  house: iconHouse,
  car: iconCar,
  travel: iconTravel,
};

export const CharacterCreation = () => {
  const initGame = useGame((s) => s.initGame);
  const [name, setName] = useState("");
  const [age, setAge] = useState([28]);
  const [income, setIncome] = useState([4000]);
  const [goal, setGoal] = useState<GoalType>("house");

  const canStart = name.trim().length >= 2;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container py-4 flex items-center justify-between">
        <Logo />
        <UserMenu />
      </header>

      <main className="container grid lg:grid-cols-2 gap-12 items-center pb-16">
        {/* Left: Hero */}
        <div className="space-y-6 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Ademi Conecta • Hackathon Edition
            </span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
            Aprenda consórcio<br />
            <span className="text-primary">jogando de verdade</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Viva uma jornada financeira real, faça lições rápidas, supere imprevistos
            e descubra como o consórcio pode mudar seu futuro — guiado por uma IA mentora.
          </p>
          <img
            src={heroImg}
            alt="Personagem do jogo"
            className="rounded-3xl shadow-elegant w-full max-w-md animate-float"
            width={1280}
            height={896}
          />
        </div>

        {/* Right: Form */}
        <Card className="p-8 lg:p-10 shadow-elegant border-2 bg-gradient-card animate-scale-in">
          <h2 className="font-display text-2xl font-bold mb-1">Crie seu personagem</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Suas escolhas moldarão a aventura.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do jogador</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Label>Idade</Label>
                <span className="font-display text-xl font-bold text-primary">{age[0]}</span>
              </div>
              <Slider value={age} onValueChange={setAge} min={18} max={65} step={1} />
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Label>Renda mensal</Label>
                <span className="font-display text-xl font-bold text-primary">
                  R$ {income[0].toLocaleString("pt-BR")}
                </span>
              </div>
              <Slider value={income} onValueChange={setIncome} min={1500} max={20000} step={500} />
            </div>

            <div className="space-y-3">
              <Label>Seu objetivo principal</Label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(GOAL_INFO) as GoalType[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`p-4 rounded-2xl border-2 transition-bounce flex flex-col items-center gap-2 ${
                      goal === g
                        ? "border-primary bg-accent shadow-soft scale-105"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <img src={goalIcons[g]} alt={GOAL_INFO[g].label} className="w-12 h-12 object-contain" />
                    <span className="text-xs font-semibold text-center">{GOAL_INFO[g].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold bg-gradient-primary hover:opacity-90 shadow-elegant"
              disabled={!canStart}
              onClick={() => initGame({ name: name.trim(), age: age[0], income: income[0], goal })}
            >
              Começar a jornada
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </Card>
      </main>

      <footer className="container py-8 text-center text-xs text-muted-foreground border-t">
        Desenvolvido pela <span className="font-semibold text-foreground">Equipe Code</span> •
        Powered by <span className="font-semibold text-primary">Ademicon</span>
      </footer>
    </div>
  );
};
