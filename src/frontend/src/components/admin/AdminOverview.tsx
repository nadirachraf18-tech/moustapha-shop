import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCount } from "@/lib/format";
import type { Category, Product } from "@/types";
import {
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Package,
  PackagePlus,
  Pencil,
  Settings2,
  Sparkles,
  Tags,
} from "lucide-react";

interface AdminOverviewProps {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEditProduct: (product: Product) => void;
  onCreateProduct: () => void;
  onGoToCategories: () => void;
  onGoToSettings: () => void;
}

const SKELETON_IDS = Array.from(
  { length: 4 },
  (_, index) => `admin-overview-skeleton-${index}`,
);

const STOREFRONT_URL = "/";

/** Dashboard landing tab: shop health at a glance plus quick actions. */
export function AdminOverview({
  products,
  categories,
  isLoading,
  isError,
  onRetry,
  onEditProduct,
  onCreateProduct,
  onGoToCategories,
  onGoToSettings,
}: AdminOverviewProps) {
  const unavailable = products.filter((product) => !product.available);
  const featuredCount = products.filter((product) => product.featured).length;

  const stats = [
    {
      key: "products",
      label: "عدد المنتوجات",
      value: products.length,
      icon: Package,
      tone: "bg-primary/10 text-primary",
    },
    {
      key: "categories",
      label: "عدد الأصناف",
      value: categories.length,
      icon: Tags,
      tone: "bg-accent/15 text-accent",
    },
    {
      key: "unavailable",
      label: "غير متوفرة",
      value: unavailable.length,
      icon: AlertTriangle,
      tone: "bg-destructive/10 text-destructive",
    },
    {
      key: "featured",
      label: "مميزة",
      value: featuredCount,
      icon: Sparkles,
      tone: "bg-success/15 text-success",
    },
  ];

  const quickActions = (
    <section
      data-ocid="admin.overview_quick_actions_section"
      className="rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-subtle sm:p-5"
    >
      <h2 className="font-display text-lg font-bold">
        <span className="accent-sparkle">إجراءات سريعة</span>
      </h2>
      <p className="mt-1 text-muted-foreground text-sm">
        وصل بسرعة للأعمال اللي كتديرها بزاف.
      </p>
      <div className="mt-4 grid gap-3">
        <Button
          type="button"
          data-ocid="admin.overview_add_product_button"
          onClick={onCreateProduct}
          className="h-11 justify-start rounded-full bg-gradient-primary px-5 text-primary-foreground shadow-glow-pink"
        >
          <PackagePlus className="size-4" aria-hidden="true" />
          زيد منتوج
        </Button>
        <Button
          type="button"
          variant="outline"
          data-ocid="admin.overview_add_category_button"
          onClick={onGoToCategories}
          className="h-11 justify-start rounded-full px-5"
        >
          <Tags className="size-4" aria-hidden="true" />
          زيد صنف
        </Button>
        <Button
          type="button"
          variant="outline"
          data-ocid="admin.overview_edit_settings_button"
          onClick={onGoToSettings}
          className="h-11 justify-start rounded-full px-5"
        >
          <Settings2 className="size-4" aria-hidden="true" />
          بدّل معلومات المتجر
        </Button>
        <Button
          type="button"
          variant="outline"
          data-ocid="admin.overview_view_store_button"
          onClick={() => window.open(STOREFRONT_URL, "_blank", "noopener")}
          className="h-11 justify-start rounded-full px-5"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          شوف المتجر
        </Button>
      </div>
    </section>
  );

  if (isLoading) {
    return (
      <div
        data-ocid="admin.overview_loading_state"
        aria-busy="true"
        aria-label="جاري تحميل نظرة عامة"
        className="space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKELETON_IDS.map((id) => (
            <Skeleton
              key={id}
              className="h-28 w-full rounded-[var(--radius-card)]"
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-56 w-full rounded-[var(--radius-card)]" />
          {quickActions}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div data-ocid="admin.overview_section" className="space-y-6">
        <div
          data-ocid="admin.overview_error_state"
          className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-border bg-card px-6 py-14 text-center shadow-subtle"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </span>
          <p className="text-muted-foreground text-sm">
            ما قدرناش نحمّلو معطيات لوحة التحكم.
          </p>
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.overview_retry_button"
            onClick={onRetry}
            className="h-10 rounded-full px-5"
          >
            عاود المحاولة
          </Button>
        </div>
        {quickActions}
      </div>
    );
  }

  return (
    <div data-ocid="admin.overview_section" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.key}
              data-ocid={`admin.overview_stat_card.${index + 1}`}
              className="rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-subtle"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-sm">
                  {stat.label}
                </span>
                <span
                  className={`flex size-9 items-center justify-center rounded-full ${stat.tone}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <p className="num mt-3 font-display text-3xl font-bold">
                {formatCount(stat.value)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section
          data-ocid="admin.overview_unavailable_section"
          className="rounded-[var(--radius-card)] border border-border bg-card shadow-subtle"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
            <div>
              <h2 className="font-display text-lg font-bold">
                منتوجات غير متوفرة
              </h2>{" "}
              <p className="text-muted-foreground text-sm">
                منتوجات خاصها انتباه حيت ما كايناش معروضة للبيع دابا.
              </p>
            </div>
            <span className="num flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 font-semibold text-destructive text-sm">
              {formatCount(unavailable.length)}
            </span>
          </div>

          {unavailable.length === 0 ? (
            <div
              data-ocid="admin.overview_unavailable_empty_state"
              className="flex flex-col items-center gap-2 px-6 py-12 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
                <Package className="size-6" aria-hidden="true" />
              </span>
              <p className="font-display font-semibold">
                كلشي مزيان، كل المنتوجات متوفرة
              </p>
              <p className="text-muted-foreground text-sm">
                ما كاين حتى منتوج محتاج انتباه دابا.
              </p>
            </div>
          ) : (
            <ul
              data-ocid="admin.overview_unavailable_list"
              className="divide-y divide-border"
            >
              {unavailable.map((product, index) => (
                <li
                  key={product.id.toString()}
                  data-ocid={`admin.overview_unavailable_item.${index + 1}`}
                  className="flex items-center justify-between gap-3 p-4 sm:px-5"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {product.name}
                    </span>
                    <span className="block text-muted-foreground text-xs">
                      غير متوفر للبيع
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-ocid={`admin.overview_unavailable_edit_button.${index + 1}`}
                    onClick={() => onEditProduct(product)}
                    className="h-9 shrink-0 rounded-full px-4"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    عدّل
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {quickActions}
      </div>

      {products.length === 0 && (
        <section
          data-ocid="admin.overview_empty_state"
          className="rounded-[var(--radius-card)] border border-dashed border-border bg-secondary/40 px-6 py-12 text-center"
        >
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
            <PackagePlus className="size-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-xl font-bold">
            المتجر خاوي دابا
          </h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm">
            باش تبدا، زيد أول صنف من بعد أول منتوج. من بعد غادي يبانو فالمتجر
            مباشرة.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              data-ocid="admin.overview_empty_add_category_button"
              onClick={onGoToCategories}
              className="h-11 rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-glow-pink"
            >
              <Tags className="size-4" aria-hidden="true" />
              زيد أول صنف
            </Button>
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.overview_empty_add_product_button"
              onClick={onCreateProduct}
              className="h-11 rounded-full px-6"
            >
              <ArrowUpRight className="size-4" aria-hidden="true" />
              زيد أول منتوج
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
