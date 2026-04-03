import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Chatbot from "@/components/Chatbot";
import Index from "./pages/Index";
import Recommend from "./pages/Recommend";
import Rainfall from "./pages/Rainfall";
import About from "./pages/About";
import Auth from "./pages/Auth";
import History from "./pages/History";
import HelpSupport from "./pages/HelpSupport";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>          
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/recommend" element={<ProtectedRoute><Recommend /></ProtectedRoute>} />
            <Route path="/rainfall" element={<Rainfall />} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>} />
            <Route path="/admin/admin_profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />

            <Route path="/help" element={<HelpSupport />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;