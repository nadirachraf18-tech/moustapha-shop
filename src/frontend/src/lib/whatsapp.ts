import { formatPrice } from "@/lib/format";
import type { CartLine, StoreSettings } from "@/types";

/** Strip everything but digits so `wa.me` receives a bare international number. */
export function normaliseWhatsappNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export interface OrderMessageInput {
  lines: CartLine[];
  subtotal: number;
  shopName: string;
  customerName?: string;
  note?: string;
}

/** Build the pre-filled, itemised order message sent to the shop on WhatsApp. */
export function buildOrderMessage({
  lines,
  subtotal,
  shopName,
  customerName,
  note,
}: OrderMessageInput): string {
  const parts: string[] = [`السلام عليكم، بغيت نطلب من ${shopName}:`, ""];

  lines.forEach((line, index) => {
    parts.push(
      `${index + 1}. ${line.name} — ${line.quantity} × ${formatPrice(line.price)} = ${formatPrice(
        line.price * line.quantity,
      )}`,
    );
  });

  parts.push("", `المجموع: ${formatPrice(subtotal)}`);

  if (customerName?.trim()) {
    parts.push(`الاسم: ${customerName.trim()}`);
  }
  if (note?.trim()) {
    parts.push(`ملاحظة: ${note.trim()}`);
  }

  return parts.join("\n");
}

/** Build a `wa.me` deep link with the order message pre-filled. */
export function buildWhatsappOrderLink(
  settings: Pick<StoreSettings, "whatsappNumber" | "shopName">,
  input: Omit<OrderMessageInput, "shopName">,
): string {
  const number = normaliseWhatsappNumber(settings.whatsappNumber);
  const message = buildOrderMessage({ ...input, shopName: settings.shopName });
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Generic WhatsApp contact link (no order payload). */
export function buildWhatsappContactLink(
  settings: Pick<StoreSettings, "whatsappNumber" | "shopName">,
): string {
  const number = normaliseWhatsappNumber(settings.whatsappNumber);
  const message = `السلام عليكم، عندي سؤال على ${settings.shopName}.`;
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}
