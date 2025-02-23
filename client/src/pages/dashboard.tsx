import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Balance System</h1>
          </div>
          <div className="flex items-center gap-2">
            {user.isCashier && (
              <Button 
                variant="outline" 
                onClick={() => setLocation("/cashier")}
                className="hidden sm:flex"
              >
                Cashier Dashboard
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => logoutMutation.mutate()}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <div className="grid gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg text-muted-foreground">Aktuelles Guthaben</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">
                €{(user.balance / 100).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <QRCodeGenerator />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaktionen</CardTitle>
              <Badge variant="outline" className="font-normal">
                {transactions?.length || 0} Einträge
              </Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : transactions?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Noch keine Transaktionen vorhanden
                </p>
              ) : (
                <div className="space-y-4">
                  {transactions?.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={transaction.type === "deposit" ? "default" : "destructive"}>
                          {transaction.type === "deposit" ? "+" : "-"}€{(transaction.amount / 100).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {user.isCashier && (
        <div className="fixed bottom-4 right-4 sm:hidden">
          <Button 
            className="shadow-lg"
            onClick={() => setLocation("/cashier")}
          >
            Zur Kasse
          </Button>
        </div>
      )}
    </div>
  );
}