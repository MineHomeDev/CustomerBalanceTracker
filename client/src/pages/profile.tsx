
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Profil</h1>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Persönliche Informationen</h2>
            <div className="space-y-2">
              <p><span className="text-muted-foreground">Name:</span> {user.firstName} {user.lastName}</p>
              <p><span className="text-muted-foreground">E-Mail:</span> {user.email}</p>
              <p><span className="text-muted-foreground">Rolle:</span> {user.isCashier ? 'Kassierer' : 'Benutzer'}</p>
            </div>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }}
          >
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
