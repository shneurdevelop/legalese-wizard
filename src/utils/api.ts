
import axios from "axios";
import { toast } from "@/components/ui/sonner";

// Securely access OpenAI API key (should be in environment variable in production)
const API_KEY = "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";

// Create a configured axios instance
const openaiAPI = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

// Function to get legal analysis from OpenAI
export const getLegalAnalysis = async (query: string) => {
  try {
    const prompt = `
      אתה עורך דין ישראלי מומחה. נא לנתח את המקרה הבא על פי החוק הישראלי:
      
      ${query}
      
      בתשובתך, אנא כלול:
      1. החוקים והסעיפים הרלוונטיים למקרה
      2. ניתוח משפטי קצר ופשוט להבנה
      3. המלצות לפעולה מבוססות על החוק
      4. אם רלוונטי, הפנייה לתקדימים או פסקי דין חשובים
      
      ענה בעברית בצורה מובנית ומסודרת.
    `;

    const { data } = await openaiAPI.post("/chat/completions", {
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1000,
    });

    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching legal analysis:", error);
    toast.error("שגיאה בקבלת ניתוח משפטי, נסה שנית");
    return "אירעה שגיאה בניתוח המשפטי. אנא נסה שנית מאוחר יותר.";
  }
};

// Save search to history
export const saveToHistory = (query: string, response: string) => {
  try {
    const historyItems = JSON.parse(localStorage.getItem("lawai-history") || "[]");
    const newItem = {
      id: Date.now(),
      date: new Date().toISOString(),
      query,
      response,
    };
    
    historyItems.unshift(newItem);
    localStorage.setItem("lawai-history", JSON.stringify(historyItems.slice(0, 20)));
    
    return true;
  } catch (error) {
    console.error("Error saving to history:", error);
    return false;
  }
};

// Get history items
export const getHistoryItems = () => {
  try {
    return JSON.parse(localStorage.getItem("lawai-history") || "[]");
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};
