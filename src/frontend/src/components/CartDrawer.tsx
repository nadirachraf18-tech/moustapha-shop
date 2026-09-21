import { ProductImagePlaceholder } from "@/components/ProductImagePlaceholder";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
// ShoppingBag is still used by the empty-cart state below.

export function CartDrawer() {
  const {
    lines,
    itemCount,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
  } = useCart();

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent
        side="left"
        data-ocid="cart.sheet"
        className="w-full gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border bg-card px-5 py-4 text-start">
          <SheetTitle className="font-display text-lg">
            سلة المشتريات
          </SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm">
            {itemCount > 0 ? `${itemCount} منتج فالسلة` : "السلة خاوية دابا"}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div
            data-ocid="cart.empty_state"
            className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <ShoppingBag className="size-7" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-display text-base font-semibold">
                مازال ما زدت حتى منتج
              </p>
              <p className="text-muted-foreground text-sm">
                تصفح المنتوجات وزيد اللي عجبك للسلة.
              </p>
            </div>
            <Button
              asChild
              type="button"
              className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink"
              onClick={closeDrawer}
            >
              <Link to="/products" data-ocid="cart.browse_button">
                تصفح المنتوجات
              </Link>
            </Button>
          </div>
        ) : (
          <ul
            data-ocid="cart.list"
            className="flex-1 divide-y divide-border overflow-y-auto px-5"
          >
            {lines.map((line, index) => (
              <li
                key={line.productId}
                data-ocid={`cart.item.${index + 1}`}
                className="flex gap-3 py-4"
              >
                <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
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

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate font-medium">{line.name}</p>
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

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 rounded-full border border-border p-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`نقص كمية ${line.name}`}
                        data-ocid={`cart.decrease_button.${index + 1}`}
                        className="size-7 rounded-full"
                        onClick={() =>
                          updateQuantity(line.productId, line.quantity - 1)
                        }
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </Button>
                      <span className="num w-6 text-center text-sm font-semibold">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`زيد كمية ${line.name}`}
                        data-ocid={`cart.increase_button.${index + 1}`}
                        className="size-7 rounded-full"
                        onClick={() =>
                          updateQuantity(line.productId, line.quantity + 1)
                        }
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                    <span className="text-price text-sm">
                      {formatPrice(line.price * line.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 && (
          <SheetFooter className="border-t border-border bg-card px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">المجموع</span>
              <span className="text-price text-lg text-glow-gold">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Button
              asChild
              type="button"
              size="lg"
              className="w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink"
              onClick={closeDrawer}
            >
              <Link to="/cart" data-ocid="cart.checkout_link">
                تابع الطلب
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
