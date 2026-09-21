import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

/**
 * PocketIC backend lane for Moustapha Shop.
 *
 * This is the only place the compiled canister is actually executed. The
 * frontend suite mocks the actor, so it would pass unchanged against a backend
 * whose public methods are all `Debug.todo()` stubs; this file installs
 * `src/backend/dist/backend.wasm` into the platform's PocketIC replica and
 * calls the real public API.
 *
 * It is a new-app build, so there is no previous revision to upgrade from and
 * no `*.upgrade.test.ts` file here.
 */

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

/** The installing identity is the canister's initial admin. */
const admin = createIdentity("moustapha-admin");
/** A second caller with no admin role, used for the authorization checks. */
const guest = createIdentity("moustapha-guest");

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
    sender: admin.getPrincipal(),
  }));

  // The backend's documented contract: the first caller to invoke
  // `_initialize_access_control` becomes the app's owner/admin, and a caller
  // that has never registered is not an admin even if it installed the
  // canister. Register the admin identity before any mutation is attempted.
  actor.setIdentity(admin);
  await actor._initialize_access_control();
  await expect(actor.isCallerAdmin()).resolves.toBe(true);
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far; a failed
  // `PocketIc.create` otherwise buries the real error under a TypeError.
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  await expect(actor.listCategories()).resolves.toEqual([]);
  await expect(actor.listProducts({ categoryId: [], search: [], sort: [] })).resolves.toEqual([]);
  await expect(actor.listFeaturedProducts()).resolves.toEqual([]);
  await expect(actor.listRelatedProducts(1n)).resolves.toEqual([]);
  await expect(actor.getProduct(1n)).resolves.toEqual([]);
});

it("returns default store settings before an admin saves any", async () => {
  const settings = await actor.getStoreSettings();
  expect(settings.shopName).toBe("Moustapha Shop");
  expect(typeof settings.tagline).toBe("string");
});

it("round-trips a category through the real canister", async () => {
  actor.setIdentity(admin);
  const created = await actor.createCategory("أواني المطبخ");
  expect(created).toHaveProperty("ok");
  const category = (created as { ok: { id: bigint; name: string } }).ok;
  expect(category.name).toBe("أواني المطبخ");

  const categories = await actor.listCategories();
  expect(categories).toContainEqual(expect.objectContaining({ id: category.id, name: "أواني المطبخ" }));
});

it("round-trips a product and filters it by category and search", async () => {
  actor.setIdentity(admin);
  const category = (await actor.createCategory("الزرابي")) as {
    ok: { id: bigint };
  };
  const categoryId = category.ok.id;

  const created = await actor.createProduct({
    name: "زربية أطلس",
    price: 30_000n,
    categoryId,
    description: "زربية مصنوعة باليد",
    available: true,
    featured: true,
    images: [],
  });
  expect(created).toHaveProperty("ok");
  const product = (created as { ok: { id: bigint } }).ok;

  // Read it back by id.
  const fetched = await actor.getProduct(product.id);
  expect(fetched).toHaveLength(1);
  expect(fetched[0]).toMatchObject({ name: "زربية أطلس", price: 30_000n, categoryId });

  // Category filter narrows to it.
  const byCategory = await actor.listProducts({ categoryId: [categoryId], search: [], sort: [] });
  expect(byCategory.map((entry) => entry.name)).toContain("زربية أطلس");

  // Free-text search matches the description.
  const bySearch = await actor.listProducts({ categoryId: [], search: ["مصنوعة باليد"], sort: [] });
  expect(bySearch.map((entry) => entry.name)).toContain("زربية أطلس");

  // A non-matching search returns nothing.
  const noMatch = await actor.listProducts({ categoryId: [], search: ["zzz"], sort: [] });
  expect(noMatch).toEqual([]);

  // Featured listing includes it.
  const featured = await actor.listFeaturedProducts();
  expect(featured.map((entry) => entry.name)).toContain("زربية أطلس");
});

it("sorts products by price in both directions", async () => {
  actor.setIdentity(admin);
  const category = (await actor.createCategory("الحلي")) as { ok: { id: bigint } };
  const categoryId = category.ok.id;

  for (const [name, price] of [
    ["خاتم فضي", 5_000n],
    ["قلادة ذهبية", 90_000n],
  ] as const) {
    await actor.createProduct({
      name,
      price,
      categoryId,
      description: name,
      available: true,
      featured: false,
      images: [],
    });
  }

  const lowToHigh = await actor.listProducts({
    categoryId: [categoryId],
    search: [],
    sort: [{ priceLowToHigh: null }],
  });
  expect(lowToHigh.map((entry) => entry.name)).toEqual(["خاتم فضي", "قلادة ذهبية"]);

  const highToLow = await actor.listProducts({
    categoryId: [categoryId],
    search: [],
    sort: [{ priceHighToLow: null }],
  });
  expect(highToLow.map((entry) => entry.name)).toEqual(["قلادة ذهبية", "خاتم فضي"]);
});

it("updates, toggles availability and deletes a product", async () => {
  actor.setIdentity(admin);
  const category = (await actor.createCategory("الملابس")) as { ok: { id: bigint } };
  const categoryId = category.ok.id;
  const created = (await actor.createProduct({
    name: "جلابة",
    price: 20_000n,
    categoryId,
    description: "جلابة مغربية",
    available: true,
    featured: false,
    images: [],
  })) as { ok: { id: bigint } };
  const id = created.ok.id;

  const renamed = await actor.updateProduct(id, {
    name: ["جلابة مطرزة"],
    price: [],
    categoryId: [],
    description: [],
    available: [],
    featured: [],
    images: [],
  });
  expect(renamed).toHaveProperty("ok");
  expect((renamed as { ok: { name: string } }).ok.name).toBe("جلابة مطرزة");

  const toggled = await actor.setProductAvailability(id, false);
  expect(toggled).toHaveProperty("ok");
  expect((toggled as { ok: { available: boolean } }).ok.available).toBe(false);

  await expect(actor.deleteProduct(id)).resolves.toHaveProperty("ok");
  await expect(actor.getProduct(id)).resolves.toEqual([]);
});

it("renames and deletes a category, refusing to delete one in use", async () => {
  actor.setIdentity(admin);
  const category = (await actor.createCategory("مؤقت")) as { ok: { id: bigint } };
  const id = category.ok.id;

  const renamed = await actor.renameCategory(id, "مؤقت 2");
  expect(renamed).toHaveProperty("ok");
  expect((renamed as { ok: { name: string } }).ok.name).toBe("مؤقت 2");

  await actor.createProduct({
    name: "منتج مؤقت",
    price: 1_000n,
    categoryId: id,
    description: "",
    available: true,
    featured: false,
    images: [],
  });
  const inUse = await actor.deleteCategory(id);
  expect(inUse).toHaveProperty("err");

  await expect(actor.deleteCategory(999_999n)).resolves.toHaveProperty("err");
});

it("persists store settings written by an admin", async () => {
  actor.setIdentity(admin);
  const settings = {
    shopName: "متجر مصطفى",
    tagline: "منتوجات مغربية أصيلة",
    phone: "0612345678",
    whatsappNumber: "+212 612 345 678",
    address: "شارع محمد الخامس، الدار البيضاء",
    openingHours: "من الاثنين للسبت",
  };
  const saved = await actor.updateStoreSettings(settings);
  expect(saved).toHaveProperty("ok");
  await expect(actor.getStoreSettings()).resolves.toEqual(settings);
});

it("rejects a non-admin caller on every admin mutation", async () => {
  const guestActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  guestActor.setIdentity(guest);

  // Register the guest as a signed-in caller. The first caller already took the
  // owner/admin role, so this caller receives the default non-admin role — and
  // the documented contract is that a registered non-admin gets `#err`, not a
  // trap.
  await guestActor._initialize_access_control();
  await expect(guestActor.isCallerAdmin()).resolves.toBe(false);

  await expect(guestActor.createCategory("ممنوع")).resolves.toHaveProperty("err");
  await expect(guestActor.createProduct({
    name: "ممنوع",
    price: 1_000n,
    categoryId: 1n,
    description: "",
    available: true,
    featured: false,
    images: [],
  })).resolves.toHaveProperty("err");
  await expect(guestActor.deleteProduct(1n)).resolves.toHaveProperty("err");
  await expect(guestActor.updateStoreSettings({
    shopName: "ممنوع",
    tagline: "",
    phone: "",
    whatsappNumber: "",
    address: "",
    openingHours: "",
  })).resolves.toHaveProperty("err");
});
