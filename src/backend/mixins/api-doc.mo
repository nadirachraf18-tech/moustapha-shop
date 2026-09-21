mixin () {
  /// Static Markdown description of this backend's public API.
  public query func getApiDoc() : async Text {
    "# Moustapha Shop — Backend API

## Purpose

This canister is the backend of **Moustapha Shop**, an Arabic (Moroccan) storefront.
It persists the product catalog (products and categories), the storefront settings
shown on the home page, and the platform authorization state. It also exposes the
catalog through the Caffeine Object Query Layer (OQL) so the Data Intelligence
agent can answer natural-language questions over it.

## Public methods

### Catalog reads (no sign-in required)

- `listCategories() : async [Category]` — every category, ordered by name.
- `listProducts(filter : ProductFilter) : async [Product]` — products matching
  `filter.categoryId` (exact category), `filter.search` (case-insensitive
  substring over product name and description), sorted by `filter.sort`.
  `null` fields mean \"no filter\" / \"default sort\".
- `getProduct(id : ProductId) : async ?Product` — one product, or `null` when no
  product has that id.
- `listFeaturedProducts() : async [Product]` — products flagged `featured`, for
  the home-page strip.
- `listRelatedProducts(id : ProductId) : async [Product]` — other products in the
  same category as `id`, newest first and capped to a small number of items.
  Returns `[]` when `id` does not exist.
- `getStoreSettings() : async StoreSettings` — shop name, tagline, phone,
  WhatsApp number, address and opening hours.

### Catalog mutations (admin only)

- `createCategory(name : Text) : async Result<Category, CatalogError>`
- `renameCategory(id : CategoryId, name : Text) : async Result<Category, CatalogError>`
- `deleteCategory(id : CategoryId) : async Result<(), CatalogError>`
- `createProduct(input : ProductInput) : async Result<Product, CatalogError>`
- `updateProduct(id : ProductId, update : ProductUpdate) : async Result<Product, CatalogError>`
- `deleteProduct(id : ProductId) : async Result<(), CatalogError>`
- `setProductAvailability(id : ProductId, available : Bool) : async Result<Product, CatalogError>`
- `updateStoreSettings(settings : StoreSettings) : async Result<StoreSettings, CatalogError>`

### Documentation

- `getApiDoc() : async Text` — this document.

### Platform methods

The canister also includes the platform authorization mixin
(`_initialize_access_control`, `_getCallerUserRole`, `_isCallerAdmin`,
`_assignCallerUserRole`, `_getAllUsers`, `_getUser`), the object-storage mixin
(blob upload/download endpoints), and the OQL mixin (`schema`, `execute`).

## Authentication and authorization

- **Anonymous callers** may call every catalog read listed above and
  `getApiDoc`. They may not call any mutation.
- **Signed-in callers** are identified by their Internet Identity principal.
  Signing in alone grants no catalog privileges.
- **Admins** are the only callers allowed to mutate the catalog or the store
  settings. Every mutation checks the caller's role and returns
  `#err(#notAuthorized)` when the caller is not an admin — it does not trap.
- The first caller to invoke `_initialize_access_control` becomes the app's
  **owner/admin**; later callers receive the default non-admin role. A caller
  that has never signed in through the app's frontend is unregistered, and an
  unregistered caller is not an admin even if it is the app owner's principal.

### Identity derivation

The app's frontend pins an Internet Identity **derivation origin**, published at
`/.well-known/ii-derivation-origin` when available. An agent that already holds
the user's Internet Identity authorization derives the correct per-app principal
against that origin, for example:

```
icp identity link web <name> --app <host>
```

A principal derived against a different origin is a **different principal** than
the one the frontend registered, so it will not carry that user's admin role.
Such a delegation acts with the user's full authority in this app until it
expires — treat it as a credential.

## Units and encodings

- `price` is a whole number of **centimes** (the minor unit of the Moroccan
  dirham), not dirhams: **1 MAD = 100 centimes**. It is a `Nat` with no decimal
  part, so the value is always 100× the dirham amount. For example, `12000`
  means **120.00 MAD**, and `120` means 1.20 MAD. When writing a price, multiply
  the dirham amount by 100; when displaying one, divide by 100.
- `createdAt` / `updatedAt` are Unix timestamps in **nanoseconds** (`Int`), as
  returned by `Time.now()`. Divide by 1_000_000_000 for seconds.
- `ProductId` and `CategoryId` are `Nat` identifiers assigned by the canister.
- `ProductImage.blob` is an object-storage `ExternalBlob` reference. Pass it
  back unchanged; never parse a file type out of the blob URL — use
  `ProductImage.mimeType` for that.
- `ProductFilter.sort` is the variant `#newest | #priceLowToHigh | #priceHighToLow`.
- `CatalogError` is the variant `#notAuthorized | #notFound | #invalidInput(Text)
  | #categoryInUse | #duplicateName`. Branch on the tag, not on a message string.

## Lifecycle and polling

- All catalog reads are `query` calls: they are fast, unreplicated, and never
  change state. Poll them freely; there is no rate limit or completion state.
- Mutations are update calls. A mutation is complete when its `Result` resolves;
  there is nothing to poll afterwards. Re-read with `getProduct` /
  `listProducts` / `listCategories` to observe the new state.
- `deleteCategory` returns `#err(#categoryInUse)` while any product still
  references that category. Reassign or delete those products first, then retry.

## Mutation retry safety

- `createCategory` and `createProduct` are **not idempotent**: each successful
  call allocates a new id and creates a new row. A retry after a timeout that
  actually succeeded creates a duplicate. Re-read the list before retrying.
- `renameCategory`, `updateProduct`, `setProductAvailability` and
  `updateStoreSettings` are idempotent — applying the same values twice leaves
  the same state.
- `deleteProduct` and `deleteCategory` are destructive and idempotent in effect:
  a second call returns `#err(#notFound)` because the row is already gone.
- `updateProduct` treats `null` in `ProductUpdate` as \"leave unchanged\", so a
  retry cannot accidentally clear a field.

## Errors and gotchas

- Mutations never trap for caller mistakes; they return `#err(...)`. A trap
  means an invariant broke, not a user error.
- `#duplicateName` is returned when a category name already exists.
- `#invalidInput(Text)` carries a human-readable reason for rejected input
  (for example an empty name or a negative-looking price).
- `#notFound` is returned by mutations targeting a missing product or category;
  the read `getProduct` instead returns `null`.
- `listProducts` search is case-insensitive and matches substrings, so an empty
  search string matches everything.
- OQL `schema` and `execute` are available for the `category` and `product`
  tables; both are world-readable, matching the public catalog reads.
";
  };
};
