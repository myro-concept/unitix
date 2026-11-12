import { Navigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const adminQuery = useIsAdmin();

  if (adminQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (adminQuery.isError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-sm text-destructive">
        Could not verify admin access. Please refresh and try again.
      </div>
    );
  }

  if (!adminQuery.data) return <Navigate to="/dashboard/events" replace />;
  return <>{children}</>;
}
