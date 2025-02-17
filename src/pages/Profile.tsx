
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Globe, Headset, Star, Shield, Share2, UserPlus, Trash2, ArrowRight, Mail, GraduationCap, Crown } from "lucide-react";
import { useState, useEffect } from "react";
import { AuthDialog } from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ProfileOption = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-secondary rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/80 transition-colors"
  >
    <div className="flex items-center space-x-3">
      <Icon className="text-primary" size={20} />
      <span className="text-white">{label}</span>
    </div>
    <ArrowRight size={16} className="text-gray-400" />
  </motion.div>
);

const Profile = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/");
      } else {
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-20 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-20 pb-24 px-4 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center">
            <UserPlus size={32} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">{session?.user?.email}</h2>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <Mail size={16} />
              <span>{session?.user?.email}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <GraduationCap size={16} />
              <span>Grade {profile?.grade || 'Not set'}</span>
            </div>
            {profile?.is_premium && (
              <div className="flex items-center justify-center space-x-2 text-yellow-500">
                <Crown size={16} />
                <span>Premium Member</span>
              </div>
            )}
          </div>
        </motion.div>

        {!profile?.is_premium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/80 to-primary rounded-lg p-4 mb-6 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Star className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">Upgrade to PRO!</h3>
                <p className="text-sm text-white/80">Get access to all features</p>
              </div>
            </div>
            <ArrowRight className="text-white" size={20} />
          </motion.div>
        )}

        <div className="space-y-3">
          <ProfileOption icon={Globe} label="Language: English" />
          <ProfileOption icon={Headset} label="Support" />
          <ProfileOption icon={Star} label="Rate Us" />
          <ProfileOption icon={Shield} label="Privacy" />
          <ProfileOption icon={Share2} label="Social Media" />
          <ProfileOption icon={UserPlus} label="Invite Friends" />
          <ProfileOption icon={Trash2} label="Clear all history" />
        </div>

        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </main>
    </div>
  );
};

export default Profile;
