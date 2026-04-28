import { useGame } from "@/game/store";
import { CharacterCreation } from "@/components/CharacterCreation";
import { GameWorld } from "@/components/GameWorld";

const Index = () => {
  const character = useGame((s) => s.character);
  const hasCharacter = character.name.length > 0;
  return hasCharacter ? <GameWorld /> : <CharacterCreation />;
};

export default Index;
