import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { processImage, sendMessage } from "@/lib/ai-utils";
import { generatePDF } from "@/lib/pdf-utils";
import { UploadSection } from "@/components/ai-solver/UploadSection";
import { QuestionsSection } from "@/components/ai-solver/QuestionsSection";
import { AnswersSection } from "@/components/ai-solver/AnswersSection";
import "katex/dist/katex.min.css";

interface Question {
  id: string;
  question: string;
}

interface Answer {
  questionId: string;
  question: string;
  answer: string;
}

const AiSolver = () => {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState<{ [key: string]: boolean }>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set<string>());
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    checkPremiumStatus();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
      toast({
        title: "Authentication required",
        description: "Please login to access AI Solver",
        variant: "destructive",
      });
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();
        
        setIsPremium(profile?.is_premium || false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setImage(files[0]);
    }
  };

  const extractJsonFromResponse = (text: string): any => {
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      throw new Error("Failed to parse response format");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast({
        title: "Missing image",
        description: "Please upload an image to process",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const extractedText = await processImage(image);
      
      const prompt = `Extract questions from this text and return them in this JSON format without any markdown formatting or additional text:
      {
        "questions": [
          { "id": "Q1", "question": "first question" },
          { "id": "Q2", "question": "second question" }
        ]
      }
      
      Text to process: ${extractedText}`;

      const response = await sendMessage(prompt);
      const result = await response.json();
      
      try {
        const parsedQuestions = extractJsonFromResponse(result.choices[0].message.content);
        if (parsedQuestions && Array.isArray(parsedQuestions.questions)) {
          setQuestions(parsedQuestions.questions);
          setActiveTab("questions");
          toast({
            title: "Success",
            description: "Questions extracted successfully",
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Failed to parse questions:", error);
        toast({
          title: "Error",
          description: "Failed to parse questions from the response",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetAnswer = async (question: Question) => {
    if (!isPremium && answeredQuestions.has(question.id)) {
      return;
    }

    setLoadingAnswers(prev => ({ ...prev, [question.id]: true }));

    try {
      const prompt = `Please provide a clear and detailed answer to this question. Include proper markdown formatting and LaTeX math formulas where appropriate. For example, use $...$ for inline math and $$...$$ for display math: ${question.question}`;
      const response = await sendMessage(prompt);
      const result = await response.json();
      
      const newAnswer: Answer = {
        questionId: question.id,
        question: question.question,
        answer: result.choices[0].message.content
      };

      setAnswers(prev => [...prev, newAnswer]);
      setActiveTab("answers");
      
      if (!isPremium) {
        setAnsweredQuestions(prev => new Set(prev).add(question.id));
      }
      
      toast({
        title: "Success",
        description: "Answer generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error getting answer",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingAnswers(prev => ({ ...prev, [question.id]: false }));
    }
  };

  const hasAnswer = (questionId: string) => answers.some(a => a.questionId === questionId);

  const handleExport = () => {
    generatePDF('answers-content');
    toast({
      title: "Success",
      description: "Exporting answers to PDF...",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Header />
      <main className="pt-20 pb-24 px-4 mx-auto max-w-4xl">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-gray-200">Processing your request...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">AI Solver</h1>
            <p className="text-gray-400">
              Upload images of questions and get instant solutions
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="answers">Answers</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <UploadSection
                loading={loading}
                onImageUpload={handleImageUpload}
                onSubmit={handleSubmit}
                image={image}
              />
            </TabsContent>

            <TabsContent value="questions">
              <QuestionsSection
                questions={questions}
                loadingAnswers={loadingAnswers}
                onGetAnswer={handleGetAnswer}
                hasAnswer={hasAnswer}
                isPremium={isPremium}
                answeredQuestions={answeredQuestions}
              />
            </TabsContent>

            <TabsContent value="answers">
              <AnswersSection
                answers={answers}
                onExport={handleExport}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AiSolver;
