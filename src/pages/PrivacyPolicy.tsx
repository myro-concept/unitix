import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  CalendarClock,
  RefreshCw,
  ShieldCheck,
  Lock,
  Database,
  Cookie,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Eye,
  FileText,
} from "lucide-react";
import logoGlyph from "@/assets/logo-glyph.png";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-[10px] bg-[#FF0048] flex items-center justify-center overflow-hidden">
        <img src={logoGlyph} alt="UniTix" className="w-full h-full object-contain" />
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

function FooterSocialIcon({ type }: { type: "x" | "instagram" | "whatsapp" | "tiktok" }) {
  const paths = {
    x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    instagram: "M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5Zm0 2h8.5A3.75 3.75 0 0 1 20 7.75v8.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4Zm8.75 1a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
    whatsapp: "M20.52 3.48A11.79 11.79 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.91c0 2.1.55 4.16 1.6 5.98L0 24l6.29-1.65a11.8 11.8 0 0 0 5.78 1.47h.01c6.57 0 11.91-5.34 11.91-11.91 0-3.18-1.24-6.17-3.47-8.43ZM12.08 21.3h-.01a9.37 9.37 0 0 1-4.77-1.3l-.34-.2-3.73.98 1-3.63-.22-.37a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.89.98 6.67 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.44-9.43 9.44Zm5.17-7.07c-.28-.14-1.67-.82-1.93-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.89 1.1-.16.19-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.37-1.63-1.53-1.91-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.49-.64-.5h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.35s1 2.73 1.14 2.91c.14.19 1.96 2.99 4.75 4.19.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.67-.68 1.9-1.33.23-.66.23-1.22.16-1.33-.07-.12-.26-.19-.54-.33Z",
    tiktok: "M19.59 6.69A4.83 4.83 0 0 1 16 5.26V16a5 5 0 1 1-5-5c.34 0 .67.03 1 .1v2.06a3 3 0 1 0 2 2.84V0h2a4.83 4.83 0 0 0 4.83 4.83v1.86c-.42 0-.83-.04-1.24-.1Z",
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d={paths[type]} /></svg>;
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

const collectItems = [
  "Name, email address, and phone number when you create an account or buy a ticket.",
  "Campus or school selection to help personalize event discovery.",
  "Event details submitted by organizers, including event name, venue, date, description, and ticket price.",
  "Support messages, enquiries, and communication with UniTix.",
  "Device, browser, page visit, and basic usage information.",
];

const usageItems = [
  "To process ticket purchases and generate ticket confirmations.",
  "To send event updates, reminders, and support messages.",
  "To help organizers manage attendees and verify ticket check-ins.",
  "To improve UniTix features, event discovery, and user experience.",
  "To prevent fraud, duplicate ticket use, chargebacks, and suspicious activity.",
];

const rights = [
  "Request access to personal data we hold about you.",
  "Ask us to correct inaccurate or outdated information.",
  "Request deletion of your account, subject to legal and transaction record requirements.",
  "Object to certain uses of your data where applicable.",
  "Withdraw consent where processing is based on consent.",
];

export default function PrivacyPolicy() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-foreground">
      <style>{`
        .nav {
          position: sticky;
          top: 0;
          z-index: 10001;
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
            top: 66px;
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

        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .policy-hero {
          padding: 92px 0 56px;
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

        .policy-hero h1 {
          max-width: 820px;
          margin: 0 auto 22px;
          font-size: clamp(40px, 6vw, 78px);
          line-height: 1.02;
          letter-spacing: -2px;
          font-weight: 900;
          color: #111111;
        }

        .policy-hero h1 span {
          color: #ff0048;
        }

        .policy-hero p {
          max-width: 560px;
          margin: 0 auto;
          padding: 0 14px;
          font-size: 17px;
          line-height: 1.75;
          color: #6b7280;
        }

        .meta-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .meta-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          border-radius: 999px;
          padding: 9px 14px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 700;
        }

        .policy-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 36px;
          padding-bottom: 82px;
          align-items: start;
        }

        .toc {
          position: sticky;
          top: 94px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 22px;
        }

        .toc h3 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-weight: 900;
          margin-bottom: 14px;
          color: #111111;
        }

        .toc a {
          display: block;
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          padding: 9px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .toc a:last-child {
          border-bottom: 0;
        }

        .toc a:hover {
          color: #ff0048;
        }

        .policy-content {
          display: grid;
          gap: 22px;
        }

        .policy-section,
        .contact-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 26px;
          padding: 32px;
        }

        .policy-section {
          scroll-margin-top: 100px;
        }

        .policy-section h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1.1;
          letter-spacing: -1px;
          font-weight: 900;
          color: #111111;
          margin-bottom: 16px;
        }

        .policy-section h3 {
          font-size: 17px;
          font-weight: 900;
          margin: 22px 0 10px;
          color: #111111;
        }

        .policy-section p {
          color: #6b7280;
          line-height: 1.8;
          font-size: 15px;
          margin-bottom: 14px;
        }

        .num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 12px;
          background: #fff1f2;
          color: #ff0048;
          font-size: 13px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .info-box {
          border-radius: 18px;
          background: #fafaf9;
          border: 1px solid #e5e7eb;
          padding: 18px;
          margin-top: 18px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .info-box svg {
          color: #ff0048;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-box p {
          margin: 0;
          font-size: 14px;
        }

        .list {
          list-style: none;
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }

        .list li {
          display: flex;
          gap: 10px;
          color: #6b7280;
          line-height: 1.6;
          font-size: 14px;
        }

        .list li::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #ff0048;
          flex-shrink: 0;
          margin-top: 9px;
        }

        .two-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 18px;
        }

        .mini-card {
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 22px;
          background: #fafaf9;
        }

        .mini-card h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 10px;
          font-size: 16px;
        }

        .mini-card svg {
          color: #ff0048;
        }

        .mini-card p {
          margin: 0;
          font-size: 14px;
        }

        .contact-card {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          align-items: center;
        }

        .contact-card h3 {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.5px;
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

          .policy-layout {
            grid-template-columns: 1fr;
          }

          .toc {
            display: none;
          }

          .two-grid,
          .footer-grid {
            grid-template-columns: 1fr;
          }

          .policy-hero h1 {
            font-size: clamp(36px, 10vw, 56px);
            line-height: 1.05;
            letter-spacing: -1.5px;
            max-width: 340px;
          }

          .policy-hero p {
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

          .policy-hero {
            padding: 70px 0 42px;
          }

          .policy-section,
          .contact-card {
            border-radius: 22px;
            padding: 24px 20px;
          }

          .contact-card .primary-btn {
            width: 100%;
          }

          .policy-hero h1 {
            font-size: clamp(36px, 10vw, 56px);
            line-height: 1.05;
            letter-spacing: -1.5px;
            max-width: 300px;
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
        <section className="page-container policy-hero">
          <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                color: "#FF0048",
                fontWeight: 900,
                letterSpacing: ".22em",
                fontSize: "11px",
                marginBottom: "20px",
                }}
            >
                PRIVACY POLICY
            </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            How UniTix protects <span>your data.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            We believe your data belongs to you. This policy explains what we collect, why we collect it, and how we keep it safe.
          </motion.p>
          <div className="meta-row">
            <div className="meta-pill"><CalendarClock size={15} /> Effective: 1 January 2026</div>
            <div className="meta-pill"><RefreshCw size={15} /> Last updated: 7 May 2026</div>
          </div>
        </section>

        <section className="page-container policy-layout">
          <aside className="toc">
            <h3>Contents</h3>
            <a href="#who-we-are">Who we are</a>
            <a href="#collect">What we collect</a>
            <a href="#use">How we use data</a>
            <a href="#sharing">Sharing data</a>
            <a href="#payments">Payments</a>
            <a href="#cookies">Cookies</a>
            <a href="#retention">Retention</a>
            <a href="#rights">Your rights</a>
            <a href="#security">Security</a>
            <a href="#minors">Minors</a>
            <a href="#contact">Contact</a>
          </aside>

          <div className="policy-content">
            <motion.div className="policy-section" id="who-we-are" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">01</span> Who we are</h2>
              <p>UniTix is a student event ticketing platform operated by Myro Concept. The platform helps Nigerian students discover campus events, buy tickets, and access event confirmations.</p>
              <p>In this policy, “UniTix”, “we”, “us”, and “our” refer to UniTix. “You” refers to anyone who uses the UniTix website, platform, or related services.</p>
              <div className="info-box"><ShieldCheck size={20} /><p><strong>Our commitment:</strong> we do not sell your personal data to advertisers or unrelated third parties.</p></div>
            </motion.div>

            <motion.div className="policy-section" id="collect" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">02</span> What we collect</h2>
              <p>We collect information needed to run UniTix, process tickets, support organizers, and improve the platform.</p>
              <ul className="list">{collectItems.map((item) => <li key={item}>{item}</li>)}</ul>
              <div className="two-grid">
                <div className="mini-card"><Database size={19} /><h3>Account data</h3><p>Basic profile details used to identify your account and tickets.</p></div>
                <div className="mini-card"><Eye size={19} /><h3>Usage data</h3><p>Basic activity data that helps us improve pages, events, and support.</p></div>
              </div>
            </motion.div>

            <motion.div className="policy-section" id="use" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">03</span> How we use your data</h2>
              <p>We use your data only for specific UniTix-related purposes.</p>
              <ul className="list">{usageItems.map((item) => <li key={item}>{item}</li>)}</ul>
            </motion.div>

            <motion.div className="policy-section" id="sharing" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">04</span> Sharing your data</h2>
              <p>We do not sell or rent your personal data. We only share information where it is needed to provide the service or comply with legal requirements.</p>
              <ul className="list">
                <li>Event organizers may receive ticket holder names and check-in status for event entry.</li>
                <li>Payment processors receive payment-related data needed to complete transactions.</li>
                <li>Promoters may receive aggregate ticket counts, not private buyer details.</li>
                <li>Authorities may receive data only where required by law or lawful request.</li>
              </ul>
            </motion.div>

            <motion.div className="policy-section" id="payments" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">05</span> Payments and processors</h2>
              <p>Payments on UniTix may be processed through secure third-party payment providers such as Paystack. UniTix does not store your full card number, CVV, or PIN.</p>
              <div className="info-box"><CreditCard size={20} /><p>Your card and bank details are handled by the payment processor, not stored directly by UniTix.</p></div>
            </motion.div>

            <motion.div className="policy-section" id="cookies" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">06</span> Cookies and tracking</h2>
              <p>We may use cookies or similar technologies to keep you logged in, remember preferences, and understand how students use UniTix.</p>
              <div className="two-grid">
                <div className="mini-card"><Cookie size={19} /><h3>Essential cookies</h3><p>Used for login, tickets, checkout, and core platform features.</p></div>
                <div className="mini-card"><FileText size={19} /><h3>Analytics cookies</h3><p>Used to understand page visits and improve the experience.</p></div>
              </div>
            </motion.div>

            <motion.div className="policy-section" id="retention" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">07</span> How long we keep data</h2>
              <ul className="list">
                <li>Account data is kept while your account remains active.</li>
                <li>Transaction records may be kept where required for legal, tax, accounting, or dispute purposes.</li>
                <li>Support messages may be kept to help resolve future issues.</li>
                <li>Event records may be kept for organizer reporting and fraud prevention.</li>
              </ul>
            </motion.div>

            <motion.div className="policy-section" id="rights" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">08</span> Your rights</h2>
              <p>You may have rights over your personal data under applicable Nigerian data protection laws.</p>
              <ul className="list">{rights.map((item) => <li key={item}>{item}</li>)}</ul>
            </motion.div>

            <motion.div className="policy-section" id="security" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">09</span> Security</h2>
              <p>We use reasonable technical and organizational measures to protect your data, including secure connections, restricted access, and careful handling of sensitive information.</p>
              <div className="info-box"><Lock size={20} /><p>No platform can guarantee perfect security, but we take user privacy and platform safety seriously.</p></div>
            </motion.div>

            <motion.div className="policy-section" id="minors" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">10</span> Minors</h2>
              <p>UniTix is designed for university students and is intended for users aged 16 and above. If we become aware that a younger minor created an account, we may delete the account and related personal data.</p>
            </motion.div>

            <motion.div className="policy-section" id="changes" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">11</span> Changes to this policy</h2>
              <p>We may update this Privacy Policy from time to time. When we make important changes, we may notify users through the platform, email, or other reasonable channels.</p>
            </motion.div>

            <motion.div className="policy-section" id="contact" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">12</span> Contact us</h2>
              <p>If you have questions about this policy or how UniTix handles your data, contact us.</p>
              <div className="contact-card">
                <div>
                  <h3>Privacy questions?</h3>
                  <p><Mail size={15} style={{ display: "inline", marginRight: 6 }} /> privacy@unitix.ng</p>
                  <p><Phone size={15} style={{ display: "inline", marginRight: 6 }} /> +234 812 060 4186</p>
                  <p><MapPin size={15} style={{ display: "inline", marginRight: 6 }} /> Lagos, Nigeria</p>
                </div>
                <Link to="/contact-us" className="primary-btn">Contact support <ArrowRight size={16} /></Link>
              </div>
            </motion.div>
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
