import { useEffect, useState } from "react";

const COLORS = ["hsl(354 78% 50%)", "hsl(354 90% 62%)", "hsl(38 92% 50%)", "hsl(142 70% 42%)", "hsl(0 0% 100%)"];

export const Confetti = ({ trigger }: { trigger: number }) => {
  const [pieces, setPieces] = useState<{ id: number; left: number; bg: string; delay: number }[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const next = Array.from({ length: 24 }, (_, i) => ({
      id: trigger * 100 + i,
      left: Math.random() * 100,
      bg: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.3,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 1500);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!pieces.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.bg,
            top: 0,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
