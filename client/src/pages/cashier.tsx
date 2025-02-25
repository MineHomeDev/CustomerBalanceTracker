import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { useState } from "react";
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

const balanceSchema = z.object({
  userId: z.number(),
  amount: z.number().min(1),
  type: z.enum(["deposit", "withdrawal"]),
  description: z.string().min(1),
});

const AnimatedContainer = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

function BalanceForm() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const form = useForm<z.infer<typeof balanceSchema>>({
    resolver: zodResolver(balanceSchema),
    defaultValues: {
      amount: 0,
      type: "deposit" as const,
      description: "",
    },
  });

  const balanceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof balanceSchema>) => {
      const res = await apiRequest("POST", "/api/balance", {
        ...data,
        amount: Math.round(data.amount * 100), // Convert to cents
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      form.reset();
      setSelectedUser(null);
      setSearchTerm("");
      toast({
        title: "Erfolg",
        description: "Guthaben wurde aktualisiert",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      try {
        console.log('Suche nach:', searchTerm);
        const res = await apiRequest("GET", `/api/users/search?search=${encodeURIComponent(searchTerm)}`);
        if (!res.ok) {
          if (res.status === 401) {
            toast({
              title: "Fehler",
              description: "Bitte melden Sie sich erneut an",
              variant: "destructive",
            });
            return [];
          }
          if (res.status === 403) {
            toast({
              title: "Fehler",
              description: "Sie haben keine Berechtigung für diese Aktion",
              variant: "destructive",
            });
            return [];
          }
          throw new Error("Fehler bei der Benutzersuche");
        }
        const data = await res.json();
        console.log('Gefundene Benutzer:', data);
        return data;
      } catch (error) {
        console.error('Fehler bei der Suche:', error);
        return [];
      }
    },
    enabled: searchTerm.length >= 2,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => balanceMutation.mutate(data))} className="space-y-6">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benutzer</FormLabel>
              <div className="relative">
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Nach E-Mail oder Namen suchen..."
                      value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : searchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log('Sucheingabe geändert:', value);
                        setSearchTerm(value);
                        setSelectedUser(null);
                        field.onChange(undefined);
                      }}
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                {isLoading && (
                  <div className="absolute w-full mt-1 p-2 border rounded-md bg-background">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                )}
                {!isLoading && users.length > 0 && !selectedUser && (
                  <div className="absolute w-full mt-1 border rounded-md bg-background shadow-lg max-h-48 overflow-auto z-50">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex justify-between items-center p-3 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          console.log('Benutzer ausgewählt:', user);
                          field.onChange(user.id);
                          setSelectedUser(user);
                          setSearchTerm("");
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{user.firstName} {user.lastName}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                        <span className="text-muted-foreground">
                          €{(user.balance / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaktionstyp</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ auswählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="deposit">Einzahlung</SelectItem>
                    <SelectItem value="withdrawal">Auszahlung</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Betrag (€)</FormLabel>
                <FormControl>
                  <input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    placeholder="Betrag eingeben"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={balanceMutation.isPending || !form.getValues().userId}
        >
          {balanceMutation.isPending ? "Verarbeite..." : "Guthaben aktualisieren"}
        </Button>
      </form>
    </Form>
  );
}

export default function CashierPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user?.isCashier) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-screen"
      >
        <p className="text-destructive">Zugriff verweigert. Nur für Kassierer.</p>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                className="lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </motion.div>
            <h1 className="text-xl font-bold">Kassierer Dashboard</h1>
          </div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="hidden lg:flex"
            >
              Zum Guthaben
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid gap-6 max-w-2xl mx-auto">
          <AnimatedContainer>
            <QRCodeScanner />
          </AnimatedContainer>

          <AnimatedContainer>
            <Card>
              <CardHeader>
                <CardTitle>Guthaben verwalten</CardTitle>
              </CardHeader>
              <CardContent>
                <BalanceForm />
              </CardContent>
            </Card>
          </AnimatedContainer>
        </div>
      </main>
    </div>
  );
}