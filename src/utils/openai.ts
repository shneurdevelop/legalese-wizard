
import axios from "axios";
import { toast } from "sonner";

// Create a configured axios instance
const openaiAPI = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY || "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"}`,
  },
});

// Function to get legal analysis from OpenAI with improved prompting
export const getLegalAnalysis = async (query: string, relevantLaws: string = "") => {
  try {
    const cleanQuery = query.trim();
    
    if (!cleanQuery) {
      return "אנא הזן שאלה או תיאור מקרה כדי לקבל ניתוח משפטי.";
    }

    const prompt = relevantLaws 
      ? `
        אתה עורך דין ישראלי מומחה. נא לנתח את המקרה הבא על פי החוק הישראלי:
        
        ${cleanQuery}
        
        להלן החוקים הרלוונטיים למקרה:
        ${relevantLaws}
        
        בתשובתך, אנא כלול:
        1. החוקים והסעיפים הרלוונטיים למקרה
        2. ניתוח משפטי קצר ופשוט להבנה
        3. המלצות לפעולה מבוססות על החוק
        4. אם רלוונטי, הפנייה לתקדימים או פסקי דין חשובים
        
        ענה בעברית בצורה מובנית ומסודרת.
      `
      : `
        אתה עורך דין ישראלי מומחה. נא לנתח את המקרה הבא על פי החוק הישראלי:
        
        ${cleanQuery}
        
        בתשובתך, אנא כלול:
        1. החוקים והסעיפים הרלוונטיים למקרה
        2. ניתוח משפטי קצר ופשוט להבנה
        3. המלצות לפעולה מבוססות על החוק
        4. אם רלוונטי, הפנייה לתקדימים או פסקי דין חשובים
        
        ענה בעברית בצורה מובנית ומסודרת.
      `;

    console.log("Sending legal query to OpenAI:", cleanQuery.substring(0, 50) + "...");
    
    const { data } = await openaiAPI.post("/chat/completions", {
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "אתה עוזר משפטי המסביר חוקים בצורה ברורה ומדויקת לפי החוק הישראלי." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    console.log("Received response from OpenAI");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching legal analysis:", error);
    
    // More detailed error handling
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        toast.error("שגיאת אימות API. אנא בדוק את מפתח ה-API שלך.");
        return "שגיאת אימות API. אנא פנה למנהל המערכת.";
      } else if (status === 429) {
        toast.error("חריגה ממגבלת בקשות API. אנא נסה שנית בעוד מספר דקות.");
        return "חריגה ממגבלת בקשות API. אנא נסה שנית בעוד מספר דקות.";
      } else if (status >= 500) {
        toast.error("שגיאת שרת OpenAI. אנא נסה שנית מאוחר יותר.");
        return "שגיאת שרת OpenAI. אנא נסה שנית מאוחר יותר.";
      }
    }
    
    toast.error("שגיאה בקבלת ניתוח משפטי, נסה שנית");
    return "אירעה שגיאה בניתוח המשפטי. אנא נסה שנית מאוחר יותר.";
  }
};

// Function to find relevant laws for a query
export const findRelevantLaws = (query: string, lawsData: any) => {
  if (!lawsData || Object.keys(lawsData).length === 0) {
    return "";
  }

  const queryWords = query.toLowerCase().split(/\s+/);
  const relevantLaws: string[] = [];

  // Search laws for relevant content
  Object.entries(lawsData).forEach(([category, laws]: [string, any]) => {
    Object.entries(laws).forEach(([lawName, sections]: [string, any]) => {
      let lawIsRelevant = false;
      let relevantSections: string[] = [];

      // Check if law name is relevant
      if (queryWords.some(word => lawName.toLowerCase().includes(word) && word.length > 2)) {
        lawIsRelevant = true;
      }

      // Check if any section is relevant
      Object.entries(sections).forEach(([sectionId, content]: [string, any]) => {
        if (typeof content === 'string' && 
            queryWords.some(word => content.toLowerCase().includes(word) && word.length > 2)) {
          lawIsRelevant = true;
          relevantSections.push(`${sectionId}: ${content}`);
        }
      });

      if (lawIsRelevant) {
        relevantLaws.push(`חוק: ${lawName}\n${relevantSections.join('\n')}`);
      }
    });
  });

  return relevantLaws.join('\n\n').slice(0, 3000); // Limit length to avoid token limits
};
