import { ProductImagePlaceholder } from "@/components/ProductImagePlaceholder";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";
import { useEffect, useState } from "react";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

/** Only blobs whose mime type is an image can be rendered in an <img>. */
function imageUrl(image: ProductImage): string | null {
  if (!image.mimeType.startsWith("image/")) return null;
  try {
    return image.blob.getDirectURL();
  } catch {
    return null;
  }
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const usable = images
    .map((image) => ({ image, url: imageUrl(image) }))
    .filter((entry): entry is { image: ProductImage; url: string } =>
      Boolean(entry.url),
    );

  const [activeIndex, setActiveIndex] = useState(0);

  // Reset to the first image whenever the gallery contents change.
  const imageSignature = usable.map((entry) => entry.url).join("|");
  useEffect(() => {
    void imageSignature;
    setActiveIndex(0);
  }, [imageSignature]);

  if (usable.length === 0) {
    return (
      <div
        data-ocid="product.gallery.empty_state"
        className="aspect-square w-full overflow-hidden rounded-[var(--radius-card)] border border-border bg-secondary"
      >
        <ProductImagePlaceholder
          label="ما كايناش تصاور لهاد المنتج"
          caption="ما كايناش تصاور لهاد المنتج"
        />
      </div>
    );
  }

  const safeIndex = Math.min(activeIndex, usable.length - 1);
  const active = usable[safeIndex];

  return (
    <div data-ocid="product.gallery" className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-elevated">
        <img
          key={active.url}
          src={active.url}
          alt={`${productName} — صورة ${safeIndex + 1}`}
          data-ocid="product.gallery.image"
          className="size-full object-cover"
        />
      </div>

      {usable.length > 1 && (
        <ul
          data-ocid="product.gallery.thumbnails"
          className="flex flex-wrap gap-3"
        >
          {usable.map((entry, index) => (
            <li key={entry.url}>
              <button
                type="button"
                aria-label={`عرض الصورة ${index + 1} من ${usable.length}`}
                aria-current={index === safeIndex}
                data-ocid={`product.gallery.thumbnail.${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "size-20 overflow-hidden rounded-[var(--radius)] border-2 bg-secondary transition-smooth focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  index === safeIndex
                    ? "border-accent shadow-glow-gold"
                    : "border-border opacity-70 hover:opacity-100",
                )}
              >
                <img
                  src={entry.url}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
