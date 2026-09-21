import { ProductImagePlaceholder } from "@/components/ProductImagePlaceholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/types";
import { PackageSearch, Pencil, Plus, Search, Trash2 } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  search: string;
  onSearchChange: (value: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onToggleAvailability: (product: Product, available: boolean) => void;
  onToggleFeatured: (product: Product, featured: boolean) => void;
  togglingId: string | null;
  togglingFeaturedId: string | null;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const SKELETON_IDS = Array.from(
  { length: 5 },
  (_, index) => `admin-product-skeleton-${index}`,
);

function firstImageUrl(product: Product): string | null {
  const image = product.images.find((entry) =>
    entry.mimeType.startsWith("image/"),
  );
  return image ? image.blob.getDirectURL() : null;
}

/** Admin product list with search and a quick availability toggle. */
export function ProductTable({
  products,
  categories,
  search,
  onSearchChange,
  isLoading,
  isError,
  onRetry,
  onToggleAvailability,
  onToggleFeatured,
  togglingId,
  togglingFeaturedId,
  onCreate,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const term = search.trim().toLowerCase();
  const filtered = term
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term),
      )
    : products;

  const categoryLabel = (product: Product) =>
    categories.find((category) => category.id === product.categoryId)?.name ??
    "بلا صنف";

  return (
    <section
      data-ocid="admin.products_section"
      className="rounded-[var(--radius-card)] border border-border bg-card shadow-subtle"
    >
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="font-display text-lg font-bold">
            <span className="accent-sparkle">المنتوجات</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            <span className="num font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            من {products.length} منتوج
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="قلب على منتوج…"
              aria-label="البحث في منتوجات لوحة التحكم"
              data-ocid="admin.product_search_input"
              className="h-10 rounded-full bg-secondary pe-9 sm:w-64"
            />
          </div>
          <Button
            type="button"
            data-ocid="admin.product_create_button"
            onClick={onCreate}
            className="h-10 rounded-full bg-gradient-primary px-5 text-primary-foreground shadow-glow-pink"
          >
            <Plus className="size-4" aria-hidden="true" />
            منتوج جديد
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div
          data-ocid="admin.products_loading_state"
          aria-busy="true"
          aria-label="جاري تحميل المنتوجات"
          className="space-y-3 p-4 sm:p-5"
        >
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div
          data-ocid="admin.products_error_state"
          className="flex flex-col items-center gap-3 px-6 py-14 text-center"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <PackageSearch className="size-6" aria-hidden="true" />
          </span>
          <p className="text-sm text-muted-foreground">
            ما قدرناش نحمّلو لائحة المنتوجات.
          </p>
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.products_retry_button"
            onClick={onRetry}
            className="h-10 rounded-full px-5"
          >
            عاود المحاولة
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="admin.products_empty_state"
          className="flex flex-col items-center gap-3 px-6 py-14 text-center"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <PackageSearch className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display font-semibold">
              {products.length === 0
                ? "ما كاين حتى منتوج دابا"
                : "ما لقيناش نتائج"}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {products.length === 0
                ? "زيد أول منتوج باش يبان فالمتجر."
                : "جرّب كلمة بحث أخرى."}
            </p>
          </div>
          {products.length === 0 && (
            <Button
              type="button"
              data-ocid="admin.products_empty_create_button"
              onClick={onCreate}
              className="h-10 rounded-full bg-gradient-primary px-5 text-primary-foreground shadow-glow-pink"
            >
              <Plus className="size-4" aria-hidden="true" />
              زيد منتوج
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="admin.products_table">
            <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur">
              <TableRow>
                <TableHead className="text-start">المنتوج</TableHead>
                <TableHead className="text-start">الصنف</TableHead>
                <TableHead className="text-start">الثمن</TableHead>
                <TableHead className="text-start">الحالة</TableHead>
                <TableHead className="text-start">مميز</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product, index) => {
                const imageUrl = firstImageUrl(product);
                const isToggling = togglingId === product.id.toString();
                const isTogglingFeatured =
                  togglingFeaturedId === product.id.toString();
                return (
                  <TableRow
                    key={product.id.toString()}
                    data-ocid={`admin.product_row.${index + 1}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              loading="lazy"
                              className="size-full object-cover"
                            />
                          ) : (
                            <ProductImagePlaceholder
                              label={`${product.name} — بلا صورة`}
                              showCaption={false}
                            />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[16rem] truncate font-medium">
                            {product.name}
                          </span>
                          <span className="block text-muted-foreground text-xs">
                            <span className="num">{product.images.length}</span>{" "}
                            صورة
                          </span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {categoryLabel(product)}
                    </TableCell>
                    <TableCell className="text-price text-sm">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.available}
                          disabled={isToggling}
                          aria-label={`تبديل توفر ${product.name}`}
                          data-ocid={`admin.product_availability_switch.${index + 1}`}
                          onCheckedChange={(checked) =>
                            onToggleAvailability(product, checked)
                          }
                        />
                        <span className="text-xs">
                          {product.available ? (
                            <Badge className="badge-pill border-transparent bg-success text-success-foreground">
                              متوفر
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="badge-pill border-transparent text-muted-foreground"
                            >
                              غير متوفر
                            </Badge>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.featured}
                          disabled={isTogglingFeatured}
                          aria-label={`تبديل تمييز ${product.name}`}
                          data-ocid={`admin.product_featured_switch.${index + 1}`}
                          onCheckedChange={(checked) =>
                            onToggleFeatured(product, checked)
                          }
                        />
                        <span className="text-xs">
                          {product.featured ? (
                            <Badge
                              variant="outline"
                              className="badge-pill border-accent/50 text-accent"
                            >
                              مميز
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`عدّل ${product.name}`}
                          data-ocid={`admin.product_edit_button.${index + 1}`}
                          onClick={() => onEdit(product)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`حيّد ${product.name}`}
                          data-ocid={`admin.product_delete_button.${index + 1}`}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDelete(product)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
