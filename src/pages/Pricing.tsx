
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QrCode, CreditCard, ArrowRight } from "lucide-react";

const Pricing = () => {
  const [qrCode, setQrCode] = useState("");
  const [price, setPrice] = useState(0);
  const [transactionNumber, setTransactionNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    const fetchQrCode = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("payment_settings")
          .select("qr_code_url, price")
          .single();

        if (error) throw error;
        
        if (data) {
          setQrCode(data.qr_code_url);
          setPrice(data.price);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load payment information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      // Create payment transaction
      const { error: transactionError } = await supabase
        .from("payment_transactions")
        .insert({
          user_id: user.id,
          transaction_number: transactionNumber.trim(),
          amount: price,
        });

      if (transactionError) throw transactionError;

      // Update user's premium status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Success!",
        description: "Your payment is being verified. You'll be notified once it's confirmed.",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="pt-20 px-4">
          <div className="flex items-center justify-center">
            Loading...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-20 px-4 max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Upgrade to Pro</h1>
            <p className="text-gray-400">Get access to all premium features</p>
          </div>

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

          <div className="space-y-4">
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Submit Payment"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
