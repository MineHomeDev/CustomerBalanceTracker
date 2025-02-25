import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '@/hooks/use-auth';
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
    <motion.div 
      className="flex flex-col items-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <img 
        src={qrUrl} 
        alt="QR Code" 
        className="w-32 h-32 md:w-40 md:h-40"
      />
      <p className="text-sm text-muted-foreground text-center mt-2">
        Ihr persönlicher QR-Code
      </p>
    </motion.div>
  );
}