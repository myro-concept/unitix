import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart2,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  Instagram,
  MapPin,
  Megaphone,
  Menu,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Ticket,
  Twitter,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import eventChill from "@/assets/event-chill-code-workshop.jpg";
import eventHackathon from "@/assets/event-hackathon-ai.jpg";
import eventJam from "@/assets/event-late-night-jam.jpg";
import eventStartup from "@/assets/event-startup-weekend.jpg";
import eventSummit from "@/assets/event-vibe-coding-summit.jpg";
import logoGlyph from "@/assets/logo-glyph-160.png";
import { supabase } from "@/integrations/supabase/client";
import { CAMPUS_OPTIONS } from "@/lib/campusOptions";

const rotatingWords = ["campus events.", "ticket sales.", "student vibes.", "sold-out shows."];

const campusChips = ["All Schools", ...CAMPUS_OPTIONS.filter((item) => item !== "Other")];

const popularEvents = [
  {
    img: eventJam,
    title: "Chief JP’s Birthday Extravaganza",
    campus: "Calabar",
    category: "Events",
    tag: "Free",
    date: "May 27",
    likes: 0,
  },
  {
    img: eventChill,
    title: "Splash, Sip and Chill Pool Party",
    campus: "Lisa Suites and Hotels, Asokoro, Abuja",
    category: "Events",
    tag: "₦3,000",
    date: "May 31 • 2:00 PM",
    likes: 2,
  },
  {
    img: eventStartup,
    title: "MOPÉLÓLÁ by Jafextra",
    campus: "Terra Kulture, Victoria Island, Lagos",
    category: "Events",
    tag: "From ₦20,000",
    date: "Jun 28",
    likes: 0,
  },
  {
    img: eventSummit,
    title: "THE OVERDRIVE - Push It Past The Limit",
    campus: "Yaba, Lagos",
    category: "Events",
    tag: "From ₦8,000",
    date: "Jul 10",
    likes: 0,
  },
];

const features = [
  {
    title: "Discover campus events",
    description:
      "Find parties, concerts, faculty weeks, sports tournaments, dinners, and hangouts happening around your school.",
    Icon: Search,
    bg: "hsl(80, 100%, 90%)",
  },
  {
    title: "Fast student checkout",
    description:
      "Buy tickets in seconds with a clean mobile-first flow built for quick decisions and low stress.",
    Icon: CreditCard,
    bg: "hsl(340, 75%, 92%)",
  },
  {
    title: "QR ticket verification",
    description:
      "Every ticket is checked at the gate with a simple scan, reducing fake tickets and entry confusion.",
    Icon: QrCode,
    bg: "hsl(170, 60%, 90%)",
  },
  {
    title: "Organizer dashboard",
    description:
      "Track ticket sales, attendee lists, revenue, and event performance from one simple dashboard.",
    Icon: BarChart2,
    bg: "hsl(250, 60%, 94%)",
  },
];

const steps = [
  { title: "Create your event", description: "Add event name, date, location, poster, ticket price, and school." },
  { title: "Share your link", description: "Promote on WhatsApp, Instagram, class groups, and faculty communities." },
  { title: "Sell tickets", description: "Students pay online and receive their ticket confirmation instantly." },
  { title: "Scan at entry", description: "Verify tickets at the gate and know exactly who attended." },
];

const testimonials: Array<{ quote: string; name: string; role: string; avatar?: string }> = [];

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

const CONFETTI_COLORS = ["#FF0048", "#FFD93D", "#6BCB77", "#4D96FF", "#FF6BCB", "#FF9F43"];
const cornerSeeds = [
  [
    { x: -40, y: -20, shape: 0, color: 0, rot: 12, s: 12 },
    { x: 220, y: -30, shape: 1, color: 1, rot: 45, s: 8 },
    { x: -25, y: 200, shape: 2, color: 2, rot: -20, s: 14 },
    { x: 240, y: 50, shape: 0, color: 3, rot: 0, s: 5 },
    { x: -30, y: 100, shape: 3, color: 4, rot: 30, s: 10 },
    { x: 200, y: 200, shape: 1, color: 1, rot: 15, s: 6 },
  ],
  [
    { x: 230, y: -20, shape: 1, color: 1, rot: 22, s: 7 },
    { x: -35, y: 40, shape: 2, color: 3, rot: 15, s: 12 },
    { x: 40, y: -30, shape: 0, color: 0, rot: 0, s: 10 },
    { x: 220, y: 190, shape: 3, color: 2, rot: -40, s: 10 },
    { x: -20, y: 200, shape: 1, color: 4, rot: 60, s: 6 },
    { x: 150, y: -40, shape: 0, color: 5, rot: 0, s: 8 },
  ],
  [
    { x: 230, y: -25, shape: 0, color: 4, rot: 0, s: 10 },
    { x: -35, y: 70, shape: 1, color: 1, rot: 35, s: 7 },
    { x: 40, y: -30, shape: 2, color: 2, rot: 40, s: 13 },
    { x: 240, y: 180, shape: 0, color: 3, rot: 0, s: 5 },
    { x: -25, y: 190, shape: 3, color: 0, rot: -25, s: 10 },
    { x: 100, y: -40, shape: 1, color: 5, rot: 20, s: 8 },
  ],
  [
    { x: -40, y: 30, shape: 1, color: 3, rot: 18, s: 8 },
    { x: 230, y: -25, shape: 2, color: 1, rot: -30, s: 14 },
    { x: 50, y: 200, shape: 0, color: 4, rot: 0, s: 8 },
    { x: 240, y: 100, shape: 3, color: 2, rot: 50, s: 10 },
    { x: 20, y: -30, shape: 0, color: 0, rot: 0, s: 6 },
    { x: -30, y: 160, shape: 1, color: 5, rot: -40, s: 7 },
  ],
];

function ConfettiLayer() {
  const corners = [
    { side: "left" as const, vSide: "top" as const, originX: 105, originY: 95 },
    { side: "left" as const, vSide: "bottom" as const, originX: 95, originY: -95 },
    { side: "right" as const, vSide: "top" as const, originX: -105, originY: 95 },
    { side: "right" as const, vSide: "bottom" as const, originX: -105, originY: -95 },
  ];

  return (
    <div className="hero-confetti" aria-hidden="true">
      {corners.map((corner, ci) =>
        cornerSeeds[ci].map((seed, si) => {
          const sz = seed.s;
          const color = CONFETTI_COLORS[seed.color % CONFETTI_COLORS.length];
          const shape = ["circle", "square", "triangle", "line"][seed.shape % 4];
          const sharedMotion = {
            initial: { [corner.side]: corner.originX, [corner.vSide]: Math.abs(corner.originY), opacity: 0, scale: 0, rotate: 0 },
            animate: { [corner.side]: seed.x, [corner.vSide]: seed.y < 0 ? Math.abs(seed.y) : seed.y, opacity: 0.85, scale: 1, rotate: seed.rot },
            transition: { delay: 0.8 + si * 0.06 + ci * 0.04, duration: 0.5, type: "spring" as const, stiffness: 200, damping: 15 },
          };
          const base = { position: "absolute" as const };

          if (shape === "circle") return <motion.div key={`${ci}-${si}`} {...sharedMotion} style={{ ...base, width: sz, height: sz, borderRadius: "50%", backgroundColor: color }} />;
          if (shape === "square") return <motion.div key={`${ci}-${si}`} {...sharedMotion} style={{ ...base, width: sz, height: sz, borderRadius: 2, backgroundColor: color }} />;
          if (shape === "line") return <motion.div key={`${ci}-${si}`} {...sharedMotion} style={{ ...base, width: sz, height: sz * 0.25, borderRadius: 99, backgroundColor: color }} />;

          return (
            <motion.div
              key={`${ci}-${si}`}
              {...sharedMotion}
              style={{
                ...base,
                width: 0,
                height: 0,
                borderLeft: `${sz / 2}px solid transparent`,
                borderRight: `${sz / 2}px solid transparent`,
                borderBottom: `${sz * 0.85}px solid ${color}`,
                backgroundColor: "transparent",
              }}
            />
          );
        }),
      )}
    </div>
  );
}

function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? 36 : size === "md" ? 30 : 22;
  const txt = size === "lg" ? 23 : size === "md" ? 18 : 14;

  return (
    <div className="logo">
      <div className="logo-mark" style={{ width: sz, height: sz }}>
        <img
          src={logoGlyph}
          alt="UniTix"
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: "9px",
          }}
        />
      </div>

      <span
      style={{
        fontSize: txt,
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontWeight: 800,
        letterSpacing: "-0.02em",
      }}
    >
      UniTix
    </span>
    </div>
  );
}

function EventCard({ event, index }: { event: LandingEvent; index: number }) {
  const href = `/${event.slug}`;
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.42, delay: index * 0.06 }}
      className="event-card"
    >
      <div className="event-img-wrap">
        {event.img ? <img src={event.img} alt={event.title} className="event-img" loading="lazy" decoding="async" /> : <div className="event-fallback"><Ticket size={42} /></div>}
        <span className="image-date-pill">
          <CalendarDays size={14} />
          {event.date}
        </span>
        <span className="price-pill">{event.tag}</span>
      </div>

      <div className="event-body">
        <div className="event-meta">
          <span className="event-date">
            <CalendarDays size={14} />
            {event.date}
            {event.time && <> • {event.time}</> }
          </span>
          <span className="event-category">{event.category}</span>
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

          <span>
            <Share2 size={18} />
            Share
          </span>
        </div>
      </div>
    </motion.a>
  );
}

function FeatureIllustration({ feature, index }: { feature: (typeof features)[number]; index: number }) {
  const Icon = feature.Icon;

  return (
    <div className="feature-illustration">
      <div className="feature-mini-card">
        <div className="feature-mini-top">
          <div className="feature-mini-icon">
            <Icon size={20} />
          </div>
          <span>UniTix</span>
        </div>

        {index === 0 && (
          <div className="mini-list">
            {["Freshers Night", "VC Cup Final", "Faculty Dinner"].map((item) => (
              <div key={item} className="mini-row">
                <span>{item}</span>
                <Ticket size={14} />
              </div>
            ))}
          </div>
        )}

        {index === 1 && (
          <div className="mini-pay">
            <div>
              <p>Ticket</p>
              <strong>₦2,000</strong>
            </div>
            <button>Pay now</button>
          </div>
        )}

        {index === 2 && (
          <div className="mini-qr">
            <QrCode size={80} />
            <span>
              <CheckCircle2 size={13} />
              Valid ticket
            </span>
          </div>
        )}

        {index === 3 && (
          <div className="mini-chart">
            <div className="bars">
              {[35, 60, 45, 82, 50, 70].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="chart-stats">
              <div>
                <p>Sold</p>
                <strong>412</strong>
              </div>
              <div>
                <p>Revenue</p>
                <strong>₦824k</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<number | null>(null);
  const hasTestimonials = testimonials.length > 0;

  const go = (next: number, dir: number) => {
    setDirection(dir);
    setCurrent((next + testimonials.length) % testimonials.length);
  };

  const resetTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % testimonials.length);
    }, 4500);
  };

  useEffect(() => {
    if (!hasTestimonials) return;

    resetTimer();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [hasTestimonials]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  if (!hasTestimonials) {
    return (
      <div className="testimonial-carousel">
        <div className="testimonial-window">
          <div className="testimonial-card testimonial-placeholder">
            <div className="testimonial-content">
              <div className="stars">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} />
                ))}
              </div>
              <strong>Be the first to drop a testimony</strong>
              <p>
                Once you’ve used UniTix, share your experience here so other students can discover the best campus events.
              </p>
              <a
                href="https://wa.me/2348120604186"
                target="_blank"
                rel="noopener noreferrer"
                className="primary-btn"
              >
                Share on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const t = testimonials[current];

  return (
    <div className="testimonial-carousel">
      <div className="testimonial-window">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src={t.avatar} alt={t.name} loading="lazy" decoding="async" />
              </div>
              <div className="testimonial-content">
                <div className="stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} />
                  ))}
                </div>
                <p>"{t.quote}"</p>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="carousel-controls">
        <button
          onClick={() => {
            go(current - 1, -1);
            resetTimer();
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <div>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                go(i, i > current ? 1 : -1);
                resetTimer();
              }}
              className={i === current ? "active-dot" : ""}
            />
          ))}
        </div>

        <button
          onClick={() => {
            go(current + 1, 1);
            resetTimer();
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
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

type PublicEvent = {
  id?: string;
  slug?: string;
  name: string;
  event_date?: string | null;
  event_type?: string | null;
  location_value?: string | null;
  ticket_price?: number | null;
  background_image_url?: string | null;
};

type LandingEvent = {
  id: string;
  slug: string;
  img?: string;
  title: string;
  campus: string;
  school: string;
  creator: string;
  category: string;
  tag: string;
  date: string;
  time: string;
  likes: number;
};

function formatEventDate(date?: string | null) {
  if (!date) return "Date TBA";

  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? "Date TBA"
    : d.toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
      });
}

function mapLiveEvent(event: PublicEvent & { profiles?: { id?: string; school?: string | null; company?: string | null; full_name?: string | null; } | null; }): LandingEvent {
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
    img: event.background_image_url || undefined,
    title: event.name,
    campus: event.location_value || "Venue TBA",
    school: event.profiles?.school || "Campus",
    creator: event.profiles?.company || event.profiles?.full_name || "UniTix Organizer",
    category: event.event_type || "Events",
    tag: price > 0 ? `From ₦${price.toLocaleString()}` : "Free",
    date: formattedDate,
    time: formattedTime,
    likes: 0,
  };
}

export default function Landing() {
  const [wordIndex, setWordIndex] = useState(0);
  const [activeCampus, setActiveCampus] = useState("All Schools");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [liveEvents, setLiveEvents] = useState<LandingEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);

    return () => {
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      setLoadingEvents(true);

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, slug, name, event_date, event_type, location_value, ticket_price, background_image_url, status, user_id")
        .eq("status", "live")
        .order("event_date", { ascending: true })
        .limit(6);

      if (!mounted) return;

      if (eventsError) {
        setLiveEvents([]);
        setLoadingEvents(false);
        return;
      }

      const userIds = [...new Set((eventsData || []).map((event) => event.user_id).filter(Boolean))];

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, school, company, full_name")
        .in("id", userIds);

      const profilesMap = new Map(
        (profilesData || []).map((profile) => [profile.id, profile])
      );

      const mappedEvents = (eventsData || []).map((event) => {
        const profile = event.user_id ? profilesMap.get(event.user_id) : null;
        return mapLiveEvent({
          ...event,
          profiles: profile || null,
        });
      });

      setLiveEvents(mappedEvents);
      setLoadingEvents(false);
    }

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredEvents = activeCampus === "All Schools"
    ? liveEvents
    : liveEvents.filter((event) => event.school.toLowerCase().includes(activeCampus.toLowerCase()));

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="unitix-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        .unitix-page {
          min-height: 100vh;
          background: #fafaf9;
          overflow-x: hidden;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #111111;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
        }

        .logo-mark {
          border-radius: 9px;
          background: #FF0048;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo span {
          font-weight: 900;
          letter-spacing: -0.6px;
          color: #111111;
        }

        .nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        background: rgba(250, 250, 249, 0.94);
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

        .primary-btn,
        .dark-btn,
        .outline-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 800;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .primary-btn:hover,
        .dark-btn:hover,
        .outline-btn:hover {
          transform: translateY(-1px);
        }

        .primary-btn {
          background: #FF0048;
          color: white;
          padding: 13px 26px;
        }

        .dark-btn {
          background: #111111;
          color: white;
          padding: 13px 28px;
        }

        .outline-btn {
          background: white;
          color: #111111;
          border: 2px solid #e5e7eb;
          padding: 11px 28px;
        }

        .mobile-menu-button {
          display: none;
          width: 42px;
          height: 42px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          color: #111111;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .mobile-menu {
          position: fixed;
          top: 65px;
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
          color: white !important;
          border-bottom: 0 !important;
          margin-top: 14px;
        }

        .mobile-login-btn {
          background: #111111;
          color: #ffffff !important;
          border-radius: 16px;
        }

        .hero {
          position: relative;
          overflow: hidden;
        }

        .hero-shell {
          max-width: 1200px;
          margin: 0 auto;
          padding: 150px 32px 96px;
        }

        .hero-stage {
          position: relative;
          min-height: 580px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-confetti {
          display: block;
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: visible;
        }

        .hero-card {
          position: absolute;
          width: 260px;
          z-index: 2;
        }

        .hero-card-inner {
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.12);
          background: white;
        }

        .hero-card img {
          width: 100%;
          height: 170px;
          object-fit: cover;
          display: block;
        }

        .hero-card div div {
          background: white;
          padding: 10px 14px;
        }

        .hero-card span {
          font-size: 11px;
          font-weight: 800;
          color: #FF0048;
          background: #fff1f2;
          padding: 4px 11px;
          border-radius: 999px;
        }

        .hero-card.tl { left: -90px; top: 10px; }
        .hero-card.bl { left: -110px; bottom: 10px; }
        .hero-card.tr { right: -90px; top: 10px; }
        .hero-card.br { right: -110px; bottom: 10px; }

        .hero-center {
          text-align: center;
          max-width: 720px;
          position: relative;
          z-index: 10;
          padding: 0 16px;
        }

        .hero-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 36px;
        }

        .hero h1 {
          font-size: clamp(48px, 6.2vw, 76px);
          font-weight: 900;
          line-height: 1.02;
          letter-spacing: -3px;
          color: #111111;
          margin-bottom: 28px;
        }

        .hero h1 span {
          color: #FF0048;
          position: relative;
          display: inline-block;
          min-width: 9ch;
        }

        .hero-copy {
          font-size: clamp(18px, 2vw, 23px);
          color: #6b7280;
          max-width: 680px;
          margin: 0 auto 34px;
          line-height: 1.55;
        }

        .hero-buttons {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 44px;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          max-width: 520px;
          margin: 0 auto;
        }

        .hero-stats div {
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          background: white;
          padding: 14px 10px;
          text-align: center;
        }

        .hero-stats strong {
          display: block;
          font-size: 20px;
          font-weight: 900;
          color: #111111;
          margin-bottom: 2px;
        }

        .hero-stats span {
          font-size: 10px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 800;
        }

        .mobile-hero-card {
          display: none;
        }

        .campus-strip {
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          background: rgba(255, 255, 255, 0.75);
          padding: 14px 0;
        }

        .campus-list {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .campus-list::-webkit-scrollbar {
          display: none;
        }

        .campus-list button {
          flex-shrink: 0;
          border-radius: 999px;
          border: 0;
          padding: 8px 18px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          background: white;
          color: #6b7280;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .campus-list button.active {
          background: #FF0048;
          color: white;
          box-shadow: 0 2px 12px rgba(225, 29, 72, 0.25);
        }

        .section {
          padding: 80px 0;
        }

        .section-header {
          text-align: center;
          margin-bottom: 56px;
        }

        .section-label {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #FF0048;
          margin-bottom: 12px;
        }

        .section-title {
          font-size: clamp(30px, 4vw, 44px);
          font-weight: 900;
          color: #111111;
          letter-spacing: -1px;
          margin-bottom: 14px;
        }

        .section-copy {
          font-size: 17px;
          color: #6b7280;
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .events-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 34px;
        }

        .events-head h2 {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -0.6px;
        }

        .see-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .view-more-events {
          text-align: center;
          margin-top: 38px;
          padding-top: 16px;
        }

        .view-more-events a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
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
          background: radial-gradient(circle at 30% 30%, rgba(255, 0, 72, 0.45), transparent 34%), linear-gradient(145deg, #111111, #2a1020);
        }

        .image-date-pill {
          position: absolute;
          top: 16px;
          right: 16px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.94);
          color: #111111;
          font-size: 13px;
          font-weight: 900;
          border-radius: 999px;
          padding: 10px 14px;
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

        .event-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
          flex-wrap: wrap;
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

        .event-category {
          margin-left: auto;
          color: #ff0048;
          background: #fff1f2;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 900;
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

        .event-category {
          color: #ff0048;
          background: #fff1f2;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 900;
        }

        .event-date {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 14px;
          font-weight: 600;
          min-width: 0;
          flex: 1 1 0;
          word-break: break-word;
        }

        .event-school,
        .event-category {
          flex-shrink: 0;
        }

        .event-body h3 {
          font-size: 20px;
          line-height: 1.25;
          letter-spacing: -0.035em;
          font-weight: 900;
          color: #111111;
          margin-bottom: 12px;
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

        .event-actions span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          line-height: 1;
        }

        .event-actions span svg {
          display: block;
          flex-shrink: 0;
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

        .features {
          background: white;
        }

        .feature-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 960px;
          margin: 0 auto;
        }

        .feature-row-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .feature-row-bottom {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 24px;
        }

        .feature-card {
          border-radius: 24px;
          overflow: hidden;
          background: #fafaf9;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .feature-card.wide {
          flex-direction: row;
        }

        .feature-visual {
          min-height: 220px;
          aspect-ratio: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-card.wide .feature-visual {
          width: 45%;
          aspect-ratio: auto;
          flex-shrink: 0;
        }

        .feature-text {
          padding: 24px;
        }

        .feature-card.wide .feature-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .feature-text h3 {
          font-size: 19px;
          font-weight: 900;
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }

        .feature-text p {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
        }

        .feature-illustration {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .feature-mini-card {
          width: 88%;
          max-width: 360px;
          border-radius: 18px;
          background: rgba(255,255,255,0.86);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
          padding: 16px;
        }

        .feature-mini-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .feature-mini-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #111111;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-mini-top span {
          font-size: 10px;
          font-weight: 900;
          color: #888;
        }

        .mini-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mini-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 12px;
          background: #f3f4f6;
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 800;
        }

        .mini-row svg {
          color: #FF0048;
        }

        .mini-pay {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mini-pay div {
          border-radius: 12px;
          background: #f3f4f6;
          padding: 12px;
        }

        .mini-pay p,
        .chart-stats p {
          font-size: 10px;
          color: #888;
          margin-bottom: 2px;
        }

        .mini-pay strong,
        .chart-stats strong {
          font-size: 14px;
        }

        .mini-pay button {
          height: 32px;
          border-radius: 999px;
          border: 0;
          background: #FF0048;
          color: white;
          font-size: 10px;
          font-weight: 900;
        }

        .mini-qr {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .mini-qr span {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 900;
          color: #16a34a;
        }

        .mini-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bars {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 80px;
        }

        .bars span {
          flex: 1;
          border-radius: 4px 4px 0 0;
          background: #FF0048;
        }

        .chart-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .chart-stats div {
          border-radius: 9px;
          background: #f3f4f6;
          padding: 8px;
        }

        .organizers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }

        .organizers-copy h2 {
          font-size: clamp(30px, 4vw, 40px);
          font-weight: 900;
          letter-spacing: -0.8px;
          margin-bottom: 16px;
        }

        .organizers-copy > p {
          font-size: 16px;
          color: #6b7280;
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .organizer-benefits {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 32px;
        }

        .organizer-benefits div {
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          background: white;
          padding: 16px;
        }

        .organizer-benefits svg {
          color: #FF0048;
          flex-shrink: 0;
        }

        .organizer-benefits span {
          font-size: 13px;
          font-weight: 800;
        }

        .dashboard-card {
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        }

        .dashboard-top {
          background: #111111;
          padding: 28px;
          color: white;
        }

        .dashboard-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .dashboard-title p {
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          margin-bottom: 4px;
        }

        .dashboard-title h3 {
          font-size: 22px;
          font-weight: 900;
        }

        .dashboard-title svg {
          color: #FF0048;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .dashboard-stats div {
          border-radius: 16px;
          background: rgba(255,255,255,0.08);
          padding: 16px;
        }

        .dashboard-stats strong {
          display: block;
          font-size: 20px;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .dashboard-stats span {
          color: rgba(255,255,255,0.5);
          font-size: 11px;
        }

        .dashboard-list {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #fafaf9;
        }

        .dashboard-list div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 16px;
          background: white;
          padding: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          font-size: 14px;
          font-weight: 800;
        }

        .dashboard-list svg {
          color: #16a34a;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .step-card {
          border-radius: 24px;
          background: #fafaf9;
          padding: 28px;
        }

        .step-card strong {
          display: block;
          font-size: 48px;
          font-weight: 900;
          color: rgba(225, 29, 72, 0.15);
          margin-bottom: 20px;
          line-height: 1;
        }

        .step-card h3 {
          font-size: 17px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .step-card p {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.65;
        }

        .testimonial-carousel {
          max-width: 540px;
          margin: 0 auto;
        }

        .testimonial-window {
          overflow: hidden;
          border-radius: 24px;
        }

        .testimonial-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        }

        .testimonial-card.testimonial-placeholder {
          padding: 40px 32px;
          min-height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .testimonial-card.testimonial-placeholder .primary-btn {
          margin-top: 24px;
        }

        .testimonial-image {
          height: 220px;
          overflow: hidden;
        }

        .testimonial-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .testimonial-content {
          padding: 32px;
        }

        .testimonial-card.testimonial-placeholder .stars {
          justify-content: center;
        }

        .stars {
          display: flex;
          gap: 4px;
          margin-bottom: 16px;
        }

        .stars svg {
          color: #FF0048;
          fill: #FF0048;
        }

        .testimonial-content p {
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .testimonial-content strong {
          display: block;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .testimonial-content span {
          font-size: 12px;
          color: #888;
        }

        .carousel-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }

        .carousel-controls > button {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .carousel-controls div {
          display: flex;
          gap: 8px;
        }

        .carousel-controls div button {
          border-radius: 999px;
          border: 0;
          width: 8px;
          height: 8px;
          background: #e5e7eb;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .carousel-controls div button.active-dot {
          width: 24px;
          background: #FF0048;
        }

        .cta-section {
          padding: 56px 0 72px;
          position: relative;
        }

        .cta-wrap {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .cta-card-outer {
          position: relative;
          padding-top: 78px;
        }

        .cta-calendar {
          position: absolute;
          left: 50%;
          top: 0;
          z-index: 3;
          transform: translateX(-50%);
          filter: drop-shadow(0 18px 40px rgba(23, 23, 43, 0.18));
        }

        .cta-card {
          background: #17172b;
          color: white;
          border-radius: 30px;
          overflow: hidden;
          padding: 104px 40px 80px;
          text-align: center;
          position: relative;
        }

        .cta-card h2 {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 900;
          letter-spacing: -0.9px;
          margin-bottom: 18px;
        }

        .cta-card p {
          color: rgba(255,255,255,0.72);
          font-size: 17px;
          line-height: 1.6;
          max-width: 470px;
          margin: 0 auto 32px;
        }

        .cta-confetti {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .footer {
          border-top: 1px solid #e5e7eb;
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
          font-size: 13px;
          color: #9ca3af;
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
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
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

        .footer-bottom div {
          display: flex;
          gap: 20px;
        }

        @media (max-width: 1100px) {
          .hero-card {
            width: 220px;
          }

          .hero-card img {
            height: 145px;
          }

          .hero-card.tl { left: -70px; }
          .hero-card.bl { left: -85px; }
          .hero-card.tr { right: -70px; }
          .hero-card.br { right: -85px; }

          .events-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
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

          .hero-shell {
            padding: 120px 20px 72px;
          }

          .hero-stage {
            min-height: auto;
            display: block;
          }

          .hero-confetti,
          .hero-card {
            display: none;
          }

          .hero-center {
            max-width: 100%;
            padding: 0;
          }

          .hero-logo {
            margin-bottom: 26px;
          }

          .hero h1 {
            font-size: clamp(42px, 11vw, 64px);
            line-height: 1.05;
            letter-spacing: -2.2px;
            margin-bottom: 22px;
          }

          .hero h1 span {
            min-width: auto;
          }

          .hero-copy {
            font-size: 17px;
            max-width: 560px;
            margin-bottom: 28px;
          }

          .hero-buttons {
            margin-bottom: 28px;
          }

          .mobile-hero-card {
            display: block;
            margin: 6px auto 32px;
            max-width: 360px;
            border-radius: 22px;
            overflow: hidden;
            background: white;
            box-shadow: 0 14px 34px rgba(0,0,0,0.12);
            transform: rotate(-2deg);
          }

          .mobile-hero-card img {
            width: 100%;
            height: 210px;
            object-fit: cover;
            display: block;
          }

          .mobile-hero-card div {
            padding: 12px 16px;
          }

          .mobile-hero-card span {
            display: inline-flex;
            border-radius: 999px;
            background: #fff1f2;
            color: #FF0048;
            font-size: 12px;
            font-weight: 900;
            padding: 5px 12px;
          }

          .hero-stats {
            grid-template-columns: repeat(2, 1fr);
            max-width: 360px;
          }

          .feature-row-top,
          .feature-row-bottom,
          .organizers-grid,
          .steps-grid,
          .footer-grid {
            grid-template-columns: 1fr;
          }

          .feature-card.wide {
            flex-direction: column;
          }

          .feature-card.wide .feature-visual {
            width: 100%;
            aspect-ratio: 4 / 3;
          }

          .organizer-benefits {
            grid-template-columns: 1fr;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }

          .events-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .cta-card .primary-btn {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .container,
          .nav-inner,
          .footer-inner {
            padding-left: 20px;
            padding-right: 20px;
          }

          .nav-inner {
            height: 66px;
          }

          .feature-visual {
             min-height: 230px;
             padding: 18px 0;
            aspect-ratio: auto;
          }

          .feature-mini-card {
            width: 88%;
            max-width: 320px;
          }

          .hero h1 {
            font-size: clamp(38px, 12vw, 54px);
            letter-spacing: -1.7px;
          }

          .hero-copy {
            font-size: 16px;
          }

          .hero-buttons a {
            width: 100%;
          }

          .hero-shell {
            padding-top: 115px;
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

          .section {
            padding: 64px 0;
          }

          .section-header {
            margin-bottom: 40px;
          }

          .cta-wrap {
            padding: 0 20px;
          }

          .cta-card {
            border-radius: 24px;
            padding: 94px 22px 56px;
          }

          .cta-card-outer {
            padding-top: 68px;
          }

          .cta-calendar svg {
            width: 105px;
            height: auto;
          }

          .cta-card .primary-btn {
            width: 100%;
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
            <Logo size="md" />
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

          <button className="mobile-menu-button" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle menu">
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

      <section className="hero">
        <div className="hero-shell">
          <div className="hero-stage">
            <ConfettiLayer />

            {[
              { img: eventChill, tag: "Workshop", pos: "tl", rotate: "rotate(6deg)", from: { x: -80, y: -60 }, delay: 0.2 },
              { img: eventJam, tag: "Social", pos: "bl", rotate: "rotate(-5deg)", from: { x: -80, y: 60 }, delay: 0.35 },
              { img: eventStartup, tag: "Hackathon", pos: "tr", rotate: "rotate(-6deg)", from: { x: 80, y: -60 }, delay: 0.25 },
              { img: eventSummit, tag: "Conference", pos: "br", rotate: "rotate(5deg)", from: { x: 80, y: 60 }, delay: 0.4 },
            ].map((card) => (
              <motion.div
                key={card.pos}
                className={`hero-card ${card.pos}`}
                initial={{ opacity: 0, scale: 0.3, x: card.from.x, y: card.from.y }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: card.delay }}
              >
                <div className="hero-card-inner" style={{ transform: card.rotate }}>
                  <img src={card.img} alt={card.tag} decoding="async" fetchPriority="high" />
                  <div>
                    <div>
                      <span>{card.tag}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div
              className="hero-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="hero-logo">
                <Logo size="lg" />
              </div>

              <h1>
                Your campus event plug for{" "}
                <span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={rotatingWords[wordIndex]}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.32 }}
                    >
                      {rotatingWords[wordIndex]}
                    </motion.span>
                  </AnimatePresence>
                  <span style={{ visibility: "hidden", display: "block", height: 0, overflow: "hidden" }}>sold-out shows.</span>
                </span>
              </h1>

              <p className="hero-copy">
                Discover the hottest student events, buy tickets instantly, and help organizers sell and verify tickets without the usual campus stress.
              </p>

              <div className="hero-buttons">
                <a href="/events" className="dark-btn">
                  Find Events <ArrowRight size={16} />
                </a>
                <a href="/auth" className="outline-btn">
                  Create Event
                </a>
              </div>

              <div className="mobile-hero-card">
                <img src={eventSummit} alt="Campus event" decoding="async" fetchPriority="high" />
                <div>
                  <span>Campus Event</span>
                </div>
              </div>

              <div className="hero-stats">
                {[
                  ["50+", "campuses"],
                  ["12k+", "students"],
                  ["100+", "events"],
                  ["2 min", "checkout"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="campus-strip">
        <div className="container campus-list">
          {campusChips.map((campus) => (
            <button key={campus} type="button" onClick={() => setActiveCampus(campus)} className={activeCampus === campus ? "active" : ""}>
              {campus}
            </button>
          ))}
        </div>
      </section>

      <section id="events" className="section">
        <div className="container">
          <div className="events-head">
            <div>
              <p className="section-label">Discover</p>
              <h2>Upcoming events on UniTix</h2>
            </div>
            <a href="/events" className="see-all">
              See all <ArrowRight size={16} />
            </a>
          </div>

          <div className="events-grid">
            {loadingEvents ? (
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
              filteredEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))
            ) : (
              <div className="empty-state">
                <h3>No events found</h3>
                <p>Try another search term or choose "All Schools".</p>
              </div>
            )}
          </div>
          <div className="view-more-events">
            <a href="/events" className="primary-btn">View all events <ArrowRight size={16} /></a>
          </div>
        </div>
      </section>

      <section id="features" className="section features">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Features</p>
            <h2 className="section-title">Everything campus events need</h2>
            <p className="section-copy">
              UniTix helps students discover events and gives organizers the tools to sell, manage, and verify entry.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-row-top">
              {features.slice(0, 2).map((feature, i) => (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                  <div className="feature-card">
                    <div className="feature-visual" style={{ background: feature.bg }}>
                      <FeatureIllustration feature={feature} index={i} />
                    </div>
                    <div className="feature-text">
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="feature-row-bottom">
              {features.slice(2).map((feature, rawI) => {
                const i = rawI + 2;
                const isWide = rawI === 0;
                return (
                  <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                    <div className={`feature-card ${isWide ? "wide" : ""}`}>
                      <div className="feature-visual" style={{ background: feature.bg }}>
                        <FeatureIllustration feature={feature} index={i} />
                      </div>
                      <div className="feature-text">
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="organizers" className="section">
        <div className="container">
          <div className="organizers-grid">
            <motion.div className="organizers-copy" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <motion.p
                className="section-label"
                style={{
                    color: "#FF0048",
                    fontWeight: 900,
                    fontSize: 11,
                    letterSpacing: ".22em",
                }}
                >
                FOR ORGANIZERS
              </motion.p>
              <h2>Sell out your campus event without messy lists</h2>
              <p>
                Build your event page, collect payments, track buyers, and scan tickets at the gate. UniTix gives your event a more premium and trusted experience.
              </p>

              <div className="organizer-benefits">
                {[
                  { Icon: WalletCards, text: "Online ticket payments" },
                  { Icon: ShieldCheck, text: "Fake-ticket protection" },
                  { Icon: Users, text: "Attendee list export" },
                  { Icon: Megaphone, text: "Easy promo links" },
                ].map(({ Icon, text }) => (
                  <div key={text}>
                    <Icon size={20} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <a href="/auth" className="primary-btn">
                Start selling tickets <ArrowRight size={16} />
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="dashboard-card">
                <div className="dashboard-top">
                  <div className="dashboard-title">
                    <div>
                      <p>Dashboard</p>
                      <h3>Freshers Party</h3>
                    </div>
                    <CalendarDays size={32} />
                  </div>

                  <div className="dashboard-stats">
                    {[
                      ["412", "Tickets sold"],
                      ["₦824k", "Revenue"],
                      ["78%", "Capacity"],
                    ].map(([value, label]) => (
                      <div key={label}>
                        <strong>{value}</strong>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-list">
                  {["Payment confirmed", "QR ticket generated", "Guest checked in"].map((item) => (
                    <div key={item}>
                      <span>{item}</span>
                      <CheckCircle2 size={20} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How UniTix works</h2>
          </div>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <div className="step-card">
                  <strong>0{i + 1}</strong>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <motion.p
              className="section-label"
              style={{
                  color: "#FF0048",
                  fontWeight: 900,
                  fontSize: 11,
                  letterSpacing: ".22em",
              }}
              >
              TESTIMONIALS
            </motion.p>
            <h2 className="section-title">Built for campus communities</h2>
            <p className="section-copy">Hear from students and organizers using UniTix.</p>
          </div>

          <TestimonialCarousel />
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-wrap">
          <div className="cta-card-outer">
            <CalendarGraphic />

            <div className="cta-card">
              <div className="cta-confetti" aria-hidden="true">
                {[
                  { left: "33%", top: "15%", size: 8, bg: "#ff9f43", rot: 45, type: "triangle" },
                  { left: "38%", top: "13%", size: 13, bg: "#ff6b6b", rot: 0, type: "circle" },
                  { left: "43%", top: "17%", size: 10, bg: "#ffd93d", rot: 30, type: "square" },
                  { left: "49%", top: "20%", size: 7, bg: "#6bcb77", rot: 20, type: "square" },
                  { left: "53%", top: "15%", size: 8, bg: "#4d96ff", rot: 22, type: "square" },
                  { left: "58%", top: "18%", size: 11, bg: "#ff9f43", rot: 0, type: "circle" },
                  { left: "63%", top: "14%", size: 7, bg: "#ff6b6b", rot: 0, type: "circle" },
                  { left: "67%", top: "13%", size: 11, bg: "#6bcb77", rot: 90, type: "triangle" },
                  { left: "72%", top: "14%", size: 11, bg: "#ffd93d", rot: 0, type: "circle" },
                  { left: "70%", top: "20%", size: 10, bg: "#ff6bcb", rot: 20, type: "square" },
                ].map((item, i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      left: item.left,
                      top: item.top,
                      width: item.type === "triangle" ? 0 : item.size,
                      height: item.type === "triangle" ? 0 : item.size,
                      background: item.type === "triangle" ? "transparent" : item.bg,
                      borderRadius: item.type === "circle" ? "50%" : item.type === "square" ? 2 : 0,
                      transform: `rotate(${item.rot}deg)`,
                      borderLeft: item.type === "triangle" ? `${item.size / 2}px solid transparent` : undefined,
                      borderRight: item.type === "triangle" ? `${item.size / 2}px solid transparent` : undefined,
                      borderBottom: item.type === "triangle" ? `${item.size}px solid ${item.bg}` : undefined,
                    }}
                  />
                ))}
              </div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <h2>Ready to launch your next campus event?</h2>
                <p>Create your UniTix event page, start selling tickets, and give students a smoother event experience.</p>
                <a href="/auth" className="primary-btn">
                  Get started <ArrowRight size={16} />
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-about">
              <Logo size="md" />
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
