import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Rendered size in pixels; the mark is square. */
  size?: number;
  className?: string;
}

/**
 * The MOUSTAPHA SHOP logo mark: two glossy shopping bags (magenta + silver)
 * with pink/gold glow, on a transparent background so it sits directly on the
 * black canvas. Decorative — the adjacent wordmark carries the accessible name.
 */
export function BrandMark({ size = 40, className }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-primary/25 blur-md"
      />
      <img
        src="/assets/generated/brand-mark-transparent.dim_512x512.png"
        alt=""
        width={size}
        height={size}
        className="relative size-full object-contain drop-shadow-[0_0_10px_rgba(233,30,99,0.45)]"
      />
    </span>
  );
}
