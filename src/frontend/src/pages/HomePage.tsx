import { BrandMark } from "@/components/BrandMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { ProductCard } from "@/components/ProductCard";
import { StoreInfo } from "@/components/StoreInfo";
import { Button } from "@/components/ui/button";
import {
  useCategories,
  useFeaturedProducts,
  useStoreSettings,
} from "@/hooks/use-catalog";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";

const FALLBACK_SHOP_NAME = "MOUSTAPHA SHOP";
const FALLBACK_TAGLINE = "منتوجات مغربية أصيلة مختارة بعناية";

export function HomePage() {
  const { data: settings } = useStoreSettings();
  const { data: featured, isLoading: isFeaturedLoading } =
    useFeaturedProducts();
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();

  const shopName = settings?.shopName ?? FALLBACK_SHOP_NAME;
  const tagline = settings?.tagline ?? FALLBACK_TAGLINE;

  const featuredProducts = featured ?? [];
  const categoryList = categories ?? [];

  return (
    <div data-ocid="home.page" className="pb-4">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        data-ocid="home.hero_section"
        className="relative overflow-hidden border-b border-border bg-gradient-subtle"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 start-1/4 size-[28rem] rounded-full bg-primary/20 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 end-0 size-[22rem] rounded-full bg-accent/10 blur-[110px]"
        />

        <div className="container relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <span className="badge-pill border border-accent/40 bg-accent/10 text-accent shadow-glow-gold">
              <Sparkles className="size-3.5" aria-hidden="true" />
              مختارات مغربية أصيلة
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              <BrandWordmark name={shopName} size="lg" sparkle />
            </h1>
            <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
              {tagline}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                type="button"
                size="lg"
                className="rounded-full bg-gradient-price text-price-foreground shadow-glow-gold transition-smooth hover:-translate-y-0.5 hover:opacity-95"
              >
                <Link to="/products" search={{}} data-ocid="home.browse_button">
                  تسوق دابا
                  <ArrowLeft className="size-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                type="button"
                size="lg"
                variant="outline"
                className="rounded-full border-accent/50 text-accent transition-smooth hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10 hover:text-accent"
              >
                <a href="#store-info" data-ocid="home.contact_button">
                  معلومات المتجر
                </a>
              </Button>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div
              aria-hidden="true"
              className="absolute inset-0 -rotate-3 rounded-[var(--radius-card)] bg-gradient-primary opacity-25 blur-sm"
            />
            <div className="relative flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-[var(--radius-card)] border border-border bg-card p-10 text-center shadow-elevated">
              <BrandMark size={112} />
              <BrandWordmark name={shopName} size="md" sparkle />
              <p className="text-muted-foreground text-sm leading-relaxed">
                {tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category shortcuts ───────────────────────────────────────────── */}
      {(isCategoriesLoading || categoryList.length > 0) && (
        <section
          data-ocid="home.categories_section"
          className="container py-12 md:py-16"
        >
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-bold md:text-4xl">
                <span className="accent-sparkle">الأصناف</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                دخل مباشرة على الصنف اللي كتقليب عليه.
              </p>
            </div>
            <Link
              to="/products"
              search={{}}
              data-ocid="home.all_categories_link"
              className="text-primary shrink-0 text-sm font-semibold transition-colors hover:underline"
            >
              شوف الكل
            </Link>
          </div>

          {isCategoriesLoading ? (
            <div
              data-ocid="home.categories_loading_state"
              className="flex flex-wrap gap-3"
            >
              {["c1", "c2", "c3", "c4", "c5"].map((key) => (
                <div
                  key={key}
                  className="h-11 w-28 animate-pulse rounded-full border border-border bg-secondary"
                />
              ))}
            </div>
          ) : (
            <ul
              data-ocid="home.categories_list"
              className="flex flex-wrap gap-3"
            >
              {categoryList.map((category, index) => (
                <li key={category.id.toString()}>
                  <Link
                    to="/products"
                    search={{ category: category.id.toString() }}
                    data-ocid={`home.category_link.${index + 1}`}
                    className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold shadow-subtle transition-smooth hover:-translate-y-0.5 hover:border-accent/60 hover:text-primary hover:shadow-glow-pink"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ── Featured products ────────────────────────────────────────────── */}
      {(isFeaturedLoading || featuredProducts.length > 0) && (
        <section
          data-ocid="home.featured_section"
          className="border-y border-border bg-secondary/40 py-12 md:py-16"
        >
          <div className="container">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold md:text-4xl">
                  <span className="accent-sparkle">منتوجات مختارة</span>
                </h2>
                <p className="text-muted-foreground text-sm">
                  أحسن اللي عندنا، مختارين ليك بيد.
                </p>
              </div>
              <Link
                to="/products"
                search={{}}
                data-ocid="home.all_products_link"
                className="text-primary shrink-0 text-sm font-semibold transition-colors hover:underline"
              >
                شوف الكل
              </Link>
            </div>

            {isFeaturedLoading ? (
              <div
                data-ocid="home.featured_loading_state"
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
              >
                {["f1", "f2", "f3", "f4"].map((key) => (
                  <div
                    key={key}
                    className="h-72 animate-pulse rounded-[var(--radius-card)] border border-border bg-card"
                  />
                ))}
              </div>
            ) : (
              <div
                data-ocid="home.featured_list"
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
              >
                {featuredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id.toString()}
                    product={product}
                    categories={categoryList}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Store info ───────────────────────────────────────────────────── */}
      <section
        id="store-info"
        data-ocid="home.store_info_section"
        className="container scroll-mt-20 py-12 md:py-16"
      >
        <div className="mb-6 space-y-1">
          <h2 className="font-display text-2xl font-bold md:text-4xl">
            <span className="accent-sparkle">معلومات المتجر</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            دوز علينا ولا عيط لينا، حنا هنا باش نعاونوك.
          </p>
        </div>
        <StoreInfo />
      </section>
    </div>
  );
}
