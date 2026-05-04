import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, XCircle, TrendingDown, TrendingUp, Sparkles, ExternalLink } from "lucide-react";

/**
 * Vídeo-aula animada (60s) — feita 100% em React/CSS, sem MP4.
 * Toca dentro da Academy explicando consórcio com decisão BOA vs RUIM.
 *
 * Cenas (60s = 60 ticks de 1s):
 *  0-6   Abertura: "Comprar dos sonhos sem destruir a vida financeira"
 *  6-18  Cena 1 — O problema: financiamento e juros
 *  18-32 Cena 2 — Decisão RUIM: financiar moto R$ 20.000
 *  32-48 Cena 3 — Decisão BOA: consórcio da moto R$ 20.000
 *  48-56 Cena 4 — Comparativo lado a lado
 *  56-60 Encerramento + CTA
 */

const DURATION = 60; // segundos

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const SCENES = [
  { start: 0, end: 6, label: "Intro" },
  { start: 6, end: 18, label: "O problema" },
  { start: 18, end: 32, label: "Decisão ruim" },
  { start: 32, end: 48, label: "Decisão boa" },
  { start: 48, end: 56, label: "Comparativo" },
  { start: 56, end: 60, label: "Próximo passo" },
];

export const AcademyVideo = ({ onFinished }: { onFinished?: () => void }) => {
  const [t, setT] = useState(0); // tempo em segundos (float)
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const lastFrame = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastBeepScene = useRef<number>(-1);

  // Loop de animação suave (60fps)
  useEffect(() => {
    if (!playing) {
      lastFrame.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      if (lastFrame.current == null) lastFrame.current = now;
      const dt = (now - lastFrame.current) / 1000;
      lastFrame.current = now;
      setT((prev) => {
        const next = prev + dt;
        if (next >= DURATION) {
          setPlaying(false);
          onFinished?.();
          return DURATION;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, onFinished]);

  // Beep sutil ao trocar de cena (se som ativado)
  const currentSceneIdx = SCENES.findIndex((s) => t >= s.start && t < s.end);
  useEffect(() => {
    if (muted) return;
    if (currentSceneIdx === lastBeepScene.current) return;
    lastBeepScene.current = currentSceneIdx;
    if (currentSceneIdx <= 0) return;
    try {
      const ctx = audioCtxRef.current ?? new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 660;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      /* noop */
    }
  }, [currentSceneIdx, muted]);

  const restart = () => {
    setT(0);
    setPlaying(true);
  };

  const seek = (newT: number) => {
    setT(Math.max(0, Math.min(DURATION, newT)));
  };

  const progress = (t / DURATION) * 100;

  return (
    <Card className="overflow-hidden border-2 bg-card">
      {/* Player */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Grid de fundo sutil */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Cenas */}
        <Scene visible={t >= 0 && t < 6}>
          <IntroScene t={t} />
        </Scene>
        <Scene visible={t >= 6 && t < 18}>
          <ProblemScene t={t - 6} />
        </Scene>
        <Scene visible={t >= 18 && t < 32}>
          <BadDecisionScene t={t - 18} />
        </Scene>
        <Scene visible={t >= 32 && t < 48}>
          <GoodDecisionScene t={t - 32} />
        </Scene>
        <Scene visible={t >= 48 && t < 56}>
          <CompareScene t={t - 48} />
        </Scene>
        <Scene visible={t >= 56 && t <= 60}>
          <CTAScene t={t - 56} />
        </Scene>

        {/* Badge "Ademi Conecta" */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span className="text-[10px] font-bold text-white tracking-wider uppercase">Ademi Conecta · Vídeo-aula</span>
        </div>

        {/* Indicador de cena */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-[10px] font-semibold text-white/90">
          {SCENES[currentSceneIdx]?.label ?? "Fim"} · {Math.floor(t)}s / {DURATION}s
        </div>

        {/* Overlay play (quando pausado) */}
        {!playing && t < DURATION && (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm group"
          >
            <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <Play className="w-9 h-9 text-slate-900 ml-1" fill="currentColor" />
            </div>
          </button>
        )}

        {/* Tela final */}
        {t >= DURATION && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-3 animate-in fade-in">
            <CheckCircle2 className="w-14 h-14 text-emerald-400" />
            <p className="font-display text-xl font-bold text-white">Você concluiu a vídeo-aula!</p>
            <Button onClick={restart} variant="secondary" size="sm">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Assistir de novo
            </Button>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="p-3 space-y-2 bg-card border-t">
        {/* Barra de progresso clicável */}
        <div
          className="relative h-1.5 rounded-full bg-secondary cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seek(pct * DURATION);
          }}
        >
          <div
            className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
          {/* Marcadores de cena */}
          {SCENES.slice(1).map((s, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-background/80 rounded"
              style={{ left: `${(s.start / DURATION) * 100}%` }}
            />
          ))}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setPlaying((p) => !p)} className="px-2">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={restart} className="px-2">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMuted((m) => !m)} className="px-2" title="Som dos cortes">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums ml-auto">
            {String(Math.floor(t)).padStart(2, "0")}:{String(Math.floor((t % 1) * 100)).padStart(2, "0")} / 01:00
          </span>
        </div>
      </div>
    </Card>
  );
};

/* ---------------- Cenas ---------------- */

const Scene = ({ visible, children }: { visible: boolean; children: React.ReactNode }) => (
  <div
    className="absolute inset-0 transition-opacity duration-500"
    style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
  >
    {children}
  </div>
);

const IntroScene = ({ t }: { t: number }) => {
  const fade = Math.min(1, t / 0.6);
  const scale = 0.94 + Math.min(1, t / 1.5) * 0.06;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
      <div
        className="text-5xl md:text-6xl mb-3"
        style={{ opacity: fade, transform: `scale(${scale})`, transition: "transform 0.4s" }}
      >
        🤝
      </div>
      <h2
        className="font-display font-black text-2xl md:text-4xl text-white leading-tight max-w-2xl"
        style={{ opacity: fade, transform: `translateY(${(1 - fade) * 12}px)` }}
      >
        Conquiste seus sonhos <span className="text-amber-300">sem destruir</span> sua vida financeira
      </h2>
      <p
        className="text-white/70 text-sm md:text-base mt-3 max-w-md"
        style={{ opacity: Math.min(1, Math.max(0, (t - 1.2) / 0.8)) }}
      >
        Em 60 segundos, você vai entender por que tanta gente está mudando do financiamento para o consórcio.
      </p>
    </div>
  );
};

const ProblemScene = ({ t }: { t: number }) => {
  const enter = Math.min(1, t / 0.8);
  const showCoins = t > 2;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
      <p
        className="text-xs uppercase tracking-[0.3em] text-amber-300 font-bold mb-2"
        style={{ opacity: enter }}
      >
        O problema
      </p>
      <h3
        className="font-display font-bold text-xl md:text-3xl text-white max-w-xl leading-tight"
        style={{ opacity: enter, transform: `translateY(${(1 - enter) * 10}px)` }}
      >
        O brasileiro paga <span className="text-rose-400">muito mais caro</span> do que precisa
      </h3>

      {/* Moedas caindo */}
      {showCoins && (
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => {
            const delay = (i * 0.4) % 4;
            const localT = (t - 2 - delay + 8) % 8;
            const yPct = (localT / 8) * 110 - 10;
            const x = 6 + ((i * 7.7) % 88);
            const rot = localT * 90;
            return (
              <div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: `${x}%`,
                  top: `${yPct}%`,
                  transform: `rotate(${rot}deg)`,
                  opacity: localT > 0 && localT < 8 ? 0.85 : 0,
                }}
              >
                💸
              </div>
            );
          })}
        </div>
      )}

      <div
        className="mt-6 grid grid-cols-3 gap-3 max-w-lg w-full"
        style={{ opacity: Math.min(1, Math.max(0, (t - 4) / 1)) }}
      >
        {[
          { v: "73%", l: "vivem endividados" },
          { v: "+180%", l: "juros num financiamento" },
          { v: "5 anos", l: "presos pagando" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-white/5 border border-white/10 p-2.5 backdrop-blur">
            <div className="font-display font-black text-lg md:text-2xl text-amber-300">{s.v}</div>
            <div className="text-[10px] md:text-xs text-white/70 leading-tight">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BadDecisionScene = ({ t }: { t: number }) => {
  const enter = Math.min(1, t / 0.6);
  // Animação dos números crescendo
  const grow = Math.min(1, Math.max(0, (t - 2) / 6));
  const totalPaid = Math.round(20000 + grow * 15800); // 20.000 → 35.800
  const interest = Math.round(grow * 15800);
  const month = Math.min(60, Math.floor(grow * 60));
  const showStamp = t > 10;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/40 mb-3"
        style={{ opacity: enter }}
      >
        <XCircle className="w-3.5 h-3.5 text-rose-400" />
        <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Decisão ruim · Financiamento</span>
      </div>

      <h3
        className="font-display font-bold text-white text-lg md:text-2xl text-center mb-4"
        style={{ opacity: enter }}
      >
        Lucas financia uma moto de <span className="text-amber-300">{formatBRL(20000)}</span>
      </h3>

      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        <Stat label="Mês" value={`${month}/60`} tone="neutral" />
        <Stat label="Parcela mensal" value={formatBRL(597)} tone="neutral" />
        <Stat label="Juros pagos" value={formatBRL(interest)} tone="bad" pulse={grow > 0 && grow < 1} />
        <Stat label="Total pago" value={formatBRL(totalPaid)} tone="bad" pulse={grow > 0 && grow < 1} />
      </div>

      {/* Barra de progresso de juros engolindo */}
      <div className="w-full max-w-lg mt-4">
        <div className="flex justify-between text-[10px] text-white/60 mb-1">
          <span>Valor da moto</span>
          <span className="text-rose-300 font-bold">+ {Math.round(grow * 79)}% de juros</span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden flex">
          <div className="h-full bg-emerald-500/70" style={{ width: `${(20000 / totalPaid) * 100}%` }} />
          <div className="h-full bg-rose-500" style={{ width: `${(interest / totalPaid) * 100}%` }} />
        </div>
      </div>

      {showStamp && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ animation: "pop 0.6s ease-out" }}
        >
          <div className="border-4 border-rose-500 text-rose-500 font-display font-black text-3xl md:text-5xl px-6 py-2 rotate-[-12deg] bg-rose-500/10 rounded-lg">
            PREJUÍZO
            <div className="text-base md:text-xl font-bold mt-1">- {formatBRL(15800)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const GoodDecisionScene = ({ t }: { t: number }) => {
  const enter = Math.min(1, t / 0.6);
  const grow = Math.min(1, Math.max(0, (t - 2) / 8));
  const totalPaid = Math.round(20000 + grow * 3200); // 20.000 → 23.200 (taxa adm)
  const adminFee = Math.round(grow * 3200);
  const month = Math.min(72, Math.floor(grow * 72));
  const contemplated = t > 10;
  const showStamp = t > 13;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 mb-3"
        style={{ opacity: enter }}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Decisão boa · Consórcio</span>
      </div>

      <h3
        className="font-display font-bold text-white text-lg md:text-2xl text-center mb-4"
        style={{ opacity: enter }}
      >
        Marina entra em um consórcio de <span className="text-amber-300">{formatBRL(20000)}</span>
      </h3>

      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        <Stat label="Mês" value={`${month}/72`} tone="neutral" />
        <Stat label="Parcela mensal" value={formatBRL(322)} tone="good" />
        <Stat label="Taxa de administração" value={formatBRL(adminFee)} tone="neutral" />
        <Stat label="Total pago" value={formatBRL(totalPaid)} tone="good" pulse={grow > 0 && grow < 1} />
      </div>

      {/* Barra mostrando proporção */}
      <div className="w-full max-w-lg mt-4">
        <div className="flex justify-between text-[10px] text-white/60 mb-1">
          <span>Valor da carta</span>
          <span className="text-emerald-300 font-bold">+ apenas {Math.round(grow * 16)}% de taxa</span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden flex">
          <div className="h-full bg-emerald-500" style={{ width: `${(20000 / totalPaid) * 100}%` }} />
          <div className="h-full bg-amber-400/70" style={{ width: `${(adminFee / totalPaid) * 100}%` }} />
        </div>
      </div>

      {contemplated && (
        <div
          className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold"
          style={{ animation: "pop 0.5s ease-out" }}
        >
          🎉 Marina foi contemplada com lance!
        </div>
      )}

      {showStamp && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ animation: "pop 0.6s ease-out" }}
        >
          <div className="border-4 border-emerald-400 text-emerald-300 font-display font-black text-3xl md:text-5xl px-6 py-2 rotate-[-8deg] bg-emerald-500/10 rounded-lg">
            ECONOMIA
            <div className="text-base md:text-xl font-bold mt-1">+ {formatBRL(12600)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const CompareScene = ({ t }: { t: number }) => {
  const enter = Math.min(1, t / 0.6);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
      <p className="text-xs uppercase tracking-[0.3em] text-amber-300 font-bold mb-2" style={{ opacity: enter }}>
        Lado a lado
      </p>
      <h3
        className="font-display font-bold text-white text-lg md:text-2xl text-center mb-4"
        style={{ opacity: enter }}
      >
        A diferença é de <span className="text-emerald-300">{formatBRL(12600)}</span> no seu bolso
      </h3>
      <div className="grid grid-cols-2 gap-3 w-full max-w-2xl">
        <div
          className="rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 p-3 md:p-4 backdrop-blur"
          style={{ opacity: enter, transform: `translateX(${-(1 - enter) * 20}px)` }}
        >
          <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold mb-2">
            <TrendingDown className="w-3.5 h-3.5" /> FINANCIAMENTO
          </div>
          <div className="font-display font-black text-2xl md:text-3xl text-white">{formatBRL(35800)}</div>
          <div className="text-xs text-white/60 mt-1">Lucas pagou no total</div>
          <div className="text-[10px] text-rose-300 mt-2">+ {formatBRL(15800)} em juros</div>
        </div>
        <div
          className="rounded-2xl border-2 border-emerald-400/50 bg-emerald-500/10 p-3 md:p-4 backdrop-blur"
          style={{ opacity: enter, transform: `translateX(${(1 - enter) * 20}px)` }}
        >
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> CONSÓRCIO
          </div>
          <div className="font-display font-black text-2xl md:text-3xl text-white">{formatBRL(23200)}</div>
          <div className="text-xs text-white/60 mt-1">Marina pagou no total</div>
          <div className="text-[10px] text-emerald-300 mt-2">+ apenas {formatBRL(3200)} de taxa</div>
        </div>
      </div>
    </div>
  );
};

const CTAScene = ({ t }: { t: number }) => {
  const enter = Math.min(1, t / 0.6);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
      <div className="text-4xl mb-3" style={{ opacity: enter, transform: `scale(${0.9 + enter * 0.1})` }}>
        ✨
      </div>
      <h3
        className="font-display font-black text-white text-xl md:text-3xl max-w-xl leading-tight"
        style={{ opacity: enter, transform: `translateY(${(1 - enter) * 10}px)` }}
      >
        Agora é a sua vez de <span className="text-amber-300">conquistar</span> com inteligência.
      </h3>
      <a
        href="https://www.ademicon.com.br/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold text-sm shadow-xl hover:scale-105 transition-transform"
        style={{ opacity: Math.min(1, Math.max(0, (t - 1) / 0.8)) }}
      >
        Simular consórcio na Ademicon <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};

/* ---------------- Helpers ---------------- */

const Stat = ({
  label,
  value,
  tone,
  pulse,
}: {
  label: string;
  value: string;
  tone: "good" | "bad" | "neutral";
  pulse?: boolean;
}) => {
  const toneColor =
    tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-rose-300" : "text-white";
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 backdrop-blur">
      <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">{label}</div>
      <div
        className={`font-display font-black text-base md:text-xl tabular-nums ${toneColor}`}
        style={pulse ? { animation: "pulse 1s ease-in-out infinite" } : undefined}
      >
        {value}
      </div>
    </div>
  );
};
