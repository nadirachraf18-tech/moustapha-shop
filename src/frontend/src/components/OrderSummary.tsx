import type { CustomerDetails } from "@/components/CheckoutForm";
import { ProductImagePlaceholder } from "@/components/ProductImagePlaceholder";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/types";
import { ArrowRight, MapPin, Phone, User } from "lucide-react";

interface OrderSummaryProps {
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
  customer: CustomerDetails;
  onConfirm: () => void;
  onBack: () => void;
}

export function OrderSummary({
  lines,
  subtotal,
  itemCount,
  customer,
  onConfirm,
  onBack,
}: OrderSummaryProps) {
  return (
    <div data-ocid="order_summary.panel" className="space-y-6">
      <section className="card-product p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">
          تفاصيل الطلب
        </h2>
        <ul data-ocid="order_summary.list" className="divide-y divide-border">
          {lines.map((line, index) => (
            <li
              key={line.productId}
              data-ocid={`order_summary.item.${index + 1}`}
              className="flex items-center gap-3 py-3"
            >
              <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                {line.imageUrl ? (
                  <img
                    src={line.imageUrl}
                    alt={line.name}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <ProductImagePlaceholder
                    label={`${line.name} — بلا صورة`}
                    showCaption={false}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{line.name}</p>
                <p className="text-muted-foreground text-xs">
                  <span className="num">{line.quantity}</span> ×{" "}
                  <span className="num">{formatPrice(line.price)}</span>
                </p>
              </div>
              <span className="text-price shrink-0 text-sm">
                {formatPrice(line.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-muted-foreground text-sm">
            المجموع (<span className="num">{itemCount}</span> منتج)
          </span>
          <span className="text-price text-xl text-glow-gold">
            {formatPrice(subtotal)}
          </span>
        </div>
      </section>

      <section className="card-product p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">
          معلومات التوصيل
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <User
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <dt className="text-muted-foreground text-xs">الاسم</dt>
              <dd className="font-medium break-words">{customer.name}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <dt className="text-muted-foreground text-xs">الهاتف</dt>
              <dd className="num font-medium">{customer.phone}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <dt className="text-muted-foreground text-xs">
                العنوان والملاحظات
              </dt>
              <dd className="font-medium break-words">
                {customer.address || "بلا ملاحظات"}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          type="button"
          size="lg"
          onClick={onConfirm}
          data-ocid="order_summary.confirm_button"
          className="flex-1 rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink transition-smooth hover:-translate-y-0.5 hover:opacity-95"
        >
          <SendIcon />
          صيفط الطلب فواتساب
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onBack}
          data-ocid="order_summary.back_button"
          className="rounded-full"
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          رجع للتفاصيل
        </Button>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
