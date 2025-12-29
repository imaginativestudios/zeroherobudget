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
    {/* Large 4-pointed star - scaled up to fill more space */}
    <path d="M12 0L14 9L22 12L14 15L12 24L10 15L2 12L10 9L12 0Z" />
    {/* Medium 4-pointed star */}
    <path d="M20 4L21 7L24 8L21 9L20 12L19 9L16 8L19 7L20 4Z" />
    {/* Small 4-pointed star */}
    <path d="M4 0L4.75 2.25L7 3L4.75 3.75L4 6L3.25 3.75L1 3L3.25 2.25L4 0Z" />
  </svg>
);

export default SparklesIcon;
