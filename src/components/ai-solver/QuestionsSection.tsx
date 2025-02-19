
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface Question {
  id: string;
  question: string;
}

interface QuestionsSectionProps {
  questions: Question[];
  loadingAnswers: { [key: string]: boolean };
  onGetAnswer: (question: Question) => Promise<void>;
  hasAnswer: (questionId: string) => boolean;
  isPremium: boolean;
  answeredQuestions: Set<string>;
}

export const QuestionsSection = ({
  questions,
  loadingAnswers,
  onGetAnswer,
  hasAnswer,
  isPremium,
  answeredQuestions
}: QuestionsSectionProps) => {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const navigate = useNavigate();

  const handleAnswerClick = (question: Question) => {
    if (!isPremium && answeredQuestions.has(question.id)) {
      setShowUpgradeDialog(true);
      return;
    }
    onGetAnswer(question);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No questions yet. Upload an image to extract questions.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {questions.map((question) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={question.id}
            className="bg-gray-800 rounded-lg p-4 space-y-3"
          >
            <h3 className="font-medium">{question.id}</h3>
            <div className="text-gray-300 prose prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {question.question}
              </ReactMarkdown>
            </div>
            <Button
              onClick={() => handleAnswerClick(question)}
              variant="secondary"
              disabled={hasAnswer(question.id) || loadingAnswers[question.id]}
              className="w-full"
            >
              {loadingAnswers[question.id] ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating Answer...
                </>
              ) : hasAnswer(question.id) ? (
                !isPremium && answeredQuestions.has(question.id) ? 
                "Upgrade to Try Again" : 
                "Answer Generated"
              ) : (
                "Get Answer"
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upgrade to Premium</DialogTitle>
            <DialogDescription>
              You've reached the limit for free answers. Upgrade to premium for unlimited question solving!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowUpgradeDialog(false);
                navigate("/pricing");
              }}
            >
              Upgrade Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
