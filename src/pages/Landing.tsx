
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Brain, ArrowRight, BookOpen, Check } from "lucide-react";
import Logo from "@/components/Logo";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex justify-between items-center py-6">
          <Logo size="md" />
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <Logo size="lg" className="scale-150" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              ייעוץ משפטי חכם מבוסס
              <span className="text-primary mx-2">בינה מלאכותית</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              LawAI מספקת ניתוח משפטי מקיף, מותאם אישית וזמין 24/7,
              המבוסס על מאגר החוקים המקיף ביותר בישראל ומונע על ידי בינה מלאכותית מתקדמת.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register">
                <Button size="lg" className="px-8 text-lg group">
                  התחל עכשיו
                  <ArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8 text-lg">
                  יש לי כבר חשבון
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.2 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="bg-primary/5 rounded-2xl p-8 text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-6">איך זה עובד?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.2 }}
                  className="relative"
                >
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-primary/20" style={{ left: '60%' }}></div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">יתרונות שימוש ב-LawAI</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <div className="bg-primary/20 p-1 rounded-full">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-muted-foreground">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>

        <footer className="py-8 border-t border-border/40 text-center">
          <div className="flex justify-center mb-6">
            <Logo size="sm" />
          </div>
          <p className="text-muted-foreground">© {new Date().getFullYear()} LawAI. כל הזכויות שמורות.</p>
          <p className="text-sm mt-2 text-muted-foreground max-w-xl mx-auto">
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
    description: "תיאור המקרה שלך ינותח בשניות באמצעות בינה מלאכותית מתקדמת עם גישה למאגר החוקים המלא",
    icon: Brain,
  },
  {
    title: "חיפוש מאגר חוקים מקיף",
    description: "גישה למאגר החקיקה הישראלי המלא מויקיטקסט, מעודכן ומסונכרן באופן שוטף",
    icon: BookOpen,
  },
  {
    title: "יצירת מסמכים משפטיים",
    description: "ייצור אוטומטי של מסמכים משפטיים בהתאם לניתוח המקרה שלך עם המלצות לפעולה",
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

const benefits = [
  "חיסכון בעלויות ייעוץ משפטי יקר",
  "זמינות 24/7 ללא הגבלה",
  "ניתוח מבוסס על מאגר החוקים המעודכן ביותר",
  "פרטיות מלאה של המידע שלך",
  "מסמכים משפטיים מוכנים להגשה",
  "ממשק ידידותי וקל לשימוש",
  "תמיכה בשפה העברית",
  "עדכונים שוטפים למאגר החוקים",
];

export default Landing;
