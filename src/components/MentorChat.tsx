import { useState, useRef, useEffect } from "react";
import { useGame } from "@/game/store";
import { GOAL_INFO } from "@/game/engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles } from "lucide-react";
import mentorImg from "@/assets/ademi-avatar.jpg";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Consórcio vale a pena?",
  "Financiar ou consórcio?",
  "Como funciona o lance?",
  "O que é carta de crédito?",
];

export const MentorChat = () => {
  const game = useGame();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Oi, **${game.character.name}**! 👋 Sou a **Ademi**, sua mentora financeira IA. Vejo que seu objetivo é **${GOAL_INFO[game.character.goal].label}** ${GOAL_INFO[game.character.goal].emoji}. Me pergunte qualquer coisa sobre dinheiro, consórcio ou suas decisões no jogo!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content !== messages[messages.length - 1]?.content) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          playerContext: {
            nome: game.character.name,
            idade: game.character.age,
            renda: game.character.income,
            objetivo: GOAL_INFO[game.character.goal].label,
            valor_objetivo: GOAL_INFO[game.character.goal].value,
            saldo_atual: game.cash,
            score_financeiro: game.finScore,
            mes: game.month,
            estrategia: game.activeStrategy,
          },
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        upsert(err.error || "Tive um problema para responder. Tente novamente.");
        setLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No body");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        textBuffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      upsert("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-card rounded-3xl border-2 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b bg-background/60">
        <div className="relative">
          <img src={mentorImg} alt="Ademi — Mentora IA" className="w-12 h-12 rounded-full object-cover object-top bg-accent ring-2 ring-primary" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />
        </div>
        <div>
          <h3 className="font-display font-bold flex items-center gap-1.5">
            Ademi <Sparkles className="w-4 h-4 text-primary" />
          </h3>
          <p className="text-xs text-muted-foreground">Sua mentora financeira IA</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm animate-slide-up ${
                m.role === "user"
                  ? "ml-auto bg-gradient-primary text-primary-foreground"
                  : "bg-background border"
              }`}
            >
              <div className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-current">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="bg-background border rounded-2xl px-4 py-3 max-w-[85%] inline-flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t space-y-2 bg-background/60">
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-smooth"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte qualquer coisa..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-gradient-primary">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
