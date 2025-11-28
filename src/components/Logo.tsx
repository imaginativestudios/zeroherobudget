import { cn } from "@/lib/utils";
import logoSvg from "@/assets/zero-hero-logo.svg";

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo = ({ className, alt = "Zero Hero logo" }: LogoProps) => {
  return (
    <img
      src={logoSvg}
      alt={alt}
      className={cn("block h-auto w-auto", className)}
    />
  );
};
