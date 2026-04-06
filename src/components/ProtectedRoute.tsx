import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sprout } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sprout className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}