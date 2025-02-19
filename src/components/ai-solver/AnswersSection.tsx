
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Answer {
  questionId: string;
  question: string;
  answer: string;
}

interface AnswersSectionProps {
  answers: Answer[];
  onExport: () => void;
}

export const AnswersSection = ({ answers, onExport }: AnswersSectionProps) => {
  if (answers.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No answers yet. Generate answers from the Questions tab.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div 
        id="answers-content" 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4"
        style={{ 
          breakInside: 'avoid-page',
          printColorAdjust: 'exact'
        }}
      >
        {answers.map((answer) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={answer.questionId}
            className="answer-card bg-gray-800 rounded-lg p-6 space-y-4 border border-gray-700 print:break-inside-avoid overflow-hidden"
            style={{ 
              breakInside: 'avoid',
              pageBreakInside: 'avoid',
              maxWidth: '100%'
            }}
          >
            <h3 className="font-medium text-lg">{answer.questionId}</h3>
            <div className="text-gray-300">
              <p className="font-medium mb-2">Question:</p>
              <div className="mb-4 prose prose-invert max-w-none break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  className="whitespace-pre-wrap overflow-wrap-anywhere"
                >
                  {answer.question}
                </ReactMarkdown>
              </div>
              <p className="font-medium mb-2">Answer:</p>
              <div className="prose prose-invert max-w-none break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  className="whitespace-pre-wrap overflow-wrap-anywhere"
                >
                  {answer.answer}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {answers.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center bg-black/80 backdrop-blur-sm py-4">
          <Button
            onClick={onExport}
            className="flex items-center gap-2"
            variant="secondary"
          >
            <FileDown className="w-4 h-4" />
            Export to PDF
          </Button>
        </div>
      )}
    </div>
  );
};
