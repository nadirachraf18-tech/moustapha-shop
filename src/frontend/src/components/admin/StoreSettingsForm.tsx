import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types";
import { AlertCircle, CheckCircle2, Loader2, Save, Store } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

interface StoreSettingsFormProps {
  settings: StoreSettings | null;
  isLoading: boolean;
  isPending: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onSubmit: (settings: StoreSettings) => void;
}

const EMPTY_SETTINGS: StoreSettings = {
  shopName: "",
  tagline: "",
  phone: "",
  whatsappNumber: "",
  address: "",
  openingHours: "",
};

/** Shop name, contact details and opening hours. */
export function StoreSettingsForm({
  settings,
  isLoading,
  isPending,
  errorMessage,
  successMessage,
  onSubmit,
}: StoreSettingsFormProps) {
  const [values, setValues] = useState<StoreSettings>(EMPTY_SETTINGS);
  const [nameError, setNameError] = useState<string | null>(null);

  // Seed the draft once the backend settings arrive; the user owns it afterwards.
  useEffect(() => {
    if (settings) setValues(settings);
  }, [settings]);

  function update<K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key === "shopName" && nameError && value.trim()) setNameError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.shopName.trim()) {
      setNameError("المرجو كتابة سمية المتجر.");
      return;
    }
    setNameError(null);
    onSubmit({ ...values, shopName: values.shopName.trim() });
  }

  return (
    <section
      data-ocid="admin.settings_section"
      className="rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-subtle sm:p-5"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink">
          <Store className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold">
            <span className="accent-sparkle">معلومات المتجر</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            هاد المعلومات كتبان فالترويسة، الفوتر وصفحة الطلب.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="settings-shop-name"
              className="text-sm font-semibold"
            >
              سمية المتجر <span className="text-destructive">*</span>
            </Label>
            <Input
              id="settings-shop-name"
              value={values.shopName}
              onChange={(event) => update("shopName", event.target.value)}
              placeholder="مثال: متجر مصطفى"
              disabled={isLoading}
              data-ocid="admin.settings_shop_name_input"
              aria-invalid={Boolean(nameError)}
              className={cn(
                "h-11 rounded-lg bg-secondary",
                nameError &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
            {nameError && (
              <p
                data-ocid="admin.settings_shop_name_error"
                className="flex items-center gap-1.5 text-destructive text-xs"
              >
                <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                {nameError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-tagline" className="text-sm font-semibold">
              الشعار القصير
            </Label>
            <Input
              id="settings-tagline"
              value={values.tagline}
              onChange={(event) => update("tagline", event.target.value)}
              placeholder="مثال: منتوجات مغربية أصيلة"
              disabled={isLoading}
              data-ocid="admin.settings_tagline_input"
              className="h-11 rounded-lg bg-secondary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-phone" className="text-sm font-semibold">
              رقم الهاتف
            </Label>
            <Input
              id="settings-phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="0612345678"
              disabled={isLoading}
              data-ocid="admin.settings_phone_input"
              className="num h-11 rounded-lg bg-secondary text-start"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="settings-whatsapp"
              className="text-sm font-semibold"
            >
              رقم واتساب
            </Label>
            <Input
              id="settings-whatsapp"
              type="tel"
              inputMode="tel"
              dir="ltr"
              value={values.whatsappNumber}
              onChange={(event) => update("whatsappNumber", event.target.value)}
              placeholder="0612345678"
              disabled={isLoading}
              data-ocid="admin.settings_whatsapp_input"
              className="num h-11 rounded-lg bg-secondary text-start"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="settings-address" className="text-sm font-semibold">
              العنوان
            </Label>
            <Input
              id="settings-address"
              value={values.address}
              onChange={(event) => update("address", event.target.value)}
              placeholder="مثال: شارع محمد الخامس، الدار البيضاء"
              disabled={isLoading}
              data-ocid="admin.settings_address_input"
              className="h-11 rounded-lg bg-secondary"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label
              htmlFor="settings-opening-hours"
              className="text-sm font-semibold"
            >
              أوقات العمل
            </Label>
            <Textarea
              id="settings-opening-hours"
              value={values.openingHours}
              onChange={(event) => update("openingHours", event.target.value)}
              placeholder="مثال: من الاثنين للسبت، من 9:00 حتى 20:00"
              rows={2}
              disabled={isLoading}
              data-ocid="admin.settings_opening_hours_textarea"
              className="resize-none rounded-lg bg-secondary"
            />
          </div>
        </div>

        {errorMessage && (
          <p
            data-ocid="admin.settings_error"
            role="alert"
            className="flex items-start gap-2 rounded-[var(--radius)] border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive text-sm"
          >
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <output
            data-ocid="admin.settings_success"
            className="flex items-start gap-2 rounded-[var(--radius)] border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success"
          >
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {successMessage}
          </output>
        )}

        <div className="flex justify-end border-t border-border pt-4">
          <Button
            type="submit"
            disabled={isPending || isLoading}
            data-ocid="admin.settings_submit_button"
            className="h-11 rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-glow-pink"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            سجّل المعلومات
          </Button>
        </div>
      </form>
    </section>
  );
}
