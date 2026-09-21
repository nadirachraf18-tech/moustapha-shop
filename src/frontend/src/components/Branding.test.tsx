import {
  DEFAULT_SETTINGS,
  createMockActor,
  makeCategory,
  makeProduct,
} from "@/test/mock-actor";
import { setMockActor } from "@/test/render";
import { renderApp } from "@/test/render-app";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

/**
 * Characterization baseline for the branding/identity seam that the
 * black/pink/gold rebrand rewrites: the header logo link, the settings-driven
 * shop identity, the footer identity, and the semantic price/CTA hooks the
 * theme tokens feed.
 *
 * These assert observable behavior and the app's own semantic class hooks, not
 * specific colors or the logo glyph, so a legitimate visual rebrand keeps them
 * green while a rebrand that breaks navigation, hardcodes the shop identity, or
 * drops a theme hook fails here.
 *
 * The actor is a local typed mock; the PocketIC lane exercises the real
 * canister.
 */

const categories = [makeCategory(1, "أواني المطبخ")];

const products = [
  makeProduct({
    id: 1,
    name: "طاجين فخار",
    price: BigInt(12_500),
    categoryId: BigInt(1),
    description: "طاجين تقليدي مغربي",
    featured: true,
  }),
];

describe("branding and shop identity", () => {
  beforeEach(() => {
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
    });
    setMockActor(actor);
  });

  it("renders the shop identity from store settings, not a hardcoded brand", async () => {
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
      settings: {
        ...DEFAULT_SETTINGS,
        shopName: "دار الأناقة",
        tagline: "فخامة مغربية أصيلة",
      },
    });
    setMockActor(actor);

    renderApp("/");

    // The hero heading and the header identity both come from settings.
    expect(
      await screen.findByRole("heading", { level: 1, name: "دار الأناقة" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("دار الأناقة").length).toBeGreaterThan(0);
    expect(screen.getAllByText("فخامة مغربية أصيلة").length).toBeGreaterThan(0);
    // The old hardcoded identity must not leak through.
    expect(screen.queryByText("متجر مصطفى")).not.toBeInTheDocument();
  });

  it("keeps the header logo link pointing at the home route", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/products");
    await screen.findByText("طاجين فخار");

    const logoLink = document.querySelector(
      "[data-ocid='header.logo_link']",
    ) as HTMLAnchorElement;
    expect(logoLink).not.toBeNull();
    expect(logoLink).toHaveAttribute("href", "/");

    await user.click(logoLink);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });
    expect(
      await screen.findByRole("heading", { level: 1, name: "متجر مصطفى" }),
    ).toBeInTheDocument();
  });

  it("mirrors the settings-driven identity in the footer", async () => {
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
      settings: {
        ...DEFAULT_SETTINGS,
        shopName: "دار الأناقة",
        tagline: "فخامة مغربية أصيلة",
      },
    });
    setMockActor(actor);

    renderApp("/");

    // The router commits its first match asynchronously and the footer swaps in
    // the settings identity once the query resolves, so await the configured
    // name inside the footer.
    await waitFor(() => {
      const footer = document.querySelector(
        "[data-ocid='footer.section']",
      ) as HTMLElement | null;
      expect(footer).not.toBeNull();
      expect(
        within(footer as HTMLElement).getByText("دار الأناقة"),
      ).toBeInTheDocument();
    });
    const footer = document.querySelector(
      "[data-ocid='footer.section']",
    ) as HTMLElement;
    expect(within(footer).getByText("فخامة مغربية أصيلة")).toBeInTheDocument();
    // The copyright line carries the configured shop name.
    expect(within(footer).getByText(/جميع الحقوق محفوظة/)).toHaveTextContent(
      "دار الأناقة",
    );
  });

  it("keeps the semantic price theme hook on catalog cards", async () => {
    renderApp("/products");

    // The price element keeps the app's `text-price` hook that the theme
    // tokens style; a rebrand that drops the hook silently unstyles prices.
    const price = await screen.findByText("125 د.م.");
    expect(price).toHaveClass("text-price");

    // The header cart control is always present and keeps its accessible name.
    expect(screen.getByRole("button", { name: /السلة/ })).toBeInTheDocument();
  });

  it("keeps the primary hero CTA gradient hook on the home page", async () => {
    renderApp("/");

    const browse = await waitFor(() => {
      const node = document.querySelector(
        "[data-ocid='home.browse_button']",
      ) as HTMLElement | null;
      expect(node).not.toBeNull();
      return node as HTMLElement;
    });
    expect(browse).toHaveClass("bg-gradient-price");
    expect(browse).toHaveAttribute("href", "/products");
  });
});
