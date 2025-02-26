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

      try {
        const depositData = {
          qrCodeId: user.depositQrCodeId,
          type: 'deposit'
        };
        const withdrawData = {
          qrCodeId: user.withdrawQrCodeId,
          type: 'withdraw'
        };

        const depositUrl = await QRCode.toDataURL(JSON.stringify(depositData));
        const withdrawUrl = await QRCode.toDataURL(JSON.stringify(withdrawData));
        setQrUrl({ deposit: depositUrl, withdraw: withdrawUrl });
      } catch (err) {
        console.error('Error generating QR codes:', err);
      }
    };

    generateQRCode();
  }, [user]);

  if (!qrUrl) return null;

  return (
    <motion.div 
      className="flex flex-col items-center gap-4"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="text-center">
        <img 
          src={qrUrl.deposit} 
          alt="Einzahlungs QR-Code" 
          className="w-32 h-32 md:w-40 md:h-40"
        />
        <p className="text-sm text-muted-foreground text-center mt-2">
          QR-Code für Einzahlungen
        </p>
      </div>
      <div className="text-center">
        <img 
          src={qrUrl.withdraw} 
          alt="Abbuchungs QR-Code" 
          className="w-32 h-32 md:w-40 md:h-40"
        />
        <p className="text-sm text-muted-foreground text-center mt-2">
          QR-Code für Abbuchungen
        </p>
      </div>
    </motion.div>
  );
}