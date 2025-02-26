import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AnimatedContainer, AnimatedListItem } from "@/components/ui/animated-container";
import { motion } from "framer-motion";
import { useEffect } from 'react';

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
            <Badge variant="outline" className="font-normal">{achievements?.length || 0} Freigeschaltet</Badge>
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
        ) : achievements?.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Errungenschaften freigeschaltet</p>
            <p className="text-sm">Nutzen Sie die App weiter, um Errungenschaften freizuschalten!</p>
          </div>
        ) : (
          <div className="space-y-4">
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
          </div>
        )}
      </main>
    </div>
  );
}
