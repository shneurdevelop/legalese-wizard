
import React from "react";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
}

const Logo = ({ size = "md", withText = true, className }: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Scale className={cn("text-primary", sizeClasses[size])} />
        <div className="absolute inset-0 bg-primary/10 rounded-full -z-10 scale-110 blur-[2px]"></div>
      </div>
      {withText && (
        <span className={cn("font-bold text-primary", textSizeClasses[size])}>
          LawAI
        </span>
      )}
    </div>
  );
};

export default Logo;
