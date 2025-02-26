import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Wallet, QrCode, LogOut, History, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function BottomNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-40" />
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
      >
        <nav className="mx-auto max-w-lg rounded-xl bg-white/80 backdrop-blur-lg shadow-lg border p-2">
          <div className="flex items-center justify-around">
            <Link href="/">
              <a className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors relative",
                location === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}>
                <Wallet className="h-6 w-6" />
                <span className="text-xs mt-1">Guthaben</span>
                {location === "/" && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </a>
            </Link>

            <Link href="/transactions">
              <a className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors relative",
                location === "/transactions" ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}>
                <History className="h-6 w-6" />
                <span className="text-xs mt-1">Verlauf</span>
                {location === "/transactions" && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </a>
            </Link>

            <Link href="/achievements">
              <a className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors relative",
                location === "/achievements" ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}>
                <Award className="h-6 w-6" />
                <span className="text-xs mt-1">Erfolge</span>
                {location === "/achievements" && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </a>
            </Link>

            {user.isCashier && (
              <Link href="/cashier">
                <a className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-colors relative",
                  location === "/cashier" ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}>
                  <QrCode className="h-6 w-6" />
                  <span className="text-xs mt-1">Scanner</span>
                  {location === "/cashier" && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </a>
              </Link>
            )}

            <button
              onClick={() => logoutMutation.mutate()}
              className="flex flex-col items-center p-2 rounded-lg transition-colors text-muted-foreground hover:text-primary"
            >
              <LogOut className="h-6 w-6" />
              <span className="text-xs mt-1">Abmelden</span>
            </button>
          </div>
        </nav>
      </motion.div>
    </>
  );
}