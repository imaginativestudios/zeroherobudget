import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo = ({ className, alt = "Zero Hero logo" }: LogoProps) => {
  return (
    <img
      src="/logo-white.png"
      alt={alt}
      className={cn("w-auto", className)}
    />
  );
};