import { cn } from "@/lib/utils";
import { useState } from "react";

interface LogoProps {
  className?: string;
  alt?: string;
  variant?: "white" | "color";
}

export const Logo = ({ className, alt = "Zero Hero logo", variant = "white" }: LogoProps) => {
  const COLOR_SRC = "/lovable-uploads/c5934d2f-f8e8-49af-9e33-d101494ff56d.png";
  const WHITE_SRC_PRIMARY = "/lovable-uploads/dada87df-83e8-4d64-b92c-a2668a7a608f.png"; // may not exist
  const FALLBACKS = variant === "white"
    ? [WHITE_SRC_PRIMARY, "/logo-white.png", COLOR_SRC, "/logo-color.png"]
    : [COLOR_SRC, "/logo-color.png"];

  const [srcIndex, setSrcIndex] = useState(0);
  const currentSrc = FALLBACKS[srcIndex] ?? COLOR_SRC;

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn("block h-auto w-auto", className)}
      onError={() => setSrcIndex((i) => (i < FALLBACKS.length - 1 ? i + 1 : i))}
    />
  );
};