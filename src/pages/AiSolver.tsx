
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Image as ImageIcon, Download } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { processImage, sendMessage } from "@/lib/ai-utils";

interface Question {
  id: string;
  question: string;
  answer?: string;
}

const AiSolver = () => {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [grade, setGrade] = useState("");
  const [mode, setMode] = useState<"answer" | "quiz">("answer");
  const [progress, setProgress] = useState(0);
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
    if (!image || !grade) {
      toast({
        title: "Missing information",
        description: "Please provide both an image and grade",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProcessing(true);
    setProgress(0);

    try {
      // Step 1: Process image with OCR
      setProgress(25);
      const extractedText = await processImage(image);

      // Step 2: Generate questions/answers using ChatGPT
      setProgress(50);
      const prompt = mode === "quiz" 
        ? `Extract questions from this text and format as JSON array: ${extractedText}`
        : `Answer this question: ${extractedText}. Context: Grade ${grade}`;

      const response = await sendMessage(prompt);
      const result = await response.json();
      setProgress(75);

      if (mode === "quiz") {
        try {
          const parsedQuestions = JSON.parse(result.choices[0].message.content);
          setQuestions(parsedQuestions.questions || []);
        } catch (error) {
          console.error("Failed to parse questions:", error);
          setQuestions([{ id: "Q1", question: result.choices[0].message.content }]);
        }
      } else {
        setQuestions([
          { 
            id: "A1", 
            question: extractedText,
            answer: result.choices[0].message.content 
          }
        ]);
      }

      setProgress(100);
      toast({
        title: "Success",
        description: "Image processed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error processing image",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleGenerateAnswer = async (question: Question) => {
    if (question.answer) return;

    try {
      const response = await sendMessage(
        `Answer this question for a grade ${grade} student: ${question.question}`
      );
      const result = await response.json();

      setQuestions(prev => 
        prev.map(q => 
          q.id === question.id 
            ? { ...q, answer: result.choices[0].message.content }
            : q
        )
      );
    } catch (error: any) {
      toast({
        title: "Error generating answer",
        description: error.message,
        variant: "destructive",
      });
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="responses">Responses</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grade/Class</label>
                  <Input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g., Grade 10"
                    className="bg-secondary border-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={mode === "answer"}
                        onChange={() => setMode("answer")}
                        className="text-primary"
                      />
                      <span>Answer</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={mode === "quiz"}
                        onChange={() => setMode("quiz")}
                        className="text-primary"
                      />
                      <span>Quiz Solve</span>
                    </label>
                  </div>
                </div>

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

                {processing && (
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !image || !grade}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="responses" className="space-y-6">
              {questions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No responses yet. Upload an image to get started.
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className="bg-secondary rounded-lg p-6 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{question.id}</h3>
                      </div>
                      <p className="text-gray-300">{question.question}</p>
                      {question.answer ? (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                          <p className="text-gray-300">{question.answer}</p>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleGenerateAnswer(question)}
                          variant="secondary"
                        >
                          Generate Answer
                        </Button>
                      )}
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
