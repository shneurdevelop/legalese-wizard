
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, History, FileText } from "lucide-react";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navItems = [
    { path: "/", icon: <Search className="w-5 h-5" />, label: "חיפוש משפטי" },
    { path: "/laws", icon: <BookOpen className="w-5 h-5" />, label: "מאגר חוקים" },
    { path: "/history", icon: <History className="w-5 h-5" />, label: "היסטוריה" },
    { path: "/documents", icon: <FileText className="w-5 h-5" />, label: "יצירת מסמך" },
  ];

  return (
    <nav className="py-6">
      <div className="px-4 py-2 glass-card rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-blue-100/20 backdrop-blur-md -z-10"></div>
        <div className="flex justify-between items-center">
          <div className="text-xl font-medium text-primary">LawAi</div>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
