
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form from auto-submitting
    if (transactionNumber.trim()) {
      onSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionNumber(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="transactionNumber" className="text-sm font-medium">
          Transaction Number
        </label>
        <Input
          id="transactionNumber"
          type="text"
          placeholder="Enter your transaction number"
          value={transactionNumber}
          onChange={handleChange}
          required
          className="bg-secondary border-none"
          disabled={submitting}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full" 
        disabled={submitting || !transactionNumber.trim()}
      >
        {submitting ? "Processing..." : "Submit Payment"}
      </Button>
    </form>
  );
};
