import { Layout } from "@/components/Layout";
import { CartProvider } from "@/context/CartContext";
import { AdminPage } from "@/pages/AdminPage";
import { CartPage } from "@/pages/CartPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { HomePage } from "@/pages/HomePage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { createTestQueryClient } from "@/test/render";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * A router harness that mirrors the route tree in `App.tsx` but uses an
 * in-memory history so tests can start at any URL and assert on navigation.
 * The real `App.tsx` builds its router at module scope, which makes it
 * impossible to seed a starting location; this harness keeps the same routes
 * and components while giving each test its own history.
 */
function buildRouter(initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <Layout>
        <Outlet />
      </Layout>
    ),
  });

  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
  });

  const catalogRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/products",
    validateSearch: (
      search: Record<string, unknown>,
    ): { category?: string; sort?: string; search?: string } => ({
      category:
        typeof search.category === "string" ? search.category : undefined,
      sort: typeof search.sort === "string" ? search.sort : undefined,
      search: typeof search.search === "string" ? search.search : undefined,
    }),
    component: CatalogPage,
  });

  const productDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/products/$id",
    component: ProductDetailPage,
  });

  const cartRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cart",
    component: CartPage,
  });

  const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: AdminPage,
  });

  const routeTree = rootRoute.addChildren([
    homeRoute,
    catalogRoute,
    productDetailRoute,
    cartRoute,
    adminRoute,
  ]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

export interface RenderAppResult extends RenderResult {
  queryClient: QueryClient;
  router: ReturnType<typeof buildRouter>;
}

/** Render the full app at `initialPath` with mocked actor and auth. */
export function renderApp(
  initialPath = "/",
  queryClient: QueryClient = createTestQueryClient(),
): RenderAppResult {
  const router = buildRouter(initialPath);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <CartProvider>{children}</CartProvider>
      </QueryClientProvider>
    );
  }

  const result = render(<RouterProvider router={router} />, {
    wrapper: Wrapper,
  });
  return { ...result, queryClient, router };
}
