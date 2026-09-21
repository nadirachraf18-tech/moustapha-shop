import {
  centimesToDirhams,
  formatCount,
  formatPrice,
  toArabicDigits,
  toLatinDigits,
  toTelHref,
  truncate,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

describe("formatPrice", () => {
  it("renders whole dirhams from centimes with Latin digits", () => {
    expect(formatPrice(12_500)).toBe("125 د.م.");
  });

  it("keeps a fractional part with a comma separator", () => {
    expect(formatPrice(14_990)).toBe("149,90 د.م.");
  });

  it("accepts bigint centimes as returned by the backend", () => {
    expect(formatPrice(1_000n)).toBe("10 د.م.");
  });

  it("groups thousands with dots", () => {
    expect(formatPrice(1_234_500)).toBe("12.345 د.م.");
  });
});

describe("centimesToDirhams", () => {
  it("divides centimes by 100", () => {
    expect(centimesToDirhams(25_000)).toBe(250);
    expect(centimesToDirhams(1_250n)).toBe(12.5);
  });
});

describe("digit helpers", () => {
  it("formats counts with Latin digits", () => {
    expect(formatCount(1_234)).toBe("1.234");
  });

  it("converts to Arabic-Indic digits", () => {
    expect(toArabicDigits(2026)).toBe("٢٠٢٦");
  });

  it("keeps non-digit characters untouched", () => {
    expect(toArabicDigits(12)).toBe("١٢");
    expect(toLatinDigits(0)).toBe("0");
  });
});

describe("toTelHref", () => {
  it("strips spaces and keeps a leading plus", () => {
    expect(toTelHref("+212 612 345 678")).toBe("tel:+212612345678");
  });

  it("strips punctuation from a local number", () => {
    expect(toTelHref("06-12-34-56-78")).toBe("tel:0612345678");
  });
});

describe("truncate", () => {
  it("leaves short text unchanged", () => {
    expect(truncate("نص قصير", 20)).toBe("نص قصير");
  });

  it("appends an ellipsis when over the limit", () => {
    expect(truncate("abcdefghij", 5)).toBe("abcde…");
  });
});
