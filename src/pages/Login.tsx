
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, Key, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast.error("נא למלא שם משתמש וסיסמה");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Store user data in localStorage for compatibility with existing code
        localStorage.setItem("lawai-user", JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          username: data.user.email?.split('@')[0],
          user_metadata: data.user.user_metadata,
          loggedIn: true,
          loginTime: new Date().toISOString()
        }));
        
        toast.success(`ברוך הבא!`);
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message.includes("Invalid login credentials")) {
        toast.error("פרטי ההתחברות שגויים");
      } else {
        toast.error(error.message || "אירעה שגיאה בהתחברות");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <LogIn className="h-6 w-6" />
              התחברות למערכת
            </CardTitle>
            <CardDescription>
              התחבר כדי לקבל ייעוץ משפטי חכם
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">דואר אלקטרוני</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="הזן כתובת אימייל"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                  <Mail className="absolute top-1/2 right-3 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">סיסמה</Label>
                  <Link to="#" className="text-xs text-primary hover:underline">
                    שכחת סיסמה?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="הזן סיסמה"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                  <Key className="absolute top-1/2 right-3 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <Button 
                type="submit"
                className="w-full" 
                size="lg" 
                disabled={isLoading}
              >
                {isLoading ? "מתחבר..." : "התחבר"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/register" className="text-sm text-primary hover:underline">
              אין לך חשבון? הירשם עכשיו
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
