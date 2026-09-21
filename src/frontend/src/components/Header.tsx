import { BrandMark } from "@/components/BrandMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useStoreSettings } from "@/hooks/use-catalog";
import { formatCount } from "@/lib/format";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LogIn,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "الرئيسية" },
  { to: "/products", label: "المنتوجات" },
] as const;

export function Header() {
  const { itemCount, openDrawer } = useCart();
  const { data: settings } = useStoreSettings();
  const { isAuthenticated, isInitializing, isLoggingIn, login, clear } =
    useInternetIdentity();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isMenuOpen, setMenuOpen] = useState(false);

  const shopName = settings?.shopName ?? "MOUSTAPHA SHOP";
  const tagline = settings?.tagline ?? "متجر مغربي فاخر";

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = search.trim();
    setMenuOpen(false);
    void navigate({
      to: "/products",
      search: term ? { search: term } : {},
    });
  };

  const handleAuth = () => {
    if (isAuthenticated) {
      clear();
    } else {
      login();
    }
  };

  return (
    <header
      data-ocid="header.section"
      className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-subtle backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <div className="container flex h-16 items-center gap-3">
        <Link
          to="/"
          data-ocid="header.logo_link"
          className="flex shrink-0 items-center gap-2.5"
        >
          <BrandMark size={40} />
          <BrandWordmark
            name={shopName}
            tagline={tagline}
            size="md"
            className="hidden sm:flex"
          />
        </Link>

        <nav
          aria-label="التنقل الرئيسي"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`header.nav_link.${link.to === "/" ? "home" : "products"}`}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={submitSearch}
          className="relative ms-auto hidden max-w-xs flex-1 lg:block"
        >
          <Search
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="قلب على منتج…"
            aria-label="البحث في المنتوجات"
            data-ocid="header.search_input"
            className="h-10 rounded-full bg-secondary pe-9"
          />
        </form>

        <div className="ms-auto flex items-center gap-1.5 lg:ms-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="البحث"
            data-ocid="header.search_button"
            className="lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Search className="size-5" aria-hidden="true" />
          </Button>

          <Button
            asChild
            type="button"
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
          >
            <Link
              to="/admin"
              aria-label="لوحة التحكم"
              data-ocid="header.admin_link"
            >
              <ShieldCheck className="size-5" aria-hidden="true" />
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isAuthenticated ? "تسجيل الخروج" : "تسجيل الدخول"}
            data-ocid="header.auth_button"
            disabled={isInitializing || isLoggingIn}
            onClick={handleAuth}
          >
            {isAuthenticated ? (
              <LogOut className="size-5" aria-hidden="true" />
            ) : (
              <LogIn className="size-5" aria-hidden="true" />
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            aria-label={`السلة، ${itemCount} منتج`}
            data-ocid="header.cart_button"
            className="relative h-10 gap-2 rounded-full border-accent/40 px-3 hover:border-accent hover:text-accent"
            onClick={openDrawer}
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            <span className="hidden text-sm font-semibold sm:inline">
              السلة
            </span>
            {itemCount > 0 && (
              <span
                data-ocid="header.cart_count"
                className="num absolute -top-1.5 -end-1.5 flex size-5 items-center justify-center rounded-full bg-price text-[11px] font-bold text-price-foreground shadow-glow-gold"
              >
                {formatCount(itemCount)}
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isMenuOpen ? "سد القائمة" : "فتح القائمة"}
            aria-expanded={isMenuOpen}
            data-ocid="header.menu_button"
            className="md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          data-ocid="header.mobile_menu"
          className="border-t border-border bg-card md:hidden"
        >
          <div className="container flex flex-col gap-3 py-4">
            <form onSubmit={submitSearch} className="relative">
              <Search
                className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="قلب على منتج…"
                aria-label="البحث في المنتوجات"
                data-ocid="header.mobile_search_input"
                className="h-10 rounded-full bg-secondary pe-9"
              />
            </form>
            <nav aria-label="التنقل الرئيسي" className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid={`header.mobile_nav_link.${link.to === "/" ? "home" : "products"}`}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "bg-secondary text-foreground" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin"
                data-ocid="header.mobile_admin_link"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                لوحة التحكم
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
