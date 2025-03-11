
import React, { useState, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, History, FileText, Settings, Scale, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserDetails, logoutUser } from "@/utils/user";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Get initial user state
    const userDetails = getUserDetails();
    setUser(userDetails);
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      // Clean up the subscription
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  if (!mounted) return null;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logoutUser();
      toast.success("התנתקת בהצלחה");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("שגיאה בהתנתקות");
    }
  };

  const navItems = [
    { path: "/", icon: <Search className="w-5 h-5" />, label: "חיפוש משפטי" },
    { path: "/laws", icon: <BookOpen className="w-5 h-5" />, label: "מאגר חוקים" },
    { path: "/history", icon: <History className="w-5 h-5" />, label: "היסטוריה" },
    { path: "/documents", icon: <FileText className="w-5 h-5" />, label: "מסמכים משפטיים" },
  ];

  const getUserInitials = () => {
    if (!user || !user.user_metadata?.full_name) return "LI";
    
    const nameParts = user.user_metadata.full_name.split(" ");
    if (nameParts.length === 1) return nameParts[0].substring(0, 2).toUpperCase();
    
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <nav className="py-6">
      <div className="px-4 py-2 glass-card rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-blue-100/20 backdrop-blur-md -z-10"></div>
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-medium text-primary">
            <Scale className="h-6 w-6" />
            <span>LawAI</span>
          </Link>
          
          <div className="flex items-center">
            <div className="flex space-x-1 space-x-reverse">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-lg flex items-center transition-all duration-300 ${
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-primary/10 rounded-lg"
                          initial={false}
                          transition={{ type: "spring", duration: 0.5 }}
                        />
                      )}
                      <span className="mr-2">{item.icon}</span>
                      <span className="relative z-10">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
            
            <div className="mr-4 flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative rounded-full h-10 w-10 p-0" aria-label="User menu">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>החשבון שלי</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to="/settings">
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="ml-2 h-4 w-4" />
                        <span>הגדרות</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
                      <LogOut className="ml-2 h-4 w-4" />
                      <span>התנתק</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="default" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    התחבר
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
