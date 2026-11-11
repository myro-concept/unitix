import logoGlyph from "@/assets/logo-glyph-160.png";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  textColor?: string;
}

const sizes = {
  xs: { glyph: "w-5 h-5", text: "text-sm" },
  sm: { glyph: "w-7 h-7", text: "text-lg" },
  md: { glyph: "w-9 h-9", text: "text-[22px]" },
  lg: { glyph: "w-12 h-12", text: "text-2xl" },
};

export function Logo({ size = "md", className = "", textColor = "#111111" }: LogoProps) {
  const s = sizes[size];

  return (
    <span className={`inline-flex items-center justify-center gap-2 ${className}`}>
      <span className={`${s.glyph} inline-flex shrink-0 items-center justify-center`}>
        <img
          src={logoGlyph}
          alt="UniTix"
          decoding="async"
          className="block h-full w-full object-contain"
        />
      </span>

      <span
        className={`font-display font-bold tracking-tight ${s.text}`}
        style={{ color: textColor }}
      >
        UniTix
      </span>
    </span>
  );
}