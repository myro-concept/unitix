import { useEffect, useState } from "react";
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

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Events from "./pages/dashboard/Events";
import Contact from "./pages/Contact";
import CreateEvent from "./pages/dashboard/CreateEvent";
import EventDetail from "./pages/dashboard/EventDetail";
import Attendees from "./pages/dashboard/Attendees";
import TicketCheckIn from "./pages/dashboard/TicketCheckIn";
import Analytics from "./pages/dashboard/Analytics";
import Integrations from "./pages/dashboard/Integrations";
import WalletPage from "./pages/dashboard/Wallet";
import SettingsPage from "./pages/dashboard/SettingsPage";
import FeaturedEvents from "./pages/dashboard/FeaturedEvents";
import WithdrawalManagement from "./pages/dashboard/WithdrawalManagement";
import AdminOverview from "./pages/admin/AdminOverview";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import RefundPolicy from "./pages/RefundPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Pricing from "./pages/Pricing";
import BrowseEvents from "./pages/BrowseEvents";
import EventDetails from "./pages/EventDetails";
import Checkout from "./pages/Checkout";
import TicketCollection from "./pages/TicketCollection";

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
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
