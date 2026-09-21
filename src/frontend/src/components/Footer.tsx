import { BrandMark } from "@/components/BrandMark";
import { BrandWordmark } from "@/components/BrandWordmark";
import { Separator } from "@/components/ui/separator";
import { useStoreSettings } from "@/hooks/use-catalog";
import { toTelHref } from "@/lib/format";
import { buildWhatsappContactLink } from "@/lib/whatsapp";
import { Link } from "@tanstack/react-router";
import {
  Clock,
  Facebook,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const QUICK_LINKS = [
  { to: "/", label: "الرئيسية", ocid: "home" },
  { to: "/products", label: "المنتوجات", ocid: "products" },
  { to: "/cart", label: "السلة", ocid: "cart" },
  { to: "/admin", label: "لوحة التحكم", ocid: "admin" },
] as const;

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/", label: "فيسبوك", Icon: Facebook },
  { href: "https://www.instagram.com/", label: "إنستغرام", Icon: Instagram },
] as const;

export function Footer() {
  const { data: settings } = useStoreSettings();
  const year = new Date().getFullYear();

  const shopName = settings?.shopName ?? "MOUSTAPHA SHOP";
  const tagline = settings?.tagline ?? "متجر مغربي فاخر";
  const phone = settings?.phone ?? "";
  const address = settings?.address ?? "";
  const openingHours = settings?.openingHours ?? "";
  const whatsappHref = settings
    ? buildWhatsappContactLink(settings)
    : "https://wa.me/";

  return (
    <footer
      data-ocid="footer.section"
      className="mt-16 border-t border-border bg-secondary"
    >
      <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <BrandMark size={40} />
            <BrandWordmark name={shopName} size="sm" />
          </div>
          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
            {tagline}
          </p>
        </div>

        <nav aria-label="روابط سريعة" className="space-y-3">
          <h2 className="font-display text-sm font-bold">روابط سريعة</h2>
          <ul className="space-y-2">
            {QUICK_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  data-ocid={`footer.link.${link.ocid}`}
                  className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="font-display text-sm font-bold">تواصل معانا</h2>
          <ul className="space-y-2.5 text-sm">
            {phone && (
              <li className="flex items-start gap-2">
                <Phone
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <a
                  href={toTelHref(phone)}
                  data-ocid="footer.phone_link"
                  className="num text-muted-foreground transition-colors hover:text-foreground"
                >
                  {phone}
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">{address}</span>
              </li>
            )}
            {openingHours && (
              <li className="flex items-start gap-2">
                <Clock
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground">{openingHours}</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <MessageCircle
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                data-ocid="footer.whatsapp_link"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                واتساب
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-sm font-bold">تابعنا</h2>
          <ul className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  data-ocid={`footer.social_link.${label === "فيسبوك" ? "facebook" : "instagram"}`}
                  className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              </li>
            ))}
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                aria-label="واتساب"
                data-ocid="footer.social_link.whatsapp"
                className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <Separator />

      <div className="container flex flex-col items-center justify-between gap-2 py-5 text-center sm:flex-row sm:text-start">
        <p className="text-muted-foreground text-xs">
          © {year} {shopName}. جميع الحقوق محفوظة.
        </p>
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground text-xs transition-colors hover:text-foreground"
        >
          © {year}. Built with love using caffeine.ai
        </a>
      </div>
    </footer>
  );
}
