import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/game/store";
import { CHAPTERS, QUIZ_BANK, questionsByChapter, reward, type QuizQuestion } from "@/game/quizBank";
import { GOAL_INFO } from "@/game/engine";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Zap, Lightbulb, Scissors, Sparkles, Check, X, ArrowRight, Trophy, Flame, BookOpen, Timer, AlertTriangle, FastForward } from "lucide-react";
import { toast } from "sonner";
import { Confetti } from "./Confetti";
import { MentorFollowup } from "./MentorFollowup";

const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

interface Props {
  onOpenAcademy: () => void;
}

export const QuizJourney = ({ onOpenAcademy }: Props) => {
  const game = useGame();
  const goal = GOAL_INFO[game.character.goal];

  const [picked, setPicked] = useState<number | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [trapRevealed, setTrapRevealed] = useState<number | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [chapterTransition, setChapterTransition] = useState<number | null>(null);

  // Próxima pergunta: do capítulo atual, ainda não respondida
  const currentQuestion = useMemo<QuizQuestion | null>(() => {
    const inChapter = questionsByChapter(game.currentChapter).filter(
      (q) => !game.answeredIds.includes(q.id)
    );
    if (inChapter.length === 0) return null;
    return inChapter[0];
  }, [game.currentChapter, game.answeredIds]);

  // Reset estado ao trocar pergunta
  useEffect(() => {
    setPicked(null);
    setHintShown(false);
    setEliminated([]);
    setTrapRevealed(null);
    setTimeLeft(currentQuestion?.difficulty === "boss" ? 30 : 20);
  }, [currentQuestion?.id]);

  // Timer countdown
  useEffect(() => {
    if (!currentQuestion || picked != null) return;
    if (timeLeft <= 0) {
      // tempo esgotado = errada
      handlePick(-1);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, picked, currentQuestion]);

  // Detecta fim de capítulo
  useEffect(() => {
    if (!currentQuestion) {
      const remaining = QUIZ_BANK.filter((q) => !game.answeredIds.includes(q.id));
      const inOtherChapter = remaining.find((q) => q.chapter > game.currentChapter);
      if (inOtherChapter && game.currentChapter < 4) {
        setChapterTransition(game.currentChapter + 1);
      }
    }
  }, [currentQuestion, game.answeredIds, game.currentChapter]);

  if (!currentQuestion) {
    // Acabaram as perguntas (ou transição de capítulo)
    if (chapterTransition) {
      const ch = CHAPTERS.find((c) => c.id === chapterTransition);
      return (
        <Card className="p-8 text-center bg-gradient-card border-2 border-primary shadow-elegant animate-pop-in">
          <div className="text-6xl mb-3 animate-float inline-block">{ch?.emoji}</div>
          <p className="text-xs uppercase tracking-widest font-bold text-primary mb-1">Capítulo desbloqueado</p>
          <h2 className="font-display text-3xl font-bold mb-2">{ch?.title}</h2>
          <p className="text-muted-foreground mb-5">{ch?.desc}</p>
          <div className="flex gap-2 justify-center text-xs mb-5">
            <span className="px-3 py-1.5 rounded-full bg-success/10 text-success font-bold flex items-center gap-1"><Heart className="w-3 h-3" /> +1 vida</span>
            <span className="px-3 py-1.5 rounded-full bg-warning/10 text-warning font-bold flex items-center gap-1"><Lightbulb className="w-3 h-3" /> +1 dica</span>
            <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold flex items-center gap-1"><Scissors className="w-3 h-3" /> +1 50/50</span>
          </div>
          <Button
            size="lg"
            className="bg-gradient-primary shadow-elegant"
            onClick={() => {
              game.quizAdvanceChapter();
              game.quizRefillLives();
              setChapterTransition(null);
              setConfetti((c) => c + 1);
            }}
          >
            Começar capítulo <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Confetti trigger={confetti} />
        </Card>
      );
    }
    // Sem mais perguntas no capítulo atual e sem transição = jornada concluída
    return (
      <Card className="p-8 text-center bg-gradient-card border-2 shadow-elegant animate-pop-in">
        <Trophy className="w-16 h-16 text-warning mx-auto mb-3 animate-float" />
        <h2 className="font-display text-3xl font-bold mb-2">Jornada completa!</h2>
        <p className="text-muted-foreground mb-5">Você dominou todos os conceitos do consórcio.</p>
        <Button size="lg" className="bg-gradient-primary" onClick={() => game.finish()}>
          Ver meu Dashboard <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </Card>
    );
  }

  const q = currentQuestion;
  const r = reward(q.difficulty);
  const showResult = picked !== null;
  const isCorrect = picked != null && picked >= 0 && q.options[picked].correct;

  function handlePick(idx: number) {
    if (picked != null) return;
    setPicked(idx);
    const correct = idx >= 0 && q.options[idx].correct;
    if (correct) {
      game.quizCorrectAnswer(q.id, r);
      setConfetti((c) => c + 1);
      const newCombo = game.combo + 1;
      if (newCombo >= 3) {
        toast.success(`🔥 Combo x${newCombo}!`, { description: `+${Math.round((newCombo - 1) * 10)}% em recompensas.` });
      }
    } else {
      game.quizWrongAnswer(q.id);
      if (idx < 0) toast.error("⏰ Tempo esgotado!");
    }
  }

  const handleHint = () => {
    if (hintShown) return;
    if (game.quizUseHint()) {
      setHintShown(true);
    } else {
      toast.error("Sem dicas restantes neste capítulo.");
    }
  };

  const handleFifty = () => {
    if (eliminated.length > 0 || q.options.length <= 2) return;
    if (game.quizUseFiftyFifty()) {
      // elimina 2 erradas (deixa correta + 1 errada se tiver 3+; deixa só correta se tiver 2)
      const wrongIdxs = q.options.map((o, i) => (o.correct ? -1 : i)).filter((i) => i >= 0);
      const toRemove = wrongIdxs.sort(() => Math.random() - 0.5).slice(0, Math.min(2, wrongIdxs.length - 0));
      // garante deixar pelo menos 2 opções visíveis
      const keep = q.options.length - toRemove.length < 2 ? toRemove.slice(0, q.options.length - 2) : toRemove;
      setEliminated(keep);
    } else {
      toast.error("Sem 50/50 restantes.");
    }
  };

  const chapter = CHAPTERS.find((c) => c.id === q.chapter)!;
  const diffLabel = { easy: "Fácil", medium: "Médio", hard: "Difícil", boss: "BOSS" }[q.difficulty];
  const diffColor = {
    easy: "bg-success/15 text-success",
    medium: "bg-primary/15 text-primary",
    hard: "bg-warning/15 text-warning",
    boss: "bg-destructive/15 text-destructive animate-pulse",
  }[q.difficulty];

  const progressColor = game.goalProgress >= 75 ? "from-success to-success" : "from-primary to-primary-glow";

  return (
    <div className="space-y-3 sm:space-y-4">
      <Confetti trigger={confetti} />

      {/* HUD: Progresso rumo ao objetivo */}
      <Card className="p-4 bg-gradient-card border-2 shadow-card relative overflow-hidden">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-0.5">
              Jornada rumo a:
            </p>
            <h2 className="font-display text-lg sm:text-xl font-bold flex items-center gap-2">
              <span className="text-2xl animate-float inline-block">{goal.emoji}</span>
              <span className="truncate">{goal.label}</span>
            </h2>
          </div>
          <span className="text-2xl font-display font-bold text-primary tabular-nums shrink-0">
            {Math.round(game.goalProgress)}%
          </span>
        </div>
        {/* Barra de progresso visual com mascote */}
        <div className="relative h-6 rounded-full bg-secondary overflow-hidden border">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${progressColor} transition-all duration-700 ease-out`}
            style={{ width: `${game.goalProgress}%` }}
          />
          <div className="absolute inset-0 shimmer" />
          <div
            className="absolute top-1/2 -translate-y-1/2 text-xl transition-all duration-700 ease-out drop-shadow"
            style={{ left: `calc(${Math.min(game.goalProgress, 95)}% - 12px)` }}
          >
            🏃
          </div>
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 text-lg opacity-80">
            {goal.emoji}
          </div>
        </div>
      </Card>

      {/* HUD: Vidas, Combo, Capítulo */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="p-3 bg-gradient-card border flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Vidas</p>
            <div className="flex gap-0.5 mt-0.5">
              {[0, 1, 2].map((i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-all ${
                    i < game.lives ? "text-destructive fill-destructive animate-pulse" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
        <Card className={`p-3 border flex items-center justify-between ${game.combo >= 3 ? "bg-warning/10 border-warning/40" : "bg-gradient-card"}`}>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Combo</p>
            <div className="flex items-center gap-1">
              <Flame className={`w-4 h-4 ${game.combo >= 3 ? "text-warning animate-wiggle" : "text-muted-foreground/40"}`} />
              <span className="font-display text-lg font-bold tabular-nums">x{game.combo}</span>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-card border flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Capítulo</p>
            <div className="flex items-center gap-1">
              <span className="text-lg">{chapter.emoji}</span>
              <span className="font-display text-lg font-bold tabular-nums">{q.chapter}/4</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Pergunta atual */}
      <Card className="p-4 sm:p-6 bg-gradient-card border-2 shadow-elegant animate-pop-in relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />

        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${diffColor}`}>
              {diffLabel}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-secondary text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-2.5 h-2.5" /> Cap. {q.chapter}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent text-primary flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> +{r.xp} XP • +{r.progress}%
            </span>
          </div>
          <div className={`flex items-center gap-1 text-sm font-bold tabular-nums ${timeLeft <= 5 ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
            <Timer className="w-4 h-4" /> {timeLeft}s
          </div>
        </div>

        <div className="flex items-start gap-3 mb-4">
          <span className="text-4xl sm:text-5xl animate-float inline-block">{q.emoji}</span>
          <h3 className="font-display text-base sm:text-lg font-bold leading-tight pt-1">
            {q.question}
          </h3>
        </div>

        {/* Power-ups */}
        {!showResult && (
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleHint}
              disabled={hintShown || game.hintsLeft <= 0}
              className="text-xs flex-1"
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1 text-warning" /> Dica ({game.hintsLeft})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFifty}
              disabled={eliminated.length > 0 || game.fiftyLeft <= 0 || q.options.length <= 2}
              className="text-xs flex-1"
            >
              <Scissors className="w-3.5 h-3.5 mr-1 text-primary" /> 50/50 ({game.fiftyLeft})
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenAcademy} className="text-xs flex-1">
              <BookOpen className="w-3.5 h-3.5 mr-1" /> Estudar
            </Button>
          </div>
        )}

        {hintShown && !showResult && (
          <Card className="p-3 mb-3 bg-warning/10 border-warning/30 animate-slide-up">
            <p className="text-xs flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <span><strong className="text-warning">Dica:</strong> {q.hint}</span>
            </p>
          </Card>
        )}

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isEliminated = eliminated.includes(i);
            const isPicked = picked === i;
            const reveal = showResult;
            return (
              <button
                key={i}
                disabled={showResult || isEliminated}
                onClick={() => handlePick(i)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-smooth flex items-center gap-3 animate-slide-in-right ${
                  isEliminated
                    ? "opacity-30 line-through cursor-not-allowed"
                    : reveal && opt.correct
                    ? "border-success bg-success/10 animate-pop-in"
                    : reveal && isPicked && !opt.correct
                    ? "border-destructive bg-destructive/10"
                    : isPicked
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/60 hover:bg-accent/40 hover:-translate-y-0.5 hover:shadow-soft"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    reveal && opt.correct
                      ? "bg-success text-success-foreground"
                      : reveal && isPicked && !opt.correct
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm font-medium flex-1">{opt.label}</span>
                {reveal && opt.correct && <Check className="w-5 h-5 text-success shrink-0" />}
                {reveal && isPicked && !opt.correct && <X className="w-5 h-5 text-destructive shrink-0" />}
              </button>
            );
          })}
        </div>

        {showResult && (
          <Card
            className={`p-4 mt-4 animate-slide-up ${
              isCorrect ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"
            }`}
          >
            <p className="text-sm font-bold mb-1 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> {isCorrect ? "Resposta correta!" : picked === -1 ? "Tempo esgotado!" : "Resposta incorreta"}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              {picked === -1
                ? `A resposta certa era: "${q.options.find((o) => o.correct)?.label}". ${q.options.find((o) => o.correct)?.explain}`
                : q.options[picked].explain}
            </p>
            {isCorrect && (
              <p className="text-xs font-bold text-success">
                +{Math.round(r.xp * (1 + Math.min(0.5, (game.combo - 1) * 0.1)))} XP • +{(r.progress * (1 + Math.min(0.5, (game.combo - 1) * 0.1))).toFixed(1)}% progresso • +{formatBRL(Math.round(r.cash * (1 + Math.min(0.5, (game.combo - 1) * 0.1))))}
              </p>
            )}
            <Button
              onClick={() => {
                setPicked(null);
                setHintShown(false);
                setEliminated([]);
              }}
              className="w-full mt-3 bg-gradient-primary"
              size="sm"
            >
              Próxima pergunta <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Card>
        )}
      </Card>
    </div>
  );
};
