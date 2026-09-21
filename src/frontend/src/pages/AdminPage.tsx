import { AdminOverview } from "@/components/admin/AdminOverview";
import { CategoryManager } from "@/components/admin/CategoryManager";
import {
  ProductForm,
  type ProductFormValues,
  inputToCentimes,
} from "@/components/admin/ProductForm";
import { ProductTable } from "@/components/admin/ProductTable";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminProducts,
  useCreateCategory,
  useCreateProduct,
  useDeleteCategory,
  useDeleteProduct,
  useIsAdmin,
  useRenameCategory,
  useSetProductAvailability,
  useSetProductFeatured,
  useUpdateProduct,
  useUpdateStoreSettings,
} from "@/hooks/use-admin";
import { useCategories, useStoreSettings } from "@/hooks/use-catalog";
import type { Product, ProductImage, StoreSettings } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  Lock,
  LogIn,
  Package,
  ShieldAlert,
  ShieldCheck,
  Store,
  Tags,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function SignInGate() {
  const { login, isInitializing, isLoggingIn } = useInternetIdentity();

  return (
    <div
      data-ocid="admin.signin_gate"
      className="container flex min-h-[60vh] items-center justify-center py-16"
    >
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-card p-8 text-center shadow-elevated">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
          <Lock className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold">
          <span className="accent-sparkle">لوحة التحكم</span>
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          هاد المنطقة محمية. سجّل الدخول بحساب المسؤول باش تقدر تسيّر المنتوجات
          والأصناف ومعلومات المتجر.
        </p>
        <Button
          type="button"
          size="lg"
          disabled={isInitializing || isLoggingIn}
          data-ocid="admin.signin_button"
          onClick={() => login()}
          className="mt-6 h-12 w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink"
        >
          {isInitializing || isLoggingIn ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogIn className="size-4" aria-hidden="true" />
          )}
          {isInitializing
            ? "كنحمّلو…"
            : isLoggingIn
              ? "كنسجلو الدخول…"
              : "سجّل الدخول"}
        </Button>
        <p className="mt-4 text-muted-foreground text-xs">
          أول حساب كيسجل الدخول كيولي هو المسؤول ديال المتجر.
        </p>
      </div>
    </div>
  );
}

function AccessDenied() {
  const { clear } = useInternetIdentity();

  return (
    <div
      data-ocid="admin.access_denied"
      className="container flex min-h-[60vh] items-center justify-center py-16"
    >
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-border bg-card p-8 text-center shadow-elevated">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold">
          ما عندكش الصلاحية
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          هاد الحساب ماشي مسؤول. إلا كنت كتظن أن هادا خطأ، تواصل مع مسؤول المتجر
          باش يعطيك الصلاحية.
        </p>
        <Button
          type="button"
          variant="outline"
          data-ocid="admin.access_denied_logout_button"
          onClick={() => clear()}
          className="mt-6 h-11 rounded-full px-6"
        >
          بدّل الحساب
        </Button>
      </div>
    </div>
  );
}

function AdminLoading() {
  return (
    <div
      data-ocid="admin.loading_state"
      aria-busy="true"
      aria-label="جاري التحقق من الصلاحية"
      className="container space-y-4 py-16"
    >
      <Skeleton className="h-10 w-64 rounded-lg" />
      <Skeleton className="h-64 w-full rounded-[var(--radius-card)]" />
    </div>
  );
}

export function AdminPage() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: isRoleLoading } = useIsAdmin();

  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useAdminProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: settings, isLoading: settingsLoading } = useStoreSettings();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const setAvailability = useSetProductAvailability();
  const setFeatured = useSetProductFeatured();
  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const deleteCategory = useDeleteCategory();
  const updateSettings = useUpdateStoreSettings();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [pendingCategoryDelete, setPendingCategoryDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(
    null,
  );
  const [tab, setTab] = useState("overview");

  if (isInitializing || (isAuthenticated && isRoleLoading)) {
    return <AdminLoading />;
  }

  if (!isAuthenticated) {
    return <SignInGate />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  const categoryList = categories ?? [];

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormError(null);
    setFormOpen(true);
  }

  function handleSubmitProduct(values: ProductFormValues) {
    const price = inputToCentimes(values.price);
    if (price === null) {
      setFormError("الثمن ماشي صحيح. المرجو كتابة رقم أكبر من صفر.");
      return;
    }
    const categoryId = BigInt(values.categoryId);
    const images: ProductImage[] = values.images;
    setFormError(null);

    if (editing) {
      updateProduct.mutate(
        {
          id: editing.id,
          update: {
            name: values.name,
            price,
            categoryId,
            description: values.description,
            available: values.available,
            featured: values.featured,
            images,
          },
        },
        {
          onSuccess: () => {
            toast.success("تسجّلو التعديلات بنجاح.");
            setFormOpen(false);
            setEditing(null);
          },
          onError: (error) => setFormError(error.message),
        },
      );
      return;
    }

    createProduct.mutate(
      {
        name: values.name,
        price,
        categoryId,
        description: values.description,
        available: values.available,
        featured: values.featured,
        images,
      },
      {
        onSuccess: () => {
          toast.success("تزاد المنتوج بنجاح.");
          setFormOpen(false);
        },
        onError: (error) => setFormError(error.message),
      },
    );
  }

  function handleToggleAvailability(product: Product, available: boolean) {
    setTogglingId(product.id.toString());
    setAvailability.mutate(
      { id: product.id, available },
      {
        onSuccess: () => {
          toast.success(
            available ? "المنتوج ولا متوفر." : "المنتوج ولا غير متوفر.",
          );
        },
        onError: (error) => toast.error(error.message),
        onSettled: () => setTogglingId(null),
      },
    );
  }

  function handleToggleFeatured(product: Product, featured: boolean) {
    setTogglingFeaturedId(product.id.toString());
    setFeatured.mutate(
      { product, featured },
      {
        onSuccess: () => {
          toast.success(
            featured
              ? "المنتوج ولا مميز وكيبان فقسم «منتوجات مختارة»."
              : "تحيّد التمييز على المنتوج.",
          );
        },
        onError: (error) => toast.error(error.message),
        onSettled: () => setTogglingFeaturedId(null),
      },
    );
  }

  function handleDeleteProduct() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    deleteProduct.mutate(target.id, {
      onSuccess: () => {
        toast.success("تحيّد المنتوج.");
        setPendingDelete(null);
      },
      onError: (error) => {
        toast.error(error.message);
        setPendingDelete(null);
      },
    });
  }

  function handleCreateCategory(name: string) {
    setCategoryError(null);
    createCategory.mutate(name, {
      onSuccess: () => toast.success("تزاد الصنف بنجاح."),
      onError: (error) => setCategoryError(error.message),
    });
  }

  function handleRenameCategory(category: { id: bigint }, name: string) {
    setCategoryError(null);
    renameCategory.mutate(
      { id: category.id, name },
      {
        onSuccess: () => toast.success("تبدّلت سمية الصنف."),
        onError: (error) => setCategoryError(error.message),
      },
    );
  }

  function handleDeleteCategory() {
    if (!pendingCategoryDelete) return;
    const target = pendingCategoryDelete;
    setCategoryError(null);
    deleteCategory.mutate(BigInt(target.id), {
      onSuccess: () => {
        toast.success("تحيّد الصنف.");
        setPendingCategoryDelete(null);
      },
      onError: (error) => {
        setCategoryError(error.message);
        setPendingCategoryDelete(null);
      },
    });
  }

  function handleSubmitSettings(values: StoreSettings) {
    setSettingsError(null);
    setSettingsSuccess(null);
    updateSettings.mutate(values, {
      onSuccess: () => {
        setSettingsSuccess("تسجّلو معلومات المتجر بنجاح.");
        toast.success("تسجّلو معلومات المتجر.");
      },
      onError: (error) => setSettingsError(error.message),
    });
  }

  return (
    <div data-ocid="admin.page" className="bg-background">
      <Toaster position="top-center" richColors />

      <div className="relative overflow-hidden border-b border-border bg-gradient-subtle">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 start-1/4 size-80 rounded-full bg-primary/15 blur-[110px]"
        />
        <div className="container relative py-10 sm:py-12">
          <div className="flex items-center gap-2 text-accent">
            <ShieldCheck className="size-5" aria-hidden="true" />
            <span className="font-display text-sm font-semibold">
              منطقة المسؤول
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            <span className="accent-sparkle">لوحة التحكم</span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            سيّر منتوجات المتجر، الأصناف ومعلومات التواصل من مكان واحد.
          </p>
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.view_store_button"
            onClick={() => window.open("/", "_blank", "noopener")}
            className="mt-5 h-11 rounded-full px-5"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            شوف المتجر
          </Button>
        </div>
      </div>

      <div className="container py-8 sm:py-10">
        <Tabs value={tab} onValueChange={setTab} data-ocid="admin.tabs">
          <TabsList
            data-ocid="admin.tabs_list"
            className="h-auto w-full flex-wrap justify-start gap-1 rounded-full bg-secondary p-1 sm:w-auto"
          >
            <TabsTrigger
              value="overview"
              data-ocid="admin.overview_tab"
              className="gap-2 rounded-full px-4 py-2"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger
              value="products"
              data-ocid="admin.products_tab"
              className="gap-2 rounded-full px-4 py-2"
            >
              <Package className="size-4" aria-hidden="true" />
              المنتوجات
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              data-ocid="admin.categories_tab"
              className="gap-2 rounded-full px-4 py-2"
            >
              <Tags className="size-4" aria-hidden="true" />
              الأصناف
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              data-ocid="admin.settings_tab"
              className="gap-2 rounded-full px-4 py-2"
            >
              <Store className="size-4" aria-hidden="true" />
              معلومات المتجر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <AdminOverview
              products={products ?? []}
              categories={categoryList}
              isLoading={productsLoading || categoriesLoading}
              isError={productsError}
              onRetry={() => void refetchProducts()}
              onEditProduct={openEdit}
              onCreateProduct={openCreate}
              onGoToCategories={() => setTab("categories")}
              onGoToSettings={() => setTab("settings")}
            />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductTable
              products={products ?? []}
              categories={categoryList}
              search={search}
              onSearchChange={setSearch}
              isLoading={productsLoading}
              isError={productsError}
              onRetry={() => void refetchProducts()}
              onToggleAvailability={handleToggleAvailability}
              onToggleFeatured={handleToggleFeatured}
              togglingId={togglingId}
              togglingFeaturedId={togglingFeaturedId}
              onCreate={openCreate}
              onEdit={openEdit}
              onDelete={setPendingDelete}
            />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoryManager
              categories={categoryList}
              isLoading={categoriesLoading}
              onCreate={handleCreateCategory}
              onRename={handleRenameCategory}
              onDelete={(category) =>
                setPendingCategoryDelete({
                  id: category.id.toString(),
                  name: category.name,
                })
              }
              isCreating={createCategory.isPending}
              renamingId={
                renameCategory.isPending && renameCategory.variables
                  ? renameCategory.variables.id.toString()
                  : null
              }
              deletingId={
                deleteCategory.isPending && deleteCategory.variables
                  ? deleteCategory.variables.toString()
                  : null
              }
              errorMessage={categoryError}
              onDismissError={() => setCategoryError(null)}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <StoreSettingsForm
              settings={settings ?? null}
              isLoading={settingsLoading}
              isPending={updateSettings.isPending}
              errorMessage={settingsError}
              successMessage={settingsSuccess}
              onSubmit={handleSubmitSettings}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditing(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent
          data-ocid="admin.product_dialog"
          className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "تعديل المنتوج" : "منتوج جديد"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "بدّل المعطيات اللي بغيتي وسجّل التعديلات."
                : "عمّر المعطيات وزيد المنتوج للمتجر."}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            key={editing ? editing.id.toString() : "new"}
            categories={categoryList}
            product={editing}
            isPending={createProduct.isPending || updateProduct.isPending}
            errorMessage={formError}
            onSubmit={handleSubmitProduct}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
              setFormError(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent data-ocid="admin.delete_product_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              تحيّد المنتوج؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              غادي يتحيّد «{pendingDelete?.name}» نهائيا من المتجر. هاد العملية
              ما يمكنش ترجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.delete_product_cancel_button"
              className="rounded-full"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete_product_confirm_button"
              disabled={deleteProduct.isPending}
              onClick={handleDeleteProduct}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <AlertCircle className="size-4" aria-hidden="true" />
              )}
              حيّد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingCategoryDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingCategoryDelete(null);
        }}
      >
        <AlertDialogContent data-ocid="admin.delete_category_dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              تحيّد الصنف؟
            </AlertDialogTitle>
            <AlertDialogDescription>
              غادي يتحيّد صنف «{pendingCategoryDelete?.name}». إلا كانت منتوجات
              مرتبطة بيه، ما غاديش يتحيّد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.delete_category_cancel_button"
              className="rounded-full"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete_category_confirm_button"
              disabled={deleteCategory.isPending}
              onClick={handleDeleteCategory}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategory.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <AlertCircle className="size-4" aria-hidden="true" />
              )}
              حيّد
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
