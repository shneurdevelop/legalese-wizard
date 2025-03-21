
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Shield, RotateCw } from "lucide-react";
import { getUserDetails } from "@/utils/user";
import { supabase } from "@/integrations/supabase/client";
import ApiKeyInput from "@/components/ApiKeyInput";

const Settings = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setIsLoading(true);
    const userDetails = getUserDetails();
    
    if (userDetails?.id) {
      try {
        const { data, error } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('id', userDetails.id)
          .single();
          
        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mb-2">
          הגדרות מערכת
        </div>
        <h1 className="text-4xl font-bold mb-2">הגדרות אישיות</h1>
        <p className="text-lg text-muted-foreground">
          התאם את חווית המערכת להעדפותיך האישיות
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              פרטי משתמש
            </CardTitle>
            <CardDescription>
              הפרטים האישיים שלך במערכת
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="py-4 flex justify-center">
                <RotateCw className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : userProfile ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>שם מלא</Label>
                    <div className="font-medium mt-1">{userProfile.full_name || "לא הוגדר"}</div>
                  </div>
                  <div>
                    <Label>כתובת אימייל</Label>
                    <div className="font-medium mt-1">{userProfile.email || "לא הוגדר"}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">לא נמצאו פרטי משתמש</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              הגדרת מפתח OpenAI API
            </CardTitle>
            <CardDescription>
              <div className="text-amber-600 font-medium mb-1">נדרש לשימוש במערכת הניתוח המשפטי</div>
              <div>
                המפתח דרוש כדי לבצע ניתוח של המקרים המשפטיים ויצירת מסמכים באמצעות בינה מלאכותית.
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-primary hover:underline mr-1 block mt-1 font-medium"
                >
                  לחץ כאן לקבלת מפתח API מאתר OpenAI
                </a>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ApiKeyInput />
            
            <div className="rounded-lg bg-secondary/50 p-4 text-sm">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">המפתח שלך נשמר בדפדפן שלך בלבד</p>
                  <p className="text-muted-foreground mt-1">
                    המפתח נשמר באופן מקומי בדפדפן שלך בלבד ולא נשלח לשרת שלנו. המפתח משמש רק לביצוע בקשות ישירות ל-OpenAI API מהדפדפן שלך.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;
