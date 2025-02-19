
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { processImage, sendMessage } from "@/lib/ai-utils";

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
      // Step 1: OCR text extraction
      const extractedText = await processImage(image);
      
      // Step 2: Generate questions using Chat API
      const prompt = `Extract questions from this text and return them in this JSON format:
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
        const parsedQuestions = JSON.parse(result.choices[0].message.content);
        setQuestions(parsedQuestions.questions || []);
        toast({
          title: "Success",
          description: "Questions extracted successfully",
        });
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
    // Check if answer already exists
    if (answers.some(a => a.questionId === question.id)) {
      return;
    }

    setLoading(true);
    try {
      const prompt = `Please provide a clear and detailed answer to this question: ${question.question}`;
      const response = await sendMessage(prompt);
      const result = await response.json();
      
      const newAnswer: Answer = {
        questionId: question.id,
        question: question.question,
        answer: result.choices[0].message.content
      };

      setAnswers(prev => [...prev, newAnswer]);
      
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
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-20 pb-24 px-4 mx-auto max-w-4xl">
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

          <Tabs defaultValue="upload" className="w-full">
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
                    <div
                      key={question.id}
                      className="bg-gray-800 rounded-lg p-4 space-y-3"
                    >
                      <h3 className="font-medium">{question.id}</h3>
                      <p className="text-gray-300">{question.question}</p>
                      <Button
                        onClick={() => handleGetAnswer(question)}
                        variant="secondary"
                        disabled={answers.some(a => a.questionId === question.id)}
                      >
                        {answers.some(a => a.questionId === question.id) 
                          ? "Answer Generated" 
                          : "Get Answer"
                        }
                      </Button>
                    </div>
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
                    <div
                      key={answer.questionId}
                      className="bg-gray-800 rounded-lg p-6 space-y-4"
                    >
                      <h3 className="font-medium">{answer.questionId}</h3>
                      <div className="text-gray-300">
                        <p className="font-medium mb-2">Question:</p>
                        <p className="mb-4">{answer.question}</p>
                        <p className="font-medium mb-2">Answer:</p>
                        <p className="whitespace-pre-wrap">{answer.answer}</p>
                      </div>
                    </div>
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
