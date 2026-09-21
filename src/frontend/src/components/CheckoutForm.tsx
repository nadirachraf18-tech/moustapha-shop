import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AlertCircle, Send } from "lucide-react";
import { type FormEvent, useState } from "react";

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

interface CheckoutFormProps {
  onSubmit: (details: CustomerDetails) => void;
  disabled?: boolean;
}

type FieldErrors = Partial<Record<keyof CustomerDetails, string>>;

/** Moroccan mobile numbers: 06/07 + 8 digits, or +212 6/7 + 8 digits. */
const PHONE_PATTERN = /^(?:\+212|00212|0)([67]\d{8})$/;

function validate(values: CustomerDetails): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = "المرجو كتابة الاسم الكامل.";
  } else if (values.name.trim().length < 3) {
    errors.name = "الاسم قصير بزاف، زيد شوية ديال التفاصيل.";
  }

  const phone = values.phone.replace(/[\s.-]/g, "");
  if (!phone) {
    errors.phone = "المرجو كتابة رقم الهاتف.";
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = "الرقم ماشي صحيح. مثال: 0612345678";
  }

  return errors;
}

export function CheckoutForm({
  onSubmit,
  disabled = false,
}: CheckoutFormProps) {
  const [values, setValues] = useState<CustomerDetails>({
    name: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState(false);

  function update<K extends keyof CustomerDetails>(
    key: K,
    value: CustomerDetails[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    if (touched) {
      setErrors(validate({ ...values, [key]: value }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({
      name: values.name.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
    });
  }

  return (
    <form
      data-ocid="checkout.form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="checkout-name" className="text-sm font-semibold">
          الاسم الكامل <span className="text-destructive">*</span>
        </Label>
        <Input
          id="checkout-name"
          name="name"
          data-ocid="checkout.name_input"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          placeholder="مثال: مصطفى العلوي"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "checkout-name-error" : undefined}
          className={cn(
            "h-11 rounded-lg bg-card",
            errors.name && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.name && (
          <p
            id="checkout-name-error"
            data-ocid="checkout.name_error"
            className="flex items-center gap-1.5 text-destructive text-xs"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkout-phone" className="text-sm font-semibold">
          رقم الهاتف <span className="text-destructive">*</span>
        </Label>
        <Input
          id="checkout-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          data-ocid="checkout.phone_input"
          value={values.phone}
          onChange={(event) => update("phone", event.target.value)}
          placeholder="0612345678"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
          className={cn(
            "num h-11 rounded-lg bg-card text-start",
            errors.phone && "border-destructive focus-visible:ring-destructive",
          )}
        />
        {errors.phone ? (
          <p
            id="checkout-phone-error"
            data-ocid="checkout.phone_error"
            className="flex items-center gap-1.5 text-destructive text-xs"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            {errors.phone}
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            غادي نتواصلو معاك فهاد الرقم باش نأكدو الطلب.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="checkout-address" className="text-sm font-semibold">
          عنوان التوصيل والملاحظات
        </Label>
        <Textarea
          id="checkout-address"
          name="address"
          data-ocid="checkout.address_textarea"
          value={values.address}
          onChange={(event) => update("address", event.target.value)}
          placeholder="الحي، الزنقة، رقم الدار… وزيد أي ملاحظة على الطلب."
          rows={3}
          className="resize-none rounded-lg bg-card"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={disabled}
        data-ocid="checkout.submit_button"
        className="w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink transition-smooth hover:-translate-y-0.5 hover:opacity-95"
      >
        <Send className="size-4" aria-hidden="true" />
        راجع الطلب
      </Button>
    </form>
  );
}
