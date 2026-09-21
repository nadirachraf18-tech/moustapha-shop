import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import {
  categoryName,
  useCategories,
  useProduct,
  useRelatedProducts,
} from "@/hooks/use-catalog";
import { formatCount, formatPrice } from "@/lib/format";
import type { ProductId } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Minus,
  PackageX,
  Plus,
  Share2,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_QUANTITY = 99;

function parseProductId(raw: string | undefined): ProductId | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

function ProductDetailSkeleton() {
  return (
    <div
      data-ocid="product.loading_state"
      className="container grid gap-10 py-10 lg:grid-cols-2 lg:gap-14"
    >
      <Skeleton className="aspect-square w-full rounded-[var(--radius-card)]" />
      <div className="flex flex-col gap-5">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div
      data-ocid="product.not_found_state"
      className="container flex flex-col items-center gap-5 py-24 text-center"
    >
      <span className="flex size-20 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <PackageX className="size-9" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold">هاد المنتج ما كاينش</h1>
        <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
          يمكن الرابط اللي تبعتيه قديم ولا المنتج تحيد من المتجر. شوف باقي
          المنتوجات اللي عندنا.
        </p>
      </div>
      <Button
        asChild
        type="button"
        size="lg"
        className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink"
      >
        <Link
          to="/products"
          search={{}}
          data-ocid="product.back_to_catalog_button"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          رجع للمنتوجات
        </Link>
      </Button>
    </div>
  );
}

export function ProductDetailPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const productId = parseProductId(params.id);

  const { data: product, isLoading } = useProduct(productId);
  const { data: categories } = useCategories();
  const { data: related } = useRelatedProducts(productId);
  const { addItem, openDrawer } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    // Reset the picker whenever the route moves to another product.
    void params.id;
    setQuantity(1);
    setJustAdded(false);
  }, [params.id]);

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 4000);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return <NotFoundState />;

  const category = categoryName(categories, product.categoryId);
  const relatedProducts = (related ?? []).filter(
    (item) => item.id !== product.id,
  );
  const cover = product.images[0];
  const coverUrl =
    cover?.mimeType.startsWith("image/") === true
      ? cover.blob.getDirectURL()
      : null;

  const handleAddToCart = () => {
    addItem(
      {
        productId: product.id.toString(),
        name: product.name,
        price: Number(product.price),
        imageUrl: coverUrl,
      },
      quantity,
    );
    setJustAdded(true);
    toast.success("تزاد للسلة", {
      description: `${product.name} — ${formatCount(quantity)} × ${formatPrice(product.price)}`,
      action: { label: "شوف السلة", onClick: openDrawer },
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: product.name,
      text: `${product.name} — ${formatPrice(product.price)}`,
      url,
    };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("تنسخ الرابط", {
        description: "دابا تقدر تلصقو فين ما بغيت.",
      });
    } catch {
      toast.error("ما قدرناش ننسخو الرابط", {
        description: "نسخ الرابط من شريط العنوان يدوياً.",
      });
    }
  };

  return (
    <div data-ocid="product.page" className="pb-16">
      <div className="container pt-6">
        <nav
          aria-label="مسار التنقل"
          className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm"
        >
          <Link
            to="/"
            data-ocid="product.breadcrumb.home_link"
            className="transition-colors hover:text-foreground"
          >
            الرئيسية
          </Link>
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          <Link
            to="/products"
            search={{}}
            data-ocid="product.breadcrumb.catalog_link"
            className="transition-colors hover:text-foreground"
          >
            المنتوجات
          </Link>
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          <span className="text-foreground max-w-[16rem] truncate font-medium">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="container grid gap-10 py-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <span
                data-ocid="product.category_badge"
                className="badge-pill bg-secondary text-secondary-foreground"
              >
                {category}
              </span>
            )}
            <span
              data-ocid="product.availability_badge"
              className={
                product.available
                  ? "badge-pill bg-success/15 text-success"
                  : "badge-pill bg-destructive/15 text-destructive"
              }
            >
              <span
                className={
                  product.available
                    ? "size-1.5 rounded-full bg-success"
                    : "size-1.5 rounded-full bg-destructive"
                }
                aria-hidden="true"
              />
              {product.available ? "متوفر فالمخزن" : "غير متوفر دابا"}
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-baseline gap-3">
            <span
              data-ocid="product.price"
              className="text-price text-3xl text-glow-gold"
            >
              {formatPrice(product.price)}
            </span>
            <span className="text-muted-foreground text-sm">
              الثمن للوحدة، الأداء عند التسليم
            </span>
          </div>

          <Separator />

          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold">وصف المنتج</h2>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-subtle">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-semibold">الكمية</span>
              <div className="flex items-center gap-1 rounded-full border border-border p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="نقص الكمية"
                  data-ocid="product.decrease_button"
                  className="size-9 rounded-full"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <Minus className="size-4" aria-hidden="true" />
                </Button>
                <span
                  data-ocid="product.quantity"
                  className="num w-10 text-center text-base font-semibold"
                >
                  {formatCount(quantity)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="زيد الكمية"
                  data-ocid="product.increase_button"
                  className="size-9 rounded-full"
                  disabled={quantity >= MAX_QUANTITY}
                  onClick={() =>
                    setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))
                  }
                >
                  <Plus className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                data-ocid="product.add_to_cart_button"
                className="h-12 flex-1 rounded-full bg-gradient-primary text-base text-primary-foreground shadow-glow-pink transition-smooth hover:-translate-y-0.5 hover:opacity-95"
                disabled={!product.available}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="size-5" aria-hidden="true" />
                {product.available ? "زيد للسلة" : "غير متوفر دابا"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                aria-label="شارك المنتج"
                data-ocid="product.share_button"
                className="h-12 rounded-full sm:w-12 sm:px-0"
                onClick={() => void handleShare()}
              >
                <Share2 className="size-5" aria-hidden="true" />
                <span className="sm:hidden">شارك المنتج</span>
              </Button>
            </div>

            {justAdded && (
              <output
                data-ocid="product.added_confirmation"
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] bg-success/10 px-4 py-3 text-sm text-success"
              >
                <span className="flex items-center gap-2 font-medium">
                  <Check className="size-4" aria-hidden="true" />
                  تزاد للسلة بنجاح
                </span>
                <Button
                  type="button"
                  variant="link"
                  data-ocid="product.open_cart_button"
                  className="h-auto p-0 text-success"
                  onClick={openDrawer}
                >
                  شوف السلة
                </Button>
              </output>
            )}

            <p className="text-muted-foreground flex items-center gap-2 text-xs">
              <Truck className="size-4 shrink-0" aria-hidden="true" />
              التوصيل متوفر داخل المدن الكبرى، والدفع كيكون عند التسليم.
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section
          data-ocid="product.related_section"
          className="container mt-14 space-y-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-bold">
                <span className="accent-sparkle">منتوجات مشابهة</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                {category ? `من نفس صنف ${category}` : "منتوجات أخرى من المتجر"}
              </p>
            </div>
            <Button
              asChild
              type="button"
              variant="ghost"
              className="rounded-full"
            >
              <Link
                to="/products"
                search={{}}
                data-ocid="product.view_all_link"
              >
                شوف الكل
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul
            data-ocid="product.related_list"
            className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          >
            {relatedProducts.map((item, index) => (
              <li
                key={item.id.toString()}
                data-ocid={`product.related_item.${index + 1}`}
              >
                <ProductCard
                  product={item}
                  categories={categories}
                  index={index}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
