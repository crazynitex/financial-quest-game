import { Sparkles } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative">
      <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
        <Sparkles className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="font-display font-bold text-lg tracking-tight">
        Ademi<span className="text-primary">Conecta</span>
      </span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
        powered by Ademicon
      </span>
    </div>
  </div>
);
