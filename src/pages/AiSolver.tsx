
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { processImage, sendMessage } from "@/lib/ai-utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
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
          setActiveTab("questions"); // Automatically switch to questions tab
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
    if (answers.some(a => a.questionId === question.id)) {
      return;
    }

    setLoading(true);
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
      setActiveTab("answers"); // Switch to answers tab after getting an answer
      
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
      setLoading(false);
    }
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

            <TabsContent value="upload" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Image</label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-400">
                        Click to upload image
                      </span>
                    </label>
                  </div>
                  {image && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="max-h-48 rounded-lg mx-auto"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !image}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Process Image"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No questions yet. Upload an image to extract questions.
                </div>
              ) : (
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
                        onClick={() => handleGetAnswer(question)}
                        variant="secondary"
                        disabled={answers.some(a => a.questionId === question.id)}
                        className="w-full"
                      >
                        {answers.some(a => a.questionId === question.id) 
                          ? "Answer Generated" 
                          : "Get Answer"
                        }
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="answers" className="space-y-6">
              {answers.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No answers yet. Generate answers from the Questions tab.
                </div>
              ) : (
                <div className="space-y-6">
                  {answers.map((answer) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={answer.questionId}
                      className="bg-gray-800 rounded-lg p-6 space-y-4"
                    >
                      <h3 className="font-medium">{answer.questionId}</h3>
                      <div className="text-gray-300">
                        <p className="font-medium mb-2">Question:</p>
                        <div className="mb-4 prose prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {answer.question}
                          </ReactMarkdown>
                        </div>
                        <p className="font-medium mb-2">Answer:</p>
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {answer.answer}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AiSolver;
