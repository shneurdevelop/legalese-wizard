
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronDown, ChevronRight, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchLaws, parseLawsFromHtml } from "@/utils/lawsFetcher";

const Laws = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wikiData, setWikiData] = useState<any>(null);
  const [filteredLaws, setFilteredLaws] = useState<any>(null);

  // Load laws from Wikisource on mount
  useEffect(() => {
    loadWikiLaws();
  }, []);

  // Load laws from Wikisource
  const loadWikiLaws = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const html = await fetchLaws();
      
      if (typeof html === "string" && html.includes("<")) {
        // Try to parse the HTML content
        try {
          const parsedLaws = parseLawsFromHtml(html);
          setWikiData(parsedLaws);
          setFilteredLaws(parsedLaws);
          toast.success("מאגר החוקים נטען בהצלחה");
        } catch (parseError) {
          console.error("Error parsing wiki content:", parseError);
          // Fall back to the static data
          setFilteredLaws(lawsData);
          setError("שגיאה בפירוש תוכן ויקיפדיה, משתמש בנתונים מקומיים במקום");
        }
      } else {
        // Fall back to the static data if the response isn't HTML
        setFilteredLaws(lawsData);
        setError("לא נמצא תוכן HTML מהויקי, משתמש בנתונים מקומיים במקום");
      }
    } catch (err) {
      console.error("Error loading wiki laws:", err);
      setFilteredLaws(lawsData);
      setError("שגיאה בטעינת חוקים מויקיפדיה, משתמש בנתונים מקומיים במקום");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter laws based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLaws(wikiData || lawsData);
      return;
    }

    const searchLowerCase = searchTerm.toLowerCase();
    const lawsToFilter = wikiData || lawsData;
    const filtered: any = {};

    Object.entries(lawsToFilter).forEach(([category, laws]: [string, any]) => {
      const filteredLawsInCategory: any = {};
      
      Object.entries(laws).forEach(([lawName, sections]: [string, any]) => {
        const filteredSections: any = {};
        
        Object.entries(sections).forEach(([sectionId, content]: [string, any]) => {
          if (
            sectionId.toLowerCase().includes(searchLowerCase) ||
            String(content).toLowerCase().includes(searchLowerCase)
          ) {
            filteredSections[sectionId] = content;
          }
        });
        
        if (
          Object.keys(filteredSections).length > 0 ||
          lawName.toLowerCase().includes(searchLowerCase)
        ) {
          filteredLawsInCategory[lawName] = Object.keys(filteredSections).length > 0 
            ? filteredSections 
            : sections;
        }
      });
      
      if (
        Object.keys(filteredLawsInCategory).length > 0 ||
        category.toLowerCase().includes(searchLowerCase)
      ) {
        filtered[category] = filteredLawsInCategory;
      }
    });
    
    setFilteredLaws(filtered);
  }, [searchTerm, wikiData]);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const toggleLaw = (law: string) => {
    setExpandedLaw(expandedLaw === law ? null : law);
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
          מאגר חוקים מקיף
        </div>
        <h1 className="text-4xl font-bold mb-2">ספר החוקים הפתוח</h1>
        <p className="text-lg text-muted-foreground">
          חפש ועיין בחוקים לפי נושאים
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          type="search"
          placeholder="חפש חוק, סעיף או מילת מפתח..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-4 pr-12 py-6 text-lg bg-white/80 backdrop-blur-sm shadow-md"
        />
      </motion.div>

      {error && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 flex items-center gap-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadWikiLaws} 
              className="mr-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              נסה שוב
            </Button>
          </CardContent>
        </Card>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="mr-3">טוען חוקים...</span>
          </div>
        ) : (
          <>
            {filteredLaws && Object.entries(filteredLaws).map(([category, laws]: [string, any]) => (
              <Card 
                key={category}
                className="glass-card glass-card-hover overflow-hidden"
              >
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  <h2 className="text-xl font-semibold">{category}</h2>
                  {expandedCategory === category ? (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-primary" />
                  )}
                </div>
                
                {expandedCategory === category && (
                  <CardContent className="pt-0">
                    <div className="space-y-2 pb-2">
                      {Object.entries(laws).map(([lawName, sections]: [string, any]) => (
                        <div key={lawName} className="border border-border/50 rounded-lg overflow-hidden">
                          <div
                            className="p-3 bg-secondary/50 flex items-center justify-between cursor-pointer hover:bg-secondary transition-colors"
                            onClick={() => toggleLaw(lawName)}
                          >
                            <h3 className="font-medium">{lawName}</h3>
                            {expandedLaw === lawName ? (
                              <ChevronDown className="h-4 w-4 text-primary" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          
                          {expandedLaw === lawName && (
                            <div className="p-3 space-y-2 bg-white/50">
                              {Object.entries(sections).map(([sectionId, content]: [string, any]) => (
                                <div key={sectionId} className="p-2 bg-white/70 rounded border border-border/30">
                                  <span className="font-semibold text-primary">{sectionId}:</span>{" "}
                                  <span>{content}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {filteredLaws && Object.keys(filteredLaws).length === 0 && (
              <div className="text-center p-8 bg-secondary/50 rounded-lg">
                <p className="text-muted-foreground">לא נמצאו חוקים התואמים את החיפוש</p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

// Fallback static data in case the Wiki API fails
const lawsData = {
  "דיני חוזים": {
    "חוק החוזים (חלק כללי), תשל״ג-1973": {
      "סעיף 1": "חוזה נכרת בדרך של הצעה וקיבול לפי הוראות פרק זה.",
      "סעיף 2": "פנייתו של אדם לחברו היא בגדר הצעה, אם היא מעידה על גמירת דעתו של המציע להתקשר עם הניצע בחוזה והיא מסויימת כדי אפשרות לכרות את החוזה בקיבול ההצעה; הפנייה יכול שתהיה לציבור.",
      "סעיף 3": "הניצע רשאי לחזור בו מן הקיבול בהודעה למציע, ובלבד שהודעת החזרה נמסרה למציע לא לאחר שנמסרה לו הודעת הקיבול או שנודע לו על קיבול בדרך אחרת."
    },
    "חוק החוזים (תרופות בשל הפרת חוזה), תשל״א-1970": {
      "סעיף 1": "הופר חוזה, זכאי הנפגע לתבוע את אכיפתו או לבטל את החוזה, וכן זכאי הוא לפיצויים, בנוסף על אחת התרופות האמורות או במקומן, והכל לפי הוראות חוק זה.",
      "סעיף 2": "הנפגע זכאי לאכיפת החוזה, זולת אם נתקיימה אחת מאלה: (1) החוזה אינו בר-ביצוע; (2) אכיפת החוזה היא כפיה לעשות, או לקבל, עבודה אישית או שירות אישי; (3) ביצוע צו האכיפה דורש מידה בלתי סבירה של פיקוח מטעם בית משפט או לשכת הוצאה לפועל; (4) אכיפת החוזה היא בלתי צודקת בנסיבות הענין."
    }
  },
  "דיני נזיקין": {
    "פקודת הנזיקין [נוסח חדש]": {
      "סעיף 35": "עשה אדם מעשה שאדם סביר ונבון לא היה עושה באותן נסיבות, או לא עשה מעשה שאדם סביר ונבון היה עושה באותן נסיבות, או שבמשלח יד פלוני לא השתמש במיומנות, או לא נקט מידת זהירות, שאדם סביר ונבון וכשיר לפעול באותו משלח יד היה משתמש או נוקט באותן נסיבות – הרי זו התרשלות; ואם התרשל כאמור ביחס לאדם אחר, שלגביו יש לו באותן נסיבות חובה שלא לנהוג כפי שנהג, הרי זו רשלנות, והגורם ברשלנותו נזק לזולתו עושה עוולה.",
      "סעיף 36": "החובה האמורה בסעיף 35 מוטלת כלפי כל אדם וכלפי בעל כל נכס, כל אימת שאדם סביר צריך היה באותן נסיבות לראות מראש שהם עלולים במהלכם הרגיל של דברים להיפגע ממעשה או ממחדל המפורשים באותו סעיף."
    }
  },
  "דיני עבודה": {
    "חוק שעות עבודה ומנוחה, תשי״א-1951": {
      "סעיף 2": "יום עבודה לא יעלה על שמונה שעות עבודה.",
      "סעיף 3": "שבוע עבודה לא יעלה על ארבעים וחמש שעות עבודה."
    },
    "חוק שכר מינימום, תשמ״ז-1987": {
      "סעיף 2": "עובד שמלאו לו 18 שנים (להלן – עובד) המועסק במשרה מלאה, כנהוג במקום עבודתו, זכאי לקבל ממעבידו שכר עבודה שלא יפחת משכר המינימום."
    }
  },
  "דיני מקרקעין": {
    "חוק המקרקעין, תשכ״ט-1969": {
      "סעיף 2": "עסקה במקרקעין טעונה רישום; העסקה נגמרת ברישום, ורואים את השעה שבה אישר הרשם את העסקה לרישום כשעת הרישום.",
      "סעיף 7": "בעלות במקרקעין היא הזכות להחזיק במקרקעין, להשתמש בהם ולעשות בהם כל דבר וכל עסקה בכפוף להגבלות לפי דין או לפי הסכם."
    }
  }
};

export default Laws;
