import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Achievement } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-xl font-bold">News</h1>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20">
        <Tabs defaultValue="home" className="space-y-6">
          <TabsContent value="home" className="space-y-6 pt-4">
            {/* Top Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              <Button variant="default" className="whitespace-nowrap bg-primary text-primary-foreground">
                Recommended
              </Button>
              <Button variant="outline" className="whitespace-nowrap">
                All News
              </Button>
              <Button variant="outline" className="whitespace-nowrap">
                Videos
              </Button>
              <Button variant="outline" className="whitespace-nowrap">
                3M
              </Button>
            </div>

            {/* Balance Card */}
            <AnimatedContainer>
              <Card className="bg-card border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Guthaben</p>
                      <motion.p 
                        className="text-2xl font-bold"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {(user.balance / 100).toFixed(2)}€
                      </motion.p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Punkte</p>
                      <div className="flex items-center gap-2">
                        <motion.p 
                          className="text-2xl font-bold"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
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
              <Card className="bg-card border-none shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <QRCodeGenerator />
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Transactions */}
            <AnimatedContainer>
              <Card className="bg-card border-none shadow-lg">
                <CardHeader className="px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Letzte Transaktionen</CardTitle>
                    <Badge variant="outline" className="font-normal">
                      {transactions?.length || 0}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  {transactionsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !transactions?.length ? (
                    <p className="text-center py-8 text-muted-foreground">
                      Keine Transaktionen vorhanden
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <AnimatedListItem key={transaction.id}>
                          <motion.div 
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                              </p>
                            </div>
                            <Badge variant={transaction.type === "deposit" ? "default" : "destructive"}>
                              {transaction.type === "deposit" ? "+" : "-"}€{(transaction.amount / 100).toFixed(2)}
                            </Badge>
                          </motion.div>
                        </AnimatedListItem>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedContainer>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6 pt-4">
            {achievements?.length > 0 && (
              <AnimatedContainer>
                <Card className="bg-card border-none shadow-lg">
                  <CardHeader className="px-6 pt-6 pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Errungenschaften
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="space-y-4">
                      {achievements.map((achievement) => (
                        <AnimatedListItem key={achievement.id}>
                          <motion.div 
                            className="p-4 rounded-lg bg-muted/50"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <h3 className="font-semibold flex items-center gap-2">
                              <Award className="h-5 w-5" />
                              {achievement.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                          </motion.div>
                        </AnimatedListItem>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 pt-4">
            <AnimatedContainer>
              <Card className="bg-card border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
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
          <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm z-50">
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