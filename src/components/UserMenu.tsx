import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { useGame } from "@/game/store";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, RotateCcw, Cloud } from "lucide-react";
import { toast } from "sonner";

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const resetGame = useGame((s) => s.resetGame);
  const clearLocal = useGame((s) => s.clearLocal);
  const [profileName, setProfileName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfileName(data?.display_name ?? user.email?.split("@")[0] ?? "Jogador");
        setAvatarUrl(data?.avatar_url ?? undefined);
      });
  }, [user]);

  if (!user) return null;
  const initials = (profileName || "J").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    clearLocal();
    await signOut();
    toast.success("Até logo!");
  };

  const handleNewJourney = async () => {
    if (!confirm("Iniciar uma nova jornada apaga seu progresso atual. Continuar?")) return;
    resetGame();
    if (user) {
      await supabase.from("game_saves").delete().eq("user_id", user.id);
    }
    toast.success("Nova jornada pronta!");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-2">
          <Avatar className="w-8 h-8 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">{profileName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-semibold">{profileName}</span>
            <span className="text-xs text-muted-foreground font-normal truncate">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-xs text-muted-foreground" disabled>
          <Cloud className="w-3.5 h-3.5" /> Progresso sincronizado
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleNewJourney} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Nova jornada
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-destructive focus:text-destructive">
          <LogOut className="w-4 h-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
