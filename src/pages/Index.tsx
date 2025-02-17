
import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { ArrowRight, Globe, Puzzle, BookOpen } from "lucide-react";

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

const TaskCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-muted rounded-lg p-3 sm:p-4 flex flex-col space-y-2"
  >
    <div className="text-primary mb-2">{icon}</div>
    <h3 className="text-white font-medium text-sm sm:text-base">{title}</h3>
    <p className="text-gray-400 text-xs sm:text-sm">{description}</p>
  </motion.div>
);

const Index = () => {
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
              icon={<Globe size={24} />}
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
              title="Wordplay Riddles"
              description="Solve wordplay riddles while expanding vocabulary"
              icon={<Puzzle size={20} sm:size={24} />}
            />
            <TaskCard
              title="Word Associations"
              description="Expand your vocabulary through word associations"
              icon={<BookOpen size={20} sm:size={24} />}
            />
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
