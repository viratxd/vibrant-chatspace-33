
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import AiSolver from "./pages/AiSolver";
import Pricing from "./pages/Pricing";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/NotFound";
import { BottomNav } from "./components/BottomNav";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai-solver" element={<AiSolver />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
      <Toaster />
    </Router>
  );
}

export default App;
