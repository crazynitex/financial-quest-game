import { useGame } from "@/game/store";
import { GOAL_INFO, simulateConsortium, simulateFinancing, type GameState } from "@/game/engine";
import { ARCHETYPES, assignArchetype, type ArchetypeId } from "@/game/archetypes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Sparkles, ExternalLink, CheckCircle2, Share2, Flame, Zap, Calendar, ArrowRight, QrCode } from "lucide-react";
import ademiImg from "@/assets/ademi-avatar.jpg";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const GAME_URL = "https://preview--financial-quest-game.lovable.app/";

function buildAdemiconUrl(game: GameState, archetypeId: ArchetypeId): string {
  const goalInfo = GOAL_INFO[game.character.goal];
  const archetype = ARCHETYPES[archetypeId];
  const params = new URLSearchParams({
    utm_source: "ademiconecta",
    utm_medium: "game",
    utm_campaign: "hackathon_2026",
    utm_content: archetypeId,
    nome: game.character.name || "",
    objetivo: goalInfo.label,
    valor: String(goalInfo.value),
    renda: String(game.character.income || 0),
    arquetipo: archetype.name,
  });
  return `https://www.ademicon.com.br/?${params.toString()}`;
}

/**
 * Plano de Ação — substitui o antigo Dashboard.
 * Foco: traduzir a jornada do jogo em PRÓXIMOS PASSOS REAIS na Ademicon.
 * Inclui card estilo Spotify (perfil) com QR Code para sair da simulação e ir pra vida real.
 */
export const ActionPlan = () => {
  const game = useGame();
  const archetypeId = assignArchetype(game);
  const archetype = ARCHETYPES[archetypeId];
  const ademiconUrl = buildAdemiconUrl(game, archetypeId);
  const goal = GOAL_INFO[game.character.goal];
  const fin = simulateFinancing(goal.value);
  const cons = simulateConsortium(goal.value);
  const economy = fin.totalCost - cons.totalCost;
  const accuracy = game.totalAnswered > 0 ? Math.round((game.totalCorrect / game.totalAnswered) * 100) : 0;

  // Plano de ação em 4 passos personalizados
  const steps = [
    {
      n: 1,
      title: "Defina o valor exato do seu sonho",
      body: `Você escolheu ${goal.label} (${formatBRL(goal.value)}). No simulador real você ajusta o valor da carta no centavo.`,
      icon: <Target className="w-5 h-5" />,
    },
    {
      n: 2,
      title: "Escolha a parcela que cabe no bolso",
      body: `Estimamos ${formatBRL(cons.monthlyPayment)}/mês. Na Ademicon você compara prazos de 60 a 240 meses.`,
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      n: 3,
      title: "Planeje seu lance para acelerar",
      body: `Combo máximo ×${game.bestCombo} no quiz mostra que você entende lance. Use isso pra ser contemplado mais rápido.`,
      icon: <Zap className="w-5 h-5" />,
    },
    {
      n: 4,
      title: "Saia do jogo. Faça acontecer.",
      body: `O simulador termina aqui — sua vida começa agora. Economia projetada vs financiamento: ${formatBRL(economy)}.`,
      icon: <Sparkles className="w-5 h-5" />,
    },
  ];

  // QR do arquétipo → leva pro JOGO (loop viral)
  const shareParams = new URLSearchParams({
    utm_source: "share",
    utm_medium: "archetype",
    utm_campaign: "viral_loop",
    utm_content: archetypeId,
    convidadoPor: game.character.name || "",
    arquetipoAmigo: archetype.name,
  });
  const gameShareUrl = `${GAME_URL}?${shareParams.toString()}`;
  const archetypeQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    gameShareUrl
  )}&bgcolor=0f172a&color=ffffff&qzone=2`;

  // QR do final → leva pra ADEMICON (conversão real)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    ademiconUrl
  )}&bgcolor=0f172a&color=ffffff&qzone=2`;

  const shareArchetype = async () => {
    const text = `Joguei o Ademi Conecta e descobri que sou "${archetype.name}" ${archetype.emoji}\n\n"${archetype.tagline}"\n\nQual arquétipo você é? Joga aí 👇`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Meu arquétipo no Ademi Conecta", text, url: gameShareUrl });
      } else {
        await navigator.clipboard.writeText(`${text}\n${gameShareUrl}`);
      }
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-5">
      {/* ===== Spotify-style Profile Card ===== */}
      <Card className="relative overflow-hidden border-0 p-0 shadow-elegant">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-primary opacity-90" />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-black/20 blur-3xl" />

        <div className="relative p-5 sm:p-6 text-primary-foreground">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90">
                Ademi Conecta · Perfil
              </span>
            </div>
            <button
              onClick={shareCard}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur text-[11px] font-semibold transition"
              title="Compartilhar"
            >
              <Share2 className="w-3 h-3" /> Compartilhar
            </button>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl sm:text-4xl shadow-xl ring-2 ring-white/30">
              {goal.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">{rating}</p>
              <h2 className="font-display font-black text-2xl sm:text-3xl leading-tight truncate">
                {game.character.name || "Você"}
              </h2>
              <p className="text-xs sm:text-sm opacity-90 truncate">
                Sonha com {goal.label.toLowerCase()} · {formatBRL(goal.value)}
              </p>
            </div>
          </div>

          {/* "Top tracks" — métricas do jogador */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <Stat label="Score" value={`${game.finScore}`} />
            <Stat label="Nível" value={`${game.level}`} />
            <Stat label="Acertos" value={`${accuracy}%`} />
            <Stat label="Combo" value={`×${game.bestCombo}`} />
          </div>

          {/* QR + CTA — ponte simulação → vida real */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-black/25 backdrop-blur border border-white/10">
            <div className="shrink-0 p-1.5 rounded-xl bg-white">
              <img src={qrUrl} alt="QR Code Ademicon" className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">
                <QrCode className="w-3 h-3" /> Aponte a câmera
              </div>
              <p className="font-display font-bold text-base sm:text-lg leading-tight">
                Saia da simulação. Realize.
              </p>
              <p className="text-[11px] opacity-85 mt-0.5">
                Escaneie e abra a Ademicon no celular agora.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ===== Streak / motivação ===== */}
      <Card className="p-4 bg-gradient-card border-2 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-warning/15 flex items-center justify-center">
          <Flame className="w-6 h-6 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Streak</p>
          <p className="font-display font-bold text-lg">
            {game.combo > 0 ? `${game.combo} acertos seguidos` : "Comece um combo no quiz!"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Recorde</p>
          <p className="font-display font-black text-2xl text-primary">×{game.bestCombo}</p>
        </div>
      </Card>

      {/* ===== Plano de ação 4 passos ===== */}
      <Card className="p-5 bg-gradient-card border-2">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">Seu plano de ação</h3>
        </div>
        <div className="space-y-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="flex gap-3 p-3 rounded-xl bg-background/60 border hover:border-primary/50 transition-smooth"
            >
              <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-display font-black">
                {s.n}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm flex items-center gap-1.5">
                  <span className="text-primary">{s.icon}</span>
                  {s.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ===== Ademi convida ===== */}
      <Card className="p-5 bg-gradient-card border-2 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-10 opacity-30 pointer-events-none">
          <img src={ademiImg} alt="" className="w-44 object-contain" />
        </div>
        <div className="relative max-w-[70%]">
          <div className="flex items-center gap-2 mb-2">
            <img src={ademiImg} alt="Ademi" className="w-10 h-10 rounded-full object-cover bg-accent ring-2 ring-primary" />
            <div>
              <p className="font-display font-bold text-sm">Ademi</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sua mentora IA</p>
            </div>
          </div>
          <p className="text-sm font-medium mb-3">
            "Você já provou que entende. Agora dá o passo que importa de verdade — fora do jogo."
          </p>
          <Button asChild size="sm" className="bg-gradient-primary shadow-glow">
            <a href={ADEMICON_URL} target="_blank" rel="noopener noreferrer">
              Sair da simulação <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </Button>
        </div>
      </Card>

      {/* ===== Comparativo curto ===== */}
      <Card className="p-5 bg-gradient-card border-2">
        <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success" /> O que você economiza
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Mini label="Financiamento" value={formatBRL(fin.totalCost)} tone="bad" />
          <Mini label="Consórcio" value={formatBRL(cons.totalCost)} tone="good" />
        </div>
        <div className="mt-3 p-3 rounded-xl bg-gradient-primary text-primary-foreground text-center">
          <p className="text-xs opacity-90">Economia projetada</p>
          <p className="font-display font-black text-2xl">{formatBRL(economy)}</p>
        </div>
      </Card>

      {/* ===== CTA final reforçado ===== */}
      <a
        href={ADEMICON_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-5 rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant hover:scale-[1.01] transition-transform"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Hora de agir</p>
            <p className="font-display font-black text-xl">Simular meu consórcio agora</p>
            <p className="text-xs opacity-90 mt-0.5">A Ademicon te leva do sonho ao plano em minutos.</p>
          </div>
          <ExternalLink className="w-6 h-6 shrink-0" />
        </div>
      </a>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white/15 backdrop-blur p-2 text-center">
    <div className="font-display font-black text-base sm:text-lg tabular-nums">{value}</div>
    <div className="text-[9px] uppercase tracking-wider opacity-80 font-semibold">{label}</div>
  </div>
);

const Mini = ({ label, value, tone }: { label: string; value: string; tone: "good" | "bad" }) => (
  <div
    className={`rounded-xl border-2 p-3 ${
      tone === "good" ? "border-success/40 bg-success/10" : "border-destructive/30 bg-destructive/5"
    }`}
  >
    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</p>
    <p className={`font-display font-black text-lg ${tone === "good" ? "text-success" : "text-destructive"}`}>{value}</p>
  </div>
);
