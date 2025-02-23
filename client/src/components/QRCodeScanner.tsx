import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface QRData {
  userId: number;
  amount: number;
  timestamp: number;
}

export function QRCodeScanner() {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  const processMutation = useMutation({
    mutationFn: async (data: QRData) => {
      const res = await apiRequest('POST', '/api/balance', {
        userId: data.userId,
        amount: data.amount,
        type: 'deposit',
        description: 'QR-Code Einzahlung'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: 'Erfolg',
        description: 'Guthaben wurde erfolgreich aufgeladen',
      });
      setScanning(false);
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
            const isValid = Date.now() - data.timestamp < 5 * 60 * 1000;
            if (!isValid) {
              throw new Error('QR-Code ist abgelaufen');
            }
            await stopScanner();
            processMutation.mutate(data);
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
        <div id="qr-reader" className="w-full max-w-sm mx-auto" />
        <Button
          className="w-full"
          onClick={scanning ? stopScanner : startScanner}
          disabled={processMutation.isPending}
        >
          {processMutation.isPending
            ? 'Verarbeite...'
            : scanning
            ? 'Scanner beenden'
            : 'QR-Code scannen'}
        </Button>
      </CardContent>
    </Card>
  );
}