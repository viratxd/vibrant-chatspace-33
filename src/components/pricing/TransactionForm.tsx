
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TransactionFormProps {
  transactionNumber: string;
  setTransactionNumber: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const TransactionForm = ({
  transactionNumber,
  setTransactionNumber,
  onSubmit,
  submitting,
}: TransactionFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="transactionNumber" className="text-sm font-medium">
          Transaction Number
        </label>
        <Input
          id="transactionNumber"
          placeholder="Enter your transaction number"
          value={transactionNumber}
          onChange={(e) => setTransactionNumber(e.target.value)}
          required
          className="bg-secondary border-none"
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Processing..." : "Submit Payment"}
      </Button>
    </form>
  );
};
