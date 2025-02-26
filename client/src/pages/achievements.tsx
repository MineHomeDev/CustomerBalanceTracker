
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AnimatedContainer, AnimatedListItem } from "@/components/ui/animated-container";
import { motion } from "framer-motion";
import { useEffect } from 'react';

const AVAILABLE_ACHIEVEMENTS = [
  {
    type: "first_deposit",
    name: "Erster Einzahler",
    description: "Tätige deine erste Einzahlung"
  },
  {
    type: "big_spender",
    name: "Großzahler",
    description: "Tätige eine Einzahlung von mindestens 10€"
  },
  {
    type: "points_100",
    name: "Punktesammler",
    description: "Sammle 100 Punkte"
  },
  {
    type: "points_500",
    name: "Punkteprofi",
    description: "Sammle 500 Punkte"
  },
  {
    type: "regular_user",
    name: "Stammkunde",
    description: "Nutze die App 5 Tage in Folge"
  }
];

export default function AchievementsPage() {
  const { user } = useAuth();

  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    refetchInterval: 10000,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Errungenschaften</h1>
          <div>
            <Badge variant="outline" className="font-normal">
              {achievements?.length || 0} von {AVAILABLE_ACHIEVEMENTS.length} freigeschaltet
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-6 w-6 text-primary" />
            </motion.div>
          </div>
        ) : (
          <div className="space-y-4">
            {AVAILABLE_ACHIEVEMENTS.map((availableAchievement) => {
              const unlockedAchievement = achievements?.find(
                (a) => a.type === availableAchievement.type
              );

              return (
                <AnimatedListItem key={availableAchievement.type}>
                  <div className={`flex items-center justify-between p-4 border rounded-lg backdrop-blur-sm transition-colors ${
                    unlockedAchievement ? 'bg-white/80 hover:bg-accent/50' : 'bg-muted/50'
                  }`}>
                    <div className="flex items-start gap-4">
                      {unlockedAchievement ? (
                        <Award className="h-6 w-6 text-primary mt-1" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground mt-1" />
                      )}
                      <div>
                        <p className={`font-medium ${!unlockedAchievement && 'text-muted-foreground'}`}>
                          {availableAchievement.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {availableAchievement.description}
                        </p>
                        {unlockedAchievement && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Freigeschaltet {formatDistanceToNow(new Date(unlockedAchievement.unlockedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                    {unlockedAchievement && <Badge>Freigeschaltet</Badge>}
                  </div>
                </AnimatedListItem>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
