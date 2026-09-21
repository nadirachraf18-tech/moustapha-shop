import { createActor } from "@/backend";
import type {
  CatalogError,
  Category,
  CategoryId,
  Product,
  ProductId,
  ProductInput,
  ProductUpdate,
  StoreSettings,
} from "@/backend";
import { catalogKeys } from "@/hooks/use-catalog";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const adminKeys = {
  role: ["admin", "role"] as const,
  isAdmin: ["admin", "isAdmin"] as const,
};

/** Arabic message for every catalog error variant the backend can return. */
export function catalogErrorMessage(error: CatalogError): string {
  switch (error.__kind__) {
    case "notAuthorized":
      return "ما عندكش الصلاحية لهاد العملية. خاصك تكون مسؤول المتجر.";
    case "notFound":
      return "هاد العنصر ما بقاش موجود. يمكن تحيد من طرف آخر.";
    case "invalidInput":
      return "المعطيات ماشي صحيحة. عافاك راجع الخانات وعاود المحاولة.";
    case "categoryInUse":
      return "ما يمكنش تحيد هاد الصنف حيت كاينين منتوجات مرتبطين بيه. حيّد ولا بدّل المنتوجات الأول.";
    case "duplicateName":
      return "كاين صنف آخر بنفس السمية. اختار سمية مختلفة.";
    default:
      return "وقع مشكل غير متوقع. عاود المحاولة من فضلك.";
  }
}

/** True when the signed-in caller holds the admin role. */
export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: adminKeys.isAdmin,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

/** Every product, newest first, for the admin management table. */
export function useAdminProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: catalogKeys.products({}),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts({});
    },
    enabled: !!actor && !isFetching,
  });
}

function useInvalidateCatalog() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["catalog"] });
  };
}

export function useCreateProduct() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.createProduct(input);
      if (result.__kind__ === "err")
        throw new Error(catalogErrorMessage(result.err));
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: async ({
      id,
      update,
    }: { id: ProductId; update: ProductUpdate }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.updateProduct(id, update);
      if (result.__kind__ === "err")
        throw new Error(catalogErrorMessage(result.err));
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: async (id: ProductId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.deleteProduct(id);
      if (result.__kind__ === "err")
        throw new Error(catalogErrorMessage(result.err));
      return null;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useSetProductAvailability() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: async ({
      id,
      available,
    }: { id: ProductId; available: boolean }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.setProductAvailability(id, available);
      if (result.__kind__ === "err")
        throw new Error(catalogErrorMessage(result.err));
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

/**
 * Flip a product's featured flag without opening the edit form.
 *
 * The backend persists `isFeatured` through the existing `updateProduct`
 * method, so this reuses that mutation with the product's current fields.
 */
export function useSetProductFeatured() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: async ({
      product,
      featured,
    }: { product: Product; featured: boolean }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.updateProduct(product.id, {
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        description: product.description,
        available: product.available,
        featured,
        images: product.images,
      });
      if (result.__kind__ === "err")
        throw new Error(catalogErrorMessage(result.err));
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useCreateCategory() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.createCategory(name);
      if (result.__kind__ === "err")
        throw new Error(catalogErrorMessage(result.err));
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useRenameCategory() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: async ({ id, name }: { id: CategoryId; name: string }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.renameCategory(id, name);
      if (result.__kind__ === "err")
        throw new Error(catalogErrorMessage(result.err));
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: async (id: CategoryId) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.deleteCategory(id);
      if (result.__kind__ === "err")
        throw new Error(catalogErrorMessage(result.err));
      return null;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateStoreSettings() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCatalog();
  return useMutation({
    mutationFn: async (settings: StoreSettings) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.updateStoreSettings(settings);
      if (result.__kind__ === "err")
        throw new Error(catalogErrorMessage(result.err));
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export type { Category, Product };
