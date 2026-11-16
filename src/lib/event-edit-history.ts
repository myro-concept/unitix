import { format } from "date-fns";
import { Json } from "@/integrations/supabase/types";

const eventTypeLabels: Record<string, string> = {
  party: "Party / Hangout",
  concert: "Concert / Show",
  conference: "Conference / Summit",
  workshop: "Workshop / Training",
  sport: "Sports Event",
  religious: "Religious Event",
  departmental: "Departmental Event",
  other: "Other Campus Event",
};

export function formatEditHistoryValue(field: string, value: Json | undefined): string {
  if (field === "gallery_urls") {
    const count = Array.isArray(value) ? value.length : 0;
    return count === 0 ? "No photos" : `${count} ${count === 1 ? "photo" : "photos"}`;
  }
  if (field === "background_image_url") return value ? "Flyer present" : "No flyer";
  if (value === undefined || value === null || value === "") return "—";

  if (field === "ticket_type" && typeof value === "object" && !Array.isArray(value)) {
    const ticket = value as Record<string, Json>;
    const details = [typeof ticket.name === "string" ? ticket.name : null];
    if (typeof ticket.price === "number") {
      details.push(`₦${new Intl.NumberFormat("en-NG").format(ticket.price)}`);
    }
    if (ticket.quantity === null) {
      details.push("Unlimited");
    } else if (typeof ticket.quantity === "number") {
      details.push(`${new Intl.NumberFormat("en-NG").format(ticket.quantity)} tickets`);
    }
    return details.filter(Boolean).join(" · ") || "Ticket details updated";
  }

  if (Array.isArray(value)) {
    return value.length === 0 ? "None" : `${value.length} ${value.length === 1 ? "item" : "items"}`;
  }
  if (typeof value === "object") return "Details updated";
  if (typeof value === "number" && field === "ticket_price") {
    return `₦${new Intl.NumberFormat("en-NG").format(value)}`;
  }
  if (typeof value === "string") {
    if (field === "event_type") return eventTypeLabels[value] || value;
    if (field === "event_date" || field === "event_end_date") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : format(date, "PP p");
    }
    if (/^https?:\/\//i.test(value)) return "Link updated";
    return value.length > 120 ? `${value.slice(0, 117)}…` : value;
  }
  return String(value);
}
