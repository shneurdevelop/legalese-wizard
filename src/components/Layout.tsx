
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar />
        <main className="py-8">
          <div className="animate-blur-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
