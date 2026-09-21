import { createActor } from "@/backend";
import type {
  Category,
  CategoryId,
  Product,
  ProductFilter,
  ProductId,
  StoreSettings,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

export const catalogKeys = {
  categories: ["catalog", "categories"] as const,
  products: (filter: ProductFilter) => ["catalog", "products", filter] as const,
  product: (id: string) => ["catalog", "product", id] as const,
  featured: ["catalog", "featured"] as const,
  related: (id: string) => ["catalog", "related", id] as const,
  settings: ["catalog", "settings"] as const,
};

/** All product categories, newest first as returned by the backend. */
export function useCategories() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Category[]>({
    queryKey: catalogKeys.categories,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Filtered + sorted product list. */
export function useProducts(filter: ProductFilter) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: catalogKeys.products(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single product by id. */
export function useProduct(id: ProductId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product | null>({
    queryKey: catalogKeys.product(id ? id.toString() : "none"),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

/** Products flagged as featured on the storefront home page. */
export function useFeaturedProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: catalogKeys.featured,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFeaturedProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Products related to the given product (same category). */
export function useRelatedProducts(id: ProductId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: catalogKeys.related(id ? id.toString() : "none"),
    queryFn: async () => {
      if (!actor || id === null) return [];
      return actor.listRelatedProducts(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

/** Shop contact details used by the header, footer and order handoff. */
export function useStoreSettings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<StoreSettings | null>({
    queryKey: catalogKeys.settings,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStoreSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Convenience: category id -> name lookup for product cards. */
export function categoryName(
  categories: Category[] | undefined,
  id: CategoryId,
): string | null {
  if (!categories) return null;
  const match = categories.find((category) => category.id === id);
  return match ? match.name : null;
}
