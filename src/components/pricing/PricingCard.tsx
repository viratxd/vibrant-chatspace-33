
import { CreditCard, ArrowRight } from "lucide-react";

interface PricingCardProps {
  price: number;
}

export const PricingCard = ({ price }: PricingCardProps) => {
  return (
    <div className="bg-secondary rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Pro Plan</h2>
          <p className="text-sm text-gray-400">One-time payment</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">₹{price}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="text-primary" size={16} />
          <span>Full access to all features</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ArrowRight className="text-primary" size={16} />
          <span>Priority support</span>
        </div>
      </div>
    </div>
  );
};
