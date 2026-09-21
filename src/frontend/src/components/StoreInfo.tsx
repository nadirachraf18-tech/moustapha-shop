import { Button } from "@/components/ui/button";
import { useStoreSettings } from "@/hooks/use-catalog";
import { toTelHref } from "@/lib/format";
import { buildWhatsappContactLink } from "@/lib/whatsapp";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";

/**
 * Store contact block: opening hours, phone, address and a WhatsApp contact
 * action. Reused by the home page and any other page that needs shop details.
 */
export function StoreInfo() {
  const { data: settings, isLoading } = useStoreSettings();

  if (isLoading || !settings) {
    return (
      <div
        data-ocid="store_info.loading_state"
        className="grid gap-4 sm:grid-cols-3"
      >
        {["hours", "phone", "address"].map((key) => (
          <div
            key={key}
            className="h-24 animate-pulse rounded-[var(--radius-card)] border border-border bg-secondary"
          />
        ))}
      </div>
    );
  }

  const whatsappHref = buildWhatsappContactLink(settings);

  const details = [
    {
      key: "hours",
      Icon: Clock,
      label: "أوقات العمل",
      value: settings.openingHours,
    },
    {
      key: "phone",
      Icon: Phone,
      label: "الهاتف",
      value: settings.phone,
      href: toTelHref(settings.phone),
    },
    {
      key: "address",
      Icon: MapPin,
      label: "العنوان",
      value: settings.address,
    },
  ].filter((detail) => detail.value.trim().length > 0);

  return (
    <div data-ocid="store_info.section" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {details.map(({ key, Icon, label, value, href }) => (
          <div
            key={key}
            data-ocid={`store_info.item.${key}`}
            className="flex items-start gap-3 rounded-[var(--radius-card)] border border-border bg-card p-5 shadow-subtle"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-muted-foreground text-xs font-medium">
                {label}
              </p>
              {href ? (
                <a
                  href={href}
                  data-ocid="store_info.phone_link"
                  className="num block break-words text-sm font-semibold transition-colors hover:text-primary"
                >
                  {value}
                </a>
              ) : (
                <p className="break-words text-sm font-semibold">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button
        asChild
        type="button"
        size="lg"
        className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow-pink transition-smooth hover:-translate-y-0.5 hover:opacity-95"
      >
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          data-ocid="store_info.whatsapp_button"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          تواصل معانا فواتساب
        </a>
      </Button>
    </div>
  );
}
