
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, LucideGavel, Shield, FileText, Brain, ArrowRight } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">LawAI</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline">התחברות</Button>
            </Link>
            <Link to="/register">
              <Button>הרשמה</Button>
            </Link>
          </div>
        </header>

        <main className="py-20">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              ייעוץ משפטי חכם מבוסס
              <span className="text-primary mx-2">בינה מלאכותית</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              LawAI מספקת ניתוח משפטי מקיף, מותאם אישית וזמין 24/7,
              המבוסס על מאגר החוקים המקיף ביותר בישראל ומונע על ידי בינה מלאכותית מתקדמת.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link to="/register">
                <Button size="lg" className="px-8 text-lg group">
                  התחל עכשיו
                  <ArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {features.map((feature, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg glass-card">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="bg-primary/5 rounded-2xl p-8 text-center"
          >
            <h2 className="text-3xl font-bold mb-4">איך זה עובד?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-primary/20" style={{ left: '60%' }}></div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </main>

        <footer className="py-8 border-t border-border/40 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} LawAI. כל הזכויות שמורות.</p>
          <p className="text-sm mt-2">
            LawAI אינה מחליפה ייעוץ משפטי מקצועי. לקבלת עצה משפטית מחייבת, אנא התייעץ עם עורך דין מוסמך.
          </p>
        </footer>
      </div>
    </div>
  );
};

const features = [
  {
    title: "ניתוח משפטי מהיר",
    description: "תיאור המקרה שלך ינותח בשניות באמצעות בינה מלאכותית מתקדמת",
    icon: Brain,
  },
  {
    title: "חיפוש מאגר חוקים מקיף",
    description: "גישה למאגר החקיקה הישראלי המלא, מעודכן ומסונכרן באופן שוטף",
    icon: LucideGavel,
  },
  {
    title: "יצירת מסמכים משפטיים",
    description: "ייצור אוטומטי של מסמכים משפטיים בהתאם לניתוח המקרה שלך",
    icon: FileText,
  },
];

const steps = [
  {
    title: "תאר את המקרה שלך",
    description: "ספר לנו על המקרה המשפטי שלך בלשון פשוטה ובהירה",
  },
  {
    title: "קבל ניתוח מקיף",
    description: "המערכת תנתח את המקרה שלך על בסיס החוקים הרלוונטיים",
  },
  {
    title: "קבל מסמכים וכלים",
    description: "אם יש בסיס לתביעה, תקבל מסמכים וכלים משפטיים מתאימים",
  },
];

export default Landing;
