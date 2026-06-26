import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, CalendarClock, CheckCircle2, XCircle, Mail, Phone, ShieldCheck, Clock, AlertCircle, RefreshCw } from "lucide-react";
import logoGlyph from "@/assets/logo-glyph.png";

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

const eligible = [
  "The event is cancelled by the organizer.",
  "The event is postponed and you cannot attend the new date.",
  "The venue or event format changes significantly.",
  "You were charged twice for the same ticket.",
  "Your ticket was not delivered after successful payment.",
];

const notEligible = [
  "You changed your mind after buying a ticket.",
  "You missed the event for personal reasons.",
  "You bought a ticket for the wrong event by mistake.",
  "You did not use your QR code at the gate.",
  "The event happened as described but you were not satisfied.",
];

const requestSteps = [
  ["Send your request", "Email hello@unitix.ng or contact support with your name, ticket email, event name, and order ID."],
  ["We review the case", "Our team checks the transaction, ticket status, and event details. We may contact the organizer."],
  ["Decision is shared", "If approved, we confirm the refund amount and the original payment method it will return to."],
  ["Refund is processed", "Approved refunds are sent back to the original payment method. Bank processing time may vary."],
];

export default function RefundPolicy() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-foreground">
      <style>{`
        .nav {
          position: sticky;
          top: 0;
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
          color: #FF0048;
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

          .mobile-menu {
            display: block;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .nav-inner,
          .footer-inner {
            padding-left: 20px;
            padding-right: 20px;
          }

          .nav-inner {
            height: 66px;
          }
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
          max-width: 900px;
          margin: 0 auto 22px;
          font-size: clamp(42px, 6vw, 78px);
          line-height: 0.98;
          letter-spacing: -3px;
          font-weight: 900;
          color: #111111;
        }

        .policy-hero h1 span {
          color: #ff0048;
        }

        .policy-hero p {
          max-width: 650px;
          margin: 0 auto;
          font-size: 18px;
          line-height: 1.7;
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

        .policy-section p {
          color: #6b7280;
          line-height: 1.8;
          font-size: 15px;
          margin-bottom: 14px;
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

        .eligibility-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-top: 20px;
        }

        .elig-card {
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 22px;
          background: #fafaf9;
        }

        .elig-card h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 900;
          margin-bottom: 14px;
        }

        .elig-card.yes h3 {
          color: #16a34a;
        }

        .elig-card.no h3 {
          color: #ef4444;
        }

        .elig-card ul,
        .policy-section ul {
          list-style: none;
          display: grid;
          gap: 10px;
        }

        .elig-card li,
        .policy-section li {
          display: flex;
          gap: 10px;
          color: #6b7280;
          line-height: 1.6;
          font-size: 14px;
        }

        .elig-card li::before,
        .policy-section li::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #ff0048;
          flex-shrink: 0;
          margin-top: 9px;
        }

        .step-list {
          display: grid;
          gap: 14px;
          margin-top: 18px;
        }

        .step-item {
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 14px;
          align-items: start;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 18px;
          background: #fafaf9;
        }

        .step-number {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: #111111;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
        }

        .step-item h3 {
          font-size: 16px;
          font-weight: 900;
          margin-bottom: 4px;
          color: #111111;
        }

        .step-item p {
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

          .eligibility-grid {
            grid-template-columns: 1fr;
          }

          .policy-hero h1 {
            font-size: clamp(36px, 10vw, 56px);
            line-height: 1.05;
            letter-spacing: -1.5px;
            max-width: 340px;
          }
        }

        @media (max-width: 640px) {
          .page-container,
          .nav-inner {
            padding-left: 20px;
            padding-right: 20px;
          }

          .nav-inner {
            height: 66px;
          }

          .policy-hero {
            padding: 70px 0 42px;
          }

          .policy-hero p {
            max-width: 560px;
            padding: 0 20px;
            font-size: 17px;
            line-height: 1.75;
          }

          .policy-section,
          .contact-card {
            border-radius: 22px;
            padding: 24px 20px;
          }

          .contact-card .primary-btn {
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
                REFUND POLICY
            </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            Clear rules for <span>ticket refunds.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            We want every student to feel confident when buying tickets on UniTix. This page explains when refunds are available, when they are not, and how to request one.
          </motion.p>
          <div className="meta-row">
            <div className="meta-pill"><CalendarClock size={15} /> Effective: 1 January 2026</div>
            <div className="meta-pill"><RefreshCw size={15} /> Last updated: 7 May 2026</div>
          </div>
        </section>

        <section className="page-container policy-layout">
          <aside className="toc">
            <h3>Contents</h3>
            <a href="#overview">Overview</a>
            <a href="#eligibility">Eligibility</a>
            <a href="#cancelled">Cancelled events</a>
            <a href="#postponed">Postponed events</a>
            <a href="#request">How to request</a>
            <a href="#timeline">Timeline</a>
            <a href="#organizers">For organizers</a>
            <a href="#contact">Contact</a>
          </aside>

          <div className="policy-content">
            <motion.div className="policy-section" id="overview" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">01</span> Overview</h2>
              <p>UniTix helps students discover and buy tickets for campus events. When you buy a ticket, the event is delivered by the organizer, while UniTix helps process the ticket sale, payment confirmation, and ticket access.</p>
              <p>Our refund policy is designed to be fair to both ticket buyers and event organizers. If an event is cancelled by the organizer, eligible buyers will receive a refund of the ticket price paid.</p>
              <div className="info-box"><ShieldCheck size={20} /><p><strong>Simple rule:</strong> cancelled events are refundable. Change-of-mind purchases are generally not refundable unless the organizer states otherwise.</p></div>
            </motion.div>

            <motion.div className="policy-section" id="eligibility" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">02</span> Refund eligibility</h2>
              <p>Below are the common cases where a refund may or may not be approved.</p>
              <div className="eligibility-grid">
                <div className="elig-card yes">
                  <h3><CheckCircle2 size={19} /> Eligible for refund</h3>
                  <ul>{eligible.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div className="elig-card no">
                  <h3><XCircle size={19} /> Not eligible for refund</h3>
                  <ul>{notEligible.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              </div>
            </motion.div>

            <motion.div className="policy-section" id="cancelled" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">03</span> Cancelled events</h2>
              <p>If an event is cancelled by the organizer, UniTix will work with the organizer to process refunds for affected ticket holders.</p>
              <ul>
                <li>Ticket holders may be notified by email, WhatsApp, or platform notification.</li>
                <li>The organizer’s payout may be paused until refund issues are resolved.</li>
                <li>Refunds are returned to the original payment method where possible.</li>
              </ul>
            </motion.div>

            <motion.div className="policy-section" id="postponed" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">04</span> Postponed events</h2>
              <p>If an event is postponed, your ticket will usually remain valid for the new date. If you cannot attend the new date, you may request a refund within the period communicated by UniTix or the event organizer.</p>
              <div className="info-box"><AlertCircle size={20} /><p>Refund requests for postponed events should be made as soon as the new date is announced.</p></div>
            </motion.div>

            <motion.div className="policy-section" id="request" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">05</span> How to request a refund</h2>
              <p>For cases that are not automatic, follow these steps.</p>
              <div className="step-list">
                {requestSteps.map(([title, text], index) => (
                  <div className="step-item" key={title}>
                    <div className="step-number">0{index + 1}</div>
                    <div><h3>{title}</h3><p>{text}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="policy-section" id="timeline" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">06</span> Refund timeline</h2>
              <p>Approved refunds may take time to reflect depending on your bank or payment method. In most cases, refunds are processed within 3–7 business days after approval.</p>
              <ul>
                <li><strong>Card payments:</strong> usually 3–7 business days.</li>
                <li><strong>Bank transfers:</strong> usually 1–3 business days after approval.</li>
                <li><strong>Payment processor delays:</strong> may depend on your bank or payment provider.</li>
              </ul>
              <div className="info-box"><Clock size={20} /><p>If your approved refund has not arrived after 7 business days, contact UniTix support with your order details.</p></div>
            </motion.div>

            <motion.div className="policy-section" id="organizers" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">07</span> For event organizers</h2>
              <p>Organizers are responsible for delivering events as advertised. If an event is cancelled, postponed, or materially changed, refunds may be deducted from organizer payouts.</p>
              <ul>
                <li>Cancelled event payouts may be held until refund issues are settled.</li>
                <li>Repeated cancellations may affect organizer account access.</li>
                <li>False or misleading event information may lead to refund approval and account review.</li>
              </ul>
            </motion.div>

            <motion.div className="policy-section" id="contact" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2><span className="num">08</span> Contact support</h2>
              <p>For refund requests, contact UniTix with your event name, ticket email, and order ID.</p>
              <div className="contact-card">
                <div>
                  <h3>Need help with a refund?</h3>
                  <p><Mail size={15} style={{ display: "inline", marginRight: 6 }} /> hello@unitix.ng</p>
                  <p><Phone size={15} style={{ display: "inline", marginRight: 6 }} /> +234 812 060 4186</p>
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
