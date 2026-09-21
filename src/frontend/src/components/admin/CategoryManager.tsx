import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import {
  AlertCircle,
  Check,
  Loader2,
  Pencil,
  Plus,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { type FormEvent, useState } from "react";

interface CategoryManagerProps {
  categories: Category[];
  isLoading: boolean;
  onCreate: (name: string) => void;
  onRename: (category: Category, name: string) => void;
  onDelete: (category: Category) => void;
  isCreating: boolean;
  renamingId: string | null;
  deletingId: string | null;
  errorMessage: string | null;
  onDismissError: () => void;
}

const SKELETON_IDS = Array.from(
  { length: 4 },
  (_, index) => `admin-category-skeleton-${index}`,
);

/** Create, rename and delete product categories. */
export function CategoryManager({
  categories,
  isLoading,
  onCreate,
  onRename,
  onDelete,
  isCreating,
  renamingId,
  deletingId,
  errorMessage,
  onDismissError,
}: CategoryManagerProps) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.trim();
    if (!name) return;
    setDraft("");
    onCreate(name);
  }

  function startEditing(category: Category) {
    setEditingId(category.id.toString());
    setEditingName(category.name);
  }

  function commitRename(category: Category) {
    const name = editingName.trim();
    if (!name || name === category.name) {
      setEditingId(null);
      return;
    }
    onRename(category, name);
    setEditingId(null);
  }

  return (
    <section
      data-ocid="admin.categories_section"
      className="rounded-[var(--radius-card)] border border-border bg-card p-4 shadow-subtle sm:p-5"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink">
          <Tags className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold">
            <span className="accent-sparkle">الأصناف</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            نظّم منتوجاتك فمجموعات واضحة.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-2">
        <Label htmlFor="category-name" className="text-sm font-semibold">
          صنف جديد
        </Label>
        <div className="flex gap-2">
          <Input
            id="category-name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="مثال: أواني المطبخ"
            data-ocid="admin.category_name_input"
            className="h-11 rounded-lg bg-secondary"
          />
          <Button
            type="submit"
            disabled={isCreating || !draft.trim()}
            data-ocid="admin.category_create_button"
            className="h-11 shrink-0 rounded-full bg-gradient-primary px-5 text-primary-foreground shadow-glow-pink"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            زيد
          </Button>
        </div>
      </form>

      {errorMessage && (
        <div
          data-ocid="admin.category_error"
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-[var(--radius)] border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            aria-label="سد الرسالة"
            data-ocid="admin.category_error_dismiss_button"
            onClick={onDismissError}
            className="shrink-0 rounded-full p-0.5 transition-colors hover:bg-destructive/10"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="mt-4">
        {isLoading ? (
          <div
            data-ocid="admin.categories_loading_state"
            aria-busy="true"
            aria-label="جاري تحميل الأصناف"
            className="space-y-2"
          >
            {SKELETON_IDS.map((id) => (
              <Skeleton key={id} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p
            data-ocid="admin.categories_empty_state"
            className="rounded-[var(--radius)] border border-dashed border-border px-4 py-8 text-center text-muted-foreground text-sm"
          >
            ما كاين حتى صنف. زيد أول صنف باش تقدر تصنّف المنتوجات.
          </p>
        ) : (
          <ul data-ocid="admin.categories_list" className="space-y-2">
            {categories.map((category, index) => {
              const id = category.id.toString();
              const isEditing = editingId === id;
              const isRenaming = renamingId === id;
              const isDeleting = deletingId === id;
              return (
                <li
                  key={id}
                  data-ocid={`admin.category_item.${index + 1}`}
                  className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-secondary/50 px-3 py-2"
                >
                  {isEditing ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        aria-label={`سمية الصنف ${category.name}`}
                        data-ocid={`admin.category_rename_input.${index + 1}`}
                        className="h-9 flex-1 rounded-lg bg-card"
                      />
                      <Button
                        type="button"
                        size="icon"
                        aria-label="سجّل السمية الجديدة"
                        data-ocid={`admin.category_rename_save_button.${index + 1}`}
                        disabled={isRenaming}
                        onClick={() => commitRename(category)}
                        className="size-9 rounded-full"
                      >
                        {isRenaming ? (
                          <Loader2
                            className="size-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Check className="size-4" aria-hidden="true" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="إلغاء التعديل"
                        data-ocid={`admin.category_rename_cancel_button.${index + 1}`}
                        onClick={() => setEditingId(null)}
                        className="size-9 rounded-full"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {category.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`بدّل سمية ${category.name}`}
                        data-ocid={`admin.category_rename_button.${index + 1}`}
                        onClick={() => startEditing(category)}
                        className="size-9 rounded-full"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`حيّد صنف ${category.name}`}
                        data-ocid={`admin.category_delete_button.${index + 1}`}
                        disabled={isDeleting}
                        onClick={() => onDelete(category)}
                        className={cn(
                          "size-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive",
                        )}
                      >
                        {isDeleting ? (
                          <Loader2
                            className="size-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Trash2 className="size-4" aria-hidden="true" />
                        )}
                      </Button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
