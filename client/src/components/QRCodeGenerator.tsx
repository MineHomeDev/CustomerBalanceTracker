import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export function QRCodeGenerator() {
  const { user } = useAuth();
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      if (!user) return;

      const data = {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };

      try {
        const url = await QRCode.toDataURL(JSON.stringify(data));
        setQrUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generateQRCode();
  }, [user]);

  if (!qrUrl) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ihr persönlicher QR-Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <motion.img 
          src={qrUrl} 
          alt="QR Code" 
          className="w-48 h-48"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        />
        <p className="text-sm text-muted-foreground text-center">
          Zeigen Sie diesen Code vor, um Guthaben aufzuladen
        </p>
      </CardContent>
    </Card>
  );
}