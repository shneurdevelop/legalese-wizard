
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Key, Mail, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("הסיסמאות אינן תואמות");
      return;
    }

    if (password.length < 6) {
      toast.error("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setIsLoading(true);

    try {
      // Register the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create a profile for the user
        const { error: profileError } = await supabase
          .from('users_profiles')
          .insert([
            { 
              id: data.user.id,
              full_name: fullName,
              email: email
            }
          ]);

        if (profileError) {
          console.error("Error creating profile:", profileError);
          // Continue anyway since the user was created
        }

        toast.success("ההרשמה הושלמה בהצלחה!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "אירעה שגיאה בהרשמה");
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
              <UserPlus className="h-6 w-6" />
              הרשמה למערכת
            </CardTitle>
            <CardDescription>
              צור חשבון חדש כדי לקבל ייעוץ משפטי חכם
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">שם מלא</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="הזן את שמך המלא"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                  <User className="absolute top-1/2 right-3 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
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
                <Label htmlFor="password">סיסמה</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="הזן סיסמה (לפחות 6 תווים)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                  <Key className="absolute top-1/2 right-3 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">אימות סיסמה</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="הזן את הסיסמה שנית"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? "מבצע רישום..." : "הירשם"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              כבר יש לך חשבון? התחבר עכשיו
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
