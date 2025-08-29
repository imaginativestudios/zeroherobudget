import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  alt?: string;
  variant?: "white" | "color";
}

export const Logo = ({ className, alt = "Zero Hero logo", variant = "white" }: LogoProps) => {
  const logoSrc = variant === "color" ? "/logo-color.png" : "/logo-white.png";
  
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={cn("w-auto", className)}
    />
  );
};