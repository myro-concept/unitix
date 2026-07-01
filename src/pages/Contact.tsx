import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MapPin,
  ArrowRight,
  Send,
  Phone,
  Clock,
  CheckCircle2,
  Menu,
  X,
  Instagram,
  Twitter,
  Music2,
} from "lucide-react";
import SEO from "@/seo/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CAMPUS_OPTIONS } from "@/lib/campusOptions";
import { z } from "zod";
import logoGlyph from "@/assets/logo-glyph-160.png";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-[10px] bg-[#FF0048] flex items-center justify-center overflow-hidden">
        <img
          src={logoGlyph}
          alt="UniTix"
          className="w-full h-full object-contain"
        />
      </div>

      <span
        className="font-extrabold tracking-[-0.03em]"
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: "20px",
        }}
      >
        UniTix
      </span>
    </div>
  );
}


function FooterSocialIcon({ type }: { type: "x" | "instagram" | "whatsapp" | "tiktok" }) {
  const paths = {
    x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    instagram:
      "M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5Zm0 2h8.5A3.75 3.75 0 0 1 20 7.75v8.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4Zm8.75 1a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
    whatsapp:
      "M20.52 3.48A11.79 11.79 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.91c0 2.1.55 4.16 1.6 5.98L0 24l6.29-1.65a11.8 11.8 0 0 0 5.78 1.47h.01c6.57 0 11.91-5.34 11.91-11.91 0-3.18-1.24-6.17-3.47-8.43ZM12.08 21.3h-.01a9.37 9.37 0 0 1-4.77-1.3l-.34-.2-3.73.98 1-3.63-.22-.37a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.89.98 6.67 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.44-9.43 9.44Zm5.17-7.07c-.28-.14-1.67-.82-1.93-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.89 1.1-.16.19-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.37-1.63-1.53-1.91-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.49-.64-.5h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.35s1 2.73 1.14 2.91c.14.19 1.96 2.99 4.75 4.19.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.67-.68 1.9-1.33.23-.66.23-1.22.16-1.33-.07-.12-.26-.19-.54-.33Z",
    tiktok:
      "M19.59 6.69A4.83 4.83 0 0 1 16 5.26V16a5 5 0 1 1-5-5c.34 0 .67.03 1 .1v2.06a3 3 0 1 0 2 2.84V0h2a4.83 4.83 0 0 0 4.83 4.83v1.86c-.42 0-.83-.04-1.24-.1Z",
  };

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d={paths[type]} />
    </svg>
  );
}


const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Invalid email address").max(255),
  campus: z.string().trim().min(1, "Please select your campus"),
  topic: z.string().trim().min(1, "Please select a topic"),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

const campusOptions = CAMPUS_OPTIONS;

const topicOptions = [
  "Ticket purchase issue",
  "Event hosting enquiry",
  "Organizer account support",
  "Payment or refund question",
  "Partnership / sponsorship",
  "Technical issue",
  "General enquiry",
];

const channels = [
  {
    icon: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.52 3.48A11.79 11.79 0 0 0 12.07 0C5.5 0 .16 5.34.16 11.91c0 2.1.55 4.16 1.6 5.98L0 24l6.29-1.65a11.8 11.8 0 0 0 5.78 1.47h.01c6.57 0 11.91-5.34 11.91-11.91 0-3.18-1.24-6.17-3.47-8.43ZM12.08 21.3h-.01a9.37 9.37 0 0 1-4.77-1.3l-.34-.2-3.73.98 1-3.63-.22-.37a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.89.98 6.67 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.44-9.43 9.44Zm5.17-7.07c-.28-.14-1.67-.82-1.93-.91-.26-.1-.45-.14-.64.14-.19.28-.73.91-.89 1.1-.16.19-.33.21-.61.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.37-1.63-1.53-1.91-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.49.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.49-.64-.5h-.55c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.35s1 2.73 1.14 2.91c.14.19 1.96 2.99 4.75 4.19.66.28 1.18.45 1.58.58.66.21 1.26.18 1.73.11.53-.08 1.67-.68 1.9-1.33.23-.66.23-1.22.16-1.33-.07-.12-.26-.19-.54-.33Z" />
    </svg>
  ),
      title: "WhatsApp support",
    description: "Fast help for ticket issues, check-in questions, and event day support.",
    value: "Message us",
    href: "https://wa.me/2348120604186",
    bg: "bg-[hsl(170,60%,92%)]",
  },
  {
    icon: Mail,
    title: "Email us",
    description: "Best for partnerships, hosting requests, and detailed enquiries.",
    value: "hello@unitix.ng",
    href: "mailto:hello@unitix.ng",
    bg: "bg-[hsl(340,75%,95%)]",
  },
  {
    icon: Instagram,
    title: "Instagram DM",
    description: "Follow updates, discover new events, and send quick questions.",
    value: "@unitix.ng",
    href: "https://instagram.com",
    bg: "bg-[hsl(45,90%,92%)]",
  },
];

const helpItems = [
  "Ticket purchase and QR issues",
  "Creating and managing events",
  "Organizer payments and payouts",
  "Campus partnerships",
];

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

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    campus: "",
    topic: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const parsed = contactSchema.safeParse(form);
  if (!parsed.success) {
    toast({
      title: "Check your details",
      description: parsed.error.issues[0]?.message ?? "Please review the form.",
      variant: "destructive",
    });
    return;
  }

  setSubmitting(true);

  const res = await fetch("https://formspree.io/f/xzdovnkd", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(form),
  });

  setSubmitting(false);

  if (!res.ok) {
    toast({
      title: "Message not sent",
      description: "Please try again.",
      variant: "destructive",
    });
    return;
  }

  setSent(true);
  setTimeout(() => setSent(false), 5000);

  toast({
    title: "Message sent",
    description: "Thanks for reaching out — we'll be in touch shortly.",
  });

  setForm({
    firstName: "",
    lastName: "",
    email: "",
    campus: "",
    topic: "",
    message: "",
  });
};

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO page="contact" />
      <style>{`
        .unitix-logo-wrap {
          display: flex;
          align-items: center;
          gap: 9px;
          text-decoration: none;
        }

        .unitix-logo-wrap > div {
          border-radius: 9px;
          background: #FF0048;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .unitix-logo-wrap span {
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
          border-top: none;
          background: #0b1020;
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

      {/* Hero */}
      <section className="px-6 md:px-10 pt-12 md:pt-20 pb-12 max-w-4xl mx-auto text-center">
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
        CONTACT UNITIX
      </motion.p>
        <h1 className="font-display font-black tracking-[-0.06em] leading-[0.95] mb-6" style={{fontSize: "clamp(40px, 6vw, 78px)",}}>
          Let's help with your <span className="text-[#FF0048]">next event.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Questions about tickets, event hosting, payments, or partnerships? Send us a message and our team will get back to you.
        </p>
      </section>

      {/* Channels */}
      <section className="px-6 md:px-10 pb-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {channels.map((c, i) => (
            <motion.a
              key={c.title}
              href={c.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group rounded-3xl bg-card p-6 hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center mb-4`}>
                <c.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{c.description}</p>
              <div className="inline-flex items-center gap-1.5 text-sm font-medium text-[#FF0048] group-hover:gap-2.5 transition-all">
                {c.value}
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Form + Info */}
      <section className="px-6 md:px-10 pb-24 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-card p-6 md:p-10"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-2">
              Send us a message
            </h2>
            <p className="text-muted-foreground mb-8">
              Tell us what you need help with. Add your campus and topic so we can route your message properly.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} maxLength={60} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} maxLength={60} required />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@school.edu" maxLength={255} required />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Your campus</Label>
                <Select value={form.campus} onValueChange={(v) => setForm({ ...form, campus: v })}>
                  <SelectTrigger><SelectValue placeholder="Select your school" /></SelectTrigger>
                  <SelectContent>
                    {campusOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>What is this about?</Label>
                <Select value={form.topic} onValueChange={(v) => setForm({ ...form, topic: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                  <SelectContent>
                    {topicOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <Label htmlFor="message">Your message</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us a bit about your event or question…"
                rows={6}
                maxLength={1000}
                required
              />
              <p className="text-xs text-muted-foreground text-right">{form.message.length}/1000</p>
            </div>

            <Button type="submit" size="lg" disabled={submitting} className="w-full bg-[#111111] hover:bg-[#e60041] text-white">
              {submitting ? "Sending…" : (<>Send message <Send className="w-4 h-4" /></>)}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              We usually respond within 2–24 hours on active support days.
            </p>

            <AnimatePresence>
              {sent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 rounded-2xl bg-[hsl(150,60%,95%)] text-[hsl(150,60%,30%)] px-4 py-3 text-sm font-medium text-center"
                >
                  Message sent! We'll get back to you soon.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* Info column */}
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-card p-6"
            >
              <h3 className="font-display text-lg font-semibold mb-5">Contact details</h3>
              {[
                { icon: Mail, label: "Email", value: "hello@unitix.ng" },
                { icon: Phone, label: "WhatsApp", value: "+234 812 060 4186" },
                { icon: MapPin, label: "Location", value: "Lagos, Nigeria" },
                { icon: Clock, label: "Support hours", value: "Mon – Sat · 8AM – 10PM WAT" },
              ].map((it) => (
                <div key={it.label} className="flex items-start gap-3 mb-4 last:mb-0">
                  <div className="w-10 h-10 rounded-2xl bg-[hsl(340,75%,95%)] text-[#FF0048] flex items-center justify-center shrink-0">
                    <it.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">{it.label}</div>
                    <div className="text-sm font-semibold">{it.value}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-card p-6"
            >
              <h3 className="font-display text-lg font-semibold mb-3">Support status</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[hsl(150,60%,45%)] animate-pulse" />
                Ticketing and check-in systems are running
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-card p-6"
            >
              <h3 className="font-display text-lg font-semibold mb-4">What we can help with</h3>
              <div className="grid gap-2">
                {helpItems.map((h) => (
                  <div key={h} className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2.5 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#FF0048] shrink-0" />
                    {h}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-card p-6"
            >
              <h3 className="font-display text-lg font-semibold mb-4">Follow UniTix</h3>
              <div className="flex flex-wrap gap-2">
              {[
                {
                  label: "Twitter",
                  href: "https://x.com/unitix.ng",
                  svg: (
                    <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  ),
                },
                {
                  label: "Instagram",
                  href: "https://instagram.com/unitix.ng",
                  svg: (
                  <svg
                    width="18"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  ),
                },
                {
                  label: "WhatsApp",
                  href: "https://wa.me/2348120604186",
                  svg: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  ),
                },
                {
                  label: "TikTok",
                  href: "https://tiktok.com/@unitix.ng",
                  svg: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.17 8.17 0 004.78 1.52V6.82a4.85 4.85 0 01-1.01-.13z"/>
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-muted hover:bg-[#FF0048]/10 hover:text-[#FF0048] px-3.5 py-2 text-xs font-medium transition-colors"
                >
                  {s.svg}
                  {s.label}
                </a>
              ))}
            </div>
            </motion.div>
          </div>
        </div>
      </section>

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