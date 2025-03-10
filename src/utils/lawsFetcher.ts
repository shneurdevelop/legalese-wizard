
import axios from "axios";

// Function to fetch laws from Wikisource
export async function fetchLaws() {
  try {
    const response = await axios.get(
      "https://he.wikisource.org/w/api.php",
      {
        params: {
          action: "parse",
          page: "ספר_החוקים_הפתוח",
          format: "json",
          origin: "*",
          prop: "text"
        }
      }
    );

    if (response.data && response.data.parse && response.data.parse.text) {
      return response.data.parse.text["*"];
    }
    
    return "לא נמצאו חוקים. נסה שוב מאוחר יותר.";
  } catch (error) {
    console.error("שגיאה בשליפת החוקים:", error);
    return "⚠️ לא הצלחנו להוריד את החוקים. אנא נסה שוב מאוחר יותר.";
  }
}

// Function to clean law text by removing confusing elements
export function cleanLawText(text: string): string {
  return text
    .replace(/תיקון.*?[;,.]/g, "") // Remove amendment notes
    .replace(/\(\d{4}\)/g, "") // Remove years in parentheses
    .replace(/\[.*?\]/g, "") // Remove text in square brackets
    .replace(/התשכ"[א-ת]–\d{4}/g, "") // Remove Hebrew date formats
    .replace(/^\s*$/gm, ""); // Remove empty lines
}

// Parse laws from HTML content
export function parseLawsFromHtml(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // Extract law categories and content
  const lawSections = doc.querySelectorAll('.mw-parser-output > h2, .mw-parser-output > h3, .mw-parser-output > p');
  
  const lawData: Record<string, Record<string, Record<string, string>>> = {};
  let currentCategory = "";
  let currentLaw = "";
  
  for (const section of Array.from(lawSections)) {
    if (section.tagName === 'H2') {
      currentCategory = section.textContent?.trim() || "כללי";
      if (!lawData[currentCategory]) {
        lawData[currentCategory] = {};
      }
    } else if (section.tagName === 'H3') {
      currentLaw = section.textContent?.trim() || "כללי";
      if (!lawData[currentCategory][currentLaw]) {
        lawData[currentCategory][currentLaw] = {};
      }
    } else if (section.tagName === 'P' && currentCategory && currentLaw) {
      const content = section.textContent?.trim() || "";
      if (content) {
        const sectionMatch = content.match(/^(סעיף \d+|פרק [א-ת]+):(.*)/);
        if (sectionMatch) {
          const [, sectionId, sectionContent] = sectionMatch;
          lawData[currentCategory][currentLaw][sectionId] = cleanLawText(sectionContent.trim());
        }
      }
    }
  }
  
  return lawData;
}
