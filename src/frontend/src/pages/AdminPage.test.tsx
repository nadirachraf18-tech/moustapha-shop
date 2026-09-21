import { createMockActor, makeCategory, makeProduct } from "@/test/mock-actor";
import { setAuthState, setMockActor } from "@/test/render";
import { renderApp } from "@/test/render-app";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterization baseline for the admin dashboard's access gates and its
 * existing product/category/settings management.
 *
 * Deliberately NOT frozen here, because the accepted request changes them:
 * the default tab, the header admin-link visibility rule, and the products
 * table's action set (a featured toggle is being added). The tests below only
 * assert the gates and the management flows that must keep working.
 *
 * The actor is a local typed mock; the PocketIC lane exercises the real
 * canister.
 */

const categories = [
  makeCategory(1, "أواني المطبخ"),
  makeCategory(2, "الزرابي"),
];

const products = [
  makeProduct({
    id: 1,
    name: "طاجين فخار",
    price: BigInt(12_500),
    categoryId: BigInt(1),
    description: "طاجين تقليدي مغربي",
    available: true,
    featured: false,
  }),
  makeProduct({
    id: 2,
    name: "زربية أطلس",
    price: BigInt(30_000),
    categoryId: BigInt(2),
    description: "زربية مصنوعة باليد",
    available: false,
    featured: false,
  }),
];

function seedAdmin() {
  // Copy the fixtures: `createMockActor` keeps the arrays it is handed, so a
  // mutation in one test would otherwise leak into the next.
  const { actor, state } = createMockActor({
    categories: categories.map((category) => ({ ...category })),
    products: products.map((product) => ({ ...product })),
    isAdmin: true,
  });
  setMockActor(actor);
  setAuthState({ isAuthenticated: true });
  return state;
}

/** The mock state backing the actor rendered by the current test. */
let adminState: ReturnType<typeof seedAdmin>;

/**
 * The dashboard now defaults to the «نظرة عامة» overview tab, so management
 * tests must open their tab before asserting on its content.
 */
async function openTab(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
  await user.click(await screen.findByRole("tab", { name }));
}

describe("admin access gates", () => {
  beforeEach(() => {
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
    });
    setMockActor(actor);
    setAuthState({ isAuthenticated: false });
  });

  it("shows the sign-in gate to a visitor who is not signed in", async () => {
    renderApp("/admin");

    // The footer now always links to the dashboard, so scope the title query to
    // the gate's own heading instead of matching every «لوحة التحكم» string.
    expect(
      await screen.findByRole("heading", { level: 1, name: "لوحة التحكم" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /سجّل الدخول/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText("ما عندكش الصلاحية")).not.toBeInTheDocument();
  });

  it("shows the access-denied message to a signed-in non-admin", async () => {
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
      isAdmin: false,
    });
    setMockActor(actor);
    setAuthState({ isAuthenticated: true });

    renderApp("/admin");

    expect(await screen.findByText("ما عندكش الصلاحية")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "بدّل الحساب" }),
    ).toBeInTheDocument();
  });

  it("opens the dashboard for an admin", async () => {
    seedAdmin();
    renderApp("/admin");

    expect(await screen.findByText("منطقة المسؤول")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "لوحة التحكم" }),
    ).toBeInTheDocument();
    // The dashboard now lands on the overview tab, not the products table.
    expect(
      await screen.findByRole("tab", { name: /نظرة عامة/ }),
    ).toHaveAttribute("data-state", "active");
  });
});

describe("admin product management", () => {
  beforeEach(() => {
    adminState = seedAdmin();
  });

  it("lists products with category, price and availability state", async () => {
    const user = userEvent.setup();
    renderApp("/admin");
    await openTab(user, /المنتوجات/);
    await screen.findByText("طاجين فخار");

    const table = document.querySelector(
      "[data-ocid='admin.products_table']",
    ) as HTMLElement;
    expect(within(table).getByText("125 د.م.")).toBeInTheDocument();
    expect(within(table).getByText("أواني المطبخ")).toBeInTheDocument();
    expect(within(table).getByText("متوفر")).toBeInTheDocument();
    expect(within(table).getByText("غير متوفر")).toBeInTheDocument();
  });

  it("filters the table by the search box", async () => {
    const user = userEvent.setup();
    renderApp("/admin");
    await openTab(user, /المنتوجات/);
    await screen.findByText("طاجين فخار");

    await user.type(
      screen.getByLabelText("البحث في منتوجات لوحة التحكم"),
      "زربية",
    );

    await waitFor(() => {
      expect(screen.queryByText("طاجين فخار")).not.toBeInTheDocument();
    });
    expect(screen.getByText("زربية أطلس")).toBeInTheDocument();
  });

  it("toggles availability through the row switch", async () => {
    const user = userEvent.setup();
    renderApp("/admin");
    await openTab(user, /المنتوجات/);
    await screen.findByText("طاجين فخار");

    await user.click(
      screen.getByRole("switch", { name: "تبديل توفر طاجين فخار" }),
    );

    await waitFor(() => {
      expect(
        adminState.products.find((p) => p.id === BigInt(1))?.available,
      ).toBe(false);
    });
  });

  it("creates a product through the dialog with dirham -> centimes conversion", async () => {
    const user = userEvent.setup();
    renderApp("/admin");
    await openTab(user, /المنتوجات/);
    await screen.findByText("طاجين فخار");

    await user.click(screen.getByRole("button", { name: /منتوج جديد/ }));
    await user.type(
      await screen.findByLabelText(/سمية المنتوج/),
      "قندورة مطرزة",
    );
    await user.type(screen.getByLabelText(/الثمن/), "149.90");
    await user.click(screen.getByRole("combobox", { name: /الصنف/ }));
    await user.click(await screen.findByRole("option", { name: "الزرابي" }));
    await user.click(screen.getByRole("button", { name: "زيد المنتوج" }));

    await waitFor(() => {
      expect(adminState.products).toHaveLength(3);
    });
    const created = adminState.products.find((p) => p.name === "قندورة مطرزة");
    expect(created?.price).toBe(BigInt(14_990));
    expect(created?.categoryId).toBe(BigInt(2));
  });

  it("rejects an invalid price in the product form", async () => {
    const user = userEvent.setup();
    renderApp("/admin");
    await openTab(user, /المنتوجات/);
    await screen.findByText("طاجين فخار");

    await user.click(screen.getByRole("button", { name: /منتوج جديد/ }));
    await user.type(
      await screen.findByLabelText(/سمية المنتوج/),
      "منتوج بلا ثمن",
    );
    await user.type(screen.getByLabelText(/الثمن/), "0");
    await user.click(screen.getByRole("button", { name: "زيد المنتوج" }));

    expect(
      await screen.findByText("الثمن خاصو يكون رقم أكبر من صفر. مثال: 149.90"),
    ).toBeInTheDocument();
    // The dialog stays open and nothing is written to the backend.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(adminState.products).toHaveLength(2);
  });

  it("deletes a product after confirming the dialog", async () => {
    const user = userEvent.setup();
    renderApp("/admin");
    await openTab(user, /المنتوجات/);
    await screen.findByText("طاجين فخار");

    await user.click(screen.getByRole("button", { name: "حيّد طاجين فخار" }));
    await user.click(await screen.findByRole("button", { name: "حيّد" }));

    await waitFor(() => {
      expect(adminState.products.map((p) => p.name)).not.toContain(
        "طاجين فخار",
      );
    });
  });
});

describe("admin category management", () => {
  beforeEach(() => {
    adminState = seedAdmin();
  });

  it("creates a category from the categories tab", async () => {
    const user = userEvent.setup();
    renderApp("/admin");
    await openTab(user, /الأصناف/);
    await user.type(await screen.findByLabelText("صنف جديد"), "الحلي الفضية");
    await user.click(screen.getByRole("button", { name: /زيد/ }));

    await waitFor(() => {
      expect(adminState.categories.map((c) => c.name)).toContain(
        "الحلي الفضية",
      );
    });
  });

  it("renames a category inline", async () => {
    const user = userEvent.setup();
    renderApp("/admin");
    await openTab(user, /الأصناف/);
    await user.click(
      await screen.findByRole("button", { name: "بدّل سمية أواني المطبخ" }),
    );
    const input = screen.getByLabelText("سمية الصنف أواني المطبخ");
    await user.clear(input);
    await user.type(input, "أواني الطياب");
    await user.click(
      screen.getByRole("button", { name: "سجّل السمية الجديدة" }),
    );

    await waitFor(() => {
      expect(adminState.categories.find((c) => c.id === BigInt(1))?.name).toBe(
        "أواني الطياب",
      );
    });
  });
});

describe("admin store settings", () => {
  beforeEach(() => {
    adminState = seedAdmin();
  });

  it("saves store settings and shows the Arabic success message", async () => {
    const user = userEvent.setup();
    renderApp("/admin");
    await openTab(user, /معلومات المتجر/);
    const shopName = await screen.findByLabelText(/سمية المتجر/);
    await user.clear(shopName);
    await user.type(shopName, "متجر مصطفى الجديد");
    await user.click(screen.getByRole("button", { name: /سجّل المعلومات/ }));

    await waitFor(() => {
      expect(adminState.settings.shopName).toBe("متجر مصطفى الجديد");
    });
    expect(
      await screen.findByText("تسجّلو معلومات المتجر بنجاح."),
    ).toBeInTheDocument();
  });
});

describe("admin overview tab", () => {
  beforeEach(() => {
    adminState = seedAdmin();
  });

  it("is the default tab and shows the four shop-health counts", async () => {
    renderApp("/admin");

    const overview = await screen.findByRole("tab", { name: /نظرة عامة/ });
    expect(overview).toHaveAttribute("data-state", "active");

    await screen.findByText("عدد المنتوجات");
    const section = document.querySelector(
      "[data-ocid='admin.overview_section']",
    ) as HTMLElement;
    // 2 products, 2 categories, 1 unavailable (زربية أطلس), 0 featured.
    const cards = within(section).getAllByText(
      /^(عدد المنتوجات|عدد الأصناف|غير متوفرة|مميزة)$/,
    );
    expect(cards).toHaveLength(4);
    expect(within(section).getByText("عدد المنتوجات")).toBeInTheDocument();
    expect(within(section).getByText("عدد الأصناف")).toBeInTheDocument();
    expect(within(section).getByText("غير متوفرة")).toBeInTheDocument();
    expect(within(section).getByText("مميزة")).toBeInTheDocument();
  });

  it("lists unavailable products and opens the edit dialog from the list", async () => {
    const user = userEvent.setup();
    renderApp("/admin");

    await screen.findByText("زربية أطلس");
    const list = document.querySelector(
      "[data-ocid='admin.overview_unavailable_list']",
    ) as HTMLElement;
    // Only the unavailable product (زربية أطلس) is listed.
    expect(within(list).getByText("زربية أطلس")).toBeInTheDocument();
    expect(within(list).queryByText("طاجين فخار")).not.toBeInTheDocument();

    await user.click(within(list).getByRole("button", { name: "عدّل" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "تعديل المنتوج" }),
    ).toBeInTheDocument();
  });

  it("jumps to the categories tab from the quick actions", async () => {
    const user = userEvent.setup();
    renderApp("/admin");

    await user.click(await screen.findByRole("button", { name: /زيد صنف/ }));

    expect(await screen.findByRole("tab", { name: /الأصناف/ })).toHaveAttribute(
      "data-state",
      "active",
    );
    expect(await screen.findByLabelText("صنف جديد")).toBeInTheDocument();
  });

  it("opens the storefront in a new tab from the quick actions", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    renderApp("/admin");

    // Both the page header and the quick actions expose a «شوف المتجر» button;
    // target the quick-action one by its ocid. Await it: the router commits its
    // first match asynchronously, so a synchronous query can return null and
    // userEvent.click(null) would silently no-op.
    const viewStore = await waitFor(() => {
      const button = document.querySelector(
        "[data-ocid='admin.overview_view_store_button']",
      );
      expect(button).not.toBeNull();
      return button as HTMLElement;
    });
    await user.click(viewStore);

    expect(openSpy).toHaveBeenCalledWith("/", "_blank", "noopener");
    openSpy.mockRestore();
  });

  it("shows the Arabic empty state when the shop has no products", async () => {
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: [],
      isAdmin: true,
    });
    setMockActor(actor);
    setAuthState({ isAuthenticated: true });

    renderApp("/admin");

    expect(await screen.findByText("المتجر خاوي دابا")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /زيد أول صنف/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /زيد أول منتوج/ }),
    ).toBeInTheDocument();
  });
});

describe("admin featured toggle", () => {
  beforeEach(() => {
    adminState = seedAdmin();
  });

  it("marks a product as featured through the row switch", async () => {
    const user = userEvent.setup();
    renderApp("/admin");
    await openTab(user, /المنتوجات/);
    await screen.findByText("طاجين فخار");

    await user.click(
      screen.getByRole("switch", { name: "تبديل تمييز طاجين فخار" }),
    );

    await waitFor(() => {
      expect(
        adminState.products.find((p) => p.id === BigInt(1))?.featured,
      ).toBe(true);
    });
  });
});
