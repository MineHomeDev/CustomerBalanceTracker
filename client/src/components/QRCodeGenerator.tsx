import { useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function QRCodeGenerator() {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');

  const generateQRCode = async () => {
    if (!user || !amount) return;
    
    const data = {
      userId: user.id,
      amount: parseFloat(amount) * 100, // Convert to cents
      timestamp: Date.now()
    };
    
    const jsonStr = JSON.stringify(data);
    try {
      const url = await QRCode.toDataURL(jsonStr);
      setQrUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR-Code Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Betrag (€)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Betrag eingeben"
          />
        </div>
        <Button onClick={generateQRCode} className="w-full" disabled={!amount}>
          QR-Code generieren
        </Button>
        {qrUrl && (
          <div className="flex flex-col items-center gap-2 pt-4">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
            <p className="text-sm text-muted-foreground">
              Scannen Sie diesen Code mit der Kassierer-App
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
