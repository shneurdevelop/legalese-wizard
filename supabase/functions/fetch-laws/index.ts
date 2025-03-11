
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
    // Fetch from Wikisource
    const response = await fetch(
      "https://he.wikisource.org/w/api.php",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: null,
        qs: {
          action: "parse",
          page: "ספר_החוקים_הפתוח",
          format: "json",
          origin: "*",
          prop: "text",
          redirects: "true",
          section: "all",
          disabletoc: "true"
        }
      }
    );

    const wikiData = await response.json();
    
    if (wikiData && wikiData.parse && wikiData.parse.text) {
      const htmlContent = wikiData.parse.text["*"];
      
      // Parse the HTML content to extract laws
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      
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
      
      // Save the parsed laws to Supabase
      for (const [category, laws] of Object.entries(lawData)) {
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
      
      return new Response(JSON.stringify({ success: true, lawsCount: Object.keys(lawData).length }), {
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

// Function to clean law text by removing confusing elements
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
    .replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, ""); // Remove Hebrew diacritics (nikud)
}
