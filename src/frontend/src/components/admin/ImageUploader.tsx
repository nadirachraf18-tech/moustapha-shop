import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ProductImage } from "@/types";
import { ExternalBlob } from "@caffeineai/object-storage";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";

interface ImageUploaderProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  disabled?: boolean;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Uploaded product images with per-file progress and removal. */
export function ImageUploader({
  images,
  onChange,
  disabled = false,
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setError(null);
    const uploaded: ProductImage[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(`«${file.name}» ماشي صورة. المسموح: JPG، PNG، WEBP ولا GIF.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`«${file.name}» كبيرة بزاف. الحد الأقصى 8 ميغا.`);
        continue;
      }

      try {
        setProgress(0);
        const bytes = new Uint8Array(await file.arrayBuffer());
        const blob = ExternalBlob.fromBytes(
          bytes,
          file.type,
          file.name,
        ).withUploadProgress((percentage) => {
          setProgress(Math.round(percentage));
        });
        uploaded.push({
          blob,
          filename: file.name,
          mimeType: file.type,
        });
      } catch {
        setError(`ما قدرناش نرفعو «${file.name}». عاود المحاولة.`);
      } finally {
        setProgress(null);
      }
    }

    if (uploaded.length > 0) {
      onChange([...images, ...uploaded]);
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, position) => position !== index));
  };

  const isUploading = progress !== null;

  return (
    <div data-ocid="admin.image_uploader" className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        data-ocid="admin.image_input"
        onChange={(event) => void handleFiles(event)}
      />

      <button
        type="button"
        disabled={disabled || isUploading}
        data-ocid="admin.upload_button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-[var(--radius)] border border-dashed border-border bg-secondary/60 px-4 py-6 text-center transition-colors hover:border-accent/60 hover:bg-secondary hover:shadow-glow-gold disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink">
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <UploadCloud className="size-5" aria-hidden="true" />
          )}
        </span>
        <span className="font-display text-sm font-semibold">
          {isUploading ? "كنرفعو الصورة…" : "زيد صور المنتوج"}
        </span>
        <span className="text-muted-foreground text-xs">
          JPG، PNG، WEBP ولا GIF — حتى 8 ميغا للصورة
        </span>
      </button>

      {isUploading && (
        <div data-ocid="admin.upload_progress" className="space-y-1.5">
          <Progress value={progress ?? 0} className="h-2" />
          <p className="num text-end text-muted-foreground text-xs">
            {progress ?? 0}%
          </p>
        </div>
      )}

      {error && (
        <p
          data-ocid="admin.image_error"
          role="alert"
          className="text-destructive text-xs"
        >
          {error}
        </p>
      )}

      {images.length > 0 ? (
        <ul
          data-ocid="admin.image_list"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        >
          {images.map((image, index) => (
            <li
              key={`${image.filename}-${index}`}
              data-ocid={`admin.image_item.${index + 1}`}
              className="group relative overflow-hidden rounded-[var(--radius)] border border-border bg-secondary"
            >
              <img
                src={image.blob.getDirectURL()}
                alt={image.filename}
                className="aspect-square w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label={`حيّد صورة ${image.filename}`}
                data-ocid={`admin.image_remove_button.${index + 1}`}
                disabled={disabled}
                onClick={() => removeAt(index)}
                className="absolute end-2 top-2 size-8 rounded-full opacity-90 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p
          data-ocid="admin.image_empty_state"
          className="flex items-center gap-2 text-muted-foreground text-xs"
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          ما كاينة حتى صورة. المنتوج بلا صورة كيبان فالمتجر بعلامة «بلا صورة».
        </p>
      )}
    </div>
  );
}
