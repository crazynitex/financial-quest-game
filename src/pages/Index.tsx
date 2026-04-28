import { useGame } from "@/game/store";
import { CharacterCreation } from "@/components/CharacterCreation";
import { GameWorld } from "@/components/GameWorld";
import { Loader2 } from "lucide-react";

const Index = () => {
  const character = useGame((s) => s.character);
  const hydrated = useGame((s) => s.hydrated);
  const hasCharacter = character.name.length > 0;

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return hasCharacter ? <GameWorld /> : <CharacterCreation />;
};

export default Index;
