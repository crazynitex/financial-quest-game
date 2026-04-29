import { ExternalLink, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export const CTABanner = ({ compact = false }: { compact?: boolean }) => (
  <Card className={`bg-gradient-primary text-primary-foreground border-0 shadow-elegant overflow-hidden relative ${compact ? "p-4" : "p-6"}`}>
    <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
    <div className="relative flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Pronto para a vida real?</p>
        <h3 className={`font-display font-bold ${compact ? "text-base" : "text-lg"}`}>
          Faça sua simulação gratuita na Ademicon
        </h3>
        {!compact && (
          <p className="text-sm opacity-90 mt-0.5">
            Mais de 30 anos ajudando brasileiros a conquistar imóveis, carros e viagens sem juros.
          </p>
        )}
      </div>
      <a
        href="https://www.ademicon.com.br/"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-primary font-bold text-sm hover:scale-105 transition-bounce shadow-soft whitespace-nowrap"
      >
        Simular agora
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  </Card>
);
