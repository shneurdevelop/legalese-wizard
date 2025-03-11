
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Create a Supabase client with the Auth context of the function
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Fetch from Wikisource with more comprehensive parameters
    const response = await fetch(
      "https://he.wikisource.org/w/api.php?action=parse&page=ספר_החוקים_הפתוח&format=json&origin=*&prop=text&redirects=true&section=all&disabletoc=true",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "LawAI/1.0 (https://lawai.app; info@lawai.app) Law Database Parser"
        }
      }
    );

    const wikiData = await response.json();
    
    if (wikiData && wikiData.parse && wikiData.parse.text) {
      const htmlContent = wikiData.parse.text["*"];
      
      // Parse the HTML content to extract laws with improved parsing
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      
      // Extract all sections from the page
      const allSections = Array.from(doc.querySelectorAll('.mw-parser-output > h1, .mw-parser-output > h2, .mw-parser-output > h3, .mw-parser-output > h4, .mw-parser-output > p, .mw-parser-output > div, .mw-parser-output > ul, .mw-parser-output > ol'));
      
      const lawData: Record<string, Record<string, Record<string, string>>> = {};
      let currentCategory = "";
      let currentLaw = "";
      let currentChapter = "";
      
      for (const section of allSections) {
        const tagName = section.tagName.toLowerCase();
        const textContent = section.textContent?.trim() || "";
        
        if (!textContent) continue;
        
        // Handle headings based on level
        if (tagName === 'h1' || tagName === 'h2') {
          // Main category (e.g., "דיני חוזים")
          currentCategory = textContent;
          currentChapter = "";
          currentLaw = "";
          if (!lawData[currentCategory]) {
            lawData[currentCategory] = {};
          }
        } else if (tagName === 'h3') {
          // Law name (e.g., "חוק החוזים (חלק כללי), תשל״ג-1973")
          currentLaw = textContent;
          currentChapter = "";
          if (currentCategory && !lawData[currentCategory][currentLaw]) {
            lawData[currentCategory][currentLaw] = {};
          }
        } else if (tagName === 'h4') {
          // Chapter within a law
          currentChapter = textContent;
        } else if ((tagName === 'p' || tagName === 'div' || tagName === 'ul' || tagName === 'ol') && currentCategory && currentLaw) {
          // Content - could be sections, paragraphs, lists
          
          // Try to match section patterns more comprehensively
          const sectionMatches = [
            // Section number at start of line
            textContent.match(/^(\d+[א-ת]?)[\.\s]+(.+)$/),
            // Section with word "סעיף" at start
            textContent.match(/^(סעיף\s+\d+[א-ת]?)[\.\s:]+(.+)$/),
            // Chapter or part identifier
            textContent.match(/^(פרק [א-ת]\'?|חלק [א-ת]\'?)[\.\s:]+(.+)$/)
          ].find(m => m);
          
          if (sectionMatches) {
            // This is a numbered section
            const [, sectionId, content] = sectionMatches;
            const cleanContent = cleanLawText(content.trim());
            
            // Use the chapter as a prefix if it exists
            const sectionKey = currentChapter 
              ? `${currentChapter} - ${sectionId}` 
              : sectionId;
              
            if (cleanContent) {
              lawData[currentCategory][currentLaw][sectionKey] = cleanContent;
            }
          } else if (currentChapter && !textContent.match(/^\s*$/)) {
            // This is content under a chapter heading without a section number
            // Add it as general chapter content if not empty
            const chapterContent = lawData[currentCategory][currentLaw][currentChapter] || "";
            const newContent = cleanLawText(textContent);
            
            if (newContent) {
              lawData[currentCategory][currentLaw][currentChapter] = 
                chapterContent ? `${chapterContent}\n${newContent}` : newContent;
            }
          } else if (!Object.keys(lawData[currentCategory][currentLaw]).length && textContent.length > 10) {
            // If this is the first content for this law and doesn't match patterns, 
            // add as general content if substantial
            lawData[currentCategory][currentLaw]["כללי"] = cleanLawText(textContent);
          }
        }
      }
      
      // Filter out empty categories and laws
      const filteredLawData: Record<string, Record<string, Record<string, string>>> = {};
      
      Object.entries(lawData).forEach(([category, laws]) => {
        if (Object.keys(laws).length === 0) return;
        
        filteredLawData[category] = {};
        
        Object.entries(laws).forEach(([law, sections]) => {
          if (Object.keys(sections).length === 0) return;
          filteredLawData[category][law] = sections;
        });
        
        if (Object.keys(filteredLawData[category]).length === 0) {
          delete filteredLawData[category];
        }
      });
      
      // Save the parsed laws to Supabase
      for (const [category, laws] of Object.entries(filteredLawData)) {
        for (const [lawName, sections] of Object.entries(laws)) {
          // Check if law already exists
          const { data: existingLaw } = await supabase
            .from('laws_cache')
            .select('id')
            .eq('category', category)
            .eq('law_name', lawName)
            .maybeSingle();
          
          if (existingLaw) {
            // Update existing law
            await supabase
              .from('laws_cache')
              .update({ 
                content: sections,
                last_updated: new Date().toISOString()
              })
              .eq('id', existingLaw.id);
          } else {
            // Insert new law
            await supabase
              .from('laws_cache')
              .insert([
                {
                  category,
                  law_name: lawName,
                  content: sections,
                  last_updated: new Date().toISOString()
                }
              ]);
          }
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        lawsCount: Object.keys(filteredLawData).length,
        totalLaws: Object.values(filteredLawData).reduce((count, laws) => count + Object.keys(laws).length, 0)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      throw new Error("No valid data returned from Wikisource");
    }
  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Function to clean law text by removing confusing elements - enhanced version
function cleanLawText(text: string): string {
  return text
    .replace(/תיקון.*?[;,.]/g, "") // Remove amendment notes
    .replace(/\(\d{4}\)/g, "") // Remove years in parentheses
    .replace(/\[.*?\]/g, "") // Remove text in square brackets
    .replace(/התשכ"[א-ת]–\d{4}/g, "") // Remove Hebrew date formats
    .replace(/התש[א-ת]"[א-ת]–\d{4}/g, "") // Remove additional Hebrew date formats
    .replace(/התש[א-ת]"[א-ת]/g, "") // Remove shorter Hebrew date formats
    .replace(/^\s*$/gm, "") // Remove empty lines
    .replace(/\(תיקון מס'.*?\)/g, "") // Remove amendment numbers
    .replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, "") // Remove Hebrew diacritics (nikud)
    .replace(/^הערת\s+שוליים.*$/gm, "") // Remove footnotes
    .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
    .trim(); // Trim leading and trailing whitespace
}
