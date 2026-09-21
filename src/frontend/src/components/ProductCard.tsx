import { ProductImagePlaceholder } from "@/components/ProductImagePlaceholder";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/types";
import { Link } from "@tanstack/react-router";

interface ProductCardProps {
  product: Product;
  /** Category list used to resolve the product's category name. */
  categories?: Category[];
  /** Numeric position used for deterministic test markers. */
  index?: number;
}

/** First renderable image of a product, or `null` when it has none. */
function firstImageUrl(product: Product): string | null {
  const image = product.images.find((entry) =>
    entry.mimeType.startsWith("image/"),
  );
  return image ? image.blob.getDirectURL() : null;
}

export function ProductCard({ product, categories, index }: ProductCardProps) {
  const imageUrl = firstImageUrl(product);
  const category = categories?.find((entry) => entry.id === product.categoryId);
  const marker = index === undefined ? undefined : index + 1;

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id.toString() }}
      data-ocid={marker ? `product.card.${marker}` : "product.card"}
      className="card-product group flex flex-col focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductImagePlaceholder caption="بلا صورة" />
        )}

        <span className="absolute top-3 start-3">
          {product.available ? (
            <Badge
              data-ocid={marker ? `product.availability.${marker}` : undefined}
              className="badge-pill border-transparent bg-success text-success-foreground"
            >
              متوفر
            </Badge>
          ) : (
            <Badge
              data-ocid={marker ? `product.availability.${marker}` : undefined}
              variant="secondary"
              className="badge-pill border-transparent text-muted-foreground"
            >
              غير متوفر
            </Badge>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {category && (
          <span className="text-muted-foreground text-xs font-medium">
            {category.name}
          </span>
        )}
        <h3 className="line-clamp-2 min-h-10 font-display text-sm font-semibold leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-price text-base">
            {formatPrice(product.price)}
          </span>
        </div>{" "}
      </div>
    </Link>
  );
}
