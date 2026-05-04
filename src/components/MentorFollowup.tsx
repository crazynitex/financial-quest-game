import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, MessageCircle, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useGame } from "@/game/store";
import { GOAL_INFO } from "@/game/engine";
import type { QuizQuestion } from "@/game/quizBank";

interface Props {
  question: QuizQuestion;
  pickedIdx: number; // -1 = timeout
  isCorrect: boolean;
}

export const MentorFollowup = ({ question, pickedIdx, isCorrect }: Props) => {
  const game = useGame();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [followups, setFollowups] = useState<string[]>([]);
  const [activeFollow, setActiveFollow] = useState<string | null>(null);
  const [followText, setFollowText] = useState("");
  const [followLoading, setFollowLoading] = useState(false);
  const startedRef = useRef(false);

  const stream = async (userPrompt: string, onChunk: (s: string) => void): Promise<{ ok: boolean; status: number }> => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`;
    let resp: Response;
    try {
      resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: userPrompt }],
          playerContext: {
            nome: game.character.name,
            idade: game.character.age,
            renda: game.character.income,
            objetivo: GOAL_INFO[game.character.goal].label,
            progresso_objetivo: `${Math.round(game.goalProgress)}%`,
            combo_atual: game.combo,
            vidas: game.lives,
            score_financeiro: game.finScore,
          },
        }),
      });
    } catch {
      onChunk("⚠️ Sem conexão com o Mentor IA. Tente novamente em instantes.");
      return { ok: false, status: 0 };
    }
    if (resp.status === 429) {
      onChunk("⏳ O Mentor IA está com muitas perguntas agora. Aguarde alguns segundos e responda a próxima pergunta para tentar de novo.");
      return { ok: false, status: 429 };
    }
    if (resp.status === 402) {
      onChunk("💳 Créditos do Mentor IA esgotados. Volte em breve.");
      return { ok: false, status: 402 };
    }
    if (!resp.ok || !resp.body) {
      onChunk("Não consegui responder agora. Tente novamente.");
      return { ok: false, status: resp.status };
    }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let streamDone = false;
    while (!streamDone) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buf += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n")) !== -1) {
        let line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || !line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") {
          streamDone = true;
          break;
        }
        try {
          const p = JSON.parse(json);
          const c = p.choices?.[0]?.delta?.content;
          if (c) onChunk(c);
        } catch {
          buf = line + "\n" + buf;
          break;
        }
      }
    }
    return { ok: true, status: 200 };
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setLoading(true);
    const correctOpt = question.options.find((o) => o.correct);
    const pickedOpt = pickedIdx >= 0 ? question.options[pickedIdx] : null;
    const status = pickedIdx === -1
      ? "Não respondi a tempo (timeout)."
      : isCorrect
      ? `Acertei! Escolhi: "${pickedOpt?.label}".`
      : `Errei. Escolhi: "${pickedOpt?.label}". A correta era: "${correctOpt?.label}".`;
    const prompt = `Pergunta do quiz: "${question.question}"\nMinha resposta: ${status}\n\nResponda em até 3 parágrafos curtos:\n1) Reforce/corrija meu raciocínio de forma personalizada (use meu nome, renda e objetivo).\n2) Dê 1 exemplo prático com NÚMEROS reais aplicado ao MEU caso (renda R$ ${game.character.income}, objetivo ${GOAL_INFO[game.character.goal].label}).\n3) Termine com 1 dica acionável para a próxima decisão financeira.\nNão repita o enunciado da pergunta. Use markdown leve (negrito).`;

    let acc = "";
    stream(prompt, (c) => {
      acc += c;
      setText(acc);
    }).then(async (res) => {
      setLoading(false);
      setDone(true);
      // Se rate-limited ou erro, NÃO dispara segunda chamada (evita 429 em cascata)
      if (!res.ok) return;
      // Pequena folga para não saturar o gateway
      await new Promise((r) => setTimeout(r, 800));
      try {
        const fuPrompt = `Com base no tema da pergunta "${question.question}", gere EXATAMENTE 3 perguntas curtas (máx 8 palavras cada) que o usuário pode querer fazer em seguida sobre consórcio/finanças. Responda APENAS as 3 perguntas, uma por linha, sem numeração.`;
        let fuAcc = "";
        const fuRes = await stream(fuPrompt, (c) => { fuAcc += c; });
        if (!fuRes.ok) return;
        const lines = fuAcc.split("\n").map((l) => l.replace(/^[-*\d.\s]+/, "").trim()).filter(Boolean).slice(0, 3);
        setFollowups(lines);
      } catch { /* noop */ }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const askFollow = async (q: string) => {
    setActiveFollow(q);
    setFollowText("");
    setFollowLoading(true);
    let acc = "";
    await stream(q + " Responda em 2 parágrafos curtos, prático e personalizado.", (c) => {
      acc += c;
      setFollowText(acc);
    });
    setFollowLoading(false);
  };

  return (
    <Card className="p-4 mt-3 bg-gradient-card border-2 border-primary/30 animate-slide-up">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <p className="text-sm font-bold flex items-center gap-1">
          Mentor IA <span className="text-[10px] font-normal text-muted-foreground">• análise personalizada</span>
        </p>
      </div>
      <div className="prose prose-sm max-w-none text-sm prose-p:my-1.5 prose-strong:text-current min-h-[60px]">
        {text ? <ReactMarkdown>{text}</ReactMarkdown> : loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2 className="w-4 h-4 animate-spin" /> Analisando sua resposta...
          </div>
        )}
      </div>

      {done && followups.length > 0 && !activeFollow && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> Continuar a conversa
          </p>
          <div className="flex flex-wrap gap-1.5">
            {followups.map((f, i) => (
              <button
                key={i}
                onClick={() => askFollow(f)}
                className="text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-smooth flex items-center gap-1"
              >
                {f} <ArrowRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {activeFollow && (
        <div className="mt-3 pt-3 border-t border-border/50 animate-slide-up">
          <p className="text-xs font-bold mb-1.5 text-primary">{activeFollow}</p>
          <div className="prose prose-sm max-w-none text-sm prose-p:my-1.5 min-h-[40px]">
            {followText ? <ReactMarkdown>{followText}</ReactMarkdown> : followLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pensando...
              </div>
            )}
          </div>
          {!followLoading && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs mt-1 h-7"
              onClick={() => { setActiveFollow(null); setFollowText(""); }}
            >
              ← Voltar às sugestões
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
