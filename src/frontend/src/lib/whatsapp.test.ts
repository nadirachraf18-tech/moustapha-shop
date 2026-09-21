import {
  buildOrderMessage,
  buildWhatsappContactLink,
  buildWhatsappOrderLink,
  normaliseWhatsappNumber,
} from "@/lib/whatsapp";
import type { CartLine, StoreSettings } from "@/types";
import { describe, expect, it } from "vitest";

const settings: Pick<StoreSettings, "whatsappNumber" | "shopName"> = {
  whatsappNumber: "+212 612 345 678",
  shopName: "متجر مصطفى",
};

const lines: CartLine[] = [
  {
    productId: "1",
    name: "طاجين فخار",
    price: 12_500,
    imageUrl: null,
    quantity: 2,
  },
  {
    productId: "2",
    name: "زربية",
    price: 30_000,
    imageUrl: null,
    quantity: 1,
  },
];

describe("normaliseWhatsappNumber", () => {
  it("keeps digits only", () => {
    expect(normaliseWhatsappNumber("+212 612-345-678")).toBe("212612345678");
  });
});

describe("buildOrderMessage", () => {
  it("itemises every line with quantity, unit price and line total", () => {
    const message = buildOrderMessage({
      lines,
      subtotal: 55_000,
      shopName: "متجر مصطفى",
      customerName: "مصطفى العلوي",
      note: "0612345678 — حي السلام",
    });

    expect(message).toContain("طاجين فخار — 2 × 125 د.م. = 250 د.م.");
    expect(message).toContain("زربية — 1 × 300 د.م. = 300 د.م.");
    expect(message).toContain("المجموع: 550 د.م.");
    expect(message).toContain("الاسم: مصطفى العلوي");
    expect(message).toContain("ملاحظة: 0612345678 — حي السلام");
  });

  it("omits the customer name and note when blank", () => {
    const message = buildOrderMessage({
      lines,
      subtotal: 55_000,
      shopName: "متجر مصطفى",
      customerName: "   ",
      note: "",
    });
    expect(message).not.toContain("الاسم:");
    expect(message).not.toContain("ملاحظة:");
  });
});

describe("buildWhatsappOrderLink", () => {
  it("targets wa.me with the normalised number and an encoded message", () => {
    const link = buildWhatsappOrderLink(settings, {
      lines,
      subtotal: 55_000,
      customerName: "مصطفى",
      note: "0612345678",
    });

    expect(link.startsWith("https://wa.me/212612345678?text=")).toBe(true);
    const encoded = link.split("?text=")[1];
    const decoded = decodeURIComponent(encoded);
    expect(decoded).toContain("طاجين فخار");
    expect(decoded).toContain("المجموع: 550 د.م.");
    expect(decoded).toContain("الاسم: مصطفى");
  });

  it("falls back to the bare wa.me host when no number is configured", () => {
    const link = buildWhatsappOrderLink(
      { whatsappNumber: "", shopName: "متجر مصطفى" },
      { lines, subtotal: 55_000 },
    );
    expect(link.startsWith("https://wa.me/?text=")).toBe(true);
  });
});

describe("buildWhatsappContactLink", () => {
  it("builds a generic contact link with the shop name", () => {
    const link = buildWhatsappContactLink(settings);
    expect(link.startsWith("https://wa.me/212612345678?text=")).toBe(true);
    expect(decodeURIComponent(link.split("?text=")[1])).toContain("متجر مصطفى");
  });
});
