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

  useEffect(() => {
    if (!scanning) {
      scannerRef.current?.stop();
      return;
    }

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        try {
          const data: QRData = JSON.parse(decodedText);
          // Validate timestamp (e.g., not older than 5 minutes)
          const isValid = Date.now() - data.timestamp < 5 * 60 * 1000;
          if (!isValid) {
            throw new Error('QR-Code ist abgelaufen');
          }
          processMutation.mutate(data);
          scanner.stop();
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

    return () => {
      scanner.stop().catch(console.error);
    };
  }, [scanning]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR-Code Scanner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div id="qr-reader" className="w-full max-w-sm mx-auto" />
        <Button
          className="w-full"
          onClick={() => setScanning(!scanning)}
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