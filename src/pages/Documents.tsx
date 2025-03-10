
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLegalAnalysis } from "@/utils/api";
import { FileText, Download, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Documents = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [documentType, setDocumentType] = useState("legal-analysis");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  const handleGenerate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.warning("יש למלא את כל השדות");
      return;
    }

    setLoading(true);
    try {
      let prompt = content;
      if (documentType === "legal-analysis") {
        prompt = `אנא נתח את המקרה הבא מבחינה משפטית: ${content}`;
      } else if (documentType === "legal-letter") {
        prompt = `אנא נסח מכתב משפטי רשמי בנושא: ${content}`;
      } else if (documentType === "contract") {
        prompt = `אנא נסח חוזה בנושא: ${content}`;
      }

      const result = await getLegalAnalysis(prompt);
      setGeneratedContent(result);
      toast.success("המסמך נוצר בהצלחה");
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("שגיאה ביצירת המסמך");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // This is a placeholder for PDF generation functionality
    toast.info("יכולת יצוא ל-PDF תיהיה זמינה בקרוב");
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
          יצירת מסמכים מקצועיים
        </div>
        <h1 className="text-4xl font-bold mb-2">יצירת מסמך משפטי</h1>
        <p className="text-lg text-muted-foreground">
          צור מסמכים משפטיים מותאמים אישית בעזרת בינה מלאכותית
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle>פרטי המסמך</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">כותרת המסמך</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="הזן כותרת למסמך..."
                  className="bg-white/50"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">סוג המסמך</label>
                <Select
                  value={documentType}
                  onValueChange={setDocumentType}
                >
                  <SelectTrigger className="bg-white/50">
                    <SelectValue placeholder="בחר סוג מסמך" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal-analysis">ניתוח משפטי</SelectItem>
                    <SelectItem value="legal-letter">מכתב משפטי</SelectItem>
                    <SelectItem value="contract">חוזה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">תוכן המסמך</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="תאר את הנושא או המקרה המשפטי..."
                  className="min-h-[200px] bg-white/50 resize-none"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                className="w-full hover-lift"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    יוצר מסמך...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    צור מסמך
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>תצוגה מקדימה</CardTitle>
              {generatedContent && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExport}
                  className="hover-lift"
                >
                  <Download className="w-4 h-4 mr-2" />
                  ייצא ל-PDF
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!generatedContent ? (
                <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-border/50 rounded-lg bg-white/30">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">המסמך שלך יופיע כאן</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-6 border border-border/50 shadow-inner min-h-[300px] max-h-[500px] overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4 text-primary">{title}</h2>
                  <div className="whitespace-pre-line">{generatedContent}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Documents;
