import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Events = lazy(() => import("./pages/dashboard/Events"));
const Contact = lazy(() => import("./pages/Contact"));
const CreateEvent = lazy(() => import("./pages/dashboard/CreateEvent"));
const EventDetail = lazy(() => import("./pages/dashboard/EventDetail"));
const Attendees = lazy(() => import("./pages/dashboard/Attendees"));
const TicketCheckIn = lazy(() => import("./pages/dashboard/TicketCheckIn"));
const Analytics = lazy(() => import("./pages/dashboard/Analytics"));
const Integrations = lazy(() => import("./pages/dashboard/Integrations"));
const WalletPage = lazy(() => import("./pages/dashboard/Wallet"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const FeaturedEvents = lazy(() => import("./pages/dashboard/FeaturedEvents"));
const WithdrawalManagement = lazy(() => import("./pages/dashboard/WithdrawalManagement"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const EventRefundPolicyRequests = lazy(() => import("./pages/admin/EventRefundPolicyRequests"));
const NotFound = lazy(() => import("./pages/NotFound"));
const About = lazy(() => import("./pages/About"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Pricing = lazy(() => import("./pages/Pricing"));
const BrowseEvents = lazy(() => import("./pages/BrowseEvents"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));
const TicketCollection = lazy(() => import("./pages/TicketCollection"));

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="app-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<div className="min-h-screen bg-background" aria-label="Loading page" />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about-us" element={<About />} />
                <Route path="/contact-us" element={<Contact />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/events" element={<BrowseEvents />} />
                <Route path="/event" element={<NotFound />} />
                <Route path="/event/*" element={<NotFound />} />
                <Route path="/checkout/:slug" element={<Checkout />} />
                <Route path="/tickets" element={<TicketCollection />} />
                <Route path="/ticket/:token" element={<TicketCollection />} />
                <Route path="/:slug" element={<EventDetails />} />

                {/* Dashboard (protected) */}
                <Route path="/dashboard" element={<Navigate to="/dashboard/events" replace />} />
                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <Routes>
                        <Route path="events" element={<Events />} />
                        <Route path="featured-events" element={<Navigate to="/admin/featured-events" replace />} />
                        <Route path="withdrawals" element={<Navigate to="/admin/withdrawals" replace />} />
                        <Route path="events/create" element={<CreateEvent />} />
                        <Route path="events/:slug" element={<EventDetail />} />
                        <Route path="events/:slug/edit" element={<CreateEvent />} />
                        <Route path="attendees" element={<Attendees />} />
                        <Route path="check-in" element={<TicketCheckIn />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="wallet" element={<WalletPage />} />
                        <Route path="integrations" element={<Integrations />} />
                        <Route path="settings" element={<SettingsPage />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/*" element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminLayout>
                        <Routes>
                          <Route index element={<AdminOverview />} />
                          <Route path="withdrawals" element={<WithdrawalManagement />} />
                          <Route path="featured-events" element={<FeaturedEvents />} />
                          <Route path="refund-policy-requests" element={<EventRefundPolicyRequests />} />
                        </Routes>
                      </AdminLayout>
                    </AdminRoute>
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
