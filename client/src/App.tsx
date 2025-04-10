import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import CashierPage from "@/pages/cashier";
import TransactionsPage from "@/pages/transactions";
import { ProtectedRoute } from "./lib/protected-route";
import { BottomNav } from "@/components/ui/bottom-nav";
import { ProfilePage } from "./pages/profile"; // Added import for ProfilePage

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/cashier" component={CashierPage} />
      <ProtectedRoute path="/transactions" component={TransactionsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} /> {/* Added route for ProfilePage */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <BottomNav />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;