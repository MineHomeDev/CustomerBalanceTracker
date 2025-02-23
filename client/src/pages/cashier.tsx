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
import { Loader2 } from "lucide-react";

const balanceSchema = z.object({
  userId: z.number(),
  amount: z.number().min(1),
  type: z.enum(["deposit", "withdrawal"]),
  description: z.string().min(1),
});

export default function CashierPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user?.isCashier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Access denied. Cashiers only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Cashier Dashboard</h1>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            User Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <BalanceForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function BalanceForm() {
  const { toast } = useToast();
  const form = useForm({
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
      toast({
        title: "Success",
        description: "Balance updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users", searchTerm],
    enabled: Boolean(searchTerm),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => balanceMutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <FormControl>
                <Input
                  placeholder="Search by username..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </FormControl>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : users?.length ? (
                <div className="border rounded-md p-2 space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex justify-between items-center p-2 hover:bg-accent rounded cursor-pointer"
                      onClick={() => field.onChange(user.id)}
                    >
                      <span>{user.username}</span>
                      <span>${(user.balance / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
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
              <FormLabel>Amount ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
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
          disabled={balanceMutation.isPending}
        >
          {balanceMutation.isPending ? "Processing..." : "Update Balance"}
        </Button>
      </form>
    </Form>
  );
}
