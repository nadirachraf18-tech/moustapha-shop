import type {
  Category,
  Product,
  ProductFilter,
  ProductImage,
  StoreSettings,
} from "@/types";
import { ProductSortEnum } from "@/types";
import type { ExternalBlob } from "@caffeineai/object-storage";

/**
 * A minimal in-memory stand-in for the generated `Backend` actor, typed against
 * the app's own exported types. It implements only the public methods the
 * storefront and admin UI actually call, and records every call so tests can
 * assert on the consumer contract (e.g. the filter handed to `listProducts`).
 *
 * This is a local mock: it proves nothing about the real canister. The PocketIC
 * lane in `app/test/pocketic` is what exercises the compiled backend.
 */
export interface MockActor {
  listCategories(): Promise<Category[]>;
  createCategory(
    name: string,
  ): Promise<
    { __kind__: "ok"; ok: Category } | { __kind__: "err"; err: unknown }
  >;
  renameCategory(
    id: bigint,
    name: string,
  ): Promise<
    { __kind__: "ok"; ok: Category } | { __kind__: "err"; err: unknown }
  >;
  deleteCategory(
    id: bigint,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: unknown }>;
  listProducts(filter: ProductFilter): Promise<Product[]>;
  getProduct(id: bigint): Promise<Product | null>;
  listFeaturedProducts(): Promise<Product[]>;
  listRelatedProducts(id: bigint): Promise<Product[]>;
  createProduct(
    input: unknown,
  ): Promise<
    { __kind__: "ok"; ok: Product } | { __kind__: "err"; err: unknown }
  >;
  updateProduct(
    id: bigint,
    update: unknown,
  ): Promise<
    { __kind__: "ok"; ok: Product } | { __kind__: "err"; err: unknown }
  >;
  deleteProduct(
    id: bigint,
  ): Promise<{ __kind__: "ok"; ok: null } | { __kind__: "err"; err: unknown }>;
  setProductAvailability(
    id: bigint,
    available: boolean,
  ): Promise<
    { __kind__: "ok"; ok: Product } | { __kind__: "err"; err: unknown }
  >;
  getStoreSettings(): Promise<StoreSettings>;
  updateStoreSettings(
    settings: StoreSettings,
  ): Promise<
    { __kind__: "ok"; ok: StoreSettings } | { __kind__: "err"; err: unknown }
  >;
  isCallerAdmin(): Promise<boolean>;
  getCallerUserRole(): Promise<string>;
}

export interface MockActorState {
  categories: Category[];
  products: Product[];
  settings: StoreSettings;
  isAdmin: boolean;
  /** Every `listProducts` filter the UI passed, in call order. */
  productFilters: ProductFilter[];
}

export const DEFAULT_SETTINGS: StoreSettings = {
  shopName: "متجر مصطفى",
  tagline: "منتوجات مغربية أصيلة مختارة بعناية",
  phone: "0612345678",
  whatsappNumber: "+212 612 345 678",
  address: "شارع محمد الخامس، الدار البيضاء",
  openingHours: "من الاثنين للسبت، من 9:00 حتى 20:00",
};

/** A fake image blob whose `getDirectURL` returns a stable data URL. */
export function fakeImage(
  filename: string,
  mimeType = "image/png",
): ProductImage {
  const blob = {
    getDirectURL: () => `https://example.test/${filename}`,
  } as unknown as ExternalBlob;
  return { blob, filename, mimeType };
}

export function makeCategory(id: number, name: string): Category {
  return { id: BigInt(id), name, createdAt: BigInt(1_700_000_000_000_000_000) };
}

export function makeProduct(
  overrides: Omit<Partial<Product>, "id"> & { id: number },
): Product {
  const { id, ...rest } = overrides;
  return {
    id: BigInt(id),
    name: `منتج ${id}`,
    price: BigInt(10_000),
    categoryId: BigInt(1),
    description: `وصف المنتج ${id}`,
    available: true,
    featured: false,
    images: [],
    createdAt: BigInt(1_700_000_000_000_000_000 + id),
    updatedAt: BigInt(1_700_000_000_000_000_000 + id),
    ...rest,
  };
}

function sortProducts(
  products: Product[],
  sort: ProductFilter["sort"],
): Product[] {
  const copy = [...products];
  switch (sort) {
    case ProductSortEnum.priceLowToHigh:
      return copy.sort((a, b) => Number(a.price - b.price));
    case ProductSortEnum.priceHighToLow:
      return copy.sort((a, b) => Number(b.price - a.price));
    default:
      return copy.sort((a, b) => Number(b.createdAt - a.createdAt));
  }
}

/**
 * Build a mock actor over a mutable state object. The state is returned so a
 * test can seed products/categories and inspect recorded calls.
 */
export function createMockActor(seed: Partial<MockActorState> = {}): {
  actor: MockActor;
  state: MockActorState;
} {
  const state: MockActorState = {
    categories: seed.categories ?? [],
    products: seed.products ?? [],
    settings: seed.settings ?? DEFAULT_SETTINGS,
    isAdmin: seed.isAdmin ?? false,
    productFilters: [],
  };

  const ok = <T>(value: T) => ({ __kind__: "ok" as const, ok: value });

  const actor: MockActor = {
    async listCategories() {
      return [...state.categories].sort((a, b) => a.name.localeCompare(b.name));
    },
    async createCategory(name) {
      const category = makeCategory(state.categories.length + 1, name);
      state.categories.push(category);
      return ok(category);
    },
    async renameCategory(id, name) {
      const category = state.categories.find((entry) => entry.id === id);
      if (!category) return { __kind__: "err", err: { __kind__: "notFound" } };
      category.name = name;
      return ok(category);
    },
    async deleteCategory(id) {
      state.categories = state.categories.filter((entry) => entry.id !== id);
      return ok(null);
    },
    async listProducts(filter) {
      state.productFilters.push(filter);
      let matched = state.products.filter((product) => {
        if (
          filter.categoryId !== undefined &&
          product.categoryId !== filter.categoryId
        ) {
          return false;
        }
        if (filter.search) {
          const term = filter.search.toLowerCase();
          return (
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term)
          );
        }
        return true;
      });
      matched = sortProducts(matched, filter.sort);
      return matched;
    },
    async getProduct(id) {
      return state.products.find((product) => product.id === id) ?? null;
    },
    async listFeaturedProducts() {
      return sortProducts(
        state.products.filter((product) => product.featured),
        ProductSortEnum.newest,
      );
    },
    async listRelatedProducts(id) {
      const product = state.products.find((entry) => entry.id === id);
      if (!product) return [];
      return sortProducts(
        state.products.filter(
          (entry) => entry.id !== id && entry.categoryId === product.categoryId,
        ),
        ProductSortEnum.newest,
      ).slice(0, 4);
    },
    async createProduct(input) {
      const value = input as {
        name: string;
        price: bigint;
        categoryId: bigint;
        description: string;
        available: boolean;
        featured: boolean;
        images: ProductImage[];
      };
      const product = makeProduct({
        id: state.products.length + 1,
        ...value,
      });
      state.products.push(product);
      return ok(product);
    },
    async updateProduct(id, update) {
      const index = state.products.findIndex((entry) => entry.id === id);
      if (index < 0) return { __kind__: "err", err: { __kind__: "notFound" } };
      const merged = {
        ...state.products[index],
        ...(update as object),
      } as Product;
      state.products[index] = merged;
      return ok(merged);
    },
    async deleteProduct(id) {
      state.products = state.products.filter((entry) => entry.id !== id);
      return ok(null);
    },
    async setProductAvailability(id, available) {
      const product = state.products.find((entry) => entry.id === id);
      if (!product) return { __kind__: "err", err: { __kind__: "notFound" } };
      product.available = available;
      return ok(product);
    },
    async getStoreSettings() {
      return state.settings;
    },
    async updateStoreSettings(settings) {
      state.settings = settings;
      return ok(settings);
    },
    async isCallerAdmin() {
      return state.isAdmin;
    },
    async getCallerUserRole() {
      return state.isAdmin ? "admin" : "guest";
    },
  };

  return { actor, state };
}
