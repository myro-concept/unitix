import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FileCheck2, LayoutDashboard, LogOut, Menu, Star, WalletCards } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

const adminNavItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Withdrawals", url: "/admin/withdrawals", icon: WalletCards },
  { title: "Featured events", url: "/admin/featured-events", icon: Star },
  { title: "Refund policy requests", url: "/admin/refund-policy-requests", icon: FileCheck2 },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#fafaf9] text-[#111111]">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-3 border-b border-[#e5e7eb] bg-white/95 px-4 backdrop-blur-md sm:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/admin" className="flex shrink-0 items-center">
          <Logo size="sm" />
        </Link>
        <span className="hidden rounded-full bg-[#fff1f2] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#FF0048] sm:inline-flex">
          Admin
        </span>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/admin"}
              className={({ isActive }) =>
                `shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-[#111111] text-white" : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111111]"
                }`
              }
            >
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {user?.email && <span className="hidden max-w-[190px] truncate text-xs text-[#6b7280] lg:block">{user.email}</span>}
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/dashboard/events">Organizer dashboard</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-[360px] bg-[#fafaf9]">
          <SheetHeader className="text-left">
            <SheetTitle>Admin dashboard</SheetTitle>
            <SheetDescription>Manage UniTix operations.</SheetDescription>
          </SheetHeader>
          <nav className="mt-6 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  end={item.url === "/admin"}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                      isActive ? "bg-[#111111] text-white" : "text-[#4b5563] hover:bg-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </NavLink>
              );
            })}
            <Link
              to="/dashboard/events"
              onClick={closeMobileMenu}
              className="mt-4 flex items-center rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-semibold"
            >
              Organizer dashboard
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
