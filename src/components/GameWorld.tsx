import { useEffect, useState } from "react";
import { useGame } from "@/game/store";
import { ACHIEVEMENTS } from "@/game/engine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "./Logo";
import { MentorChat } from "./MentorChat";
import { Dashboard } from "./Dashboard";
import { GameOverScreen } from "./GameOverScreen";
import { AcademyModal } from "./AcademyModal";
import { CTABanner } from "./CTABanner";
import { Tutorial } from "./Tutorial";
import { Wallet, TrendingUp, Trophy, Sparkles, Award, Zap, HelpCircle } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { FinTipCard } from "./FinTipCard";
import { AchievementWatcher } from "./AchievementToast";
import { restartTutorial } from "./Tutorial";
import { QuizJourney } from "./QuizJourney";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const GameWorld = () => {
  const game = useGame();
  const [academyOpen, setAcademyOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [tipTrigger, setTipTrigger] = useState(0);
  const [prevAnswered, setPrevAnswered] = useState(game.totalAnswered);

  // Mostrar dica nova a cada 3 perguntas respondidas
  useEffect(() => {
    if (game.totalAnswered !== prevAnswered) {
      if (game.totalAnswered > 0 && game.totalAnswered % 3 === 0) {
        setTipTrigger((t) => t + 1);
      }
      setPrevAnswered(game.totalAnswered);
    }
  }, [game.totalAnswered, prevAnswered]);

  if (game.gameOver) return <GameOverScreen />;
  if (game.finished) return <Dashboard />;

  const xpInLevel = game.xp % 100;
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => game.achievements.includes(a.id));
  const accuracy = game.totalAnswered > 0 ? Math.round((game.totalCorrect / game.totalAnswered) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      <AchievementWatcher />
      <Tutorial />
      <AcademyModal open={academyOpen} onOpenChange={setAcademyOpen} />

      <header className="container py-3 flex items-center justify-between gap-2 border-b bg-background/70 backdrop-blur sticky top-0 z-20">
        <Logo />
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={restartTutorial} className="px-2 sm:px-3" title="Reabrir tutorial">
            <HelpCircle className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Tutorial</span>
          </Button>
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
            <StatCard icon={<Wallet />} label="Saldo" value={formatBRL(game.cash)} />
            <StatCard icon={<TrendingUp />} label="Acertos" value={`${accuracy}%`} accent />
            <StatCard icon={<Trophy />} label="Nível" value={`${game.level}`} accent />
            <StatCard icon={<Zap />} label="Score" value={`${game.finScore}/100`} />
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

          {/* GAMEPLAY: Quiz Journey */}
          <QuizJourney onOpenAcademy={() => setAcademyOpen(true)} />

          <FinTipCard trigger={tipTrigger} />

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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <Card
    className={`p-4 tilt-card transition-smooth ${accent ? "border-primary/30 bg-accent" : "bg-gradient-card"}`}
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
