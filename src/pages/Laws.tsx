
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import lawsData from "@/data/laws.json";

const Laws = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);
  const [filteredLaws, setFilteredLaws] = useState<any>(lawsData);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLaws(lawsData);
      return;
    }

    const searchLowerCase = searchTerm.toLowerCase();
    const filtered: any = {};

    Object.entries(lawsData).forEach(([category, laws]: [string, any]) => {
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
  }, [searchTerm]);

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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        {Object.entries(filteredLaws).map(([category, laws]: [string, any]) => (
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

        {Object.keys(filteredLaws).length === 0 && (
          <div className="text-center p-8 bg-secondary/50 rounded-lg">
            <p className="text-muted-foreground">לא נמצאו חוקים התואמים את החיפוש</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Laws;
