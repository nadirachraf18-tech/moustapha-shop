import { cn } from "@/lib/utils";

interface BrandWordmarkProps {
  /** Shop name from store settings; falls back to the brand name. */
  name?: string;
  /** Optional tagline rendered under the wordmark. */
  tagline?: string;
  /** `lg` for the hero, `md` for the header, `sm` for the footer. */
  size?: "sm" | "md" | "lg";
  /** Render the gold sparkle underline flourish under the wordmark. */
  sparkle?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<BrandWordmarkProps["size"]>, string> = {
  sm: "text-base",
  md: "text-lg sm:text-xl",
  lg: "text-4xl sm:text-5xl md:text-6xl",
};

/**
 * The brand wordmark: elegant serif in the logo's pink→white gradient, with an
 * optional gold sparkle underline. The shop name from settings is rendered in
 * the same treatment so the storefront always reads as the new brand.
 */
export function BrandWordmark({
  name = "MOUSTAPHA SHOP",
  tagline,
  size = "md",
  sparkle = false,
  className,
}: BrandWordmarkProps) {
  return (
    <span className={cn("flex min-w-0 flex-col leading-tight", className)}>
      <span
        className={cn(
          "brand-heading truncate tracking-tight",
          sparkle && "accent-sparkle",
          SIZE_CLASSES[size],
        )}
      >
        {name}
      </span>
      {tagline && (
        <span className="text-muted-foreground mt-0.5 truncate text-xs">
          {tagline}
        </span>
      )}
    </span>
  );
}
