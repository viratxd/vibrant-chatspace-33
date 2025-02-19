
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PricingHeader } from "@/components/pricing/PricingHeader";
import { PricingCard } from "@/components/pricing/PricingCard";
import { QrCodeSection } from "@/components/pricing/QrCodeSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ImageIcon, Loader2 } from "lucide-react";
import { uploadImage } from "@/utils/payss";

const CACHE_KEY = 'payment_settings';

const Pricing = () => {
  const [qrCode, setQrCode] = useState("");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkSession();
    fetchQrCode();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
      return;
    }
  };

  const fetchQrCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { qr_code_url, price, timestamp } = JSON.parse(cachedData);
        if (timestamp && Date.now() - timestamp < 3600000) {
          setQrCode(qr_code_url);
          setPrice(price);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("payment_settings")
        .select("qr_code_url, price")
        .single();

      if (error) throw error;
      
      if (data) {
        setQrCode(data.qr_code_url);
        setPrice(data.price);
        
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("User not authenticated");

      await uploadImage(selectedImage, user.email || '');

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_premium: true })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Success!",
        description: "Payment proof uploaded successfully. Your account has been upgraded.",
      });

      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
      <main className="pt-20 px-4 pb-32 max-w-md mx-auto">
        <div className="space-y-6">
          <PricingHeader />
          <PricingCard price={price} />
          
          <Tabs defaultValue="pricing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="upload">Upload Payment Proof</TabsTrigger>
            </TabsList>

            <TabsContent value="pricing">
              <div className="space-y-4">
                <QrCodeSection qrCode={qrCode} />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="payment-proof"
                  />
                  <label
                    htmlFor="payment-proof"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-400">
                      Click to upload payment screenshot
                    </span>
                  </label>
                </div>

                {selectedImage && (
                  <div className="mt-4">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Payment proof preview"
                      className="max-h-48 rounded-lg mx-auto"
                    />
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  className="w-full"
                  disabled={uploading || !selectedImage}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Submit Payment Proof"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
