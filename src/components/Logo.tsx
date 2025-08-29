import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  alt?: string;
  variant?: "white" | "color";
}

export const Logo = ({ className, alt = "Zero Hero logo", variant = "white" }: LogoProps) => {
  const logoSrc = variant === "color" 
    ? "/lovable-uploads/4796e673-8c5d-43ec-91a3-a9fa9fdcb2f1.png" 
    : "/lovable-uploads/dada87df-83e8-4d64-b92c-a2668a7a608f.png";
  
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={cn("w-auto", className)}
    />
  );
};