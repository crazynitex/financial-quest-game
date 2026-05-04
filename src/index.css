@tailwind base;
@tailwind components;
@tailwind utilities;

/* Consórcio Quest - Design System
   Branco e vermelho. Estilo gamificado, energético, premium.
   Todas as cores em HSL.
*/

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 15% 12%;

    --card: 0 0% 100%;
    --card-foreground: 0 15% 12%;

    --popover: 0 0% 100%;
    --popover-foreground: 0 15% 12%;

    /* Vermelho Ademicon-inspirado */
    --primary: 354 78% 50%;
    --primary-foreground: 0 0% 100%;
    --primary-glow: 354 90% 62%;
    --primary-deep: 354 80% 38%;

    --secondary: 0 0% 96%;
    --secondary-foreground: 0 15% 12%;

    --muted: 0 0% 96%;
    --muted-foreground: 0 5% 45%;

    --accent: 354 78% 96%;
    --accent-foreground: 354 78% 35%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --success: 142 70% 42%;
    --success-foreground: 0 0% 100%;

    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;

    --border: 0 0% 92%;
    --input: 0 0% 92%;
    --ring: 354 78% 50%;

    --radius: 1rem;

    /* Gradientes */
    --gradient-primary: linear-gradient(135deg, hsl(354 78% 50%), hsl(354 90% 62%));
    --gradient-hero: linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(354 78% 96%) 100%);
    --gradient-card: linear-gradient(180deg, hsl(0 0% 100%), hsl(0 0% 98%));
    --gradient-danger: linear-gradient(135deg, hsl(354 80% 38%), hsl(354 78% 50%));

    /* Sombras */
    --shadow-soft: 0 2px 12px -2px hsl(354 78% 50% / 0.08);
    --shadow-elegant: 0 10px 40px -12px hsl(354 78% 50% / 0.25);
    --shadow-glow: 0 0 40px hsl(354 90% 62% / 0.4);
    --shadow-card: 0 4px 20px -4px hsl(0 0% 0% / 0.08);

    /* Animações */
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-bounce: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .dark {
    --background: 0 15% 8%;
    --foreground: 0 0% 98%;
    --card: 0 15% 11%;
    --card-foreground: 0 0% 98%;
    --popover: 0 15% 11%;
    --popover-foreground: 0 0% 98%;
    --primary: 354 90% 62%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 10% 18%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 10% 18%;
    --muted-foreground: 0 5% 65%;
    --accent: 0 10% 18%;
    --accent-foreground: 0 0% 98%;
    --border: 0 10% 20%;
    --input: 0 10% 20%;
    --ring: 354 78% 50%;
  }
}

@layer base {
  * { @apply border-border; }
  html, body { @apply overflow-x-hidden; }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "ss01", "cv11";
  }
}

@layer utilities {
  .bg-gradient-primary { background: var(--gradient-primary); }
  .bg-gradient-hero { background: var(--gradient-hero); }
  .bg-gradient-card { background: var(--gradient-card); }
  .bg-gradient-danger { background: var(--gradient-danger); }
  .shadow-soft { box-shadow: var(--shadow-soft); }
  .shadow-elegant { box-shadow: var(--shadow-elegant); }
  .shadow-glow { box-shadow: var(--shadow-glow); }
  .shadow-card { box-shadow: var(--shadow-card); }
  .transition-smooth { transition: var(--transition-smooth); }
  .transition-bounce { transition: var(--transition-bounce); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px hsl(354 90% 62% / 0.4); }
  50% { box-shadow: 0 0 40px hsl(354 90% 62% / 0.7); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
  60% { opacity: 1; transform: scale(1.1) rotate(3deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes pop {
  0% { opacity: 0; transform: scale(0.3) rotate(-20deg); }
  60% { opacity: 1; transform: scale(1.15) rotate(-8deg); }
  100% { opacity: 1; transform: scale(1) rotate(-12deg); }
}
@keyframes coin-flip {
  0% { transform: rotateY(0deg) translateY(0); }
  50% { transform: rotateY(180deg) translateY(-20px); }
  100% { transform: rotateY(360deg) translateY(0); }
}
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes confetti-fall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
}
@keyframes count-up {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes ring-progress {
  from { stroke-dashoffset: var(--ring-from); }
  to { stroke-dashoffset: var(--ring-to); }
}

.animate-float { animation: float 3s ease-in-out infinite; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.animate-slide-up { animation: slide-up 0.5s ease-out; }
.animate-scale-in { animation: scale-in 0.4s ease-out; }
.animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.animate-coin-flip { animation: coin-flip 0.8s ease-in-out; }
.animate-wiggle { animation: wiggle 0.4s ease-in-out 2; }
.animate-slide-in-right { animation: slide-in-right 0.4s ease-out; }
.animate-count-up { animation: count-up 0.4s ease-out; }

.shimmer {
  background: linear-gradient(90deg, transparent, hsl(var(--primary) / 0.15), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  animation: confetti-fall 1.2s ease-out forwards;
}

.tilt-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.tilt-card:hover {
  transform: translateY(-4px) scale(1.02);
}
