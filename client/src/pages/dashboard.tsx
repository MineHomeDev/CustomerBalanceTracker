import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Achievement } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, Wallet, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useLocation } from 'wouter';
import { AnimatedContainer, AnimatedListItem } from "@/components/ui/animated-container";
import { motion } from "framer-motion";
import { getQueryFn } from "@/lib/queryClient"; // Fixed import path

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 5000, // Alle 5 Sekunden aktualisieren
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    refetchInterval: 10000, // Achievements weniger häufig aktualisieren
  });

  // Benutzer-Daten automatisch aktualisieren
  useQuery({
    queryKey: ["/api/user"],
    refetchInterval: 5000,
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Wallet className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold">Balance System</h1>
              <p className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => useAuth().logoutMutation.mutate()}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <AnimatedContainer>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">Kontoübersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="space-y-4 md:flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Aktuelles Guthaben</p>
                      <motion.p 
                        className="text-4xl font-bold text-primary"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {(user.balance / 100).toFixed(2)}€
                      </motion.p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Punkte</p>
                      <div className="flex items-center gap-2">
                        <motion.p 
                          className="text-2xl font-semibold"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          {user.points}
                        </motion.p>
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center md:flex-1">
                  <QRCodeGenerator />
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedContainer>

        {achievements && achievements.length > 0 && (
          <AnimatedContainer>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Errungenschaften
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((achievement) => (
                    <AnimatedListItem key={achievement.id}>
                      <motion.div 
                        className="p-4 border rounded-lg bg-accent/10"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Freigeschaltet {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                        </p>
                      </motion.div>
                    </AnimatedListItem>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        )}

        <AnimatedContainer>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaktionen</CardTitle>
              <Badge variant="outline" className="font-normal">
                {transactions?.length || 0} Einträge
              </Badge>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center p-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-6 w-6 text-primary" />
                  </motion.div>
                </div>
              ) : transactions?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Noch keine Transaktionen vorhanden
                </p>
              ) : (
                <div className="space-y-4">
                  {transactions?.map((transaction) => (
                    <AnimatedListItem key={transaction.id}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-2"
                        >
                          <Badge variant={transaction.type === "deposit" ? "default" : "destructive"}>
                            {transaction.type === "deposit" ? "+" : "-"}€{(transaction.amount / 100).toFixed(2)}
                          </Badge>
                        </motion.div>
                      </div>
                    </AnimatedListItem>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedContainer>
      </main>
    </div>
  );
}