import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="py-4 border-t border-border/30 bg-background/50">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LawAI
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            אין במידע המוצג כאן תחליף לייעוץ משפטי מקצועי
          </div>
        </div>
      </footer>
      <Toaster position="top-center" closeButton />
    </div>
  );
};

export default Layout;
