import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Achievement } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardHeader and CardTitle
import { Badge } from "@/components/ui/badge";
import { Loader2, Home, Wallet, Settings, User, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useLocation } from 'wouter';
import { AnimatedContainer, AnimatedListItem } from "@/components/ui/animated-container";
import { motion } from "framer-motion";
import { getQueryFn } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 5000,
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    refetchInterval: 10000,
  });

  useQuery({
    queryKey: ["/api/user"],
    refetchInterval: 5000,
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Balance System</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <Tabs defaultValue="home" className="space-y-4">
          <TabsContent value="home" className="space-y-4">
            {/* Kontoübersicht Card */}
            <AnimatedContainer>
              <Card className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Guthaben</p>
                      <motion.p 
                        className="text-2xl font-bold"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {(user.balance / 100).toFixed(2)}€
                      </motion.p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Punkte</p>
                      <div className="flex items-center gap-1">
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
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* QR Code */}
            <AnimatedContainer>
              <Card className="bg-white">
                <CardContent className="pt-6">
                  <QRCodeGenerator />
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Transaktionen */}
            <AnimatedContainer>
              <Card className="bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Transaktionen</h2>
                    <Badge variant="outline" className="font-normal">
                      {transactions?.length || 0} Einträge
                    </Badge>
                  </div>
                  {transactionsLoading ? (
                    <div className="flex justify-center p-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }} //Re-added animation
                      >
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      </motion.div>
                    </div>
                  ) : transactions?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Noch keine Transaktionen
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {transactions?.slice(0, 5).map((transaction) => (
                        <AnimatedListItem key={transaction.id}>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                              </p>
                            </div>
                            <Badge variant={transaction.type === "deposit" ? "default" : "destructive"}>
                              {transaction.type === "deposit" ? "+" : "-"}€{(transaction.amount / 100).toFixed(2)}
                            </Badge>
                          </div>
                        </AnimatedListItem>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {achievements && achievements.length > 0 && (
              <AnimatedContainer>
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"> {/* Added CardHeader and CardTitle */}
                      <Award className="h-5 w-5" />
                      Errungenschaften
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      {achievements.map((achievement) => (
                        <AnimatedListItem key={achievement.id}>
                          <div className="p-4 rounded-lg bg-accent/10">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Award className="h-5 w-5" />
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </AnimatedListItem>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <AnimatedContainer>
              <Card className="bg-white">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => useAuth().logoutMutation.mutate()}
                    >
                      Abmelden
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
            <TabsList className="w-full">
              <TabsTrigger value="home" className="flex-1 py-3">
                <Home className="h-5 w-5" />
              </TabsTrigger>
              {user.isCashier && (
                <TabsTrigger value="cashier" className="flex-1 py-3" onClick={() => setLocation("/cashier")}>
                  <Wallet className="h-5 w-5" />
                </TabsTrigger>
              )}
              <TabsTrigger value="achievements" className="flex-1 py-3">
                <Award className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex-1 py-3">
                <User className="h-5 w-5" />
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </main>
    </div>
  );
}