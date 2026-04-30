import { useGame } from "@/game/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { CTABanner } from "./CTABanner";
import { RotateCcw, AlertTriangle, BookOpen, Sparkles } from "lucide-react";

export const GameOverScreen = () => {
  const { gameOverReason, totalAnswered, totalCorrect, bestCombo, goalProgress, quizResetRun } = useGame();
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const lessons = [
    "Use a Academy para revisar os fundamentos antes de tentar de novo.",
    "Power-ups (Dica e 50/50) são valiosos em perguntas difíceis.",
    "Mantenha o combo: cada acerto seguido aumenta as recompensas em 10%.",
    "Pergunte ao Mentor IA quando travar — ele explica qualquer conceito.",
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container py-3 flex items-center justify-between border-b bg-background/60 backdrop-blur sticky top-0 z-10">
        <Logo />
        <UserMenu />
      </header>

      <main className="container py-12 max-w-3xl">
        <div className="text-center mb-8 animate-scale-in">
          <div className="inline-flex w-20 h-20 rounded-full bg-destructive/15 items-center justify-center mb-4">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="font-display text-4xl font-bold mb-2">Game Over</h1>
          <p className="text-lg text-muted-foreground">
            {gameOverReason ?? "Você perdeu todas as vidas."}
          </p>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 bg-gradient-card border-2 text-center">
            <p className="text-xs uppercase text-muted-foreground">Acertos</p>
            <p className="font-display text-3xl font-bold text-primary">{accuracy}%</p>
          </Card>
          <Card className="p-4 bg-gradient-card border-2 text-center">
            <p className="text-xs uppercase text-muted-foreground">Respondidas</p>
            <p className="font-display text-3xl font-bold text-primary">{totalAnswered}</p>
          </Card>
          <Card className="p-4 bg-gradient-card border-2 text-center">
            <p className="text-xs uppercase text-muted-foreground">Maior combo</p>
            <p className="font-display text-3xl font-bold text-primary">x{bestCombo}</p>
          </Card>
          <Card className="p-4 bg-gradient-card border-2 text-center">
            <p className="text-xs uppercase text-muted-foreground">Progresso</p>
            <p className="font-display text-3xl font-bold text-primary">{Math.round(goalProgress)}%</p>
          </Card>
        </div>

        <Card className="p-6 bg-gradient-card border-2 mb-6">
          <h3 className="font-display font-bold text-lg flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" /> Como vencer da próxima
          </h3>
          <ul className="space-y-2 text-sm">
            {lessons.map((l, i) => (
              <li key={i} className="flex gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </Card>

        <CTABanner />

        <div className="text-center mt-8">
          <Button size="lg" onClick={quizResetRun} className="bg-gradient-primary h-14 px-8 shadow-elegant">
            <RotateCcw className="w-5 h-5 mr-2" /> Recomeçar a jornada
          </Button>
        </div>
      </main>
    </div>
  );
};
