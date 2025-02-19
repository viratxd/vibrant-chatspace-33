
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PricingCard } from "@/components/pricing/PricingCard";
import { QrCodeSection } from "@/components/pricing/QrCodeSection";
import { TransactionForm } from "@/components/pricing/TransactionForm";
import { Button } from "@/components/ui/button";

const CACHE_KEY = 'payment_settings';

const Pricing = () => {
  const [qrCode, setQrCode] = useState("");
  const [price, setPrice] = useState(0);
  const [transactionNumber, setTransactionNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication
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

  // Fetch payment settings with caching
  useEffect(() => {
    const fetchQrCode = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to get cached data first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { qr_code_url, price, timestamp } = JSON.parse(cachedData);
          // Check if cache is less than 1 hour old
          if (timestamp && Date.now() - timestamp < 3600000) {
            setQrCode(qr_code_url);
            setPrice(price);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data if cache missing or expired
        const { data, error } = await supabase
          .from("payment_settings")
          .select("qr_code_url, price")
          .single();

        if (error) throw error;
        
        if (data) {
          setQrCode(data.qr_code_url);
          setPrice(data.price);
          
          // Cache the new data
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            qr_code_url: data.qr_code_url,
            price: data.price,
            timestamp: Date.now()
          }));
        }
      } catch (error: any) {
        setError(error.message);
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
    if (!transactionNumber.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

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
      setError(error.message);
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
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse text-center">
              <div className="mb-2">Loading...</div>
              <div className="text-sm text-gray-400">Please wait while we fetch payment information</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="pt-20 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="text-red-500">Error loading payment information</div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="secondary"
              >
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-20 px-4 pb-32 max-w-md mx-auto"> {/* Added pb-32 for bottom padding */}
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
