import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  HelpCircle,
  Ticket,
  Users,
  ShieldCheck,
  CreditCard,
  BarChart2,
  QrCode,
  Megaphone,
  Mail,
  Phone,
  ChevronDown,
} from "lucide-react";
import logoGlyph from "@/assets/logo-glyph-160.png";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-[10px] bg-[#FF0048] flex items-center justify-center overflow-hidden">
        <img src={logoGlyph} alt="UniTix" className="w-full h-full object-contain" />
      </div>
      <span className="font-extrabold tracking-[-0.03em]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "20px" }}>
        UniTix
      </span>
    </div>
  );
}

function FooterSocialIcon({ type }: { type: "x" | "instagram" | "whatsapp" | "tiktok" }) {
  const paths = {
    x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    instagram: "M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5Zm0 2h8.5A3.75 3.75 0 0 1 20 7.75v8.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4Zm8.75 1a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
    whatsapp: "M20.52 3.48A11.79 11.79 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.91c0 2.1.55 4.16 1.6 5.98L0 24l6.29-1.65a11.8 11.8 0 0 0 5.78 1.47h.01c6.57 0 11.91-5.34 11.91-11.91 0-3.18-1.24-6.17-3.47-8.43ZM12.08 21.3h-.01a9.37 9.37 0 0 1-4.77-1.3l-.34-.2-3.73.98 1-3.63-.22-.37a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.89.98 6.67 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.44-9.43 9.44Zm5.17-7.07c-.28-.14-1.67-.82-1.93-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.89 1.1-.16.19-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.37-1.63-1.53-1.91-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.49-.64-.5h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.35s1 2.73 1.14 2.91c.14.19 1.96 2.99 4.75 4.19.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.67-.68 1.9-1.33.23-.66.23-1.22.16-1.33-.07-.12-.26-.19-.54-.33Z",
    tiktok: "M19.59 6.69A4.83 4.83 0 0 1 16 5.26V16a5 5 0 1 1-5-5c.34 0 .67.03 1 .1v2.06a3 3 0 1 0 2 2.84V0h2a4.83 4.83 0 0 0 4.83 4.83v1.86c-.42 0-.83-.04-1.24-.1Z",
  };

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d={paths[type]} />
    </svg>
  );
}

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

const organizerFeatures = [
  "Create and publish campus events",
  "Sell paid or free tickets",
  "QR ticket generation",
  "Attendee list and check-in support",
  "Event dashboard and sales tracking",
  "Support for payouts after events",
];

const included = [
  { icon: Ticket, title: "Ticketing tools", text: "Create tickets, set prices, and manage event access from one place." },
  { icon: QrCode, title: "QR verification", text: "Every ticket can be verified at the gate to reduce fake entry." },
  { icon: BarChart2, title: "Organizer dashboard", text: "Track ticket sales, attendees, and performance before event day." },
  { icon: Megaphone, title: "Promotion-ready links", text: "Share clean event links across WhatsApp, Instagram, X, and campus groups." },
];

const faqs = [
  {
    q: "Is UniTix free for students?",
    a: "Students can browse events for free. They only pay when buying a paid ticket.",
  },
  {
    q: "How much does UniTix charge organizers?",
    a: "Organizers pay a 4% organizer fee on paid ticket sales. Free events can be listed without ticket revenue deductions.",
  },
    {
    q: "How do event check-ins work?",
    a: "Students simply show their QR code at the venue for quick verification and entry.",
  },
  {
    q: "When do organizers receive payouts?",
    a: "Payouts are handled after the event or according to the payout process set for the organizer account, especially after refund or dispute checks.",
  },
  {
    q: "Can I host free events?",
    a: "Yes. UniTix can be used for both free and paid campus events.",
  },
    {
    q: "Is UniTix only for universities?",
    a: "UniTix is built primarily for student communities and campus events across Nigeria.",
  },
];

export default function Pricing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const closeMobile = () => setMobileOpen(false);
  useEffect(() => {
  if (window.location.hash === "#faq") {
    setTimeout(() => {
      document.getElementById("faq")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  }
}, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-foreground">
    <style>{`
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
        color: #ff0048;
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
        transition: transform 0.2s ease;
      }

      .primary-btn:hover,
      .dark-btn:hover,
      .outline-btn:hover {
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

      .outline-btn {
        background: #ffffff;
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
        color: #ffffff !important;
        padding: 0 !important;
        border-bottom: 0 !important;
        margin-top: 14px;
      }

      .mobile-login-btn {
        background: #111111;
        color: #ffffff !important;
        border-radius: 16px;
      }

      .page-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 32px;
      }

      .pricing-hero {
        padding-top: 165px;
        text-align: center;
      }

      .section-label {
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        color: #ff0048;
        margin-bottom: 16px;
      }

      .pricing-hero h1 {
        max-width: 860px;
        margin: 0 auto 22px;
        font-size: clamp(40px, 6vw, 78px);
        line-height: 1.02;
        letter-spacing: -2px;
        font-weight: 900;
        color: #111111;
      }

      .pricing-hero h1 span {
        color: #ff0048;
      }

      .pricing-hero p {
        max-width: 560px;
        margin: 0 auto;
        padding: 0 14px;
        font-size: 17px;
        line-height: 1.75;
        color: #6b7280;
      }

      .pricing-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 22px;
        padding-bottom: 72px;
      }

      .price-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 28px;
        padding: 34px;
        position: relative;
        overflow: hidden;
      }

      .price-card.featured {
        border-color: rgba(255, 0, 72, 0.22);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #fff1f2;
        color: #ff0048;
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 900;
        margin-bottom: 18px;
      }

      .price-card h2 {
        font-size: clamp(26px, 3vw, 36px);
        line-height: 1.05;
        letter-spacing: -1.2px;
        font-weight: 900;
        color: #111111;
        margin-bottom: 10px;
      }

      .price-card .desc {
        color: #6b7280;
        line-height: 1.75;
        font-size: 15px;
        margin-bottom: 24px;
      }

      .price {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        margin-bottom: 22px;
      }

      .price strong {
        font-size: clamp(44px, 6vw, 64px);
        letter-spacing: -2px;
        line-height: 0.9;
        color: #111111;
      }

      .price span {
        color: #6b7280;
        font-size: 14px;
        font-weight: 700;
        padding-bottom: 7px;
      }

      .fee-note {
        margin: -8px 0 22px;
        color: #ff0048;
        font-size: 13px;
        font-weight: 900;
        line-height: 1.6;
      }

      .feature-list {
        list-style: none;
        display: grid;
        gap: 12px;
        margin: 24px 0 0;
      }

      .feature-list li {
        display: flex;
        gap: 10px;
        color: #4b5563;
        line-height: 1.55;
        font-size: 14px;
      }

      .feature-list svg {
        color: #ff0048;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .section {
        padding: 72px 0;
      }

      .section.white {
        background: #ffffff;
      }

      .section-head {
        max-width: 680px;
        margin: 0 auto 42px;
        text-align: center;
      }

      .section-head h2 {
        font-size: clamp(30px, 4vw, 46px);
        line-height: 1.08;
        letter-spacing: -1.5px;
        font-weight: 900;
        color: #111111;
        margin-bottom: 14px;
      }

      .section-head p {
        color: #6b7280;
        line-height: 1.75;
        font-size: 16px;
      }

      .tools-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
      }

      .tool-card,
      .faq-card,
      .contact-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 24px;
        padding: 24px;
      }

      .tool-icon {
        width: 46px;
        height: 46px;
        border-radius: 16px;
        background: #fff1f2;
        color: #ff0048;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }

      .tool-card h3 {
        font-size: 17px;
        font-weight: 900;
        color: #111111;
        margin-bottom: 8px;
      }

      .tool-card p {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.65;
      }

      .faq-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }

      .faq-card {
        padding: 0;
        overflow: hidden;
      }

      .faq-button {
        width: 100%;
        border: 0;
        background: transparent;
        padding: 22px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        cursor: pointer;
        text-align: left;
      }

      .faq-button span {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 900;
        color: #111111;
      }

      .faq-button svg {
        color: #ff0048;
        flex-shrink: 0;
      }

      .faq-chevron {
        transition: transform 0.25s ease;
      }

      .faq-chevron.open {
        transform: rotate(180deg);
      }

      .faq-answer {
        padding: 0 24px 22px 50px;
        color: #6b7280;
        font-size: 14px;
        line-height: 1.7;
      }

      .contact-card {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 72px;
      }

      .contact-card h3 {
        font-size: 24px;
        font-weight: 900;
        letter-spacing: -0.7px;
        margin-bottom: 8px;
      }

      .contact-card p {
        color: #6b7280;
        line-height: 1.7;
        margin: 0;
      }

      .footer {
        border-top: 1px solid #e5e7eb;
        background: #ffffff;
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
        max-width: 260px;
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
        transition: color 0.2s ease, border-color 0.2s ease;
      }

      .socials a:hover {
        color: #ff0048;
        border-color: rgba(255, 0, 72, 0.25);
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

      @media (max-width: 900px) {
        .nav-links,
        .nav-actions {
          display: none;
        }

        .mobile-menu-button {
          display: flex;
        }

        .pricing-grid,
        .tools-grid,
        .faq-grid,
        .footer-grid {
          grid-template-columns: 1fr;
        }

        .pricing-hero h1 {
          font-size: clamp(36px, 10vw, 56px);
          line-height: 1.05;
          letter-spacing: -1.5px;
          max-width: 340px;
        }

        .pricing-hero p {
          max-width: 360px;
          padding: 0 16px;
          font-size: 15px;
          line-height: 1.8;
        }

        .footer-bottom {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      @media (max-width: 640px) {
        .page-container,
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

        .pricing-hero {
          padding-top: 140px;
        }

        .price-card,
        .tool-card,
        .faq-card,
        .contact-card {
          border-radius: 22px;
          padding: 24px 20px;
        }

        .contact-card .primary-btn,
        .price-card .primary-btn,
        .price-card .outline-btn {
          width: 100%;
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

      <main>
        <section className="page-container pricing-hero">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ color: "#FF0048", fontWeight: 900, letterSpacing: ".22em", fontSize: "11px", marginBottom: "20px" }}
          >
            PRICING
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            Simple pricing for <span>campus events.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: "50px" }}>
            Start selling tickets without complicated setup. UniTix gives students and organizers a clean way to manage event access.
          </motion.p>
        </section>

        <section className="page-container pricing-grid">
          <motion.div className="price-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="badge"><Users size={15} /> For students</div>
            <h2>Browse & buy tickets</h2>
            <p className="desc">Students can discover campus events, buy tickets, and access QR confirmations from one place.</p>
            <div className="price">
              <strong>Free</strong>
              <span>to browse</span>
            </div>
            <Link to="/events" className="outline-btn">Browse events <ArrowRight size={16} /></Link>
            <ul className="feature-list">
              <li><CheckCircle2 size={17} /> Discover campus events</li>
              <li><CheckCircle2 size={17} /> Buy tickets online</li>
              <li><CheckCircle2 size={17} /> Receive QR ticket confirmation</li>
              <li><CheckCircle2 size={17} /> Contact support when needed</li>
            </ul>
          </motion.div>

          <motion.div className="price-card featured" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}>
            <div className="badge"><ShieldCheck size={15} /> For organizers</div>
            <h2>Sell tickets with UniTix</h2>
            <p className="desc">Create paid or free events, manage attendees, and use QR verification for smoother entry. UniTix only takes a fee when you sell paid tickets.</p>
            <div className="price">
              <strong>4%</strong>
              <span>organizer fee on paid ticket sales</span>
            </div>
            <p className="fee-note">Free events cost ₦0 to list. For paid events, organizers pay only a 4% organizer fee on each ticket sold.</p>
            <Link to="/auth" className="primary-btn">Create event <ArrowRight size={16} /></Link>
            <ul className="feature-list">
              {organizerFeatures.map((item) => (
                <li key={item}><CheckCircle2 size={17} /> {item}</li>
              ))}
            </ul>
          </motion.div>
        </section>

        <section className="section white">
          <div className="page-container">
            <div className="section-head">
              <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ color: "#FF0048", fontWeight: 900, letterSpacing: ".22em", fontSize: "11px", marginBottom: "20px" }}
            >
              WHAT IS INCLUDED
            </motion.p>
              <h2>Everything you need to run a cleaner campus event.</h2>
              <p>UniTix helps organizers move away from manual lists, screenshots, and confusing payment confirmations.</p>
            </div>

            <div className="tools-grid">
              {included.map(({ icon: Icon, title, text }, index) => (
                <motion.div className="tool-card" key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
                  <div className="tool-icon"><Icon size={22} /></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="page-container">
            <div className="section-head">
              <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ color: "#FF0048", fontWeight: 900, letterSpacing: ".22em", fontSize: "11px", marginBottom: "20px" }}
            >
              FAQS
            </motion.p>
              <h2>Pricing questions, answered clearly.</h2>
              <p>Here are the common questions students and organizers usually ask before using UniTix.</p>
            </div>

            <div className="faq-grid">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <motion.div
                    className="faq-card"
                    key={faq.q}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <button
                      type="button"
                      className="faq-button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span>
                        <HelpCircle size={18} /> {faq.q}
                      </span>
                      <ChevronDown size={20} className={`faq-chevron ${isOpen ? "open" : ""}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.p
                          className="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          {faq.a}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="page-container">
          <div className="contact-card">
            <div>
              <h3>Need a custom setup?</h3>
              <p><Mail size={15} style={{ display: "inline", marginRight: 6 }} /> hello@unitix.ng</p>
              <p><Phone size={15} style={{ display: "inline", marginRight: 6 }} /> +234 812 060 4186</p>
            </div>
            <Link to="/contact-us" className="primary-btn">Contact support <ArrowRight size={16} /></Link>
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
  );
}
