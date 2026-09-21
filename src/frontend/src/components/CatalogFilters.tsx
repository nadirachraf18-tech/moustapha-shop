import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/types";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

/** Sentinel used by the category select for "all categories". */
export const ALL_CATEGORIES = "all";

export interface CatalogFilterValues {
  category: string;
  search: string;
  sort: string;
}

interface CatalogFiltersProps {
  categories: Category[];
  values: CatalogFilterValues;
  onCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "priceLowToHigh", label: "الثمن: من الأرخص للأغلى" },
  { value: "priceHighToLow", label: "الثمن: من الأغلى للأرخص" },
] as const;

export function CatalogFilters({
  categories,
  values,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onReset,
  hasActiveFilters,
}: CatalogFiltersProps) {
  const [draft, setDraft] = useState(values.search);

  // Keep the input in sync when the URL search term changes from elsewhere
  // (header search, reset action, shared link) without fighting the user.
  useEffect(() => {
    setDraft(values.search);
  }, [values.search]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchChange(draft.trim());
  };

  return (
    <section
      data-ocid="catalog.filters"
      aria-label="تصفية المنتوجات"
      className="rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-subtle sm:p-5"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <form onSubmit={submitSearch} className="flex flex-col gap-2">
          <Label htmlFor="catalog-search" className="text-sm font-semibold">
            البحث
          </Label>{" "}
          <div className="relative">
            <Search
              className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="catalog-search"
              type="search"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="سمية المنتج ولا وصفو…"
              data-ocid="catalog.search_input"
              className="h-11 rounded-full bg-secondary pe-9"
            />
          </div>
        </form>

        <div className="grid gap-4 sm:grid-cols-2 lg:w-[26rem]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="catalog-category" className="text-sm font-semibold">
              الصنف
            </Label>
            <Select value={values.category} onValueChange={onCategoryChange}>
              <SelectTrigger
                id="catalog-category"
                data-ocid="catalog.category_select"
                className="h-11 rounded-full bg-secondary"
              >
                <SelectValue placeholder="كل الأصناف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>كل الأصناف</SelectItem>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id.toString()}
                    value={category.id.toString()}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="catalog-sort" className="text-sm font-semibold">
              الترتيب
            </Label>
            <Select value={values.sort} onValueChange={onSortChange}>
              <SelectTrigger
                id="catalog-sort"
                data-ocid="catalog.sort_select"
                className="h-11 rounded-full bg-secondary"
              >
                <SelectValue placeholder="الأحدث" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            data-ocid="catalog.reset_button"
            className="h-10 gap-2 rounded-full text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            <X className="size-4" aria-hidden="true" />
            مسح التصفية
          </Button>
        </div>
      )}
    </section>
  );
}
