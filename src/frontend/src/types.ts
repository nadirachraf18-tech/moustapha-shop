import type {
  Category,
  CategoryId,
  Product,
  ProductFilter,
  ProductId,
  ProductImage,
  ProductSort,
  StoreSettings,
} from "@/backend";

export type {
  Category,
  CategoryId,
  Product,
  ProductFilter,
  ProductId,
  ProductImage,
  ProductSort,
  StoreSettings,
};

export { ProductSort as ProductSortEnum } from "@/backend";

/** A single line in the shopping cart. */
export interface CartLine {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

/** Shape of the persisted cart payload in localStorage. */
export interface PersistedCart {
  version: 1;
  lines: CartLine[];
}

export const CART_STORAGE_KEY = "moustapha-shop.cart.v1";
