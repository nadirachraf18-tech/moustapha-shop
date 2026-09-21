import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createMockActor, makeCategory, makeProduct } from "@/test/mock-actor";
import { setAuthState, setMockActor } from "@/test/render";
import { renderApp } from "@/test/render-app";
import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

/**
 * Cover for the black / magenta-pink / gold luxury rebrand.
 *
 * These assert the accepted observable brand contract: the logo image replaces
 * the old text monogram in the header and footer, the shop name renders through
 * the serif gradient wordmark hook, the image-unavailable placeholder points at
 * the new brand asset, the theme tokens are dark/magenta/gold, and the document
 * head carries the new brand while preserving the social-sharing meta tags.
 *
 * The actor is a local typed mock, so this proves the frontend consumer
 * contract only. The PocketIC lane in `app/test/pocketic` exercises the real
 * canister.
 */

// The frontend `test` script runs Vitest from `app/src/frontend`, so the
// process cwd is the frontend package root.
const FRONTEND_ROOT = `${process.cwd()}/`;

function readFrontendFile(relativePath: string): string {
  return readFileSync(resolve(FRONTEND_ROOT, relativePath), "utf8");
}

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

describe("brand logo assets", () => {
  it("ships a square logo asset and a favicon in the public directory", () => {
    expect(
      existsSync(
        `${FRONTEND_ROOT}public/assets/generated/brand-mark-transparent.dim_512x512.png`,
      ),
    ).toBe(true);
    expect(existsSync(`${FRONTEND_ROOT}public/favicon.ico`)).toBe(true);
    expect(
      existsSync(`${FRONTEND_ROOT}public/assets/images/placeholder.svg`),
    ).toBe(true);
  });

  it("references the favicon from index.html", () => {
    const html = readFrontendFile("index.html");
    expect(html).toMatch(/<link[^>]+rel="icon"[^>]+href="\/favicon\.ico"/);
  });
});

describe("document head branding", () => {
  it("reflects the new brand name and description in the title and meta tags", () => {
    const html = readFrontendFile("index.html");

    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    expect(title).toContain("MOUSTAPHA SHOP");

    const description =
      html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? "";
    expect(description).toContain("MOUSTAPHA SHOP");

    // og:title mirrors <title> and og:description mirrors the description.
    const ogTitle =
      html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/)?.[1] ?? "";
    expect(ogTitle).toBe(title);
    const ogDescription =
      html.match(
        /<meta\s+property="og:description"\s+content="([^"]*)"/,
      )?.[1] ?? "";
    expect(ogDescription).toBe(description);
  });

  it("preserves the existing social-sharing meta tags", () => {
    const html = readFrontendFile("index.html");

    for (const tag of [
      'property="og:type"',
      'property="og:image"',
      'property="og:image:alt"',
      'name="twitter:card"',
      'name="twitter:image"',
    ]) {
      expect(html).toContain(tag);
    }
    // og:image and twitter:image must stay absolute https URLs.
    const ogImage =
      html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/)?.[1] ?? "";
    expect(ogImage.startsWith("https://")).toBe(true);
    const twitterImage =
      html.match(/<meta\s+name="twitter:image"\s+content="([^"]*)"/)?.[1] ?? "";
    expect(twitterImage.startsWith("https://")).toBe(true);
  });
});

describe("theme tokens", () => {
  it("defines a near-black canvas, magenta-pink primary and gold accent", () => {
    const css = readFrontendFile("src/index.css");

    // Surfaces: pure/near-black background and lifted near-black cards.
    expect(css).toMatch(/--background:\s*0\.1[0-9]*\s/);
    expect(css).toMatch(/--card:\s*0\.2[0-9]*\s/);

    // Primary is magenta-pink (hue ~355-360) and accent is gold (hue ~90).
    expect(css).toMatch(/--primary:\s*0\.6[0-9]*\s+0\.2[0-9]*\s+35[0-9]/);
    expect(css).toMatch(/--accent:\s*0\.8[0-9]*\s+0\.1[0-9]*\s+9[0-9]/);

    // The brand wordmark gradient is pink -> white.
    expect(css).toContain("--gradient-brand");
    expect(css).toMatch(/\.brand-heading\s*\{/);
  });
});

describe("header and footer logo", () => {
  beforeEach(() => {
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
    });
    setMockActor(actor);
  });

  it("renders the logo image in the header instead of the text monogram", async () => {
    renderApp("/");

    const logoLink = await waitFor(() => {
      const node = document.querySelector(
        "[data-ocid='header.logo_link']",
      ) as HTMLElement | null;
      expect(node).not.toBeNull();
      return node as HTMLElement;
    });

    const mark = logoLink.querySelector("img");
    expect(mark).not.toBeNull();
    expect(mark).toHaveAttribute(
      "src",
      "/assets/generated/brand-mark-transparent.dim_512x512.png",
    );
    // The old text monogram must not leak through.
    expect(within(logoLink).queryByText("م")).not.toBeInTheDocument();
  });

  it("renders the logo image in the footer instead of the text monogram", async () => {
    renderApp("/");

    const footer = await waitFor(() => {
      const node = document.querySelector(
        "[data-ocid='footer.section']",
      ) as HTMLElement | null;
      expect(node).not.toBeNull();
      return node as HTMLElement;
    });

    const mark = footer.querySelector("img");
    expect(mark).not.toBeNull();
    expect(mark).toHaveAttribute(
      "src",
      "/assets/generated/brand-mark-transparent.dim_512x512.png",
    );
    expect(within(footer).queryByText("م")).not.toBeInTheDocument();
  });

  it("renders the shop name through the serif gradient wordmark hook", async () => {
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
      settings: {
        shopName: "دار الأناقة",
        tagline: "فخامة مغربية أصيلة",
        phone: "0612345678",
        whatsappNumber: "+212 612 345 678",
        address: "شارع محمد الخامس، الدار البيضاء",
        openingHours: "من الاثنين للسبت",
      },
    });
    setMockActor(actor);

    renderApp("/");

    // The header, hero and footer each render the shop name; every one of them
    // must go through the serif gradient wordmark hook.
    const wordmarks = await screen.findAllByText("دار الأناقة");
    expect(wordmarks.length).toBeGreaterThan(0);
    for (const wordmark of wordmarks) {
      expect(wordmark).toHaveClass("brand-heading");
    }
  });
});

describe("image-unavailable placeholder", () => {
  beforeEach(() => {
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
    });
    setMockActor(actor);
  });

  it("uses the new brand placeholder asset and dark surface, not the old cool blue-grey", async () => {
    renderApp("/products");

    const placeholder = await screen.findByRole("img", {
      name: "لا توجد صورة متوفرة لهذا المنتج",
    });
    expect(placeholder).toHaveClass("bg-secondary");

    const asset = placeholder.querySelector("img");
    expect(asset).not.toBeNull();
    expect(asset).toHaveAttribute("src", "/assets/images/placeholder.svg");
  });
});

describe("dark luxury theme across pages", () => {
  beforeEach(() => {
    const { actor } = createMockActor({
      categories: categories.map((category) => ({ ...category })),
      products: products.map((product) => ({ ...product })),
      isAdmin: true,
    });
    setMockActor(actor);
    setAuthState({ isAuthenticated: true });
  });

  it("renders the storefront pages on the dark background token", async () => {
    for (const path of ["/", "/products", "/products/1", "/cart"]) {
      const { unmount } = renderApp(path);
      const main = await waitFor(() => {
        const node = document.querySelector(
          "[data-ocid='page.main']",
        ) as HTMLElement | null;
        expect(node).not.toBeNull();
        return node as HTMLElement;
      });
      // The layout paints the dark canvas; no legacy light warm-paper surface.
      expect(main.closest(".bg-background")).not.toBeNull();
      expect(document.querySelector(".bg-\\[\\#faf7f2\\]")).toBeNull();
      unmount();
    }
  });

  it("renders the admin dashboard on the dark background token", async () => {
    renderApp("/admin");

    const page = await waitFor(() => {
      const node = document.querySelector(
        "[data-ocid='admin.page']",
      ) as HTMLElement | null;
      expect(node).not.toBeNull();
      return node as HTMLElement;
    });
    expect(page).toHaveClass("bg-background");
  });
});
