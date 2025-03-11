
// Re-export all the functionality from separate files
export * from './openai';
export * from './history';
export * from './user';
export * from './lawsFetcher';

// Add the missing findRelevantLaws function
export function findRelevantLaws(query: string, lawsData: any): string {
  if (!query || !lawsData) return "";
  
  // Convert query to lowercase for case-insensitive matching
  const queryLower = query.toLowerCase();
  
  // Create an array of keywords from the query by splitting on spaces and filtering out common words
  const keywords = queryLower
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !["את", "של", "עם", "לא", "כי", "על", "או", "אם", "גם", "רק", "אבל", "אז", "כן", "מה"].includes(word)
    );
  
  // Find relevant laws by matching keywords against law names and content
  let relevantLawsText = "";
  let matchedLaws: {category: string, law: string, section: string, content: string, score: number}[] = [];
  
  // Search through all categories and laws
  Object.entries(lawsData).forEach(([category, laws]: [string, any]) => {
    Object.entries(laws).forEach(([lawName, sections]: [string, any]) => {
      // Check if the law name contains any keywords
      const lawNameLower = lawName.toLowerCase();
      const lawNameScore = keywords.reduce((score, keyword) => 
        lawNameLower.includes(keyword) ? score + 3 : score, 0);
      
      // Check each section of the law for keyword matches
      Object.entries(sections).forEach(([sectionName, content]: [string, any]) => {
        if (typeof content !== 'string') return;
        
        const contentLower = content.toLowerCase();
        let sectionScore = lawNameScore;
        
        // Calculate score based on keyword frequency in content
        keywords.forEach(keyword => {
          const regex = new RegExp(keyword, 'g');
          const matches = contentLower.match(regex);
          if (matches) {
            sectionScore += matches.length;
          }
        });
        
        // If section has a positive score, add it to the matched laws
        if (sectionScore > 0) {
          matchedLaws.push({
            category,
            law: lawName,
            section: sectionName,
            content: content.substring(0, 500) + (content.length > 500 ? "..." : ""),
            score: sectionScore
          });
        }
      });
    });
  });
  
  // Sort by relevance score (descending)
  matchedLaws.sort((a, b) => b.score - a.score);
  
  // Take only the top 5 most relevant results
  const topResults = matchedLaws.slice(0, 5);
  
  // Format the results
  if (topResults.length > 0) {
    relevantLawsText = "חוקים רלוונטיים למקרה:\n\n";
    
    topResults.forEach(result => {
      relevantLawsText += `קטגוריה: ${result.category}\n`;
      relevantLawsText += `חוק: ${result.law}\n`;
      relevantLawsText += `סעיף: ${result.section}\n`;
      relevantLawsText += `תוכן: ${result.content}\n\n`;
    });
  }
  
  return relevantLawsText;
}
