import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export type CatalogError = {
    __kind__: "categoryInUse";
    categoryInUse: null;
} | {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "invalidInput";
    invalidInput: string;
} | {
    __kind__: "notFound";
    notFound: null;
} | {
    __kind__: "duplicateName";
    duplicateName: null;
};
export interface Category {
    id: CategoryId;
    name: string;
    createdAt: Timestamp;
}
export type CategoryId = bigint;
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Product {
    id: ProductId;
    categoryId: CategoryId;
    featured: boolean;
    name: string;
    createdAt: Timestamp;
    description: string;
    available: boolean;
    updatedAt: Timestamp;
    price: bigint;
    images: Array<ProductImage>;
}
export interface ProductFilter {
    categoryId?: CategoryId;
    sort?: ProductSort;
    search?: string;
}
export type ProductId = bigint;
export interface ProductImage {
    blob: ExternalBlob;
    mimeType: string;
    filename: string;
}
export interface ProductInput {
    categoryId: CategoryId;
    featured: boolean;
    name: string;
    description: string;
    available: boolean;
    price: bigint;
    images: Array<ProductImage>;
}
export interface ProductUpdate {
    categoryId?: CategoryId;
    featured?: boolean;
    name?: string;
    description?: string;
    available?: boolean;
    price?: bigint;
    images?: Array<ProductImage>;
}
export type Result = {
    __kind__: "ok";
    ok: StoreSettings;
} | {
    __kind__: "err";
    err: CatalogError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: Product;
} | {
    __kind__: "err";
    err: CatalogError;
};
export type Result_2 = {
    __kind__: "ok";
    ok: Category;
} | {
    __kind__: "err";
    err: CatalogError;
};
export type Result_3 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: CatalogError;
};
export type Result_4 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface StoreSettings {
    tagline: string;
    whatsappNumber: string;
    address: string;
    openingHours: string;
    shopName: string;
    phone: string;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum ProductSort {
    priceLowToHigh = "priceLowToHigh",
    newest = "newest",
    priceHighToLow = "priceHighToLow"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string): Promise<Result_2>;
    createProduct(input: ProductInput): Promise<Result_1>;
    deleteCategory(id: CategoryId): Promise<Result_3>;
    deleteProduct(id: ProductId): Promise<Result_3>;
    execute(qJson: string): Promise<Result__1>;
    /**
     * / Static Markdown description of this backend's public API.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getProduct(id: ProductId): Promise<Product | null>;
    getStoreSettings(): Promise<StoreSettings>;
    isCallerAdmin(): Promise<boolean>;
    listCategories(): Promise<Array<Category>>;
    listFeaturedProducts(): Promise<Array<Product>>;
    listProducts(filter: ProductFilter): Promise<Array<Product>>;
    listRelatedProducts(id: ProductId): Promise<Array<Product>>;
    renameCategory(id: CategoryId, name: string): Promise<Result_2>;
    schema(): Promise<string>;
    setProductAvailability(id: ProductId, available: boolean): Promise<Result_1>;
    updateProduct(id: ProductId, update: ProductUpdate): Promise<Result_1>;
    updateStoreSettings(settings: StoreSettings): Promise<Result>;
}
