
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { ArrowRight, Globe, Puzzle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-secondary rounded-lg p-4 sm:p-6 flex flex-col space-y-4"
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-white font-semibold text-base sm:text-lg">{title}</h3>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">{description}</p>
      </div>
      <div className="text-primary">{icon}</div>
    </div>
    <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
      Try It
    </button>
  </motion.div>
);

const TaskCard = ({ title, description, icon, onClick }: { title: string; description: string; icon: React.ReactNode; onClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-muted rounded-lg p-3 sm:p-4 flex flex-col space-y-2 cursor-pointer hover:bg-muted/80 transition-colors"
    onClick={onClick}
  >
    <div className="text-primary mb-2">{icon}</div>
    <h3 className="text-white font-medium text-sm sm:text-base">{title}</h3>
    <p className="text-gray-400 text-xs sm:text-sm">{description}</p>
  </motion.div>
);

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-16 sm:pt-20 pb-20 sm:pb-24 px-4 mx-auto max-w-[90%] sm:max-w-md">
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">NEW FEATURES</h2>
          <div className="space-y-4">
            <FeatureCard
              title="AI Art"
              description="Turn words into image"
              icon={<Globe className="w-5 h-5 sm:w-6 sm:h-6" />}
            />
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">GET HELP WITH TASKS</h2>
            <button className="text-primary hover:text-primary/80 transition-colors text-sm sm:text-base">
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <TaskCard
              title="AI Solver"
              description="Solve NCERT questions with AI"
              icon={<Puzzle className="w-5 h-5 sm:w-6 sm:h-6" />}
              onClick={() => navigate("/ai-solver")}
            />
            <TaskCard
              title="Word Associations"
              description="Expand your vocabulary through word associations"
              icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
