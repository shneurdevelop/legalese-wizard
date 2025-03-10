
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, UserPlus, Key } from "lucide-react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleAuth = () => {
    // Simple validation
    if (!username || !password || (!isLogin && !email)) {
      toast.error(isLogin ? "נא למלא שם משתמש וסיסמה" : "נא למלא את כל השדות");
      return;
    }

    // For demo purposes, we'll just store the login state in localStorage
    if (isLogin) {
      // In a real app, we would verify credentials with a backend
      localStorage.setItem("lawai-user", JSON.stringify({
        username,
        loggedIn: true,
        loginTime: new Date().toISOString()
      }));
      toast.success(`ברוך הבא, ${username}!`);
    } else {
      // In a real app, we would register the user with a backend
      localStorage.setItem("lawai-user", JSON.stringify({
        username,
        email,
        loggedIn: true,
        registerTime: new Date().toISOString()
      }));
      toast.success("ההרשמה הושלמה בהצלחה!");
    }

    // Redirect to home page
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              {isLogin ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
              {isLogin ? "התחברות למערכת" : "הרשמה למערכת"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? "התחבר כדי לשמור חיפושים ולקבל המלצות אישיות"
                : "הירשם כדי ליצור חשבון חדש במערכת LawAI"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">שם משתמש</Label>
              <Input
                id="username"
                type="text"
                placeholder="הזן שם משתמש"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email">דואר אלקטרוני</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="הזן כתובת דואר אלקטרוני"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="הזן סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Key className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleAuth}
            >
              {isLogin ? "התחבר" : "הירשם"}
            </Button>
          </CardContent>
          <CardFooter>
            <Button 
              variant="link" 
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin 
                ? "אין לך חשבון? הירשם עכשיו" 
                : "כבר יש לך חשבון? התחבר"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
