
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
      <Toaster />
    </Router>
  );
}

export default App;
