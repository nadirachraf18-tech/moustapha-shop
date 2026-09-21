import { createMockActor, makeCategory, makeProduct } from "@/test/mock-actor";
import { setMockActor } from "@/test/render";
import { renderApp } from "@/test/render-app";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

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
    createdAt: BigInt(1_700_000_000_000) + BigInt(1),
  }),
  makeProduct({
    id: 2,
    name: "زربية أطلس",
    price: BigInt(30_000),
    categoryId: BigInt(2),
    description: "زربية مصنوعة باليد",
    createdAt: BigInt(1_700_000_000_000) + BigInt(2),
  }),
  makeProduct({
    id: 3,
    name: "كسكسية",
    price: BigInt(8_000),
    categoryId: BigInt(1),
    description: "كسكسية فخارية",
    createdAt: BigInt(1_700_000_000_000) + BigInt(3),
  }),
];

describe("CatalogPage", () => {
  beforeEach(() => {
    const { actor } = createMockActor({ categories, products });
    setMockActor(actor);
  });

  it("renders a card per product with name, price and category", async () => {
    renderApp("/products");

    expect(await screen.findByText("طاجين فخار")).toBeInTheDocument();
    expect(screen.getByText("زربية أطلس")).toBeInTheDocument();
    expect(screen.getByText("كسكسية")).toBeInTheDocument();
    expect(screen.getByText("125 د.م.")).toBeInTheDocument();
    expect(screen.getByText("300 د.م.")).toBeInTheDocument();
    // Category names appear on the cards.
    expect(screen.getAllByText("أواني المطبخ").length).toBeGreaterThan(0);
  });

  it("links each card to its product detail route", async () => {
    renderApp("/products");
    const card = await screen.findByText("طاجين فخار");
    const link = card.closest("a");
    expect(link).toHaveAttribute("href", "/products/1");
  });

  it("narrows the catalog when a category is chosen and reflects it in the URL", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/products");
    await screen.findByText("طاجين فخار");

    await user.click(screen.getByRole("combobox", { name: "الصنف" }));
    await user.click(await screen.findByRole("option", { name: "الزرابي" }));

    await waitFor(() => {
      expect(screen.queryByText("طاجين فخار")).not.toBeInTheDocument();
    });
    expect(screen.getByText("زربية أطلس")).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({ category: "2" });
  });

  it("narrows the catalog by free-text search over name and description", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/products");
    await screen.findByText("طاجين فخار");

    await user.type(
      screen.getByPlaceholderText("سمية المنتج ولا وصفو…"),
      "مصنوعة باليد",
    );
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.queryByText("طاجين فخار")).not.toBeInTheDocument();
    });
    expect(screen.getByText("زربية أطلس")).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({
      search: "مصنوعة باليد",
    });
  });

  it("sorts by price low-to-high and reflects the sort in the URL", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/products");
    await screen.findByText("طاجين فخار");

    await user.click(screen.getByRole("combobox", { name: "الترتيب" }));
    await user.click(
      await screen.findByRole("option", { name: "الثمن: من الأرخص للأغلى" }),
    );

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        sort: "priceLowToHigh",
      });
    });
    const names = screen
      .getAllByRole("heading", { level: 3 })
      .map((node) => node.textContent);
    expect(names).toEqual(["كسكسية", "طاجين فخار", "زربية أطلس"]);
  });

  it("shows the empty state with a reset action when nothing matches", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/products?search=zzz");
    await screen.findByText("ما لقيناش منتوجات");

    // Both the filter bar and the empty state expose a "مسح التصفية" button;
    // scope the click to the empty-state action.
    const emptyState = document.querySelector(
      "[data-ocid='catalog.empty_state']",
    ) as HTMLElement;
    await user.click(
      within(emptyState).getByRole("button", { name: "مسح التصفية" }),
    );

    await waitFor(() => {
      expect(screen.getByText("طاجين فخار")).toBeInTheDocument();
    });
    expect(router.state.location.search).toEqual({});
  });

  it("reads an initial filter from the URL so a shared link works", async () => {
    const user = userEvent.setup();
    // Build the shared link from the router's own serialisation rather than
    // hand-encoding it: whatever the app writes into the address bar is what a
    // user copies and shares.
    const first = renderApp("/products");
    await screen.findByText("طاجين فخار");
    await user.click(screen.getByRole("combobox", { name: "الصنف" }));
    await user.click(await screen.findByRole("option", { name: "الزرابي" }));
    await waitFor(() => {
      expect(first.router.state.location.search).toMatchObject({
        category: "2",
      });
    });
    const sharedHref = first.router.state.location.href;
    first.unmount();

    renderApp(sharedHref);
    expect(await screen.findByText("زربية أطلس")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("طاجين فخار")).not.toBeInTheDocument();
    });
  });

  it("shows the result count for the active filter", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/products");
    await screen.findByText("طاجين فخار");

    await user.click(screen.getByRole("combobox", { name: "الصنف" }));
    await user.click(
      await screen.findByRole("option", { name: "أواني المطبخ" }),
    );

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ category: "1" });
    });
    const resultCount = document.querySelector(
      "[data-ocid='catalog.result_count']",
    ) as HTMLElement;
    // The count and the Arabic noun render together in one element.
    expect(resultCount).toHaveTextContent("2 منتوج");
  });
});
