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
    <path d="M12 2L13.5 9L20 10.5L13.5 12L12 19L10.5 12L4 10.5L10.5 9L12 2Z" />
    {/* Medium 4-pointed star */}
    <path d="M19 14L19.75 16.25L22 17L19.75 17.75L19 20L18.25 17.75L16 17L18.25 16.25L19 14Z" />
    {/* Small 4-pointed star */}
    <path d="M6 2L6.5 3.5L8 4L6.5 4.5L6 6L5.5 4.5L4 4L5.5 3.5L6 2Z" />
  </svg>
);

export default SparklesIcon;
