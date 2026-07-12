import { useState, useEffect, type ChangeEvent } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  Ticket,
  UserRound,
  Users,
  Tag,
  Lock,
  CheckCircle2,
  ChevronUp,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEventBySlug } from "@/hooks/useEvents";
import { useCreateRegistration } from "@/hooks/useRegistrations";
import logoGlyph from "@/assets/logo-glyph-160.png";

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CheckoutState {
  ticketId: string;
  quantity: number;
  ticketName: string;
  price: number;
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

const Checkout = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: event, isLoading } = useEventBySlug(slug);
  const createRegistration = useCreateRegistration();
  const [paystackReady, setPaystackReady] = useState(false);

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [useContactForAttendee, setUseContactForAttendee] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const paystackPublicKey = "pk_test_0838dcdb033d9740f48ae762f3e6c260becc25cf";
  const isTestMode = paystackPublicKey?.trim().startsWith("pk_test");

  const checkoutState = (location.state as CheckoutState) || {
    ticketId: "",
    quantity: 1,
    ticketName: "General Admission",
    price: 0,
  };

  useEffect(() => {
    if (!checkoutState.ticketId) {
      toast.error("Please select a ticket first");
      navigate(`/${slug}`);
    }
  }, [checkoutState, slug, navigate]);

  useEffect(() => {
    if ((checkoutState.price || 0) <= 0) {
      return;
    }

    const scriptId = "paystack-inline-js";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    let active = true;

    const updateReadyState = () => {
      if (!active) {
        return;
      }
      const hasSetup = typeof (window as any).PaystackPop?.setup === "function";
      setPaystackReady(hasSetup);
    };

    const handleLoad = () => {
      updateReadyState();
    };

    const handleError = () => {
      if (!active) {
        return;
      }
      setPaystackReady(false);
      toast.error("Could not load payment gateway.");
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);
      updateReadyState();

      return () => {
        active = false;
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.body.appendChild(script);

    return () => {
      active = false;
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [checkoutState.price]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <p className="text-sm text-[#6b7280]">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <p className="text-sm text-[#6b7280]">Event not found</p>
      </div>
    );
  }

  const subtotal = checkoutState.price * checkoutState.quantity;
  const serviceFee = 0;
  const total = subtotal + serviceFee;

  const getErrorMessage = (error: unknown) => {
    if (error && typeof error === "object") {
      const maybeError = error as {
        message?: string;
        details?: string;
        hint?: string;
      };
      const parts = [maybeError.message, maybeError.details, maybeError.hint]
        .filter((part) => typeof part === "string" && part.trim().length > 0)
        .map((part) => part!.trim());

      if (parts.length > 0) {
        return parts.join(" | ");
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }
    if (typeof error === "string" && error.trim()) {
      return error;
    }
    return "Unknown error";
  };

  const handleContactChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttendeeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAttendeeInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("Enter a coupon code");
      return;
    }
    toast.info("Coupon validation coming soon");
  };

  const buildRegistrationPayload = (
    finalAttendee: AttendeeInfo,
    paymentMeta?: { reference?: string; status?: string; mode?: string },
  ) => ({
    "Full Name": `${finalAttendee.firstName} ${finalAttendee.lastName}`.trim(),
    "Email Address": finalAttendee.email.trim(),
    "Phone Number": finalAttendee.phone.trim(),
    "Ticket Type": checkoutState.ticketName,
    Quantity: String(checkoutState.quantity),
    "Ticket Price": String(checkoutState.price),
    "Order Total": String(total),
    "Contact Name": `${contactInfo.firstName} ${contactInfo.lastName}`.trim(),
    "Contact Email": contactInfo.email.trim(),
    "Contact Phone": contactInfo.phone.trim(),
    ...(paymentMeta?.reference ? { "Payment Reference": paymentMeta.reference } : {}),
    ...(paymentMeta?.status ? { "Payment Status": paymentMeta.status } : {}),
    ...(paymentMeta?.mode ? { "Payment Mode": paymentMeta.mode } : {}),
  });

  const handleCompleteOrder = async () => {
    if (isPaymentSuccessful) {
      navigate(`/${slug}`);
      return;
    }

    if (
      !contactInfo.firstName ||
      !contactInfo.lastName ||
      !contactInfo.email ||
      !contactInfo.phone
    ) {
      toast.error("Please fill in all contact information");
      return;
    }

    const finalAttendee = useContactForAttendee ? contactInfo : attendeeInfo;

    if (
      !finalAttendee.firstName ||
      !finalAttendee.lastName ||
      !finalAttendee.email ||
      !finalAttendee.phone
    ) {
      toast.error("Please fill in all attendee information");
      return;
    }

    setIsProcessing(true);

    const registrationPayload = buildRegistrationPayload(finalAttendee);

    if (total <= 0) {
      try {
        await createRegistration.mutateAsync({
          event_id: event.id,
          data: registrationPayload,
        });
        setIsPaymentSuccessful(true);
        toast.success("Registration successful! Your spot has been reserved.");
        navigate(`/${slug}`);
      } catch (error: any) {
        toast.error(error?.message || "Registration failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    try {
      const normalizedKey = paystackPublicKey?.trim();

      if (!normalizedKey) {
        toast.error("Payment is not configured yet. Add VITE_PAYSTACK_PUBLIC_KEY before launch.");
        setIsProcessing(false);
        return;
      }

      const paystackPop = (window as any).PaystackPop;

      if (!paystackPop || !paystackReady) {
        toast.error("Payment gateway is not ready yet. Please try again.");
        setIsProcessing(false);
        return;
      }
      console.log("Paystack key in use:", normalizedKey);
      if (typeof paystackPop.setup !== "function") {
        toast.error("Paystack SDK loaded incorrectly. Please refresh and try again.");
        setIsProcessing(false);
        return;
      }

      const attendeeEmail = finalAttendee.email.trim();

      if (!attendeeEmail || !attendeeEmail.includes("@")) {
        toast.error("Please enter a valid attendee email address.");
        setIsProcessing(false);
        return;
      }

      const handleSuccessfulPayment = async (reference?: string) => {
        const paymentMode = normalizedKey.startsWith("pk_test") ? "test" : "live";
        const paidRegistrationPayload = buildRegistrationPayload(finalAttendee, {
          reference,
          status: "success",
          mode: paymentMode,
        });

        try {
          await createRegistration.mutateAsync({
            event_id: event.id,
            data: paidRegistrationPayload,
          });
          setIsPaymentSuccessful(true);
          toast.success("Payment successful! Your registration has been confirmed.");
          navigate(`/${slug}`);
        } catch (error: any) {
          const registrationError = getErrorMessage(error);
          toast.error(`Payment succeeded, but attendee creation failed: ${registrationError}`);
        } finally {
          setIsProcessing(false);
        }
      };

      const handler = paystackPop.setup({
        key: normalizedKey,
        email: isTestMode ? "test@example.com" : attendeeEmail,
        amount: total * 100,
        callback: function (response: { reference?: string }) {
          void handleSuccessfulPayment(response?.reference);
        },
        onClose: function () {
          setIsProcessing(false);
          toast.info("Payment window closed.");
        },
      });

      handler.openIframe();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error("Payment error:", error);
      toast.error(`Payment initialization failed: ${errorMessage}`);
      setIsProcessing(false);
    }
  };

  const attendeeValues = useContactForAttendee ? contactInfo : attendeeInfo;

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="checkout-page" style={{ minHeight: '100vh', background: '#fafaf9', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#111111' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        .checkout-page * { box-sizing: border-box; }
        .checkout-logo { display:flex; align-items:center; gap:9px; text-decoration:none; }
        .checkout-logo-mark { border-radius:9px; background:#FF0048; color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .checkout-logo span { font-weight:900; letter-spacing:-0.6px; color:#111111; }
        .checkout-nav { position:fixed; top:0; left:0; right:0; z-index:9999; background:rgba(250,250,249,0.94); border-bottom:1px solid #e5e7eb; }
        .checkout-nav-inner { max-width:1200px; height:70px; margin:0 auto; padding:0 32px; display:flex; align-items:center; justify-content:space-between; position:relative; }
        .checkout-nav-links { display:flex; align-items:center; gap:32px; position:absolute; left:50%; transform:translateX(-50%); }
        .checkout-nav-links a { color:#6b7280; text-decoration:none; font-size:14px; font-weight:600; transition:color 0.2s ease; }
        .checkout-nav-links a:hover { color:#FF0048; }
        .checkout-nav-actions { display:flex; align-items:center; gap:10px; }
        .checkout-login-link { color:#374151; font-size:14px; font-weight:600; text-decoration:none; padding:9px 16px; border-radius:10px; }
        .checkout-primary-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:12px; text-decoration:none; font-size:15px; font-weight:800; transition:transform 0.2s ease, opacity 0.2s ease; background:#FF0048; color:white; padding:13px 26px; }
        .checkout-primary-btn:hover { transform:translateY(-1px); }
        .checkout-mobile-btn { display:none; width:42px; height:42px; border:1px solid #e5e7eb; border-radius:12px; background:white; color:#111111; align-items:center; justify-content:center; cursor:pointer; }
        .checkout-mobile-menu { position:fixed; top:65px; left:0; right:0; bottom:0; z-index:10000; background:#fafaf9; padding:20px; overflow-y:auto; border-top:1px solid #e5e7eb; }
        .checkout-mobile-menu a { display:block; padding:15px 0; color:#111111; text-decoration:none; font-weight:800; border-bottom:1px solid #f1f1f1; }
        .checkout-mobile-menu .checkout-primary-btn { display:flex !important; width:100%; height:56px; padding:0 !important; color:white !important; border-bottom:0 !important; margin-top:14px; }
        .checkout-mobile-login { display:flex !important; width:100%; height:56px; align-items:center; justify-content:center; background:#111111; color:#ffffff !important; border-radius:16px; border-bottom:0 !important; margin-top:14px; text-decoration:none; font-weight:800; }
        .checkout-footer { border-top:none; background:#0b1020; }
        .checkout-footer-inner { max-width:1200px; margin:0 auto; padding:56px 32px 32px; }
        .checkout-footer-grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:40px; margin-bottom:48px; }
        .checkout-footer-about p { font-size:13px; color:#9ca3af; margin-top:16px; line-height:1.6; max-width:210px; }
        .checkout-socials { display:flex; gap:12px; margin-top:20px; }
        .checkout-socials a { width:36px; height:36px; border-radius:50%; border:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; color:#9ca3af; text-decoration:none; transition:color 0.2s; }
        .checkout-socials a:hover { color:#FF0048; }
        .checkout-footer-group h4 { font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:0.18em; margin-bottom:16px; color:#111111; }
        .checkout-footer-group div { display:flex; flex-direction:column; gap:12px; }
        .checkout-footer-group a { color:#6b7280; text-decoration:none; font-size:14px; font-weight:600; transition:color 0.2s; }
        .checkout-footer-group a:hover { color:#FF0048; }
        .checkout-footer-bottom { border-top:1px solid #f3f4f6; padding-top:24px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .checkout-footer-bottom p { color:#9ca3af; font-size:13px; margin:0; }
        .checkout-footer-bottom a { color:#FF0048; text-decoration:none; font-weight:800; font-size:13px; }
        @media (max-width: 900px) {
          .checkout-nav-links, .checkout-nav-actions { display:none; }
          .checkout-mobile-btn { display:flex; }
          .checkout-footer-grid { grid-template-columns:1fr 1fr; }
          .checkout-footer-bottom { flex-direction:column; align-items:flex-start; }
        }
        @media (max-width: 640px) {
          .checkout-nav-inner, .checkout-footer-inner { padding-left:20px; padding-right:20px; }
          .checkout-nav-inner { height:66px; }
          .checkout-footer-grid { grid-template-columns:1fr; }
        }
      `}</style>

      {/* NAV */}
      <nav className="checkout-nav">
        <div className="checkout-nav-inner">
          <a href="/" className="checkout-logo">
            <div className="checkout-logo-mark" style={{ width:34, height:34, borderRadius:9, overflow:'hidden', background:'#FF0048', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <img src={logoGlyph} alt="UniTix" style={{ width:'100%', height:'100%', objectFit:'contain', borderRadius:'9px' }} />
            </div>
            <span style={{ fontSize:18, fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:800, letterSpacing:'-0.02em', color:'#111111' }}>UniTix</span>
          </a>

          <div className="checkout-nav-links">
            {[
              { label: "Browse Events", href: "/events" },
              { label: "About Us", href: "/about-us" },
              { label: "Pricing", href: "/pricing" },
              { label: "FAQ", href: "/pricing#faq" },
            ].map((item) => (
              <a key={item.label} href={item.href}>{item.label}</a>
            ))}
          </div>

          <div className="checkout-nav-actions">
            <a href="/auth" className="checkout-login-link">Log in</a>
            <a href="/auth" className="checkout-primary-btn">Get started <ArrowRight size={15} /></a>
          </div>

          <button type="button" className="checkout-mobile-btn" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="checkout-mobile-menu"
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
                <a key={item.label} href={item.href} onClick={closeMobile}>{item.label}</a>
              ))}
              <a href="/auth" className="checkout-mobile-login" onClick={closeMobile}>Log in</a>
              <a href="/auth" className="checkout-primary-btn" onClick={closeMobile}>Get started <ArrowRight size={15} /></a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10" style={{ paddingTop: '90px' }}>
        {/* Top back + title */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#111827] transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>

          <h1 className="mt-3 text-[2rem] leading-none font-bold tracking-tight text-[#111827]">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8 items-start">
          {/* LEFT */}
          <div className="space-y-4">
            {/* Contact Information */}
            <section className="rounded-2xl border border-[#e7e7e7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
                <div className="flex items-center gap-2 mb-5">
                  <UserRound size={16} className="text-[#FF0048]" />
                  <h2 className="text-[1.05rem] font-semibold text-[#111827]">
                    Contact Information
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block text-[12px] font-medium text-[#111827]">
                      First Name
                    </Label>
                    <Input
                      name="firstName"
                      value={contactInfo.firstName}
                      onChange={handleContactChange}
                      placeholder="First Name"
                      className="h-11 rounded-lg border-[#dbe2ea] bg-[#edf4ff] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block text-[12px] font-medium text-[#111827]">
                      Last Name
                    </Label>
                    <Input
                      name="lastName"
                      value={contactInfo.lastName}
                      onChange={handleContactChange}
                      placeholder="Last Name"
                      className="h-11 rounded-lg border-[#dbe2ea] bg-[#edf4ff] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block text-[12px] font-medium text-[#111827]">
                      Email
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={handleContactChange}
                      placeholder="Email"
                      className="h-11 rounded-lg border-[#dbe2ea] bg-[#edf4ff] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block text-[12px] font-medium text-[#111827]">
                      Phone
                    </Label>
                    <Input
                      name="phone"
                      type="tel"
                      value={contactInfo.phone}
                      onChange={handleContactChange}
                      placeholder="Phone"
                      className="h-11 rounded-lg border-[#dbe2ea] bg-[#edf4ff] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Attendee Information */}
            <section className="rounded-2xl border border-[#e7e7e7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#FF0048]" />
                    <h2 className="text-[1.05rem] font-semibold text-[#111827]">
                      Attendee Information ({checkoutState.quantity} ticket
                      {checkoutState.quantity > 1 ? "s" : ""})
                    </h2>
                  </div>

                  <ChevronUp size={16} className="text-[#6b7280]" />
                </div>

                <label className="inline-flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useContactForAttendee}
                    onChange={(e) => setUseContactForAttendee(e.target.checked)}
                    className="h-4 w-4 rounded border-[#d1d5db] accent-[#FF0048]"
                  />
                  <span className="text-sm text-[#6b7280]">
                    Use my contact info for the first attendee
                  </span>
                </label>

                <div className="border-t border-[#ececec] pt-4">
                  <div className="rounded-xl border border-[#e7e7e7] bg-white px-4 py-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF0048] text-white text-xs font-semibold shrink-0 mt-0.5">
                        1
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827]">
                          Ticket 1
                        </p>
                        <p className="text-xs text-[#6b7280] leading-5">
                          {event.name} ({checkoutState.ticketName})
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block text-[12px] font-medium text-[#111827]">
                          First Name *
                        </Label>
                        <Input
                          name="firstName"
                          value={attendeeValues.firstName}
                          onChange={handleAttendeeChange}
                          disabled={useContactForAttendee}
                          placeholder="First Name"
                          className="h-11 rounded-lg border-[#dbe2ea] bg-white disabled:bg-[#f8fafc] disabled:text-[#6b7280]"
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block text-[12px] font-medium text-[#111827]">
                          Last Name *
                        </Label>
                        <Input
                          name="lastName"
                          value={attendeeValues.lastName}
                          onChange={handleAttendeeChange}
                          disabled={useContactForAttendee}
                          placeholder="Last Name"
                          className="h-11 rounded-lg border-[#dbe2ea] bg-white disabled:bg-[#f8fafc] disabled:text-[#6b7280]"
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block text-[12px] font-medium text-[#111827]">
                          Email *
                        </Label>
                        <Input
                          name="email"
                          type="email"
                          value={attendeeValues.email}
                          onChange={handleAttendeeChange}
                          disabled={useContactForAttendee}
                          placeholder="Email"
                          className="h-11 rounded-lg border-[#dbe2ea] bg-white disabled:bg-[#f8fafc] disabled:text-[#6b7280]"
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block text-[12px] font-medium text-[#111827]">
                          Phone
                        </Label>
                        <Input
                          name="phone"
                          type="tel"
                          value={attendeeValues.phone}
                          onChange={handleAttendeeChange}
                          disabled={useContactForAttendee}
                          placeholder="Phone"
                          className="h-11 rounded-lg border-[#dbe2ea] bg-white disabled:bg-[#f8fafc] disabled:text-[#6b7280]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside className="lg:sticky lg:top-8">
            <div className="rounded-2xl border border-[#e7e7e7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-5">
              <h2 className="text-[1.05rem] font-semibold text-[#111827] mb-4">
                Order Summary
              </h2>

              {isTestMode && (
                <div className="mb-4 inline-flex items-center rounded-full border border-[#86efac] bg-[#f0fdf4] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#166534]">
                  Test Mode
                </div>
              )}

              {/* Event/ticket row */}
              <div className="flex items-start gap-3 pb-4">
                {event.background_image_url ? (
                  <img
                    src={event.background_image_url}
                    alt={event.name}
                    className="h-16 w-16 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-[#111827] flex items-center justify-center shrink-0">
                    <Ticket size={20} className="text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-[#111827] line-clamp-1">
                        {event.name}
                      </p>
                      <p className="text-[12px] text-[#FF0048] mt-0.5 line-clamp-1">
                        {checkoutState.ticketName}
                      </p>
                      <p className="text-[11px] text-[#6b7280] mt-0.5">
                          {checkoutState.quantity} × {checkoutState.price > 0 ? `₦${checkoutState.price.toLocaleString()}` : "Free"}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-[#111827] whitespace-nowrap">
                        {subtotal > 0 ? `₦${subtotal.toLocaleString()}` : "Free"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="border-t border-[#efefef] pt-4">
                <div className="flex items-center gap-2 text-sm text-[#6b7280] mb-2">
                  <Tag size={14} className="text-[#FF0048]" />
                  <span>Coupon Code</span>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ENTER CODE"
                    className="h-10 rounded-lg border-[#e5e7eb] bg-white text-xs uppercase placeholder:text-[#9ca3af]"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    variant="outline"
                    className="h-10 rounded-lg border-[#FF0048]/40 text-[#FF0048] hover:text-[#FF0048] hover:bg-[#fff1f2] px-4"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-[#efefef] mt-4 pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b7280]">Subtotal</span>
                  <span className="text-[#111827]">{subtotal > 0 ? `₦${subtotal.toLocaleString()}` : "Free"}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b7280]">Service Fee</span>
                  <span className="text-[#111827]">₦0</span>
                </div>

                <div className="flex items-center justify-between pt-2 text-base font-bold">
                  <span className="text-[#111827]">Total</span>
                  <span className="text-[#111827]">{total > 0 ? `₦${total.toLocaleString()}` : "Free"}</span>
                </div>
              </div>

              {/* Secure note */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#9ca3af]">
                <Lock size={12} />
                <span>{total > 0 ? "Secure checkout powered by Paystack" : "Free registration will be saved instantly"}</span>
              </div>
            </div>

            <Button
              onClick={handleCompleteOrder}
              disabled={isProcessing || (total > 0 && !paystackReady) || createRegistration.isPending}
              className="w-full mt-4 h-14 rounded-xl bg-[#FF0048] hover:bg-[#e60040] text-white font-bold shadow-none text-base"
            >
              {isProcessing ? (
                "Processing..."
              ) : isPaymentSuccessful ? (
                <span className="flex items-center gap-2.5 text-[1rem] font-bold">
                  <CheckCircle2 size={18} />
                  {total > 0 ? "Payment Successful" : "Registration Complete"}
                </span>
              ) : (
                <span className="flex items-center gap-2.5 text-[1rem] font-bold">{total > 0 ? "Complete Order" : "Complete Registration"} <span style={{ opacity: 0.5, fontSize: '1.1rem' }}>•</span> <span className="text-[1rem] font-extrabold">{total > 0 ? `₦${total.toLocaleString()}` : "Free"}</span></span>
              )}
            </Button>
          </aside>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="checkout-footer">
        <div className="checkout-footer-inner">
          <div className="checkout-footer-grid">
            <div className="checkout-footer-about">
              <a href="/" className="checkout-logo">
                <div className="checkout-logo-mark" style={{ width:34, height:34, borderRadius:9, overflow:'hidden', background:'#FF0048', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <img src={logoGlyph} alt="UniTix" style={{ width:'100%', height:'100%', objectFit:'contain', borderRadius:'9px' }} />
                </div>
                <span style={{ fontSize:18, fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:800, letterSpacing:'-0.02em', color:'#111111' }}>UniTix</span>
              </a>
              <p>The event ticketing platform built for Nigerian students.</p>
              <div className="checkout-socials">
                <a href="https://x.com/unitix.ng" target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://instagram.com/unitix.ng" target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://wa.me/2348120604186" target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="https://tiktok.com/@unitix.ng" target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.17 8.17 0 004.78 1.52V6.82a4.85 4.85 0 01-1.01-.13z"/></svg>
                </a>
              </div>
            </div>

            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group} className="checkout-footer-group">
                <h4>{group}</h4>
                <div>
                  {links.map((link) => (
                    <a key={link.label} href={link.to}>{link.label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-footer-bottom">
            <p>© 2026 UniTix. All rights reserved</p>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: 13 }}>
              Powered by{" "}
              <a href="https://myroconcept.com.ng" target="_blank" rel="noopener noreferrer">
                Myro Concept
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;