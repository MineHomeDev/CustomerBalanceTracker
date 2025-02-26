
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, History, QrCode } from "lucide-react";

export function BottomNav() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNav(currentScrollY <= lastScrollY || currentScrollY <= 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (!user || location === "/auth") return null;

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50"
      initial={{ y: "100%" }}
      animate={{ y: showNav ? 0 : "100%" }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around">
          <Link href="/">
            <a className={cn(
              "flex flex-col items-center p-2 rounded-lg transition-colors relative",
              location === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}>
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
              {location === "/" && (
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
                <span className="text-xs mt-1">Kasse</span>
                {location === "/cashier" && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </a>
            </Link>
          )}

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
        </div>
      </div>
    </motion.nav>
  );
}
