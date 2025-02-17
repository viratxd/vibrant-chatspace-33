
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Globe, Headset, Star, Shield, Share2, UserPlus, Trash2, ArrowRight } from "lucide-react";

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
          <h2 className="text-xl font-bold">Guest User</h2>
          <p className="text-gray-400 text-sm">No Email</p>
        </motion.div>

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

        <div className="space-y-3">
          <ProfileOption icon={Globe} label="Language: English" />
          <ProfileOption icon={Headset} label="Support" />
          <ProfileOption icon={Star} label="Rate Us" />
          <ProfileOption icon={Shield} label="Privacy" />
          <ProfileOption icon={Share2} label="Social Media" />
          <ProfileOption icon={UserPlus} label="Invite Friends" />
          <ProfileOption icon={Trash2} label="Clear all history" />
        </div>
      </main>
    </div>
  );
};

export default Profile;
