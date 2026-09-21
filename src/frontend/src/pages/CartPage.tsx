import { CheckoutForm, type CustomerDetails } from "@/components/CheckoutForm";
import { OrderSummary } from "@/components/OrderSummary";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useStoreSettings } from "@/hooks/use-catalog";
import { formatPrice } from "@/lib/format";
import { buildOrderMessage, buildWhatsappOrderLink } from "@/lib/whatsapp";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useState } from "react";

type Step = "cart" | "review" | "done";

export function CartPage() {
  const { lines, itemCount, subtotal, removeItem, updateQuantity, clearCart } =
    useCart();
  const { data: settings } = useStoreSettings();

  const [step, setStep] = useState<Step>("cart");
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);

  const shopName = settings?.shopName ?? "MOUSTAPHA SHOP";

  function handleReview(details: CustomerDetails) {
    setCustomer(details);
    setStep("review");
  }

  function handleConfirm() {
    if (!customer || !settings) return;
    const link = buildWhatsappOrderLink(settings, {
      lines,
      subtotal,
      customerName: customer.name,
      note: [customer.phone, customer.address].filter(Boolean).join(" — "),
    });
    window.open(link, "_blank", "noopener,noreferrer");
    clearCart();
    setStep("done");
  }

  if (step === "done" && customer) {
    return (
      <div
        data-ocid="cart.success_state"
        className="container max-w-2xl py-16 text-center"
      >
        <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-bold">
          <span className="accent-sparkle">تصيفط الطلب ديالك</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
          شكرا {customer.name}! حلّينا ليك واتساب بالطلب كامل. صيفطو للرقم ديال{" "}
          {shopName} وغادي نتواصلو معاك ف{" "}
          <span className="num">{customer.phone}</span> باش نأكدو التوصيل.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink"
          >
            <Link
              to="/products"
              search={{}}
              data-ocid="cart.back_to_catalog_button"
            >
              كمل التسوق
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link to="/" data-ocid="cart.back_home_button">
              الصفحة الرئيسية
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div
        data-ocid="cart.empty_state"
        className="container max-w-2xl py-20 text-center"
      >
        <span className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <ShoppingBag className="size-9" aria-hidden="true" />
        </span>
        <h1 className="font-display text-2xl font-bold">
          <span className="accent-sparkle">السلة خاوية</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed">
          مازال ما زدت حتى منتج. تصفح المنتوجات ديال {shopName} وزيد اللي عجبك
          للسلة.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink"
        >
          <Link to="/products" search={{}} data-ocid="cart.browse_button">
            تصفح المنتوجات
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div data-ocid="cart.page" className="container py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">
            <span className="accent-sparkle">السلة والطلب</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            <span className="num">{itemCount}</span> منتج فالسلة
          </p>
        </div>
        <Button asChild type="button" variant="ghost" className="rounded-full">
          <Link to="/products" search={{}} data-ocid="cart.continue_link">
            <ArrowRight className="size-4" aria-hidden="true" />
            زيد منتوجات
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {step === "cart" ? (
            <>
              <ul
                data-ocid="cart.list"
                className="card-product divide-y divide-border"
              >
                {lines.map((line, index) => (
                  <li
                    key={line.productId}
                    data-ocid={`cart.item.${index + 1}`}
                    className="flex gap-4 p-4"
                  >
                    <div className="size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                      {line.imageUrl ? (
                        <img
                          src={line.imageUrl}
                          alt={line.name}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="size-7" aria-hidden="true" />
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{line.name}</p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            <span className="num">
                              {formatPrice(line.price)}
                            </span>{" "}
                            للوحدة
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`حذف ${line.name} من السلة`}
                          data-ocid={`cart.remove_button.${index + 1}`}
                          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(line.productId)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 rounded-full border border-border p-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`نقص كمية ${line.name}`}
                            data-ocid={`cart.decrease_button.${index + 1}`}
                            className="size-8 rounded-full"
                            onClick={() =>
                              updateQuantity(line.productId, line.quantity - 1)
                            }
                          >
                            <Minus className="size-3.5" aria-hidden="true" />
                          </Button>
                          <span className="num w-7 text-center text-sm font-semibold">
                            {line.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`زيد كمية ${line.name}`}
                            data-ocid={`cart.increase_button.${index + 1}`}
                            className="size-8 rounded-full"
                            onClick={() =>
                              updateQuantity(line.productId, line.quantity + 1)
                            }
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                        <span className="text-price text-base">
                          {formatPrice(line.price * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="card-product p-5">
                <h2 className="mb-4 font-display text-lg font-semibold">
                  معلومات التوصيل
                </h2>
                <CheckoutForm onSubmit={handleReview} />
              </div>
            </>
          ) : (
            customer && (
              <OrderSummary
                lines={lines}
                subtotal={subtotal}
                itemCount={itemCount}
                customer={customer}
                onConfirm={handleConfirm}
                onBack={() => setStep("cart")}
              />
            )
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-product space-y-4 p-5">
            <h2 className="font-display text-lg font-semibold">ملخص السلة</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">عدد المنتوجات</dt>
                <dd className="num font-medium">{itemCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">المجموع الفرعي</dt>
                <dd className="num font-medium">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">التوصيل</dt>
                <dd className="text-muted-foreground text-xs">
                  كيتحدد مع البائع
                </dd>
              </div>
            </dl>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="font-display font-semibold">المجموع</span>
              <span className="text-price text-xl text-glow-gold">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {settings
                ? `الطلب كيتصيفط مباشرة لواتساب ${shopName} مع التفاصيل كاملة.`
                : "كنحضرو معلومات المتجر…"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
