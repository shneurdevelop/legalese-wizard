
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  getLegalAnalysis, 
  saveToHistory, 
  getUserDetails,
  hasGroundsForLawsuit
} from "@/utils/api";
import { fetchLaws, parseLawsFromHtml, cacheLawsData, getCachedLawsData } from "@/utils/lawsFetcher";
import { Search, Save, LogIn, UserCheck, Loader2, BookOpen, FileText, User, Bot } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

// Define the ChatMessage type
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [lawsData, setLawsData] = useState<any>(null);
  const [loadingLaws, setLoadingLaws] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Initial greeting message
  useEffect(() => {
    setChatHistory([
      {
        role: "assistant",
        content: "שלום, אני LawAI, עוזר משפטי חכם. כיצד אוכל לסייע לך בשאלות משפטיות?",
        timestamp: new Date()
      }
    ]);
  }, []);

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

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.warning("יש להזין הודעה");
      return;
    }

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: query,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setQuery("");
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
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: result,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      
      // Save to history
      saveToHistory(query, result);
      
      // Check if there are grounds for lawsuit
      const hasGrounds = hasGroundsForLawsuit(result);
      
      // If there are grounds for lawsuit, show a toast with option to create document
      if (hasGrounds) {
        toast.info("נמצא בסיס אפשרי לתביעה", {
          duration: 6000,
          action: {
            label: "צור מסמך",
            onClick: () => navigate("/documents", { state: { analysis: result, query } })
          }
        });
      }
    } catch (error) {
      console.error("Error in legal analysis:", error);
      toast.error("שגיאה בניתוח המשפטי");
      
      // Add error message to chat
      setChatHistory(prev => [...prev, {
        role: "assistant",
        content: "אירעה שגיאה בתקשורת. אנא נסה שנית.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format the chat message content with markdown
  const formatMessageContent = (content: string) => {
    return (
      <div className="whitespace-pre-line">
        {content}
      </div>
    );
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
          הייעוץ המשפטי החכם בישראל
        </div>
        <div className="flex justify-center mb-4">
          <Logo size="md" />
        </div>
        <h1 className="text-4xl font-bold mb-2">LawAI</h1>
        <p className="text-lg text-muted-foreground">
          שוחח עם העוזר המשפטי החכם וקבל תשובות בזמן אמת
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
        className="h-[500px] flex flex-col"
      >
        <Card className="overflow-hidden border-0 shadow-lg glass-card flex-1 flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className={`${msg.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {msg.role === 'assistant' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </Avatar>
                    <div 
                      className={`rounded-lg px-4 py-3 ${
                        msg.role === 'assistant' 
                          ? 'bg-primary/10 text-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {formatMessageContent(msg.content)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <Separator className="my-4" />
            <form onSubmit={handleChatSubmit} className="flex flex-col gap-4">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="הקלד את שאלתך המשפטית כאן..."
                className="min-h-[80px] text-lg p-4 bg-white/50 border-0 shadow-inner focus:ring-primary resize-none"
                disabled={loading}
              />
              <div className="flex justify-end">
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
                      שלח
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Helper function to find relevant laws
function findRelevantLaws(query: string, lawsData: any): string {
  if (!query || !lawsData) return "";
  
  // Convert query to lowercase for case-insensitive matching
  const queryLower = query.toLowerCase();
  
  // Create an array of keywords from the query by splitting on spaces and filtering out common words
  const keywords = queryLower
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !["את", "של", "עם", "לא", "כי", "על", "או", "אם", "גם", "רק", "אבל", "אז", "כן", "מה"].includes(word)
    );
  
  // Find relevant laws by matching keywords against law names and content
  let relevantLawsText = "";
  let matchedLaws: {category: string, law: string, section: string, content: string, score: number}[] = [];
  
  // Search through all categories and laws
  Object.entries(lawsData).forEach(([category, laws]: [string, any]) => {
    Object.entries(laws).forEach(([lawName, sections]: [string, any]) => {
      // Check if the law name contains any keywords
      const lawNameLower = lawName.toLowerCase();
      const lawNameScore = keywords.reduce((score, keyword) => 
        lawNameLower.includes(keyword) ? score + 3 : score, 0);
      
      // Check each section of the law for keyword matches
      Object.entries(sections).forEach(([sectionName, content]: [string, any]) => {
        if (typeof content !== 'string') return;
        
        const contentLower = content.toLowerCase();
        let sectionScore = lawNameScore;
        
        // Calculate score based on keyword frequency in content
        keywords.forEach(keyword => {
          const regex = new RegExp(keyword, 'g');
          const matches = contentLower.match(regex);
          if (matches) {
            sectionScore += matches.length;
          }
        });
        
        // If section has a positive score, add it to the matched laws
        if (sectionScore > 0) {
          matchedLaws.push({
            category,
            law: lawName,
            section: sectionName,
            content: content.substring(0, 500) + (content.length > 500 ? "..." : ""),
            score: sectionScore
          });
        }
      });
    });
  });
  
  // Sort by relevance score (descending)
  matchedLaws.sort((a, b) => b.score - a.score);
  
  // Take only the top 5 most relevant results
  const topResults = matchedLaws.slice(0, 5);
  
  // Format the results
  if (topResults.length > 0) {
    relevantLawsText = "חוקים רלוונטיים למקרה:\n\n";
    
    topResults.forEach(result => {
      relevantLawsText += `קטגוריה: ${result.category}\n`;
      relevantLawsText += `חוק: ${result.law}\n`;
      relevantLawsText += `סעיף: ${result.section}\n`;
      relevantLawsText += `תוכן: ${result.content}\n\n`;
    });
  }
  
  return relevantLawsText;
}

export default Index;
