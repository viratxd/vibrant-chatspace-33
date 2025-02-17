
import { Bell, Settings } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-gray-800">
      <div className="flex justify-between items-center px-4 h-14">
        <div className="flex items-center space-x-3">
          <img
            src="/lovable-uploads/0e9f6a8d-19f7-4e27-aee2-0fa3258effa2.png"
            alt="Chat Smith"
            className="w-8 h-8 rounded-full"
          />
          <span className="text-white font-semibold">Chat Smith</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
