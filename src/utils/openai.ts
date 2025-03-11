
import axios from "axios";
import { toast } from "sonner";

// Create a configured axios instance with API key from local storage
const getOpenAiAPI = () => {
  const apiKey = localStorage.getItem("lawai-openai-key") || "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";
  
  return axios.create({
    baseURL: "https://api.openai.com/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
};

// Function to get legal analysis from OpenAI with improved prompting
export const getLegalAnalysis = async (query: string, relevantLaws: string = "") => {
  try {
    const cleanQuery = query.trim();
    
    if (!cleanQuery) {
      return "אנא הזן שאלה או תיאור מקרה כדי לקבל ניתוח משפטי.";
    }

    const openaiAPI = getOpenAiAPI();
    
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
        5. האם יש בסיס לתביעה משפטית. אם כן, ציין זאת בבירור וספק מידע רלוונטי להכנת התביעה.
        
        חשוב: אם יש בסיס לתביעה, התחל את הפסקה האחרונה במשפט "יש בסיס לתביעה משפטית במקרה זה" כדי שהמערכת תוכל לזהות זאת אוטומטית.
        
        ענה בעברית בצורה מובנית ומסודרת. נא להשתמש בשפה ידידותית וברורה. הזכר שאתה עוזר משפטי שמנהל שיחה עם המשתמש בצ'אט.
      `
      : `
        אתה עורך דין ישראלי מומחה. נא לנתח את השאלה או המקרה הבא על פי החוק הישראלי:
        
        ${cleanQuery}
        
        בתשובתך, אנא כלול:
        1. החוקים והסעיפים הרלוונטיים למקרה
        2. ניתוח משפטי קצר ופשוט להבנה
        3. המלצות לפעולה מבוססות על החוק
        4. אם רלוונטי, הפנייה לתקדימים או פסקי דין חשובים
        5. האם יש בסיס לתביעה משפטית. אם כן, ציין זאת בבירור וספק מידע רלוונטי להכנת התביעה.
        
        חשוב: אם יש בסיס לתביעה, התחל את הפסקה האחרונה במשפט "יש בסיס לתביעה משפטית במקרה זה" כדי שהמערכת תוכל לזהות זאת אוטומטית.
        
        ענה בעברית בצורה מובנית ומסודרת. נא להשתמש בשפה ידידותית וברורה. הזכר שאתה עוזר משפטי שמנהל שיחה עם המשתמש בצ'אט.
      `;

    console.log("Sending legal query to OpenAI:", cleanQuery.substring(0, 50) + "...");
    
    const { data } = await openaiAPI.post("/chat/completions", {
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "אתה עוזר משפטי המסביר חוקים בצורה ברורה ומדויקת לפי החוק הישראלי. השם שלך הוא LawAI. אתה מנהל שיחה עם המשתמש ועונה בצורה ברורה ומסבירה." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    console.log("Received response from OpenAI");
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("Error fetching legal analysis:", error);
    
    // More detailed error handling
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        toast.error("מפתח ה-API שגוי או לא תקף. אנא בדוק את מפתח ה-API בהגדרות.", {
          duration: 6000,
          action: {
            label: "להגדרות",
            onClick: () => window.location.href = "/settings"
          }
        });
        return "מפתח ה-API שגוי או לא תקף. אנא בדוק את מפתח ה-API בהגדרות.";
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

// Function to determine if legal response has grounds for lawsuit - improved with more indicators
export const hasGroundsForLawsuit = (response: string): boolean => {
  if (!response) return false;
  
  const lowerResponse = response.toLowerCase();
  
  // Hebrew phrases that might indicate grounds for lawsuit - expanded list
  const positiveIndicators = [
    "יש בסיס לתביעה משפטית במקרה זה",
    "יש בסיס לתביעה",
    "קיים בסיס לתביעה",
    "ניתן להגיש תביעה",
    "יש עילת תביעה",
    "קיימת עילת תביעה",
    "מומלץ להגיש תביעה",
    "יש מקום לתביעה",
    "יש אפשרות לתבוע",
    "יש לך זכות לתבוע",
    "כדאי לשקול תביעה",
    "תביעה אפשרית",
    "אפשר לתבוע",
    "עילה לתביעה",
    "מומלץ לפנות לערכאות",
    "פנייה לבית המשפט",
    "הגשת כתב תביעה",
    "תוכל לתבוע",
    "יש סיכוי טוב בתביעה"
  ];
  
  return positiveIndicators.some(phrase => lowerResponse.includes(phrase));
};

// Function to check if API key exists
export const hasOpenAIApiKey = (): boolean => {
  const apiKey = localStorage.getItem("lawai-openai-key");
  return !!apiKey && apiKey.length > 10; // Basic validation
};
