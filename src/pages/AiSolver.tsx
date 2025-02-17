
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AiSolver = () => {
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [userGrade, setUserGrade] = useState<string>("");
  const [subject, setSubject] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchUserGrade();
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

  const fetchUserGrade = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("grade")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        if (data?.grade) {
          setUserGrade(data.grade);
        }
      } catch (error: any) {
        toast({
          title: "Error fetching grade",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) {
      toast({
        title: "Subject required",
        description: "Please select a subject before submitting",
        variant: "destructive",
      });
      return;
    }
    if (images.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    // TODO: Implement image upload and AI processing
    toast({
      title: "Success",
      description: "Your images have been submitted for processing",
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-20 pb-24 px-4 mx-auto max-w-[90%] sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI Solver</h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Class {userGrade || "Not set"} • Get instant solutions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="bg-secondary text-white">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="bg-secondary text-white">
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Images</label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-400">
                    Click to upload images
                  </span>
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group rounded-lg overflow-hidden"
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !subject || images.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit for Solution"
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default AiSolver;
