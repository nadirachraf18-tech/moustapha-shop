import { cn } from "@/lib/utils";

interface ProductImagePlaceholderProps {
  /** Extra classes for the wrapper (sizing, rounding, borders). */
  className?: string;
  /** Accessible label announced to screen readers. */
  label?: string;
  /** Optional caption rendered under the mark. */
  caption?: string;
  /** Hide the caption for dense contexts such as admin tables. */
  showCaption?: boolean;
}

/**
 * Branded image-unavailable placeholder.
 *
 * Renders the shared `placeholder.svg` brand mark (black canvas, magenta-pink
 * and gold accents) so every missing product image looks intentional rather
 * than like a broken asset.
 */
export function ProductImagePlaceholder({
  className,
  label = "لا توجد صورة متوفرة لهذا المنتج",
  caption,
  showCaption = true,
}: ProductImagePlaceholderProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "flex size-full flex-col items-center justify-center gap-2 bg-secondary",
        className,
      )}
    >
      <img
        src="/assets/images/placeholder.svg"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="size-full object-cover"
      />
      {showCaption && caption ? (
        <span className="text-muted-foreground text-xs">{caption}</span>
      ) : null}
    </span>
  );
}
