
import { QrCode } from "lucide-react";

interface QrCodeSectionProps {
  qrCode: string;
}

export const QrCodeSection = ({ qrCode }: QrCodeSectionProps) => {
  return (
    <div className="bg-secondary p-6 rounded-lg space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <QrCode className="text-primary" size={20} />
        <h3 className="font-semibold">Scan & Pay</h3>
      </div>
      <div className="aspect-square bg-white rounded-lg p-4">
        <img
          src={qrCode}
          alt="Payment QR Code"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};
