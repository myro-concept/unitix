import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Copy,
  Clock,
  Instagram,
  Loader2,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Music2,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  Twitter,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEventBySlug } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/seo/SEO";
import logoGlyph from "@/assets/logo-glyph-160.png";
import NotFound from "./NotFound";
import { ShareSheet } from "@/components/ShareSheet";

type OrganizerProfile = {
  id: string;
  school: string | null;
  company: string | null;
  full_name: string | null;
  company_description?: string | null;
  company_slug?: string | null;
  website?: string | null;
};

type TicketType = {
  id: string;
  event_id: string;
  name: string;
  price: number;
  quantity: number | null;
};

const SITE_URL = "https://unitix.ng";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;

const footerLinks = {
  Platform: [
    { label: "Browse events", to: "/events" },
    { label: "Create event", to: "/auth" },
    { label: "Pricing", to: "/pricing" },
    { label: "For organizers", to: "/pricing" },
  ],
  Company: [
    { label: "About us", to: "/about-us" },
    { label: "Blog", to: "/" },
    { label: "Careers", to: "/" },
    { label: "Contact us", to: "/contact-us" },
  ],
  Support: [
    { label: "Help centre", to: "https://wa.me/2348120604186" },
    { label: "Terms of service", to: "/terms-of-service" },
    { label: "Privacy policy", to: "/privacy-policy" },
    { label: "Refund policy", to: "/refund-policy" },
  ],
};

function Logo({ textColor = "#111111" }: { textColor?: string }) {
  return (
    <div className="ut-logo">
      <div className="ut-logo-mark">
        <img src={logoGlyph} alt="UniTix" />
      </div>
      <span style={{ color: textColor }}>UniTix</span>
    </div>
  );
}

function formatDateTime(date?: string | null) {
  if (!date) {
    return {
      date: "Date TBA",
      time: "Time TBA",
      full: "Date & time TBA",
    };
  }

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return {
      date: "Date TBA",
      time: "Time TBA",
      full: "Date & time TBA",
    };
  }

  const dateText = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeText = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return {
    date: dateText,
    time: timeText,
    full: `${dateText} • ${timeText}`,
  };
}

function formatMoney(value?: number | null) {
  const price = Number(value || 0);

  if (price <= 0) return "Free";

  return `₦${price.toLocaleString()}`;
}

function normalizeTicket(raw: any, eventId: string, index: number): TicketType {
  return {
    id: String(raw.id || `${eventId}-${index}`),
    event_id: String(raw.event_id || eventId),
    name:
      raw.name ||
      raw.ticket_name ||
      raw.title ||
      raw.type ||
      "General Admission",
    price: Number(raw.price ?? raw.ticket_price ?? raw.amount ?? 0),
    quantity:
      raw.quantity ??
      raw.qty ??
      raw.capacity ??
      null,
  };
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.051 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function EventDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading } = useEventBySlug(slug);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadOrganizer() {
      if (!event?.user_id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, school, company, full_name, company_description, company_slug, website")
        .eq("id", event.user_id)
        .single();

      if (!error && data) {
        setOrganizer(data as OrganizerProfile);
      }
    }

    loadOrganizer();
  }, [event?.user_id]);

  useEffect(() => {
    async function loadTicketTypes() {
      if (!event?.id) return;

      const { data, error } = await (supabase as any)
        .from("ticket_types")
        .select("*")
        .eq("event_id", event.id);

      if (!error && data && data.length > 0) {
        const tickets = data
          .map((item: any, index: number) => normalizeTicket(item, event.id, index))
          .sort((a: TicketType, b: TicketType) => a.price - b.price);

        setTicketTypes(tickets);
        setSelectedTicket(tickets[0]);
        return;
      }

      const fallbackTicket: TicketType = {
        id: "general-admission",
        event_id: event.id,
        name: "General Admission",
        price: Number(event.ticket_price || 0),
        quantity: event.capacity || null,
      };

      setTicketTypes([fallbackTicket]);
      setSelectedTicket(fallbackTicket);
    }

    loadTicketTypes();
  }, [event?.id]);

  const eventDate = useMemo(
    () => formatDateTime(event?.event_date),
    [event?.event_date]
  );

  const canonicalUrl = `${SITE_URL}/events/${encodeURIComponent(slug ?? event?.slug ?? "")}`;
  const eventDescription = event?.description?.trim() || "Discover this campus event and secure your ticket on UniTix.";
  const ogImage = event?.background_image_url || DEFAULT_OG_IMAGE;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fafaf9]">
        <SEO
          page="events"
          title="Loading event | UniTix"
          description="Loading event details on UniTix."
          url={canonicalUrl}
          image={DEFAULT_OG_IMAGE}
          robots="noindex, nofollow"
        />
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-9 h-9 animate-spin text-[#FF0048]" />

          <p className="text-sm font-extrabold text-[#6b7280]">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return <NotFound />;
  }

  const flyer = event.background_image_url;
  const category = event.event_type || "Event";
  const location = event.location_value || "Venue TBA";
  const organizerName =
    organizer?.company || organizer?.full_name || "UniTix Organizer";
  const school = organizer?.school || "Campus";
  const activePrice = Number(selectedTicket?.price || 0);
  const total = activePrice * quantity;
  const eventUrl = typeof window !== "undefined" ? window.location.href : "";
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
  `Check out ${event.name} on UniTix: ${eventUrl}`
)}`;

  const maxQuantity = selectedTicket?.quantity || 99;
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: eventDescription,
    image: ogImage,
    url: canonicalUrl,
    startDate: event.event_date || undefined,
    endDate: event.event_end_date || undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: event.status === "cancelled"
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled",
    location: event.location_value
      ? {
          "@type": "Place",
          name: event.location_value,
          address: event.location_value,
        }
      : undefined,
    organizer: organizerName
      ? {
          "@type": "Organization",
          name: organizerName,
          url: organizer?.website || undefined,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "NGN",
      price: Number(selectedTicket?.price || event.ticket_price || 0),
      availability: "https://schema.org/InStock",
      validFrom: event.event_date || undefined,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Events",
        item: `${SITE_URL}/events`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: event.name,
        item: canonicalUrl,
      },
    ],
  };

  const copyToClipboard = async (text: string) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(eventUrl);
      toast.success("Event link copied");
    } catch (error) {
      toast.error("Could not copy event link");
    }
  };

  const handleBuyTicket = () => {
    if (!selectedTicket) {
      toast.error("Please select a ticket type.");
      return;
    }

    navigate(`/checkout/${slug}`, {
      state: {
        ticketId: selectedTicket.id,
        quantity,
        ticketName: selectedTicket.name,
        price: Number(selectedTicket.price || 0),
      },
    });
  };

  function closeMobile(): void {
    setMobileOpen(false);
  }

  return (
    <div className="event-details-page">
      <SEO
        page="events"
        title={event.name}
        description={eventDescription}
        image={ogImage}
        url={canonicalUrl}
        type="website"
        keywords={`${event.name}, ${category}, ${location}, campus events, UniTix`}
        jsonLd={breadcrumbSchema && eventSchema ? [breadcrumbSchema, eventSchema] : eventSchema || breadcrumbSchema || undefined}
      />
      <style>{`
        .event-details-page {
          min-height: 100vh;
          background: #fafaf9;
          color: #111111;
          font-family: 'DM Sans', system-ui, sans-serif;
          overflow-x: hidden;
        }

        .loading-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .ut-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .ut-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #ff0048;
          overflow: hidden;
          flex-shrink: 0;
        }

        .ut-logo-mark img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .ut-logo span {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #111111;
          font-family: 'Bricolage Grotesque', 'DM Sans', sans-serif;
        }

        .event-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
        }

        .event-nav-inner {
          max-width: 1200px;
          height: 70px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .nav-links a,
        .footer a {
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .nav-links a:hover,
        .footer a:hover {
          color: #FF0048;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        body {
          padding-top: 70px;
        }

        .login-link {
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          padding: 9px 16px;
          border-radius: 10px;
        }

        .unitix-btn,
        .primary-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #ff0048 !important;
          color: white !important;
          border-radius: 14px;
          border: 0;
          font-weight: 900;
          text-decoration: none;
        }

        .primary-link {
          padding: 13px 24px;
          font-size: 14px;
        }

        .mobile-btn {
          display: none;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: #0b1020;
          color: #111111;
          align-items: center;
          justify-content: center;
        }

        .mobile-menu {
          display: none;
        }

        .hero-bg-section {
          position: relative;
          min-height: 460px;
          overflow: hidden;
          border-bottom: 1px solid #efe7e7;
        }

        .hero-bg-img {
          position: absolute;
          left: 0;
          top: -60px;
          width: 100%;
          height: calc(100% + 60px);
          object-fit: cover;
          object-position: center top;
        }

        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(250,250,249,0.45) 45%, #fafaf9 100%),
            linear-gradient(to right, rgba(255,255,255,0.18), rgba(255,255,255,0.04), rgba(255,255,255,0.18));
        }

        .hero-bg-fallback {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 20%, rgba(255,0,72,0.16), transparent 32%),
            radial-gradient(circle at 80% 20%, rgba(255,0,72,0.10), transparent 30%),
            linear-gradient(135deg, #fff1f2, #fafaf9);
        }

        .back-floating {
          position: relative;
          z-index: 4;
          max-width: 1200px;
          margin: 0 auto;
          padding: 36px 32px 0;
        }

        .back-floating a {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          color: #111111;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(229,231,235,0.85);
          backdrop-filter: blur(12px);
        }

        .content-wrap {
          max-width: 1200px;
          margin: -155px auto 0;
          padding: 0 32px 76px;
          position: relative;
          z-index: 5;
        }

        .main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 390px;
          gap: 32px;
          align-items: start;
        }

        .event-card-main,
        .ticket-card,
        .map-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          box-shadow: 0 24px 70px rgba(17,17,17,0.08);
        }

        .event-card-main {
          padding: 34px;
        }

        .event-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 22px;
        }

        .event-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 14px;
          border-radius: 999px;
          background: #fff1f2;
          color: #ff0048;
          font-size: 13px;
          font-weight: 900;
        }

        .event-tag.school {
          background: #f3f4f6;
          color: #4b5563;
        }

        .event-title {
          font-size: clamp(38px, 5vw, 64px);
          line-height: 1.02;
          letter-spacing: -0.06em;
          font-weight: 900;
          margin-bottom: 20px;
        }

        .quick-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          color: #6b7280;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 28px;
        }

        .quick-meta span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .quick-meta svg {
          color: #ff0048;
          flex-shrink: 0;
        }

        .organizer-strip {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fafaf9;
          border: 1px solid #f1f1f1;
          border-radius: 22px;
          padding: 18px;
          margin-bottom: 30px;
        }

        .organizer-avatar {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: #fff1f2;
          color: #ff0048;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .organizer-info {
          min-width: 0;
        }

        .organizer-info small {
          display: block;
          color: #6b7280;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .organizer-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .organizer-name-row strong {
          color: #111111;
          font-size: 16px;
          font-weight: 900;
        }

        .organizer-name-row span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .section-title {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin-bottom: 14px;
        }

        .event-description {
          color: #4b5563;
          font-size: 15px;
          line-height: 1.85;
          white-space: pre-line;
        }

        .details-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin: 28px 0;
        }

        .detail-box {
          border: 1px solid #f1f1f1;
          background: #fafaf9;
          border-radius: 22px;
          padding: 18px;
        }

        .detail-box svg {
          color: #ff0048;
          margin-bottom: 10px;
        }

        .detail-label {
          color: #9ca3af;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          margin-bottom: 6px;
        }

        .detail-value {
          color: #111111;
          font-size: 14px;
          font-weight: 900;
          line-height: 1.5;
        }

        .detail-sub {
          color: #6b7280;
          font-size: 14px;
          margin-top: 3px;
        }

        .event-actions-line {
          display: flex;
          align-items: center;
          gap: 18px;
          border-top: 1px solid #f1f1f1;
          padding-top: 18px;
          margin-top: 28px;
        }

        .event-actions-line button,
        .event-actions-line a {
          border: 0;
          background: transparent;
          color: #6b7280;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .side-column {
          position: sticky;
          top: 96px;
        }

        .ticket-card {
          padding: 26px;
        }

        .ticket-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .ticket-heading svg {
          color: #ff0048;
        }

        .ticket-heading h2 {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .ticket-label {
          color: #6b7280;
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .ticket-options {
          display: grid;
          gap: 12px;
        }

        .ticket-option {
          width: 100%;
          border: 2px solid #e5e7eb;
          background: #ffffff;
          border-radius: 20px;
          padding: 17px;
          text-align: left;
          cursor: pointer;
        }

        .ticket-option.active {
          border-color: #ff0048;
          background: #fff7fa;
        }

        .ticket-option-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .ticket-name {
          color: #111111;
          font-size: 15px;
          font-weight: 900;
        }

        .ticket-stock {
          color: #9ca3af;
          font-size: 12px;
          font-weight: 700;
          margin-top: 5px;
        }

        .ticket-price {
          color: #111111;
          font-size: 15px;
          font-weight: 900;
          white-space: nowrap;
        }

        .quantity-block {
          margin-top: 24px;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .qty-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .qty-value {
          width: 34px;
          text-align: center;
          font-size: 18px;
          font-weight: 900;
        }

        .total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #f1f1f1;
          padding-top: 22px;
          margin-top: 24px;
        }

        .total-row span {
          color: #6b7280;
          font-size: 14px;
          font-weight: 900;
        }

        .total-row strong {
          color: #111111;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .buy-btn {
          width: 100%;
          height: 54px;
          border-radius: 18px;
          background: #ff0048 !important;
          color: #ffffff !important;
          font-size: 15px;
          font-weight: 900;
          margin-top: 24px;
        }

        .ticket-share-grid {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        .ticket-share-grid button,
        .ticket-share-grid a {
          width: 100%;
          height: 48px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #111111;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .ticket-share-grid a svg {
          color: #ff0048;
          flex-shrink: 0;
        }

        .copy-event-link-btn svg {
          color: #ff0048 !important;
          stroke: #ff0048 !important;
        }

        .secure-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #9ca3af;
          font-size: 12px;
          font-weight: 700;
          margin-top: 16px;
        }

        .secure-note svg {
          color: #ff0048;
        }

        .map-card {
          padding: 28px;
          margin-top: 28px;
        }

        .map-frame {
          width: 100%;
          height: 250px;
          border: 0;
          border-radius: 22px;
          background: #f3f4f6;
          margin-top: 14px;
        }

        .footer {
          border-top: none;
          background: white;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 32px 32px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 48px;
        }

        .footer-about p {
          color: #9ca3af;
          font-size: 13px;
          line-height: 1.6;
          max-width: 260px;
          margin-top: 16px;
        }

        .socials {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .socials a {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          text-decoration: none;
        }

        .footer-group h4 {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin-bottom: 16px;
        }

        .footer-group div {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-bottom {
          border-top: 1px solid #f3f4f6;
          padding-top: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .footer-bottom p,
        .footer-bottom a {
          color: #9ca3af;
          font-size: 13px;
          text-decoration: none;
        }

        .footer-bottom span {
          color: #ff0048;
          font-weight: 900;
        }

        .not-found-card {
          border-radius: 28px;
        }

        .not-found-card h1 {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.04em;
          margin-bottom: 8px;
        }

        .not-found-card p {
          color: #6b7280;
          margin-bottom: 20px;
        }

        @media (max-width: 980px) {
          .nav-links,
          .nav-actions {
            display: none;
          }

          .mobile-btn {
            display: flex;
          }

          .mobile-menu {
            display: block;
            padding: 18px 24px 24px;
            border-top: 1px solid #e5e7eb;
            background: white;
          }

          .mobile-menu a {
            display: block;
            padding: 14px 0;
            color: #111111;
            font-weight: 800;
            text-decoration: none;
            border-bottom: 1px solid #f3f4f6;
          }

          .mobile-menu .primary-link {
            display: flex;
            margin-top: 14px;
            border-bottom: 0;
          }

          .main-grid {
            grid-template-columns: 1fr;
          }

          .side-column {
            position: static;
          }

          .content-wrap {
            margin-top: -135px;
          }
        }

        @media (max-width: 640px) {
          .event-nav-inner,
          .footer-inner {
            padding-left: 24px;
            padding-right: 24px;
          }

          .event-nav-inner {
            height: 70px;
          }

          .hero-bg-section {
            min-height: 410px;
          }

          .hero-bg-img {
            top: -60px;
            height: calc(100% + 60px);
            object-position: center top;
          }

          .hero-bg-overlay {
            background:
              linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(250,250,249,0.10) 50%, #fafaf9 100%);
          }

          .back-floating {
            padding: 22px 24px 0;
          }

          .content-wrap {
            padding: 0 24px 64px;
            margin-top: -92px;
          }

          .event-card-main,
          .ticket-card,
          .map-card {
            border-radius: 26px;
          }

          .event-card-main {
            padding: 28px;
          }

          .event-title {
            font-size: 42px;
            line-height: 1.08;
          }

          .quick-meta {
            display: grid;
            gap: 14px;
            font-size: 15px;
          }

          .details-row {
            grid-template-columns: 1fr;
          }

          .section-title {
            font-size: 24px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }


        /* Contact-page nav/menu style for EventDetails */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
        }

        .nav-inner {
          max-width: 1200px;
          height: 70px;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .nav .ut-logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 10px;
        }

        .nav .ut-logo span {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .nav-links a,
        .footer a {
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .nav-links a:hover,
        .footer a:hover {
          color: #FF0048;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .login-link {
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          padding: 9px 16px;
          border-radius: 10px;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 800;
          transition: transform 0.2s ease, opacity 0.2s ease;
          background: #FF0048;
          color: white;
          padding: 13px 26px;
        }

        .primary-btn:hover {
          transform: translateY(-1px);
          color: white;
        }

        .mobile-menu-button {
          display: none;
          width: 42px;
          height: 42px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          color: #111111;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          z-index: 10001;
        }

        .mobile-menu {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          background: #fafaf9;
          padding: 20px;
          overflow-y: auto;
          border-top: 1px solid #e5e7eb;
        }

        .mobile-menu a {
          display: block;
          padding: 15px 0;
          color: #111111;
          text-decoration: none;
          font-weight: 800;
          border-bottom: 1px solid #f1f1f1;
        }

        .mobile-menu .primary-btn,
        .mobile-menu .mobile-login-btn {
          display: flex !important;
          width: 100%;
          height: 56px;
          align-items: center;
          justify-content: center;
          padding: 0 !important;
          color: #ffffff !important;
          border-bottom: 0 !important;
          margin-top: 14px;
        }

        .mobile-login-btn {
          background: #111111;
          color: #ffffff !important;
          border-radius: 16px;
        }

        @media (max-width: 900px) {
          .nav-links,
          .nav-actions {
            display: none;
          }

          .mobile-menu-button {
            display: flex;
          }

          .mobile-menu {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .nav-inner {
            height: 66px;
            padding-left: 20px;
            padding-right: 20px;
          }

          .mobile-menu {
            top: 66px;
          }
        }

      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="logo">
            <Logo />
          </a>

          <div className="nav-links">
            {[
              { label: "Browse Events", href: "/events" },
              { label: "About Us", href: "/about-us" },
              { label: "Pricing", href: "/pricing" },
              { label: "FAQ", href: "/pricing#faq" },
            ].map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <a href="/auth" className="login-link">
              Log in
            </a>

            <a href="/auth" className="primary-btn">
              Get started <ArrowRight size={15} />
            </a>
          </div>

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {[
                { label: "Browse Events", href: "/events" },
                { label: "About Us", href: "/about-us" },
                { label: "Pricing", href: "/pricing" },
                { label: "FAQ", href: "/pricing#faq" },
              ].map((item) => (
                <a key={item.label} href={item.href} onClick={closeMobile}>
                  {item.label}
                </a>
              ))}

              <a href="/auth" className="mobile-login-btn" onClick={closeMobile}>
                Log in
              </a>

              <a href="/auth" className="primary-btn" onClick={closeMobile}>
                Get started <ArrowRight size={15} />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        <section className="hero-bg-section">
          {flyer ? (
            <img src={flyer} alt={event.name} className="hero-bg-img" decoding="async" fetchPriority="high" />
          ) : (
            <div className="hero-bg-fallback" />
          )}

          <div className="hero-bg-overlay" />

          <div className="back-floating">
            <Link to="/events" aria-label="Back to events">
              <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} />
            </Link>
          </div>
        </section>

        <section className="content-wrap">
          <div className="main-grid">
            <div>
              <motion.div
                className="event-card-main"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <div className="event-tags">
                  <span className="event-tag">{category}</span>
                  <span className="event-tag school">{school}</span>
                </div>

                <h1 className="event-title">{event.name}</h1>

                <div className="quick-meta">
                  <span>
                    <CalendarDays size={18} />
                    {eventDate.date}
                  </span>

                  <span>
                    <Clock size={18} />
                    {eventDate.time}
                  </span>

                  <span>
                    <MapPin size={18} />
                    {location}
                  </span>
                </div>

                <div className="organizer-strip">
                  <div className="organizer-avatar">
                    {organizerName.charAt(0).toUpperCase()}
                  </div>

                  <div className="organizer-info">
                    <small>Organized by</small>

                    <div className="organizer-name-row">
                      <strong>{organizerName}</strong>
                      <span>{school}</span>
                    </div>

                  </div>
                </div>

                <h2 className="section-title">About this event</h2>

                <p className="event-description">
                  {event.description ||
                    "Get ready for a smooth campus event experience. Buy your ticket, keep your confirmation, and show up ready."}
                </p>

                <div className="event-actions-line">
                  <button type="button" onClick={handleCopyLink} aria-label="Copy event link" className="copy-link-btn cursor-pointer">
                    <Copy size={17} />
                    Copy link
                  </button>

                  <ShareSheet
                    title={event.name}
                    text={`Check out ${event.name} on UniTix`}
                    url={eventUrl || canonicalUrl}
                    label="Share"
                    className="copy-link-btn cursor-pointer"
                  />
                </div>
              </motion.div>

              {location !== "Venue TBA" && (
                <div className="map-card">
                  <h2 className="section-title">Location</h2>
                  <p className="detail-sub">{location}</p>

                  <iframe
                    title={`${event.name} location`}
                    src={mapUrl}
                    loading="lazy"
                    className="map-frame"
                  />
                </div>
              )}
            </div>

            <aside className="side-column">
              <motion.div
                className="ticket-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
              >
                <div className="ticket-heading">
                  <Ticket size={22} />
                  <h2>Get Tickets</h2>
                </div>

                <p className="ticket-label">Select ticket type</p>

                <div className="ticket-options">
                  {ticketTypes.map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      className={`ticket-option ${
                        selectedTicket?.id === ticket.id ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setQuantity(1);
                      }}
                    >
                      <div className="ticket-option-inner">
                        <div>
                          <p className="ticket-name">{ticket.name}</p>
                          <p className="ticket-stock">
                            {ticket.quantity ? `${ticket.quantity} available` : "Available"}
                          </p>
                        </div>

                        <p className="ticket-price">{formatMoney(ticket.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="quantity-block">
                  <p className="ticket-label">Quantity</p>

                  <div className="quantity-control">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Minus size={16} />
                    </button>

                    <span className="qty-value">{quantity}</span>

                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="total-row">
                  <span>Total</span>
                  <strong>{activePrice > 0 ? formatMoney(total) : "Free"}</strong>
                </div>

                <Button className="buy-btn" onClick={handleBuyTicket}>
                  <ShoppingCart size={17} />
                  Buy ticket
                </Button>

                <div className="ticket-share-grid">
                  <button type="button" className="copy-event-link-btn cursor-pointer" onClick={handleCopyLink} aria-label="Copy event link">
                    <Copy size={17} />
                    Copy event link
                  </button>

                  <ShareSheet
                    title={event.name}
                    text={`Check out ${event.name} on UniTix`}
                    url={eventUrl || canonicalUrl}
                    label="Share"
                    className="copy-event-link-btn cursor-pointer"
                  />
                </div>

                <div className="secure-note">
                  <ShieldCheck size={14} />
                  Secure checkout powered by Paystack
                </div>
              </motion.div>
            </aside>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-about">
              <Logo textColor="#ffffff" />
              <p>The event ticketing platform built for Nigerian students.</p>
              <div className="socials">
                {/* X / Twitter */}
                <a href="https://x.com/unitix.ng" target="_blank" rel="noopener noreferrer">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a href="https://instagram.com/unitix.ng" target="_blank" rel="noopener noreferrer">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a href="https://wa.me/2348120604186" target="_blank" rel="noopener noreferrer">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a href="https://tiktok.com/@unitix.ng" target="_blank" rel="noopener noreferrer">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.17 8.17 0 004.78 1.52V6.82a4.85 4.85 0 01-1.01-.13z"/>
                  </svg>
                </a>
              </div>
            </div>

            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group} className="footer-group">
                <h4>{group}</h4>
                <div>
                  {links.map((link) => (
                    <a key={link.label} href={link.to}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <p>© 2026 UniTix. All rights reserved</p>

            <p style={{ margin: 0 }}>
              Powered by <a
                href="https://myroconcept.com.ng"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#FF0048",
                  textDecoration: "none",
                  fontWeight: 800,
                }}
              >
               Myro Concept
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}