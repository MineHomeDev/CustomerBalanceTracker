
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, UserIcon, UserPlus } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useState } from "react";
import { CreateCashierModal } from "@/components/create-cashier-modal";

export function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [showCreateCashierModal, setShowCreateCashierModal] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <UserIcon className="h-6 w-6 text-primary" />
            </motion.div>
            <h1 className="text-xl font-bold">Mein Profil</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Nutzerdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-Mail</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rolle</p>
                <p className="font-medium">{user.isCashier ? "Kassierer" : "Mitglied"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">QR-Code ID</p>
                <p className="font-medium">{user.qrCodeId}</p>
              </div>

              {user.isCashier && (
                <Button 
                  variant="outline" 
                  className="w-full mt-6 mb-2"
                  onClick={() => setShowCreateCashierModal(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Neuen Kassierer erstellen
                </Button>
              )}

              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                      <LogOut className="h-4 w-4" />
                    </motion.div>
                    Abmelden...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {showCreateCashierModal && (
        <CreateCashierModal 
          isOpen={showCreateCashierModal} 
          onClose={() => setShowCreateCashierModal(false)} 
        />
      )}

      <BottomNav />
    </div>
  );
}
