/**
 * Arabic (Moroccan) formatting helpers.
 *
 * Prices are stored in the backend as integer centimes (1 MAD = 100 centimes).
 * `formatPrice` divides by 100 to display whole dirhams.
 * Latin numerals inside RTL Arabic text must stay left-to-right, which is why
 * every numeral-bearing string is wrapped in the `.num` / `.text-price`
 * utilities defined in `index.css`.
 */

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Convert a number to Western (Latin) digits with thin thousands separators. */
export function toLatinDigits(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}${grouped}`;
}

/** Convert a number to Arabic-Indic digits (used for decorative counters). */
export function toArabicDigits(value: number): string {
  return Math.round(value)
    .toString()
    .split("")
    .map((char) => {
      const digit = Number.parseInt(char, 10);
      return Number.isNaN(digit) ? char : ARABIC_DIGITS[digit];
    })
    .join("");
}

/** Centimes -> whole dirhams. */
export function centimesToDirhams(centimes: bigint | number): number {
  const value = typeof centimes === "bigint" ? Number(centimes) : centimes;
  return value / 100;
}

/** Format a centime amount as `1.250 د.م.` (Latin numerals, RTL safe). */
export function formatPrice(centimes: bigint | number): string {
  const dirhams = centimesToDirhams(centimes);
  const hasFraction = Math.round(dirhams * 100) % 100 !== 0;
  const body = hasFraction
    ? dirhams.toFixed(2).replace(".", ",")
    : toLatinDigits(dirhams);
  return `${body} د.م.`;
}

/** Format a plain number with Latin digits. */
export function formatCount(value: number): string {
  return toLatinDigits(value);
}

/** Motoko `Time.now()` nanoseconds -> `Date`, or `null` when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Short Arabic date, e.g. `21 شتنبر 2026`. */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  return new Intl.DateTimeFormat("ar-MA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Normalise a phone number for `tel:` links. */
export function toTelHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

/** Truncate long Arabic copy without cutting mid-word where possible. */
export function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}
