import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Sparkles } from "lucide-react";

const STEPS = [
  {
    target: "stats",
    emoji: "📊",
    title: "Seus indicadores",
    body: "Saldo, mês atual, score financeiro e nível. Tudo atualiza em tempo real conforme você decide.",
  },
  {
    target: "flow",
    emoji: "💸",
    title: "Fluxo mensal",
    body: "Sua renda entra todo mês, mas as despesas também saem. Mantenha a sobra positiva!",
  },
  {
    target: "mission",
    emoji: "🎯",
    title: "Sua missão",
    body: "Conquistar seu objetivo (casa, carro, moto ou viagem) com a melhor estratégia. Escolha entre poupar, financiar ou consorciar.",
  },
  {
    target: "actions",
    emoji: "⚡",
    title: "Ações livres",
    body: "Antes de avançar o mês, faça freelas, invista, corte gastos ou estude. Cada ação muda seu jogo.",
  },
  {
    target: "advance",
    emoji: "📅",
    title: "Avançar mês",
    body: "Aplica seu fluxo mensal, paga parcelas e dispara eventos da vida. Às vezes vem um mini-quiz com prêmio!",
  },
  {
    target: "mentor",
    emoji: "🤖",
    title: "Mentor IA",
    body: "Pergunte qualquer coisa de finanças. Ele responde com base no seu personagem.",
  },
];

const STORAGE_KEY = "ademi-conecta-tutorial-done";

export const Tutorial = () => {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
    setStep(0);
  };

  if (!open) return null;
  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-scale-in" onClick={close} />
      <div className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[380px] z-50 animate-slide-up">
        <Card className="p-5 border-2 border-primary shadow-elegant bg-gradient-card">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-wiggle">{cur.emoji}</span>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Tutorial • {step + 1}/{STEPS.length}
                </p>
                <h3 className="font-display font-bold text-lg leading-tight">{cur.title}</h3>
              </div>
            </div>
            <button onClick={close} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{cur.body}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex gap-1">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-smooth ${i <= step ? "bg-primary" : "bg-secondary"}`} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={close} className="flex-1">Pular</Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-primary"
              onClick={() => (isLast ? close() : setStep(step + 1))}
            >
              {isLast ? "Começar" : "Próximo"} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export const restartTutorial = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};
