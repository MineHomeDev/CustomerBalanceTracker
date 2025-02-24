import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: number;
  // ... other user properties
}

interface QRData {
  qrCodeId: string;
}

export function QRCodeScanner() {
  const [scanning, setScanning] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [scannedUser, setScannedUser] = useState<User | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  const findUserMutation = useMutation({
    mutationFn: async (qrCodeId: string) => {
      const res = await apiRequest("GET", `/api/users/qr/${qrCodeId}`);
      if (!res.ok) throw new Error("Benutzer nicht gefunden");
      return res.json();
    },
    onSuccess: (user: User) => {
      setScannedUser(user);
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const processMutation = useMutation({
    mutationFn: async (data: { userId: number; amount: number; type: 'deposit' | 'withdrawal' }) => {
      const res = await apiRequest('POST', '/api/balance', {
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        description: data.type === 'deposit' ? 'QR-Code Einzahlung' : 'QR-Code Abbuchung'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: 'Erfolg',
        description: `Transaktion wurde erfolgreich ${transactionType === 'deposit' ? 'eingezahlt' : 'abgebucht'}`,
      });
      setScanning(false);
      setAmount('');
      setScannedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setScanning(false);
  };

  const startScanner = async () => {
    if (!amount) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie zuerst einen Betrag ein',
        variant: 'destructive',
      });
      return;
    }

    if (!scannerRef.current) {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
    }

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          try {
            const data: QRData = JSON.parse(decodedText);
            await stopScanner();
            const user = await findUserMutation.mutateAsync(data.qrCodeId);
            processMutation.mutate({
              userId: user.id,
              amount: Math.round(parseFloat(amount) * 100),
              type: transactionType
            });
          } catch (err) {
            toast({
              title: 'Fehler',
              description: 'Ungültiger QR-Code',
              variant: 'destructive',
            });
          }
        },
        () => {}, // Ignore errors to prevent console spam
      );
      setScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast({
        title: 'Fehler',
        description: 'Scanner konnte nicht gestartet werden',
        variant: 'destructive',
      });
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR-Code Scanner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Transaktionstyp</label>
          <Select
            value={transactionType}
            onValueChange={(value: 'deposit' | 'withdrawal') => setTransactionType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Typ auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deposit">Einzahlung</SelectItem>
              <SelectItem value="withdrawal">Abbuchung</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Betrag (€)
          </label>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          id="qr-reader"
          className="w-full max-w-sm mx-auto"
        />

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-full"
            onClick={scanning ? stopScanner : startScanner}
            disabled={processMutation.isPending || findUserMutation.isPending}
          >
            {processMutation.isPending || findUserMutation.isPending ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-5 w-5 mr-2" />
                </motion.div>
                Verarbeite...
              </>
            ) : scanning ? (
              'Scanner beenden'
            ) : (
              'QR-Code scannen'
            )}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}