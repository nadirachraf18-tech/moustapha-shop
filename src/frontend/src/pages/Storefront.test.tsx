import { createMockActor, makeCategory, makeProduct } from "@/test/mock-actor";
import { setMockActor } from "@/test/render";
import { renderApp } from "@/test/render-app";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterization baseline for the storefront journeys that the admin
 * dashboard work must not change: home rendering, catalog browsing, product
 * detail, cart and the WhatsApp checkout handoff.
 *
 * The actor is a local typed mock, so this proves the frontend consumer
 * contract only. The PocketIC lane in `app/test/pocketic` is what exercises
 * the compiled backend.
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
    featured: true,
  }),
  makeProduct({
    id: 2,
    name: "زربية أطلس",
    price: BigInt(30_000),
    categoryId: BigInt(2),
    description: "زربية مصنوعة باليد",
    featured: false,
  }),
  makeProduct({
    id: 3,
    name: "كسكسية",
    price: BigInt(8_000),
    categoryId: BigInt(1),
    description: "كسكسية فخارية",
    featured: false,
  }),
];

describe("storefront journeys", () => {
  beforeEach(() => {
    // Copy the fixtures: `createMockActor` keeps the arrays it is handed, so a
    // mutation in one test would otherwise leak into the next.
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
    });
    setMockActor(actor);
  });

  it("renders the home page with the shop identity and featured section", async () => {
    renderApp("/");

    expect(
      await screen.findByRole("heading", { level: 1, name: "متجر مصطفى" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "منتوجات مختارة" }),
    ).toBeInTheDocument();
    // Only the featured product appears in the featured grid.
    const featuredList = (await screen.findByText("طاجين فخار")).closest(
      "[data-ocid='home.featured_list']",
    ) as HTMLElement;
    expect(featuredList).not.toBeNull();
    expect(within(featuredList).getByText("طاجين فخار")).toBeInTheDocument();
    expect(
      within(featuredList).queryByText("زربية أطلس"),
    ).not.toBeInTheDocument();
    // Category shortcuts and store info are part of the home page.
    expect(screen.getByText("الأصناف")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "معلومات المتجر" }),
    ).toBeInTheDocument();
  });

  it("navigates from the home page to the catalog", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/");
    await screen.findByRole("heading", { level: 1, name: "متجر مصطفى" });

    await user.click(screen.getByRole("link", { name: /تسوق دابا/ }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/products");
    });
    expect(await screen.findByText("كل المنتوجات")).toBeInTheDocument();
  });

  it("opens a product detail page from a catalog card", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/products");
    const card = await screen.findByText("طاجين فخار");

    await user.click(card);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/products/1");
    });
    expect(
      await screen.findByRole("heading", { name: "طاجين فخار" }),
    ).toBeInTheDocument();
    expect(screen.getByText("125 د.م.")).toBeInTheDocument();
    expect(screen.getByText("طاجين تقليدي مغربي")).toBeInTheDocument();
  });

  it("adds a product to the cart from the detail page and shows the cart count", async () => {
    const user = userEvent.setup();
    renderApp("/products/1");
    await screen.findByRole("heading", { name: "طاجين فخار" });

    await user.click(screen.getByRole("button", { name: "زيد الكمية" }));
    await user.click(screen.getByRole("button", { name: "زيد للسلة" }));

    expect(await screen.findByText("تزاد للسلة بنجاح")).toBeInTheDocument();
    // The header cart button exposes the item count in its accessible name.
    expect(
      screen.getByRole("button", { name: "السلة، 2 منتج" }),
    ).toBeInTheDocument();
  });

  it("shows the empty cart state with a link back to the catalog", async () => {
    renderApp("/cart");

    expect(await screen.findByText("السلة خاوية")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "تصفح المنتوجات" }),
    ).toHaveAttribute("href", "/products");
  });

  it("walks the cart through review and the WhatsApp order handoff", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    renderApp("/products/1");
    await screen.findByRole("heading", { name: "طاجين فخار" });
    await user.click(screen.getByRole("button", { name: "زيد للسلة" }));

    const { router } = renderApp("/cart");
    await screen.findByText("السلة والطلب");

    await user.type(screen.getByLabelText(/الاسم الكامل/), "مصطفى العلوي");
    await user.type(screen.getByLabelText(/رقم الهاتف/), "0612345678");
    await user.click(screen.getByRole("button", { name: "راجع الطلب" }));

    expect(await screen.findByText("تفاصيل الطلب")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "صيفط الطلب فواتساب" }),
    );

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [url, target] = openSpy.mock.calls[0] as [string, string];
    expect(url.startsWith("https://wa.me/212612345678?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("طاجين فخار");
    expect(target).toBe("_blank");
    expect(await screen.findByText("تصيفط الطلب ديالك")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/cart");
  });

  it("blocks the checkout review when the phone number is invalid", async () => {
    const user = userEvent.setup();
    renderApp("/products/1");
    await screen.findByRole("heading", { name: "طاجين فخار" });
    await user.click(screen.getByRole("button", { name: "زيد للسلة" }));

    renderApp("/cart");
    await screen.findByText("السلة والطلب");

    await user.type(screen.getByLabelText(/الاسم الكامل/), "مصطفى العلوي");
    await user.type(screen.getByLabelText(/رقم الهاتف/), "123");
    await user.click(screen.getByRole("button", { name: "راجع الطلب" }));

    expect(
      await screen.findByText("الرقم ماشي صحيح. مثال: 0612345678"),
    ).toBeInTheDocument();
    expect(screen.queryByText("تفاصيل الطلب")).not.toBeInTheDocument();
  });
});
