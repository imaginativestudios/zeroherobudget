import { SVGProps } from "react";

interface SparklesIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const SparklesIcon = ({ size = 24, className, ...props }: SparklesIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    {...props}
  >
    {/* Large 4-pointed star */}
    <path d="M12 0L14 9L22 12L14 15L12 24L10 15L2 12L10 9L12 0Z" />
    {/* Medium 4-pointed star - enlarged and moved to top-right */}
    <path d="M21 1L22.5 5L26 6.5L22.5 8L21 12L19.5 8L16 6.5L19.5 5L21 1Z" />
    {/* Small 4-pointed star - enlarged and moved to bottom-left */}
    <path d="M5 18L6.25 21L9 22L6.25 23L5 26L3.75 23L1 22L3.75 21L5 18Z" />
  </svg>
);

export default SparklesIcon;
