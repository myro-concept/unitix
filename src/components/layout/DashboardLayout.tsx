import { useEffect, useRef, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Bell,
  LogOut,
  Menu,
} from "lucide-react";

const navItems = [
  { title: "Events", url: "/dashboard/events" },
  { title: "Attendees", url: "/dashboard/attendees" },
  { title: "Analytics", url: "/dashboard/analytics" },
  { title: "Wallet", url: "/dashboard/wallet" },
  { title: "Settings", url: "/dashboard/settings" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dismissedReminder, setDismissedReminder] = useState(false);

  const fullName = profile?.full_name?.trim() || user?.email?.split("@")[0] || "User";
  const school = profile?.school?.trim() || "School not set";
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

  const metadata = (user?.user_metadata || {}) as Record<string, string | undefined>;
  const hasBankDetails = Boolean(metadata.bank_name?.trim() && metadata.account_number?.trim() && metadata.account_name?.trim());
  const hasPersonalDetails = Boolean((profile?.full_name || "").trim() && (profile?.school || "").trim());
  const shouldShowSettingsReminder = !dismissedReminder && Boolean(user) && (!hasPersonalDetails || !hasBankDetails);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#fafaf9] text-[#111111]">
      <header className="h-16 flex items-center px-4 sm:px-6 gap-4 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden text-[#111111] hover:bg-white"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <Link to="/dashboard/events" className="shrink-0 flex items-center gap-2 no-underline">
          <Logo size="sm" />
        </Link>

        <div className="hidden md:flex flex-1 items-center h-full overflow-x-auto">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                className="px-4 py-2 text-sm font-semibold text-[#6b7280] rounded-full transition-colors hover:text-[#111111] hover:bg-white"
                activeClassName="bg-[#111111] text-white hover:bg-[#111111] hover:text-white"
              >
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3 shrink-0">
          {user && (
            <span className="text-xs text-[#6b7280] hidden lg:block truncate max-w-[180px]">
              {user.email}
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-[#6b7280] hover:text-[#FF0048] hover:bg-[#fff1f2]"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </header>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[88vw] max-w-[360px] border-r border-[#e5e7eb] bg-[#fafaf9] px-0 data-[state=closed]:duration-150 data-[state=open]:duration-200"
        >
          <SheetHeader className="px-5 pt-3 pb-3 pr-12 text-left space-y-1">
            <SheetTitle className="text-left">My Dashboard</SheetTitle>
            <SheetDescription className="text-left">
              Move around your dashboard from one place.
            </SheetDescription>
          </SheetHeader>

          <div className="flex h-full flex-col px-3 pb-6">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={closeMobileMenu}
                  className="flex items-center rounded-2xl px-4 py-3 text-sm font-semibold text-[#4b5563] transition-colors hover:bg-white hover:text-[#111111]"
                  activeClassName="bg-[#111111] text-white hover:bg-[#111111] hover:text-white"
                >
                  {item.title}
                </NavLink>
              ))}
            </div>

            <div className="mt-auto space-y-4 px-2 pt-6">
              <div className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={fullName} />
                  <AvatarFallback className="bg-[#ecfccb] text-[#111111] font-semibold">{initials}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111111] truncate">{fullName}</p>
                  <p className="text-xs text-[#6b7280] truncate">{school}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl text-[#dc2626] hover:text-[#dc2626] hover:bg-[#fef2f2]"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <main ref={mainRef} className="flex-1 p-4 sm:p-6 overflow-auto">
        {shouldShowSettingsReminder && (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-900">Complete your settings</p>
                <p className="text-sm text-amber-800/90 mt-0.5">
                  Finish setting up your profile and payout details so your account is ready.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" className="rounded-full bg-black text-white hover:bg-black/90">
                    <Link to="/dashboard/settings">Complete Settings</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full text-amber-900 hover:bg-amber-100" onClick={() => setDismissedReminder(true)}>
                    Remind me later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}