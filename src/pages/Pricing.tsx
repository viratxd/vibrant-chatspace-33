
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PricingCard } from "@/components/pricing/PricingCard";
import { QrCodeSection } from "@/components/pricing/QrCodeSection";
import { TransactionForm } from "@/components/pricing/TransactionForm";

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

      const { error: transactionError } = await supabase
        .from("payment_transactions")
        .insert({
          user_id: user.id,
          transaction_number: transactionNumber.trim(),
          amount: price,
        });

      if (transactionError) throw transactionError;

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
          <PricingHeader />
          <PricingCard price={price} />
          <div className="space-y-4">
            <QrCodeSection qrCode={qrCode} />
            <TransactionForm
              transactionNumber={transactionNumber}
              setTransactionNumber={setTransactionNumber}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
