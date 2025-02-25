import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Achievement } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Award, Search, MessageCircle } from "lucide-react";
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

  const { data: achievements } = useQuery<Achievement[]>({
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
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="container px-4 h-14 flex items-center">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">News</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2">
              <MessageCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <Tabs defaultValue="recommended" className="min-h-screen">
        {/* Main Content */}
        <main className="container px-4 pt-20 pb-20">
          <TabsContent value="recommended" className="space-y-4">
            {/* Balance Card */}
            <AnimatedContainer>
              <Card className="overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
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
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Punkte</p>
                      <div className="flex items-center justify-end space-x-1">
                        <motion.p 
                          className="text-2xl font-bold"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          {user.points}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <QRCodeGenerator />
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {/* Transactions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-semibold">Recommended for you</h2>
                <Badge variant="outline" className="font-normal">
                  {transactions?.length || 0} Einträge
                </Badge>
              </div>

              <div className="space-y-3">
                {transactionsLoading ? (
                  <Card className="p-4 flex justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="text-primary"
                    >
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"/>
                    </motion.div>
                  </Card>
                ) : transactions?.slice(0, 5).map((transaction) => (
                  <AnimatedListItem key={transaction.id}>
                    <Card className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
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
                      </CardContent>
                    </Card>
                  </AnimatedListItem>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="text-center text-muted-foreground py-8">
              Alle Transaktionen werden hier angezeigt
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            {achievements && achievements.length > 0 ? (
              <div className="grid gap-4">
                {achievements.map((achievement) => (
                  <AnimatedListItem key={achievement.id}>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Award className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{achievement.name}</p>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedListItem>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Noch keine Errungenschaften
              </div>
            )}
          </TabsContent>
        </main>

        {/* Bottom Navigation */}
        <TabsList className="fixed bottom-0 left-0 right-0 border-t bg-white/80 backdrop-blur-sm pb-safe z-50 h-16">
          <TabsTrigger value="recommended" className="flex-1 data-[state=active]:bg-transparent h-full">
            <div className="flex flex-col items-center space-y-1">
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-transparent h-full">
            <div className="flex flex-col items-center space-y-1">
              <Search className="h-5 w-5" />
              <span className="text-xs">All</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex-1 data-[state=active]:bg-transparent h-full">
            <div className="flex flex-col items-center space-y-1">
              <Award className="h-5 w-5" />
              <span className="text-xs">Awards</span>
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}