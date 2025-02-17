
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [grade, setGrade] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      onOpenChange(false);
      navigate("/profile");
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sign up the user with email
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // If signup successful, create profile with phone and grade
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            phone,
            grade,
          });

        if (profileError) throw profileError;
      }

      toast({
        title: "Welcome!",
        description: "Your account has been created successfully.",
      });

      onOpenChange(false);
      navigate("/profile");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-[400px] p-4 sm:p-6 bg-secondary text-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-white text-center sm:text-left">
            Authentication
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted rounded-lg h-12">
            <TabsTrigger value="login" className="text-sm sm:text-base data-[state=active]:text-primary">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-sm sm:text-base data-[state=active]:text-primary">
              Signup
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login" className="text-sm sm:text-base">Email</Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted text-white text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login" className="text-sm sm:text-base">Password</Label>
                <Input
                  id="password-login"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted text-white text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup" className="text-sm sm:text-base">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted text-white text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-signup" className="text-sm sm:text-base">Phone Number</Label>
                <Input
                  id="phone-signup"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-muted text-white text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup" className="text-sm sm:text-base">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted text-white text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade" className="text-sm sm:text-base">Class/Grade</Label>
                <Select value={grade} onValueChange={setGrade} required>
                  <SelectTrigger className="bg-muted text-white text-sm sm:text-base h-10 sm:h-11">
                    <SelectValue placeholder="Select your class" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary">
                    <SelectItem value="10" className="text-sm sm:text-base">Class 10</SelectItem>
                    <SelectItem value="11" className="text-sm sm:text-base">Class 11</SelectItem>
                    <SelectItem value="12" className="text-sm sm:text-base">Class 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
                {loading ? "Loading..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
