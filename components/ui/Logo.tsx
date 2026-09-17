import Image from "next/image";

interface LogoProps {
  variant?: "dark" | "light";
  height?: number;
}

const LOGO_ASPECT_RATIO = 218.26 / 101.66;

export function Logo({ height = 32 }: LogoProps) {
  return (
    <Image
      src="/logo/Albastru_2.svg"
      alt="crestem.ONG"
      height={height}
      width={Math.round(height * LOGO_ASPECT_RATIO)}
      style={{ height, width: "auto", display: "block" }}
      priority
    />
  );
}
