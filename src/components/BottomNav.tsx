
import { Home, MessageCircle, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-gray-800">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center space-y-1 ${
            location.pathname === "/" ? "text-primary" : "text-gray-400"
          }`}
        >
          <Home size={24} />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => navigate("/chat")}
          className={`flex flex-col items-center space-y-1 ${
            location.pathname === "/chat" ? "text-primary" : "text-gray-400"
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs">Chat</span>
        </button>
        <button
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center space-y-1 ${
            location.pathname === "/profile" ? "text-primary" : "text-gray-400"
          }`}
        >
          <User size={24} />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
};
