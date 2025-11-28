import { cn } from "@/lib/utils";
import { useState } from "react";

interface LogoProps {
  className?: string;
  alt?: string;
  variant?: "white" | "color";
  src?: string;
}

export const Logo = ({ className, alt = "Zero Hero logo", variant = "white", src }: LogoProps) => {
  const LOGO_SRC = "/lovable-uploads/4796e673-8c5d-43ec-91a3-a9fa9fdcb2f1.png";
  const currentSrc = src || LOGO_SRC;

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn("block h-auto w-auto", className)}
    />
  );
};