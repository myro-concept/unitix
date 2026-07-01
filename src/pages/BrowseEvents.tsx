import SEO from "@/seo/SEO";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  ChevronDown,
  Instagram,
  MapPin,
  Menu,
  Music2,
  Search,
  Share2,
  Ticket,
  Twitter,
  MessageCircle,
  Filter,
  X,
} from "lucide-react";
import logoGlyph from "@/assets/logo-glyph-160.png";
import { supabase } from "@/integrations/supabase/client";
import { CAMPUS_OPTIONS } from "@/lib/campusOptions";
import { ShareSheet } from "@/components/ShareSheet";

type PublicEvent = {
  id?: string;
  slug?: string;
  name: string;
  description?: string | null;
  event_date?: string | null;
  event_type?: string | null;
  location_value?: string | null;
  ticket_price?: number | null;
  background_image_url?: string | null;
  status?: string | null;
  user_id?: string | null;
  profiles?: {
    id?: string;
    school?: string | null;
    company?: string | null;
    full_name?: string | null;
  } | null;
};

type EventCardItem = {
  id: string;
  slug: string;
  title: string;
  campus: string;
  school: string;
  creator: string;
  category: string;
  tag: string;
  date: string;
  time: string;
  eventDateKey: string;
  img?: string;
  likes: number;
};

const INITIAL_VISIBLE_EVENTS = 9;
const LOAD_MORE_STEP = 9;

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

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-[10px] bg-[#FF0048] flex items-center justify-center overflow-hidden">
        <img src={logoGlyph} alt="UniTix" className="w-full h-full object-contain" decoding="async" />
      </div>

      <span
        className="font-extrabold tracking-[-0.03em]"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "20px" }}
      >
        UniTix
      </span>
    </div>
  );
}

function SocialIcon({ type }: { type: "x" | "instagram" | "whatsapp" | "tiktok" }) {
  if (type === "x") return <Twitter size={18} />;
  if (type === "instagram") return <Instagram size={18} />;
  if (type === "whatsapp") return <MessageCircle size={18} />;
  return <Music2 size={18} />;
}

function formatDate(date?: string | null) {
  if (!date) return "Date TBA";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "Date TBA" : d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

function formatDateKey(date?: string | null) {
  if (!date) return "";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function mapLiveEvent(event: PublicEvent): EventCardItem {
  const price = Number(event.ticket_price || 0);

  const dateObj = event.event_date
    ? new Date(event.event_date)
    : null;

  const formattedDate = dateObj
    ? dateObj.toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
      })
    : "Date TBA";

  const formattedTime = dateObj
  ? dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  : "";

  return {
    id: event.id || event.slug || event.name,
    slug: event.slug || event.id || event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: event.name,
    campus: event.location_value || "Venue TBA",
    school: event.profiles?.school || "Campus",
    creator: event.profiles?.company || event.profiles?.full_name || "UniTix Organizer",
    category: event.event_type || "Events",
    tag: price > 0 ? `From ₦${price.toLocaleString()}` : "Free",
    date: formattedDate,
    time: formattedTime,
    eventDateKey: formatDateKey(event.event_date),
    img: event.background_image_url || undefined,
    likes: 0,
  };
}  

function CalendarGraphic() {
  return (
    <motion.div
      className="cta-calendar"
      initial={{ opacity: 0, y: 16, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, type: "spring", stiffness: 220, damping: 18 }}
      aria-hidden="true"
    >
      <svg width="130" height="158" viewBox="0 0 130 158" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="28" width="110" height="120" rx="16" fill="#ffffff" />
        <rect x="10" y="28" width="110" height="32" rx="16" fill="#FF0048" />
        <rect x="10" y="44" width="110" height="16" fill="#FF0048" />
        <rect x="38" y="14" width="10" height="28" rx="5" fill="#17172b" />
        <rect x="82" y="14" width="10" height="28" rx="5" fill="#17172b" />
        {[0, 1, 2, 3, 4].map((col) =>
          [0, 1, 2, 3].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={21 + col * 19}
              y={72 + row * 18}
              width="12"
              height="10"
              rx="2.5"
              fill={col === 3 && row === 2 ? "#FF0048" : "#e5e7eb"}
            />
          )),
        )}
      </svg>
    </motion.div>
  );
}
function EventCard({ event, index }: { event: EventCardItem; index: number }) {
  const href = `/${event.slug}`;

  return (
    <motion.a href={href} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.42, delay: index * 0.06 }} className="event-card">
      <div className="event-img-wrap">
        {event.img ? <img src={event.img} alt={event.title} className="event-img" loading="lazy" decoding="async" /> : <div className="event-fallback"><Ticket size={42} /></div>}
        <span className="image-date-pill">
          {event.category.toLowerCase()}
        </span>
        <span className="price-pill">{event.tag}</span>
      </div>

      <div className="event-body">
        <div className="event-meta">
          <span className="event-date">
            <CalendarDays size={14} />
            {event.date}
            {event.time && <> • {event.time}</>}
          </span>
          <span className="event-school">{event.school}</span>
        </div>
        <h3>{event.title}</h3>
        <p className="event-creator">Organized by {event.creator}</p>
        <p className="event-location"><MapPin size={14} />{event.campus}</p>
        <div className="event-actions">
          <span className="get-ticket-action">
            <Ticket size={18} />
            Get Ticket
          </span>

          <ShareSheet
            title={event.title}
            text={`Check out ${event.title} on UniTix`}
            url={typeof window !== "undefined" ? new URL(href, window.location.origin).toString() : `https://unitix.ng${href}`}
            label="Share"
            className="share-action"
          />
        </div>
      </div>
    </motion.a>
  );
}

export default function Events() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("All Schools");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileFilterView, setMobileFilterView] = useState<"all" | "campus" | "dates">("all");
  const [openMobileSection, setOpenMobileSection] = useState<"campus" | "dates" | "results" | null>("campus");
  const [campusSearch, setCampusSearch] = useState("");
  const [resultsPerFetch, setResultsPerFetch] = useState(12);
  const [search, setSearch] = useState("");
  const [liveEvents, setLiveEvents] = useState<EventCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleEventsCount, setVisibleEventsCount] = useState(12);
  const [loadMoreMessage, setLoadMoreMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      setLoading(true);

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, slug, name, description, event_date, event_type, location_value, ticket_price, background_image_url, status, user_id")
        .eq("status", "live")
        .order("event_date", { ascending: true });

      if (!mounted) return;

      if (eventsError) {
        console.error("Events error:", eventsError);
        setLiveEvents([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set((eventsData || []).map((event) => event.user_id).filter(Boolean))];

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, school, company, full_name")
        .in("id", userIds);

      if (profilesError) {
        console.error("Profiles error:", profilesError);
      }

      const profilesMap = new Map(
        (profilesData || []).map((profile) => [profile.id, profile])
      );

      const mappedEvents = (eventsData || []).map((event) => {
        const profile = event.user_id ? profilesMap.get(event.user_id) : null;

        return mapLiveEvent({
          ...event,
          profiles: profile || null,
        } as PublicEvent);
      });
      setLiveEvents(mappedEvents);
      setLoading(false);
    }

    loadEvents();
    return () => { mounted = false; };
  }, []);

  const allEvents = useMemo(() => liveEvents, [liveEvents]);

  const filteredEvents = useMemo(() => allEvents.filter((event) => {
    const q = search.toLowerCase();
    const matchesSearch =
      event.title.toLowerCase().includes(q) ||
      event.school.toLowerCase().includes(q) ||
      event.campus.toLowerCase().includes(q) ||
      event.category.toLowerCase().includes(q);

    const matchesSchool =
      selectedSchool === "All Schools" ||
      event.school.toLowerCase().includes(selectedSchool.toLowerCase());

    const matchesFromDate = !fromDate || event.eventDateKey >= fromDate;
    const matchesToDate = !toDate || event.eventDateKey <= toDate;

    return matchesSearch && matchesSchool && matchesFromDate && matchesToDate;
  }), [allEvents, search, fromDate, selectedSchool, toDate]);

  useEffect(() => {
    setVisibleEventsCount(resultsPerFetch);
    setLoadMoreMessage("");
  }, [search, selectedSchool, fromDate, resultsPerFetch, toDate]);

  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, visibleEventsCount),
    [filteredEvents, visibleEventsCount],
  );

  const hasMoreEvents = visibleEventsCount < filteredEvents.length;

  const visibleCampuses = useMemo(() => {
    const q = campusSearch.toLowerCase().trim();
    return CAMPUS_OPTIONS.filter((campus) => campus.toLowerCase().includes(q));
  }, [campusSearch]);

  const handleLoadMore = () => {
    if (hasMoreEvents) {
      setVisibleEventsCount((current) => current + resultsPerFetch);
      setLoadMoreMessage("");
      return;
    }

    setLoadMoreMessage("No more event.");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
    <SEO page="events" />
    <div className="unitix-events-page">
      <style>{`
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            scroll-behavior: smooth;
        }

        .unitix-events-page {
            min-height: 100vh;
            background: #fafaf9;
            color: #111111;
            font-family: 'DM Sans', system-ui, sans-serif;
            overflow-x: hidden;
            --nav-height: 70px;
        }

        main {
          padding-top: var(--nav-height);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 32px;
        }

        .ut-logo {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            text-decoration: none;
        }

        .ut-logo-mark {
            border-radius: 10px;
            background: #ff0048;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
        }

        .ut-logo-mark img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .ut-logo span {
            font-family: 'Bricolage Grotesque', 'DM Sans', sans-serif;
            font-weight: 900;
            letter-spacing: -0.04em;
            color: #111111;
        }

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

        .nav-links {
        display: flex;
        align-items: center;
        gap: 32px;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        }

        .nav-links a {
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .footer a {
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
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
            font-weight: 700;
            text-decoration: none;
            padding: 9px 16px;
        }

        .primary-btn,
        .dark-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 15px;
            font-weight: 900;
            transition: transform 0.2s ease;
        }

        .primary-btn:hover,
        .dark-btn:hover {
            transform: translateY(-1px);
        }

        .primary-btn {
            background: #ff0048;
            color: #ffffff;
            padding: 13px 26px;
        }

        .dark-btn {
            background: #111111;
            color: #ffffff;
            padding: 13px 28px;
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
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            background: #fafaf9;
            padding: 20px;
            overflow-y: auto;
            border-top: none;
        }

        .mobile-menu a {
            display: block;
            padding: 15px 0;
            color: #111111;
            text-decoration: none;
            font-weight: 800;
          font-size: 15px;
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

        .filter-section {
          position: relative;
            z-index: 60;
            background: #ffffff;
            backdrop-filter: blur(12px);
            border-bottom: 1px solid #e5e7eb;
            padding: 16px 0;
        }

        .filter-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .mobile-filter-toolbar,
        .mobile-filter-panel {
          display: none;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(280px, 1fr) minmax(280px, 1fr) auto;
          gap: 16px;
          align-items: end;
          margin-top: 18px;
        }

        .filter-field {
          min-width: 0;
        }

        .filter-label {
          display: block;
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: 800;
          color: #262626;
        }

        .filter-control {
          width: 100%;
          height: 60px;
          border: 1px solid #e1e5ee;
          background: #ffffff;
          border-radius: 8px;
          padding: 0 18px;
          outline: none;
          font-size: 16px;
          color: #111111;
          box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04);
        }

        .filter-control:focus {
          border-color: rgba(255, 0, 72, 0.36);
          box-shadow: 0 0 0 3px rgba(255, 0, 72, 0.08);
        }

        .filter-select {
          appearance: none;
          background-image:
            linear-gradient(45deg, transparent 50%, #9ca3af 50%),
            linear-gradient(135deg, #9ca3af 50%, transparent 50%);
          background-position:
            calc(100% - 24px) calc(50% - 4px),
            calc(100% - 18px) calc(50% - 4px);
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          padding-right: 46px;
        }

        .filter-date {
          padding-right: 16px;
        }

        .filter-reset {
          height: 60px;
          border: 0;
          border-radius: 18px;
          padding: 0 28px;
          background: #11162e;
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
        }

        .filter-reset:hover {
          background: #0b1020;
        }

        .mobile-filter-toolbar {
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .mobile-filter-toolbar::-webkit-scrollbar {
          display: none;
        }

        .mobile-filter-chip {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 46px;
          padding: 0 18px;
          border-radius: 14px;
          border: 1px solid #dfe5ee;
          background: #eef3f9;
          color: #111827;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04);
        }

        .mobile-filter-chip-primary {
          background: #edf2f7;
        }

        .mobile-filter-chevron {
          color: #6b7280;
        }

        .mobile-filter-count {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 64px;
          height: 46px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid #dfe5ee;
          background: #ffffff;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 700;
        }

        .mobile-filter-panel.open {
          display: block;
          margin-top: 12px;
        }

        .mobile-filter-overlay {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 8px);
          z-index: 120;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 0 12px;
        }

        .mobile-filter-sheet {
          width: 100%;
          max-height: min(72vh, 620px);
          overflow-y: auto;
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
          padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
          animation: filterSheetDown 0.22s ease;
        }

        @keyframes filterSheetDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-filter-sheet-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .mobile-filter-sheet-head h2 {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0;
          color: #111827;
        }

        .mobile-filter-done {
          border: 0;
          background: transparent;
          color: #334155;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
        }

        .filter-accordion-card {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background: #f8fafc;
          margin-bottom: 12px;
          overflow: hidden;
        }

        .filter-accordion-title {
          width: 100%;
          border: 0;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          border-bottom: 1px solid #edf0f4;
          background: #f8fafc;
          cursor: pointer;
          text-align: left;
        }

        .filter-accordion-chevron {
          color: #64748b;
          transition: transform 0.2s ease;
        }

        .filter-accordion-chevron.open {
          transform: rotate(180deg);
        }

        .filter-accordion-body {
          padding: 12px;
          background: #ffffff;
        }

        .mobile-location-search {
          position: relative;
          margin-bottom: 10px;
        }

        .mobile-location-search svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .mobile-location-search input {
          width: 100%;
          height: 50px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #f8fafc;
          padding: 0 14px 0 42px;
          outline: none;
          font-size: 15px;
        }

        .mobile-location-list {
          display: grid;
          gap: 10px;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .mobile-location-item {
          width: 100%;
          height: 52px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          background: #ffffff;
          color: #111827;
          font-size: 15px;
          font-weight: 700;
          text-align: left;
          padding: 0 18px;
          cursor: pointer;
        }

        .mobile-location-item.active {
          background: #ff0048;
          border-color: #ff0048;
          color: #ffffff;
        }

        .mobile-date-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .mobile-date-grid .filter-label {
          margin-bottom: 6px;
          font-size: 13px;
        }

        .mobile-date-grid .filter-control {
          height: 42px;
          border-radius: 12px;
          font-size: 15px;
          padding: 0 10px;
        }

        .mobile-clear-link {
          border: 0;
          background: transparent;
          color: #334155;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          padding: 0;
        }

        .filter-sub-clear-dates {
          margin-top: 12px;
          display: inline-flex;
        }

        .results-per-fetch-options {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .results-per-fetch-option {
          height: 42px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          color: #111827;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .results-per-fetch-option.active {
          background: #111827;
          border-color: #111827;
          color: #ffffff;
        }

        .mobile-filter-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }

        .mobile-date-inline-actions {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .mobile-apply-inline {
          height: 40px;
          min-width: 92px;
          border: 0;
          border-radius: 10px;
          background: #ff0048;
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          padding: 0 18px;
        }

        .mobile-reset-all,
        .mobile-apply-all {
          height: 54px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
        }

        .mobile-reset-all {
          border: 0;
          background: #0b1020;
          color: #ffffff;
        }

        .mobile-apply-all {
          border: 0;
          background: #ff0048;
          color: #ffffff;
        }

        .desktop-filter-grid {
          margin-top: 18px;
          position: sticky;
          top: var(--nav-height);
          z-index: 62;
          background: #ffffff;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .search-box {
            flex: 1;
            min-width: 220px;
            position: relative;
        }

        .search-box svg {
            position: absolute;
            left: 18px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
        }

        .search-box input {
            width: 100%;
            height: 52px;
          border: 1px solid #dbe3ee;
          background: #eef3f9;
            border-radius: 999px;
            padding: 0 18px 0 48px;
            outline: none;
          font-size: 15px;
          font-weight: 500;
            color: #111111;
        }

        .search-box input:focus {
            border-color: rgba(255, 0, 72, 0.36);
        }

        .events-main {
          padding: 28px 0 84px;
        }

        .events-head {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 28px;
        }

        .events-head h1,
        .events-head h2 {
            font-size: clamp(28px, 4vw, 42px);
            line-height: 1.06;
            letter-spacing: -0.045em;
            font-weight: 900;
        }

        .events-head p {
            color: #6b7280;
            font-size: 15px;
            margin-top: 10px;
            line-height: 1.65;
        }

        .section-label {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.22em;
            color: #ff0048;
            margin-bottom: 18px;
        }

        .events-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 22px;
        }

        .load-more-wrap {
          margin-top: 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .load-more-btn {
          border: none;
          border-radius: 14px;
          background: #ff0048;
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          padding: 13px 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(255, 0, 72, 0.18);
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .load-more-btn:hover {
          transform: translateY(-1px);
          background: #e60041;
          box-shadow: 0 10px 22px rgba(255, 0, 72, 0.22);
        }

        .load-more-note {
          font-size: 13px;
          color: #ff0048;
          font-weight: 700;
        }

        .event-card {
            display: block;
            color: inherit;
            text-decoration: none;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 26px;
            overflow: hidden;
            transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .event-card:hover {
            transform: translateY(-4px);
            border-color: rgba(255, 0, 72, 0.22);
            box-shadow: 0 20px 60px rgba(17, 17, 17, 0.08);
        }

        .event-img-wrap {
            position: relative;
            height: 230px;
            overflow: hidden;
            background: #111111;
        }

        .event-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.4s ease;
        }

        .event-card:hover .event-img {
            transform: scale(1.04);
        }

        .event-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            background:
            radial-gradient(circle at 30% 30%, rgba(255, 0, 72, 0.45), transparent 34%),
            linear-gradient(145deg, #111111, #2a1020);
        }

        .bookmark-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 46px;
            height: 46px;
            border: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.92);
            color: #111111;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        .price-pill {
            position: absolute;
            right: 16px;
            bottom: 16px;
            background: #ffffff;
            color: #111111;
            font-size: 14px;
            font-weight: 900;
            border-radius: 999px;
            padding: 13px 18px;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        }

        .event-body {
            padding: 20px;
        }

        .image-date-pill {
          position: absolute;
          top: 16px;
          right: 16px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 241, 242, 0.98);
          color: #ff0048;
          font-size: 13px;
          font-weight: 900;
          border-radius: 999px;
          padding: 10px 14px;
          text-transform: lowercase;
          border: 1px solid rgba(255, 0, 72, 0.14);
          box-shadow: 0 10px 22px rgba(255, 0, 72, 0.08);
        }

        .event-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .event-school {
          background: #f3f4f6;
          color: #6b7280;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .event-creator {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          min-height: 30px;
        }

        .event-date {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #6b7280;
            font-size: 14px;
            font-weight: 600;
        }

        .event-body h3 {
            font-size: 20px;
            line-height: 1.25;
            letter-spacing: -0.035em;
            font-weight: 900;
            color: #111111;
            margin-bottom: 12px;
        }

.event-body h3 {
  transition: color 0.25s ease;
}

.event-card:hover .event-body h3 {
  color: #ff0048;
}

        .event-location {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
            min-height: 20px;
        }

        .event-location svg {
            flex-shrink: 0;
            margin-top: 2px;
        }

        .event-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #6b7280;
            border-top: 1px solid #f3f4f6;
            padding-top: 16px;
            margin-top: 18px;
            font-size: 13px;
            font-weight: 800;
        }

        .event-actions span,
        .event-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          line-height: 1;
        }

        .event-actions button {
          border: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          cursor: pointer;
          padding: 0;
        }

        .event-actions span svg {
          display: block;
          flex-shrink: 0;
        }

        .event-actions button svg {
          display: block;
          flex-shrink: 0;
        }

        .share-action:hover {
          color: #ff0048;
        }

        .share-action:hover svg {
          color: #ff0048;
        }

        .get-ticket-action {
          color: #111111 !important;
          font-weight: 900 !important;
        }

        .get-ticket-action svg {
          color: #ff0048 !important;
          transform: translateY(0.5px);
        }

        .empty-state {
            grid-column: 1 / -1;
            border: 1px solid #e5e7eb;
            background: #ffffff;
            border-radius: 28px;
            text-align: center;
            padding: 64px 24px;
        }

        .empty-state h3 {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: -0.04em;
            margin-bottom: 10px;
        }

        .empty-state p {
            color: #6b7280;
        }

        .skeleton-card {
          pointer-events: none;
        }

        .skeleton-img {
          height: 230px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.4s infinite;
        }

        .skeleton-line {
          height: 14px;
          border-radius: 999px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.4s infinite;
          margin-bottom: 14px;
        }

        .skeleton-line.short {
          width: 45%;
        }

        .skeleton-line.title {
          width: 75%;
          height: 20px;
        }

        .skeleton-line.small {
          width: 35%;
        }

        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .footer {
          border-top: none;
          background: #17172b;
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
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          margin-top: 16px;
          line-height: 1.6;
          max-width: 210px;
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
          border: 1px solid rgba(255,255,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          color: rgba(255,255,255,0.8);
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        .socials a:hover {
          border-color: #FF0048;
          color: #FF0048;
        }

        .footer-group h4 {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            margin-bottom: 16px;
          color: #FF0048;
        }

        .footer-group div {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .footer-bottom p,
        .footer-bottom a {
          color: rgba(255,255,255,0.4);
            font-size: 13px;
            text-decoration: none;
        }

        .footer-bottom div {
          display: flex;
          gap: 20px;
        }

        @media (max-width: 900px) {
            .nav-links,
            .nav-actions {
            display: none;
           }

            .mobile-menu-button {
            display: flex;
            }

            .events-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .footer-grid {
            grid-template-columns: 1fr 1fr;
            }
        }

        @media (max-width: 640px) {
            .unitix-events-page {
              --nav-height: 66px;
            }

            .container,
            .nav-inner,
            .footer-inner {
            padding-left: 20px;
            padding-right: 20px;
            }

            .nav-inner {
            height: 66px;
            }

            .mobile-menu {
            top: 66px;
            }

            .filter-section {
            position: fixed;
            top: var(--nav-height);
            left: 0;
            right: 0;
            z-index: 70;
            }

            .filter-row {
            flex-direction: column;
            align-items: stretch;
            }

            .search-box input {
              height: 54px;
              background: #eef3f9;
              border-color: #dbe3ee;
              font-size: 15px;
              font-weight: 500;
            }

            .search-box svg {
              left: 16px;
            }

            .desktop-filter-grid {
              display: none;
            }

            .mobile-filter-toolbar {
              display: flex;
              position: static;
              background: #ffffff;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }

            .events-main {
              padding-top: 170px;
            }

            .mobile-filter-panel.open {
              display: none;
            }

            .filter-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .filter-reset {
              width: 100%;
            }

            .filter-label {
              font-size: 14px;
              margin-bottom: 8px;
            }

            .filter-control,
            .filter-reset {
              height: 52px;
              border-radius: 14px;
            }

            .events-head {
            display: block;
            }

            .events-grid {
            grid-template-columns: 1fr;
            }

            .event-img-wrap {
            height: 215px;
            }

            .footer-grid {
            grid-template-columns: 1fr;
            }

            .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            }
        }
    `}</style>
      <nav className="nav">
        <div className="nav-inner">
            <a href="/" className="logo">
            <Logo />
            </a>

            <div className="nav-links">
            <a href="/events">Browse Events</a>
            <a href="/about-us">About Us</a>
            <a href="/pricing">Pricing</a>
            <a href="/pricing#faq">FAQ</a>
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
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
        </div>

        {mobileOpen && (
            <div className="mobile-menu">
            <a href="/events" onClick={closeMobile}>Browse Events</a>
            <a href="/about-us" onClick={closeMobile}>About Us</a>
            <a href="/pricing" onClick={closeMobile}>Pricing</a>
            <a href="/pricing#faq" onClick={closeMobile}>FAQ</a>

            <a href="/auth" className="mobile-login-btn" onClick={closeMobile}>
                Log in
            </a>

            <a href="/auth" className="primary-btn" onClick={closeMobile}>
                Get started <ArrowRight size={15} />
            </a>
            </div>
        )}
        </nav>

      <main>
        <section className="filter-section">
          <div className="container">
            <div className="filter-row">
              <div className="search-box">
                <Search size={18} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search event, campus, or location..." />
              </div>
            </div>

            <div className="mobile-filter-toolbar">
              <button
                type="button"
                className="mobile-filter-chip mobile-filter-chip-primary"
                onClick={() => {
                  setMobileFilterView("all");
                  setOpenMobileSection("campus");
                  setMobileFiltersOpen(true);
                }}
              >
                <Filter size={16} />
                Filters
              </button>

              <button
                type="button"
                className="mobile-filter-chip"
                onClick={() => {
                  setMobileFilterView("campus");
                  setOpenMobileSection("campus");
                  setMobileFiltersOpen(true);
                }}
              >
                Campus
                <ChevronDown size={14} className="mobile-filter-chevron" />
              </button>

              <button
                type="button"
                className="mobile-filter-chip"
                onClick={() => {
                  setMobileFilterView("dates");
                  setOpenMobileSection("dates");
                  setMobileFiltersOpen(true);
                }}
              >
                Dates
                <ChevronDown size={14} className="mobile-filter-chevron" />
              </button>

              <span className="mobile-filter-count">
                {loading ? "0 /" : `${visibleEvents.length} / ${filteredEvents.length}`}
              </span>
            </div>

            {mobileFiltersOpen && (
              <div className="mobile-filter-overlay" role="dialog" aria-modal="true" aria-label="Filters">
                <div className="mobile-filter-sheet">
                  <div className="mobile-filter-sheet-head">
                    <h2>
                      {mobileFilterView === "campus"
                        ? "Select campus"
                        : mobileFilterView === "dates"
                          ? "Select dates"
                          : "Filters"}
                    </h2>
                    <button type="button" className="mobile-filter-done" onClick={() => setMobileFiltersOpen(false)}>
                      Done
                    </button>
                  </div>

                  {mobileFilterView === "all" && (
                  <div className="filter-accordion-card">
                    <button
                      type="button"
                      className="filter-accordion-title"
                      onClick={() => setOpenMobileSection((current) => (current === "campus" ? null : "campus"))}
                    >
                      <span>Campus</span>
                      <ChevronDown
                        size={14}
                        className={openMobileSection === "campus" ? "filter-accordion-chevron open" : "filter-accordion-chevron"}
                      />
                    </button>
                    {openMobileSection === "campus" && (
                    <div className="filter-accordion-body">
                      <div className="mobile-location-search">
                        <Search size={18} />
                        <input
                          value={campusSearch}
                          onChange={(e) => setCampusSearch(e.target.value)}
                          placeholder="Search campus..."
                          aria-label="Search campus"
                        />
                      </div>

                      <div className="mobile-location-list">
                        <button
                          type="button"
                          className={selectedSchool === "All Schools" ? "mobile-location-item active" : "mobile-location-item"}
                          onClick={() => setSelectedSchool("All Schools")}
                        >
                          All
                        </button>
                        {visibleCampuses.map((campus) => (
                          <button
                            key={campus}
                            type="button"
                            className={selectedSchool === campus ? "mobile-location-item active" : "mobile-location-item"}
                            onClick={() => setSelectedSchool(campus)}
                          >
                            {campus}
                          </button>
                        ))}
                      </div>
                    </div>
                    )}
                  </div>
                  )}

                  {mobileFilterView === "campus" && (
                  <div className="filter-accordion-card">
                    <div className="filter-accordion-body">
                      <div className="mobile-location-search">
                        <Search size={18} />
                        <input
                          value={campusSearch}
                          onChange={(e) => setCampusSearch(e.target.value)}
                          placeholder="Search campus..."
                          aria-label="Search campus"
                        />
                      </div>

                      <div className="mobile-location-list">
                        <button
                          type="button"
                          className={selectedSchool === "All Schools" ? "mobile-location-item active" : "mobile-location-item"}
                          onClick={() => setSelectedSchool("All Schools")}
                        >
                          All
                        </button>
                        {visibleCampuses.map((campus) => (
                          <button
                            key={campus}
                            type="button"
                            className={selectedSchool === campus ? "mobile-location-item active" : "mobile-location-item"}
                            onClick={() => setSelectedSchool(campus)}
                          >
                            {campus}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  )}

                  {mobileFilterView === "all" && (
                  <div className="filter-accordion-card">
                    <button
                      type="button"
                      className="filter-accordion-title"
                      onClick={() => setOpenMobileSection((current) => (current === "dates" ? null : "dates"))}
                    >
                      <span>Dates</span>
                      <ChevronDown
                        size={14}
                        className={openMobileSection === "dates" ? "filter-accordion-chevron open" : "filter-accordion-chevron"}
                      />
                    </button>
                    {openMobileSection === "dates" && (
                    <div className="filter-accordion-body">
                      <div className="mobile-date-grid">
                        <div>
                          <label className="filter-label" htmlFor="from-date-mobile">From</label>
                          <input
                            id="from-date-mobile"
                            type="date"
                            className="filter-control filter-date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            aria-label="From date"
                          />
                        </div>
                        <div>
                          <label className="filter-label" htmlFor="to-date-mobile">To</label>
                          <input
                            id="to-date-mobile"
                            type="date"
                            className="filter-control filter-date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            aria-label="To date"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="mobile-clear-link filter-sub-clear-dates"
                        onClick={() => {
                          setFromDate("");
                          setToDate("");
                        }}
                      >
                        Clear dates
                      </button>
                    </div>
                    )}
                  </div>
                  )}

                  {mobileFilterView === "dates" && (
                  <div className="filter-accordion-card">
                    <div className="filter-accordion-body">
                      <div className="mobile-date-grid">
                        <div>
                          <label className="filter-label" htmlFor="from-date-mobile">From</label>
                          <input
                            id="from-date-mobile"
                            type="date"
                            className="filter-control filter-date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            aria-label="From date"
                          />
                        </div>
                        <div>
                          <label className="filter-label" htmlFor="to-date-mobile">To</label>
                          <input
                            id="to-date-mobile"
                            type="date"
                            className="filter-control filter-date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            aria-label="To date"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {mobileFilterView === "all" && (
                  <div className="filter-accordion-card">
                    <button
                      type="button"
                      className="filter-accordion-title"
                      onClick={() => setOpenMobileSection((current) => (current === "results" ? null : "results"))}
                    >
                      <span>Results per fetch</span>
                      <ChevronDown
                        size={14}
                        className={openMobileSection === "results" ? "filter-accordion-chevron open" : "filter-accordion-chevron"}
                      />
                    </button>
                    {openMobileSection === "results" && (
                    <div className="filter-accordion-body">
                      <div className="results-per-fetch-options" role="radiogroup" aria-label="Results per fetch">
                        {[12, 24, 36].map((count) => (
                          <button
                            key={count}
                            type="button"
                            className={resultsPerFetch === count ? "results-per-fetch-option active" : "results-per-fetch-option"}
                            onClick={() => setResultsPerFetch(count)}
                            aria-pressed={resultsPerFetch === count}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                    )}
                  </div>
                  )}

                  {mobileFilterView === "all" && (
                  <div className="mobile-filter-actions">
                    <button
                      type="button"
                      className="mobile-reset-all"
                      onClick={() => {
                        setSearch("");
                        setSelectedSchool("All Schools");
                        setCampusSearch("");
                        setFromDate("");
                        setToDate("");
                        setResultsPerFetch(12);
                      }}
                    >
                      Reset all
                    </button>
                    <button type="button" className="mobile-apply-all" onClick={() => setMobileFiltersOpen(false)}>
                      Apply
                    </button>
                  </div>
                  )}

                  {mobileFilterView === "dates" && (
                  <div className="mobile-date-inline-actions">
                    <button
                      type="button"
                      className="mobile-clear-link"
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                      }}
                    >
                      Clear dates
                    </button>
                    <button type="button" className="mobile-apply-inline" onClick={() => setMobileFiltersOpen(false)}>
                      Apply
                    </button>
                  </div>
                  )}
                </div>
              </div>
            )}

            <div className="filter-grid desktop-filter-grid">
              <div className="filter-field">
                <label className="filter-label" htmlFor="school-filter">Select Campus</label>
                <select
                  id="school-filter"
                  className="filter-control filter-select"
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  aria-label="Select campus"
                >
                  <option value="All Schools">Select a campus</option>
                  {CAMPUS_OPTIONS.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label className="filter-label" htmlFor="from-date-desktop">From</label>
                <input
                  id="from-date-desktop"
                  type="date"
                  className="filter-control filter-date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  aria-label="From date"
                />
              </div>

              <div className="filter-field">
                <label className="filter-label" htmlFor="to-date-desktop">To</label>
                <input
                  id="to-date-desktop"
                  type="date"
                  className="filter-control filter-date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  aria-label="To date"
                />
              </div>

              <button
                type="button"
                className="filter-reset"
                onClick={() => {
                  setSearch("");
                  setSelectedSchool("All Schools");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        <section className="events-main">
          <div className="container">
            <div className="events-head">
              <div>
                <motion.p
                  className="section-label"
                  style={{
                      color: "#FF0048",
                      fontWeight: 900,
                      fontSize: 11,
                      letterSpacing: ".22em",
                  }}
                  >
                  BROWSE EVENTS
                </motion.p>
                <h1>Popular events on UniTix</h1>
                <p>Discover the hottest campus parties, concerts, and hangouts happening near you across Nigeria.</p>
              </div>
            </div>

            <div className="events-grid">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="event-card skeleton-card">
                    <div className="skeleton-img" />
                    <div className="event-body">
                      <div className="skeleton-line short" />
                      <div className="skeleton-line title" />
                      <div className="skeleton-line" />
                      <div className="skeleton-line small" />
                    </div>
                  </div>
                ))
              ) : filteredEvents.length > 0 ? (
                visibleEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))
              ) : (
                <div className="empty-state">
                  <h3>No events found</h3>
                  <p>Try another search term or choose “All Schools”.</p>
                </div>
              )}
            </div>

            {!loading && filteredEvents.length > 0 && (
              <div className="load-more-wrap">
                <button type="button" className="load-more-btn" onClick={handleLoadMore}>
                  Load more events <ArrowRight size={16} />
                </button>
                {loadMoreMessage && <p className="load-more-note">{loadMoreMessage}</p>}
              </div>
            )}

          </div>
        </section>
      </main>

       {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-about">
              <Logo />
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
    </>
  );
}
