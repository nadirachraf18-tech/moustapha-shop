import { ALL_CATEGORIES, CatalogFilters } from "@/components/CatalogFilters";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts } from "@/hooks/use-catalog";
import { formatCount } from "@/lib/format";
import type { ProductFilter, ProductSort } from "@/types";
import { ProductSortEnum } from "@/types";
import { Link, getRouteApi, useNavigate } from "@tanstack/react-router";
import { PackageSearch, SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const catalogRoute = getRouteApi("/products");

const SORT_VALUES = new Set<string>([
  ProductSortEnum.newest,
  ProductSortEnum.priceLowToHigh,
  ProductSortEnum.priceHighToLow,
]);

const SKELETON_IDS = Array.from(
  { length: 8 },
  (_, index) => `catalog-skeleton-${index}`,
);

export function CatalogPage() {
  const search = catalogRoute.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const { data: categories } = useCategories();

  const category = search.category ?? ALL_CATEGORIES;
  const sort = search.sort ?? ProductSortEnum.newest;
  const searchTerm = search.search ?? "";

  const filter = useMemo<ProductFilter>(() => {
    const next: ProductFilter = {};
    if (category !== ALL_CATEGORIES) {
      try {
        next.categoryId = BigInt(category);
      } catch {
        // Ignore a malformed category id from a hand-edited URL.
      }
    }
    if (searchTerm) next.search = searchTerm;
    if (SORT_VALUES.has(sort)) next.sort = sort as ProductSort;
    return next;
  }, [category, searchTerm, sort]);

  const { data: products, isLoading, isError, refetch } = useProducts(filter);

  const hasActiveFilters =
    category !== ALL_CATEGORIES ||
    searchTerm !== "" ||
    sort !== ProductSortEnum.newest;

  const updateSearch = (patch: {
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (!next.category || next.category === ALL_CATEGORIES) {
          next.category = undefined;
        }
        if (!next.search) next.search = undefined;
        if (!next.sort || next.sort === ProductSortEnum.newest) {
          next.sort = undefined;
        }
        return next;
      },
      replace: true,
    });
  };

  const resetFilters = () => {
    void navigate({ search: {}, replace: true });
  };

  const resultCount = products?.length ?? 0;

  return (
    <div data-ocid="catalog.page" className="bg-background">
      <div className="relative overflow-hidden border-b border-border bg-gradient-subtle">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 start-1/3 size-80 rounded-full bg-primary/15 blur-[110px]"
        />
        <div className="container relative py-10 sm:py-12">
          <nav
            aria-label="مسار التنقل"
            className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              to="/"
              data-ocid="catalog.breadcrumb_home_link"
              className="transition-colors hover:text-foreground"
            >
              الرئيسية
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-foreground">المنتوجات</span>
          </nav>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            <span className="accent-sparkle">كل المنتوجات</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            تشكيلة مختارة من منتوجات المتجر، صفّي حسب الصنف ولا الثمن ولقى اللي
            كتقلب عليه بسهولة.
          </p>
        </div>
      </div>

      <div className="container py-8 sm:py-10">
        <CatalogFilters
          categories={categories ?? []}
          values={{ category, search: searchTerm, sort }}
          onCategoryChange={(value) => updateSearch({ category: value })}
          onSearchChange={(value) => updateSearch({ search: value })}
          onSortChange={(value) => updateSearch({ sort: value })}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="mt-6 flex items-center justify-between gap-4">
          <p
            data-ocid="catalog.result_count"
            className="text-sm text-muted-foreground"
          >
            {isLoading ? (
              "كنحمّلو المنتوجات…"
            ) : (
              <>
                <span className="num font-semibold text-foreground">
                  {formatCount(resultCount)}
                </span>{" "}
                {resultCount === 1 ? "منتج" : "منتوج"}
              </>
            )}
          </p>
        </div>

        {isLoading ? (
          <div
            data-ocid="catalog.loading_state"
            aria-busy="true"
            aria-label="جاري تحميل المنتوجات"
            className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {SKELETON_IDS.map((id) => (
              <div
                key={id}
                className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-card"
              >
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="flex flex-col gap-3 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            data-ocid="catalog.error_state"
            className="mt-6 flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-border bg-card px-6 py-16 text-center"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <PackageSearch className="size-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">
                ما قدرناش نحمّلو المنتوجات
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                وقع مشكل فالاتصال. عاود المحاولة من فضلك.
              </p>
            </div>
            <Button
              type="button"
              data-ocid="catalog.retry_button"
              className="h-11 rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-glow-pink"
              onClick={() => void refetch()}
            >
              عاود المحاولة
            </Button>
          </div>
        ) : resultCount === 0 ? (
          <div
            data-ocid="catalog.empty_state"
            className="mt-6 flex flex-col items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-border bg-card px-6 py-16 text-center"
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <SearchX className="size-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">
                ما لقيناش منتوجات
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                ما كاينش منتوج كيوافق هاد التصفية. جرّب كلمة أخرى ولا مسح
                التصفية.
              </p>
            </div>
            <Button
              type="button"
              data-ocid="catalog.empty_reset_button"
              className="h-11 rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-glow-pink"
              onClick={resetFilters}
            >
              مسح التصفية
            </Button>
          </div>
        ) : (
          <div
            data-ocid="catalog.list"
            className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {products?.map((product, index) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                categories={categories}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
