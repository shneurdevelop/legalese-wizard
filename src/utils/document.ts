
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { getUserDetails } from "./user";

// Add Hebrew font support to jsPDF
// Note: In a real production app, we would need to properly import and register Hebrew fonts
// This is a simplified version

export const generateLegalDocument = (
  title: string,
  caseDescription: string,
  analysis: string,
  recommendation: string
) => {
  try {
    const user = getUserDetails();
    const currentDate = new Date().toLocaleDateString('he-IL');
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set RTL mode for Hebrew
    doc.setR2L(true);
    
    // Add document title
    doc.setFontSize(22);
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    // Add document metadata
    doc.setFontSize(12);
    doc.text(`תאריך: ${currentDate}`, doc.internal.pageSize.width - 20, 30, { align: 'right' });
    
    if (user) {
      doc.text(`מסמך עבור: ${user.user_metadata?.full_name || user.username || 'משתמש רשום'}`, doc.internal.pageSize.width - 20, 37, { align: 'right' });
    }
    
    // Add LawAI logo/watermark
    doc.setFontSize(10);
    doc.text("נוצר על ידי מערכת LawAI", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    
    // Add content sections
    doc.setFontSize(16);
    doc.text("תיאור המקרה", doc.internal.pageSize.width - 20, 50, { align: 'right' });
    
    doc.setFontSize(12);
    const caseLines = doc.splitTextToSize(caseDescription, 170);
    doc.text(caseLines, doc.internal.pageSize.width - 20, 60, { align: 'right' });
    
    let currentY = 60 + (caseLines.length * 7);
    
    // Add analysis section
    doc.setFontSize(16);
    doc.text("ניתוח משפטי", doc.internal.pageSize.width - 20, currentY, { align: 'right' });
    
    currentY += 10;
    doc.setFontSize(12);
    const analysisLines = doc.splitTextToSize(analysis, 170);
    doc.text(analysisLines, doc.internal.pageSize.width - 20, currentY, { align: 'right' });
    
    currentY += (analysisLines.length * 7);
    
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    // Add recommendation section
    doc.setFontSize(16);
    doc.text("המלצות", doc.internal.pageSize.width - 20, currentY, { align: 'right' });
    
    currentY += 10;
    doc.setFontSize(12);
    const recommendationLines = doc.splitTextToSize(recommendation, 170);
    doc.text(recommendationLines, doc.internal.pageSize.width - 20, currentY, { align: 'right' });
    
    // Add disclaimer
    doc.addPage();
    doc.setFontSize(16);
    doc.text("הערות חשובות", doc.internal.pageSize.width - 20, 20, { align: 'right' });
    
    doc.setFontSize(12);
    const disclaimer = `
    המסמך הזה הופק על ידי מערכת LawAI המבוססת על בינה מלאכותית.
    
    אין לראות במסמך זה תחליף לייעוץ משפטי מקצועי.
    
    מערכת LawAI מספקת מידע כללי בלבד, ואינו מהווה חוות דעת משפטית מחייבת.
    
    בכל מקרה של ספק או שאלה משפטית מורכבת, מומלץ להתייעץ עם עורך דין מוסמך.
    
    © LawAI ${new Date().getFullYear()} - כל הזכויות שמורות
    `;
    
    const disclaimerLines = doc.splitTextToSize(disclaimer, 170);
    doc.text(disclaimerLines, doc.internal.pageSize.width - 20, 30, { align: 'right' });
    
    // Save and return the document
    return doc;
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
};

export const extractLawsuitInfo = (analysisText: string): {
  analysisSection: string;
  recommendationSection: string;
} => {
  // Extract the analysis and recommendation sections from the text
  let analysisSection = "";
  let recommendationSection = "";
  
  // Try to find analysis section
  const analysisMatch = analysisText.match(/ניתוח משפטי:?([\s\S]*?)(המלצות|סיכום|מסקנה|האם יש בסיס לתביעה)/i);
  if (analysisMatch && analysisMatch[1]) {
    analysisSection = analysisMatch[1].trim();
  } else {
    // If no clear analysis section, use the first half of the text
    analysisSection = analysisText.substring(0, analysisText.length / 2);
  }
  
  // Try to find recommendation section
  const recommendationMatch = analysisText.match(/(המלצות|סיכום|מסקנה|האם יש בסיס לתביעה):?([\s\S]*?)$/i);
  if (recommendationMatch && recommendationMatch[2]) {
    recommendationSection = recommendationMatch[2].trim();
  } else {
    // If no clear recommendation section, use the second half of the text
    recommendationSection = analysisText.substring(analysisText.length / 2);
  }
  
  return {
    analysisSection,
    recommendationSection
  };
};
