import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AnimatedContainer, AnimatedListItem } from "@/components/ui/animated-container";
import { motion } from "framer-motion";
import { useEffect } from 'react';

export default function TransactionsPage() {
  const { user } = useAuth();

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 5000,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Transaktionen</h1>
          <div>
            <Badge variant="outline" className="font-normal">{transactions?.length || 0} Einträge</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8">
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
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white/80 backdrop-blur-sm hover:bg-accent/50 transition-colors">
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
      </main>
    </div>
  );
}
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AnimatedContainer, AnimatedListItem } from "@/components/ui/animated-container";
import { motion } from "framer-motion";
import { useEffect } from 'react';

export default function TransactionsPage() {
  const { user } = useAuth();

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: 5000,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Transaktionen</h1>
          <div>
            <Badge variant="outline" className="font-normal">{transactions?.length || 0} Einträge</Badge>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
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
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white/80 backdrop-blur-sm hover:bg-accent/50 transition-colors">
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
      </main>
    </div>
  );
}
