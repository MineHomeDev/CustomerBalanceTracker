
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AnimatedContainer, AnimatedListItem } from "@/components/ui/animated-container";
import { motion } from "framer-motion";
import { useEffect } from 'react';
import { Progress } from "@/components/ui/progress";

const TOTAL_ACHIEVEMENTS = 5; // Gesamtzahl der verfügbaren Achievements

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

  const progress = (achievements?.length || 0) / TOTAL_ACHIEVEMENTS * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Errungenschaften</h1>
          <div>
            <Badge variant="outline" className="font-normal">
              {achievements?.length || 0} von {TOTAL_ACHIEVEMENTS} Freigeschaltet
            </Badge>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-4">
          <Progress value={progress} className="h-2" />
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
        ) : achievements?.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Errungenschaften freigeschaltet</p>
            <p className="text-sm">Nutzen Sie die App weiter, um Errungenschaften freizuschalten!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Freigeschaltete Achievements */}
            {achievements?.map((achievement) => (
              <AnimatedListItem key={achievement.id}>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white/80 backdrop-blur-sm hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Award className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Freigeschaltet {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedListItem>
            ))}

            {/* Noch nicht freigeschaltete Achievements */}
            {Array.from({ length: TOTAL_ACHIEVEMENTS - (achievements?.length || 0) }).map((_, index) => (
              <AnimatedListItem key={`locked-${index}`}>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-start gap-4">
                    <Lock className="h-6 w-6 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium text-muted-foreground">???</p>
                      <p className="text-sm text-muted-foreground">Diese Errungenschaft ist noch gesperrt</p>
                    </div>
                  </div>
                </div>
              </AnimatedListItem>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
