
// User management functions
export const isUserLoggedIn = () => {
  try {
    const userJson = localStorage.getItem("lawai-user");
    if (!userJson) return false;
    
    const user = JSON.parse(userJson);
    return user && user.loggedIn === true;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
};

export const getUserDetails = () => {
  try {
    const userJson = localStorage.getItem("lawai-user");
    if (!userJson) return null;
    
    return JSON.parse(userJson);
  } catch (error) {
    console.error("Error getting user details:", error);
    return null;
  }
};

export const logoutUser = () => {
  try {
    localStorage.removeItem("lawai-user");
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
};
