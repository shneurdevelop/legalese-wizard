import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BookText, History, Menu, Settings, FileText, LogOut, User } from "lucide-react";
import { isUserLoggedIn, logoutUser } from "@/utils/user";
import Logo from "./Logo";  // Add the Logo import

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  exact?: boolean;
}

const CustomNavLink: React.FC<NavLinkProps> = ({ to, children, exact = false }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'nav-link-active' : ''}`
      }
      end={exact}
    >
      {children}
    </NavLink>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isUserLoggedIn());
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link to="/" className="mr-6">
            <Logo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <CustomNavLink to="/" exact={true}>
              <BookText className="h-4 w-4 mr-1" />
              ניתוח משפטי
            </CustomNavLink>
            <CustomNavLink to="/laws">
              <BookText className="h-4 w-4 mr-1" />
              מאגר חוקים
            </CustomNavLink>
            <CustomNavLink to="/history">
              <History className="h-4 w-4 mr-1" />
              היסטוריה
            </CustomNavLink>
            <CustomNavLink to="/documents">
              <FileText className="h-4 w-4 mr-1" />
              מסמכים
            </CustomNavLink>
          </nav>
        </div>

        <div className="flex items-center">
          <div className="hidden md:flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    הגדרות
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  התנתק
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex justify-start py-4">
                <Logo size="sm" />
              </div>
              
              <nav className="grid gap-4">
                <CustomNavLink to="/" exact={true}>
                  <BookText className="h-4 w-4 mr-2" />
                  ניתוח משפטי
                </CustomNavLink>
                <CustomNavLink to="/laws">
                  <BookText className="h-4 w-4 mr-2" />
                  מאגר חוקים
                </CustomNavLink>
                <CustomNavLink to="/history">
                  <History className="h-4 w-4 mr-2" />
                  היסטוריה
                </CustomNavLink>
                <CustomNavLink to="/documents">
                  <FileText className="h-4 w-4 mr-2" />
                  מסמכים
                </CustomNavLink>
                <Link to="/settings" className="nav-link">
                  <Settings className="h-4 w-4 mr-2" />
                  הגדרות
                </Link>
                <Button variant="ghost" className="justify-start nav-link" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  התנתק
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
