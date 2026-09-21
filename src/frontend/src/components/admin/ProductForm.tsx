import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Category, Product, ProductImage } from "@/types";
import { AlertCircle, Loader2, Save, X } from "lucide-react";
import { type FormEvent, useState } from "react";

export interface ProductFormValues {
  name: string;
  price: string;
  categoryId: string;
  description: string;
  available: boolean;
  featured: boolean;
  images: ProductImage[];
}

interface ProductFormProps {
  categories: Category[];
  /** Existing product when editing; omitted when creating. */
  product?: Product | null;
  isPending: boolean;
  errorMessage: string | null;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
}

type FieldErrors = Partial<Record<"name" | "price" | "categoryId", string>>;

/** Centimes -> editable dirham string, e.g. `1250` -> `"12.5"`. */
function centimesToInput(centimes: bigint): string {
  const dirhams = Number(centimes) / 100;
  return Number.isInteger(dirhams) ? String(dirhams) : dirhams.toFixed(2);
}

/** Editable dirham string -> integer centimes, or `null` when unparseable. */
export function inputToCentimes(value: string): bigint | null {
  const normalised = value.trim().replace(",", ".");
  if (!normalised) return null;
  const dirhams = Number(normalised);
  if (!Number.isFinite(dirhams) || dirhams <= 0) return null;
  return BigInt(Math.round(dirhams * 100));
}

function initialValues(product?: Product | null): ProductFormValues {
  if (!product) {
    return {
      name: "",
      price: "",
      categoryId: "",
      description: "",
      available: true,
      featured: false,
      images: [],
    };
  }
  return {
    name: product.name,
    price: centimesToInput(product.price),
    categoryId: product.categoryId.toString(),
    description: product.description,
    available: product.available,
    featured: product.featured,
    images: product.images,
  };
}

function validate(values: ProductFormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) {
    errors.name = "المرجو كتابة سمية المنتوج.";
  }
  const centimes = inputToCentimes(values.price);
  if (!values.price.trim()) {
    errors.price = "المرجو كتابة الثمن بالدرهم.";
  } else if (centimes === null) {
    errors.price = "الثمن خاصو يكون رقم أكبر من صفر. مثال: 149.90";
  }
  if (!values.categoryId) {
    errors.categoryId = "المرجو اختيار الصنف.";
  }
  return errors;
}

/** Create/edit form for a product, with dirham -> centimes conversion. */
export function ProductForm({
  categories,
  product,
  isPending,
  errorMessage,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    initialValues(product),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState(false);

  function update<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched) setErrors(validate(next));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit({ ...values, name: values.name.trim() });
  }

  const isEditing = Boolean(product);

  return (
    <form
      data-ocid="admin.product_form"
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="product-name" className="text-sm font-semibold">
            سمية المنتوج <span className="text-destructive">*</span>
          </Label>
          <Input
            id="product-name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="مثال: طاجين فخار مغربي"
            data-ocid="admin.product_name_input"
            aria-invalid={Boolean(errors.name)}
            className={cn(
              "h-11 rounded-lg bg-card",
              errors.name &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.name && (
            <p
              data-ocid="admin.product_name_error"
              className="flex items-center gap-1.5 text-destructive text-xs"
            >
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-price" className="text-sm font-semibold">
            الثمن (بالدرهم) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="product-price"
            type="text"
            inputMode="decimal"
            dir="ltr"
            value={values.price}
            onChange={(event) => update("price", event.target.value)}
            placeholder="149.90"
            data-ocid="admin.product_price_input"
            aria-invalid={Boolean(errors.price)}
            className={cn(
              "num h-11 rounded-lg bg-card text-start",
              errors.price &&
                "border-destructive focus-visible:ring-destructive",
            )}
          />
          {errors.price ? (
            <p
              data-ocid="admin.product_price_error"
              className="flex items-center gap-1.5 text-destructive text-xs"
            >
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.price}
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              كيتسجل فالقاعدة بالسنتيم (1 درهم = 100 سنتيم).
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-category" className="text-sm font-semibold">
            الصنف <span className="text-destructive">*</span>
          </Label>
          <Select
            value={values.categoryId}
            onValueChange={(value) => update("categoryId", value)}
          >
            <SelectTrigger
              id="product-category"
              data-ocid="admin.product_category_select"
              aria-invalid={Boolean(errors.categoryId)}
              className={cn(
                "h-11 rounded-lg bg-card",
                errors.categoryId && "border-destructive",
              )}
            >
              <SelectValue placeholder="اختار الصنف" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem
                  key={category.id.toString()}
                  value={category.id.toString()}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p
              data-ocid="admin.product_category_error"
              className="flex items-center gap-1.5 text-destructive text-xs"
            >
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.categoryId}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label
            htmlFor="product-description"
            className="text-sm font-semibold"
          >
            الوصف
          </Label>
          <Textarea
            id="product-description"
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="وصف مختصر للمنتوج: المادة، القياس، الاستعمال…"
            rows={4}
            data-ocid="admin.product_description_textarea"
            className="resize-none rounded-lg bg-card"
          />
        </div>
      </div>

      <div className="grid gap-4 rounded-[var(--radius)] border border-border bg-secondary/50 p-4 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Label
              htmlFor="product-available"
              className="text-sm font-semibold"
            >
              متوفر للبيع
            </Label>
            <p className="text-muted-foreground text-xs">
              إلا حيّدتيها، المنتوج كيبان فالمتجر بعلامة «غير متوفر».
            </p>
          </div>
          <Switch
            id="product-available"
            checked={values.available}
            onCheckedChange={(checked) => update("available", checked)}
            data-ocid="admin.product_available_switch"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Label htmlFor="product-featured" className="text-sm font-semibold">
              منتوج مميز
            </Label>
            <p className="text-muted-foreground text-xs">
              كيبان فقسم «منتوجات مختارة» فالصفحة الرئيسية.
            </p>
          </div>
          <Switch
            id="product-featured"
            checked={values.featured}
            onCheckedChange={(checked) => update("featured", checked)}
            data-ocid="admin.product_featured_switch"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">صور المنتوج</Label>
        <ImageUploader
          images={values.images}
          onChange={(images) => update("images", images)}
          disabled={isPending}
        />
      </div>

      {errorMessage && (
        <p
          data-ocid="admin.product_form_error"
          role="alert"
          className="flex items-start gap-2 rounded-[var(--radius)] border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          data-ocid="admin.product_cancel_button"
          onClick={onCancel}
          className="h-11 rounded-full px-6"
        >
          <X className="size-4" aria-hidden="true" />
          إلغاء
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          data-ocid="admin.product_submit_button"
          className="h-11 rounded-full bg-gradient-primary px-6 text-primary-foreground shadow-glow-pink"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {isEditing ? "سجّل التعديلات" : "زيد المنتوج"}
        </Button>
      </div>
    </form>
  );
}
