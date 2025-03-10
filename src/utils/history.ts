
// Save search to history
export const saveToHistory = (query: string, response: string) => {
  try {
    const historyItems = JSON.parse(localStorage.getItem("lawai-history") || "[]");
    const newItem = {
      id: Date.now(),
      date: new Date().toISOString(),
      query,
      response,
    };
    
    historyItems.unshift(newItem);
    localStorage.setItem("lawai-history", JSON.stringify(historyItems.slice(0, 20)));
    
    return true;
  } catch (error) {
    console.error("Error saving to history:", error);
    return false;
  }
};

// Get history items
export const getHistoryItems = () => {
  try {
    return JSON.parse(localStorage.getItem("lawai-history") || "[]");
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

// Clear history items
export const clearHistory = () => {
  try {
    localStorage.removeItem("lawai-history");
    return true;
  } catch (error) {
    console.error("Error clearing history:", error);
    return false;
  }
};
