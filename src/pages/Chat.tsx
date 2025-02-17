
import { useState } from "react";
import { Header } from "@/components/Header";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

const Chat = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add your API call here
    console.log("Sending message:", message);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-md mx-auto h-[calc(100vh-180px)] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {/* Chat messages will be rendered here */}
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-secondary rounded-lg pl-4 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute right-2 p-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Send size={20} />
            </button>
          </motion.form>
        </div>
      </main>
    </div>
  );
};

export default Chat;
