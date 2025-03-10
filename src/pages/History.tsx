
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getHistoryItems } from "@/utils/api";
import { Trash2, FileText, Clock } from "lucide-react";
import { toast } from "sonner";

const History = () => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const items = getHistoryItems();
    setHistoryItems(items);
  };

  const clearHistory = () => {
    localStorage.setItem("lawai-history", "[]");
    setHistoryItems([]);
    toast.success("ההיסטוריה נמחקה בהצלחה");
  };

  const deleteHistoryItem = (id: number) => {
    const updatedItems = historyItems.filter(item => item.id !== id);
    localStorage.setItem("lawai-history", JSON.stringify(updatedItems));
    setHistoryItems(updatedItems);
    toast.success("הפריט נמחק מההיסטוריה");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
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
          תיעוד חיפושים
        </div>
        <h1 className="text-4xl font-bold mb-2">היסטוריית חיפושים</h1>
        <p className="text-lg text-muted-foreground">
          עיין בחיפושים קודמים ותוצאותיהם
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-end mb-4"
      >
        {historyItems.length > 0 && (
          <Button variant="outline" onClick={clearHistory} className="hover-lift">
            <Trash2 className="mr-2 h-4 w-4" />
            נקה היסטוריה
          </Button>
        )}
      </motion.div>

      <AnimatePresence>
        {historyItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center p-12 bg-secondary/50 rounded-lg"
          >
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2">אין עדיין חיפושים בהיסטוריה</h3>
            <p className="text-muted-foreground">
              החיפושים שלך יופיעו כאן לאחר שתבצע חיפוש משפטי
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {historyItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-medium">
                        חיפוש מיום {formatDate(item.date)}
                      </CardTitle>
                      <div className="flex space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHistoryItem(item.id)}
                          className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info("יצוא למסמך יתאפשר בקרוב")}
                          className="text-primary/70 hover:text-primary hover:bg-primary/10"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="query" className="border-0">
                        <AccordionTrigger className="py-2 text-right">
                          <span className="font-semibold">השאילתה</span>
                        </AccordionTrigger>
                        <AccordionContent className="bg-white/50 p-3 rounded-md">
                          {item.query}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="response" className="border-0">
                        <AccordionTrigger className="py-2 text-right">
                          <span className="font-semibold">התשובה</span>
                        </AccordionTrigger>
                        <AccordionContent className="bg-white/50 p-3 rounded-md">
                          <div className="whitespace-pre-line">
                            {item.response}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
