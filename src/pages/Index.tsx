
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  getLegalAnalysis, 
  saveToHistory, 
  getUserDetails, 
  findRelevantLaws
} from "@/utils/api";
import { fetchLaws, parseLawsFromHtml, cacheLawsData, getCachedLawsData } from "@/utils/lawsFetcher";
import { Search, Save, LogIn, UserCheck, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Index = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [lawsData, setLawsData] = useState<any>(null);
  const [loadingLaws, setLoadingLaws] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userJson = localStorage.getItem("lawai-user");
    if (userJson) {
      try {
        setUser(JSON.parse(userJson));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // Try to load cached laws data or fetch new data
    loadLawsData();
  }, []);

  const loadLawsData = async () => {
    // First try to get from cache
    const cachedLaws = getCachedLawsData();
    if (cachedLaws) {
      setLawsData(cachedLaws);
      console.log("Loaded laws from cache");
      return;
    }

    // If not in cache, fetch from API
    try {
      setLoadingLaws(true);
      const htmlLaws = await fetchLaws();
      if (typeof htmlLaws === 'string') {
        const parsedLaws = parseLawsFromHtml(htmlLaws);
        setLawsData(parsedLaws);
        cacheLawsData(parsedLaws);
        console.log("Fetched and cached laws data");
      }
    } catch (error) {
      console.error("Error loading laws:", error);
      toast.error("שגיאה בטעינת מאגר החוקים");
    } finally {
      setLoadingLaws(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.warning("יש להזין תיאור מקרה");
      return;
    }

    setLoading(true);
    try {
      // Find relevant laws from our data
      let relevantLaws = "";
      if (lawsData) {
        relevantLaws = findRelevantLaws(query, lawsData);
        console.log("Found relevant laws:", relevantLaws.length > 0);
      }

      // Get analysis from OpenAI with relevant laws (if found)
      const result = await getLegalAnalysis(query, relevantLaws);
      setResponse(result);
      saveToHistory(query, result);
      toast.success("הניתוח המשפטי הושלם");
    } catch (error) {
      console.error("Error in legal analysis:", error);
      toast.error("שגיאה בניתוח המשפטי");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="space-y-8 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mb-2">
          הניתוח המשפטי החכם בישראל
        </div>
        <h1 className="text-4xl font-bold mb-2">מערכת LawAi לניתוח משפטי</h1>
        <p className="text-lg text-muted-foreground">
          הזן את המקרה שלך וקבל ניתוח משפטי מבוסס בינה מלאכותית
        </p>
        
        <div className="flex items-center justify-center mt-3 gap-2">
          {loadingLaws ? (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              טוען מאגר חוקים...
            </div>
          ) : (
            lawsData && (
              <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                מחובר למאגר החוקים המלא
              </div>
            )
          )}
        </div>
        
        {!user && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <LogIn className="w-4 h-4" />
                התחבר למערכת לחוויה מותאמת אישית
              </Button>
            </Link>
          </motion.div>
        )}
        
        {user && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex items-center justify-center gap-2 text-sm text-primary"
          >
            <UserCheck className="w-4 h-4" />
            ברוך הבא, {user.username}! 
          </motion.div>
        )}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg glass-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="תאר את המקרה המשפטי שלך כאן..."
                className="min-h-[150px] text-lg p-4 bg-white/50 border-0 shadow-inner focus:ring-primary"
              />
              <div className="mt-4 flex justify-end">
                <Button 
                  type="submit"
                  className="hover-lift"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      מנתח...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      נתח מקרה
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg glass-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">ניתוח משפטי</h2>
                <Button
                  variant="secondary"
                  onClick={() => {
                    saveToHistory(query, response);
                    toast.success("הניתוח נשמר בהיסטוריה");
                  }}
                  className="hover-lift"
                >
                  <Save className="w-4 h-4 mr-2" />
                  שמור
                </Button>
              </div>
              <div className="whitespace-pre-line bg-white/50 p-4 rounded-lg text-foreground/90">
                {response}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
