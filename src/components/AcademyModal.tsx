import { useState } from "react";
import { LESSONS } from "@/game/engine";
import { useGame } from "@/game/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, GraduationCap, ArrowRight, Award } from "lucide-react";
import { toast } from "sonner";

export const AcademyModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { lessonsCompleted, completeLesson } = useGame();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [quizPicked, setQuizPicked] = useState<number | null>(null);

  const lesson = LESSONS.find((l) => l.id === activeId) ?? null;

  const close = () => {
    setActiveId(null);
    setStepIdx(0);
    setQuizPicked(null);
    onOpenChange(false);
  };

  const handleNext = () => {
    if (!lesson) return;
    if (stepIdx < lesson.steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      // entra no quiz (já estamos na última explicação) → quiz fica no proximo state
      setStepIdx(lesson.steps.length); // = quiz
    }
  };

  const handleQuiz = (idx: number) => {
    if (!lesson) return;
    setQuizPicked(idx);
    if (idx === lesson.quiz.correct) {
      if (!lessonsCompleted.includes(lesson.id)) {
        completeLesson(lesson.id, lesson.xpReward);
        toast.success(`✨ +${lesson.xpReward} XP — Lição concluída!`);
      } else {
        toast.success("Resposta correta!");
      }
    } else {
      toast.error("Resposta incorreta. Veja a explicação.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <GraduationCap className="w-6 h-6 text-primary" />
            {lesson ? lesson.title : "Academy Ademi"}
          </DialogTitle>
        </DialogHeader>

        {!lesson && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Aprenda como o consórcio funciona em mini-lições. Cada uma dá XP e melhora seu Score Financeiro.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {LESSONS.map((l) => {
                const done = lessonsCompleted.includes(l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      setActiveId(l.id);
                      setStepIdx(0);
                      setQuizPicked(null);
                    }}
                    className="text-left p-4 rounded-2xl border-2 hover:border-primary hover:bg-accent transition-smooth group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl">{l.emoji}</span>
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">
                          +{l.xpReward} XP
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-bold text-base group-hover:text-primary">{l.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{l.duration} • {l.steps.length} passos + quiz</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {lesson && stepIdx < lesson.steps.length && (
          <Card className="p-5 bg-gradient-card border-2 animate-scale-in">
            <p className="text-xs uppercase tracking-wider font-bold text-primary mb-2">
              Passo {stepIdx + 1} de {lesson.steps.length}
            </p>
            <h3 className="font-display text-xl font-bold mb-2">{lesson.steps[stepIdx].title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{lesson.steps[stepIdx].body}</p>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" onClick={() => setActiveId(null)}>Voltar</Button>
              <Button onClick={handleNext} className="bg-gradient-primary ml-auto">
                {stepIdx === lesson.steps.length - 1 ? "Ir para o quiz" : "Próximo"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        )}

        {lesson && stepIdx === lesson.steps.length && (
          <Card className="p-5 bg-gradient-card border-2 animate-scale-in">
            <p className="text-xs uppercase tracking-wider font-bold text-primary mb-2 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Quiz final
            </p>
            <h3 className="font-display text-lg font-bold mb-3">{lesson.quiz.question}</h3>
            <div className="space-y-2">
              {lesson.quiz.options.map((opt, i) => {
                const isCorrect = i === lesson.quiz.correct;
                const isPicked = quizPicked === i;
                const showFeedback = quizPicked !== null;
                return (
                  <button
                    key={i}
                    disabled={showFeedback}
                    onClick={() => handleQuiz(i)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-smooth text-sm font-medium ${
                      showFeedback
                        ? isCorrect
                          ? "border-success bg-success/10"
                          : isPicked
                          ? "border-destructive bg-destructive/10"
                          : "opacity-50"
                        : "hover:border-primary hover:bg-accent"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {quizPicked !== null && (
              <div className="mt-4 p-3 rounded-xl bg-accent text-sm">
                <p className="font-semibold mb-1">💡 {lesson.quiz.explain}</p>
                <Button onClick={() => { setActiveId(null); setStepIdx(0); setQuizPicked(null); }} className="mt-2 w-full bg-gradient-primary">
                  Voltar à Academy
                </Button>
              </div>
            )}
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
