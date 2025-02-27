
import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User } from "@shared/schema";

export function CashierManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/search", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      try {
        const res = await apiRequest("GET", `/api/users/search?search=${encodeURIComponent(searchTerm)}`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            toast({
              title: "Fehler",
              description: "Sie haben keine Berechtigung für diese Aktion",
              variant: "destructive",
            });
            return [];
          }
          throw new Error("Fehler bei der Benutzersuche");
        }
        return await res.json();
      } catch (error) {
        console.error('Fehler bei der Suche:', error);
        return [];
      }
    },
    enabled: searchTerm.length >= 2,
  });

  const makeCashierMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", "/api/users/make-cashier", { userId });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Fehler beim Aktualisieren des Nutzers");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/search"] });
      toast({
        title: "Erfolg",
        description: `${selectedUser?.firstName} ${selectedUser?.lastName} ist jetzt ein Kassierer`,
      });
      setSelectedUser(null);
      setSearchTerm("");
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMakeCashier = () => {
    if (selectedUser) {
      setIsConfirmOpen(true);
    }
  };

  const confirmMakeCashier = () => {
    if (selectedUser) {
      makeCashierMutation.mutate(selectedUser.id);
      setIsConfirmOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kassierer verwalten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Suchen Sie nach einem Benutzer, den Sie zum Kassierer befördern möchten
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Nach E-Mail oder Namen suchen..."
              value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                setSelectedUser(null);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading && (
          <div className="text-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-opacity-50 border-t-primary rounded-full mx-auto"></div>
          </div>
        )}

        {!isLoading && users.length > 0 && !selectedUser && (
          <div className="border rounded-md mt-1">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center p-3 hover:bg-accent cursor-pointer"
                onClick={() => {
                  setSelectedUser(user);
                  setSearchTerm("");
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {user.isCashier ? "Bereits Kassierer" : "Mitglied"}
                </span>
              </div>
            ))}
          </div>
        )}

        {selectedUser && (
          <div className="border rounded-md p-4 mt-2">
            <div className="flex flex-col space-y-2">
              <span className="text-sm text-muted-foreground">Ausgewählter Benutzer</span>
              <span className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</span>
              <span className="text-sm text-muted-foreground">{selectedUser.email}</span>
              <span className="text-sm">
                Status: {selectedUser.isCashier ? (
                  <span className="text-green-600 font-semibold">Kassierer</span>
                ) : (
                  <span className="text-blue-600 font-semibold">Mitglied</span>
                )}
              </span>
            </div>
          </div>
        )}

        <Button 
          onClick={handleMakeCashier} 
          disabled={!selectedUser || selectedUser.isCashier || makeCashierMutation.isPending}
          className="w-full"
        >
          {makeCashierMutation.isPending ? "Wird bearbeitet..." : "Zum Kassierer befördern"}
        </Button>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kassierer erstellen</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie wirklich {selectedUser?.firstName} {selectedUser?.lastName} zum Kassierer befördern?
                Diese Rolle erlaubt dem Benutzer, Guthaben zu verwalten und QR-Codes zu scannen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMakeCashier}>Bestätigen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
