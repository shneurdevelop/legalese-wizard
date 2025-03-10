
import axios from "axios";

// Function to fetch laws from Wikisource with improved parameters
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
          prop: "text",
          // Adding new parameters to get more complete data
          redirects: true,
          section: "all",
          disabletoc: true
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

// Function to clean law text by removing confusing elements - improved
export function cleanLawText(text: string): string {
  return text
    .replace(/תיקון.*?[;,.]/g, "") // Remove amendment notes
    .replace(/\(\d{4}\)/g, "") // Remove years in parentheses
    .replace(/\[.*?\]/g, "") // Remove text in square brackets
    .replace(/התשכ"[א-ת]–\d{4}/g, "") // Remove Hebrew date formats
    .replace(/התש[א-ת]"[א-ת]–\d{4}/g, "") // Remove additional Hebrew date formats
    .replace(/התש[א-ת]"[א-ת]/g, "") // Remove shorter Hebrew date formats
    .replace(/^\s*$/gm, "") // Remove empty lines
    .replace(/\(תיקון מס'.*?\)/g, "") // Remove amendment numbers
    .replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, ""); // Remove Hebrew diacritics (nikud)
}

// Parse laws from HTML content - improved with better structure detection
export function parseLawsFromHtml(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // Extract law categories and content with improved selectors
  const lawSections = doc.querySelectorAll('.mw-parser-output > h2, .mw-parser-output > h3, .mw-parser-output > p, .mw-parser-output > div > p, .mw-parser-output > ul, .mw-parser-output > div > ul, .mw-parser-output > div > div > p');
  
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
      if (currentCategory && !lawData[currentCategory][currentLaw]) {
        lawData[currentCategory][currentLaw] = {};
      }
    } else if ((section.tagName === 'P' || section.tagName === 'UL') && currentCategory && currentLaw) {
      const content = section.textContent?.trim() || "";
      if (content) {
        // Check for section header patterns with more variations
        const sectionMatch = content.match(/^(סעיף \d+[א-ת]?|פרק [א-ת\']+|חלק [א-ת\']+)[:\.]\s*(.*)/);
        if (sectionMatch) {
          const [, sectionId, sectionContent] = sectionMatch;
          lawData[currentCategory][currentLaw][sectionId] = cleanLawText(sectionContent.trim());
        } else if (content.match(/^\d+[א-ת]?\./) || content.match(/^\([א-ת]\)/)) {
          // Handle numbered or lettered list items
          const itemMatch = content.match(/^(\d+[א-ת]?\.|\([א-ת]\))\s*(.*)/);
          if (itemMatch) {
            const [, itemId, itemContent] = itemMatch;
            lawData[currentCategory][currentLaw][itemId] = cleanLawText(itemContent.trim());
          }
        } else if (!Object.keys(lawData[currentCategory][currentLaw]).length) {
          // If this is the first content for this law and doesn't match patterns, add as general content
          lawData[currentCategory][currentLaw]["תוכן כללי"] = cleanLawText(content);
        }
      }
    }
  }
  
  // If we didn't get much data, try an alternative parsing approach
  if (Object.keys(lawData).length <= 1) {
    return fallbackParseLaws(doc);
  }
  
  return lawData;
}

// Fallback parser if the main parser doesn't extract enough data
function fallbackParseLaws(doc: Document) {
  const lawData: Record<string, Record<string, Record<string, string>>> = {};
  const allLinks = doc.querySelectorAll('.mw-parser-output a');
  
  // Try to extract laws from links
  for (const link of Array.from(allLinks)) {
    const href = link.getAttribute('href') || '';
    const title = link.getAttribute('title') || '';
    
    if (href && href.includes('wiki/') && title && title.includes('חוק')) {
      const category = "חוקים";
      const lawName = title;
      
      if (!lawData[category]) {
        lawData[category] = {};
      }
      
      if (!lawData[category][lawName]) {
        lawData[category][lawName] = {
          "כללי": "לחץ על הקישור כדי לראות את תוכן החוק המלא"
        };
      }
    }
  }
  
  return lawData;
}

// Cache laws data in localStorage to avoid unnecessary API calls
export function cacheLawsData(lawsData: any) {
  try {
    localStorage.setItem('cached-laws-data', JSON.stringify(lawsData));
    localStorage.setItem('laws-cache-timestamp', new Date().toISOString());
  } catch (error) {
    console.error("שגיאה בשמירת נתוני חוקים למטמון:", error);
  }
}

// Get cached laws data if available and not too old (24 hours)
export function getCachedLawsData() {
  try {
    const cachedData = localStorage.getItem('cached-laws-data');
    const timestamp = localStorage.getItem('laws-cache-timestamp');
    
    if (cachedData && timestamp) {
      const cacheTime = new Date(timestamp).getTime();
      const now = new Date().getTime();
      const hoursSinceCached = (now - cacheTime) / (1000 * 60 * 60);
      
      if (hoursSinceCached < 24) {
        return JSON.parse(cachedData);
      }
    }
    
    return null;
  } catch (error) {
    console.error("שגיאה בקריאת נתוני חוקים מהמטמון:", error);
    return null;
  }
}
