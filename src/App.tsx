import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "@/components/ProtectedRoute";
import Chatbot from "@/components/Chatbot";
import Index from "./pages/Index";
import Recommend from "./pages/Recommend";
import Rainfall from "./pages/Rainfall";
import About from "./pages/About";
import Auth from "./pages/Auth";
import History from "./pages/History";
import HelpSupport from "./pages/HelpSupport";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProfile from "./pages/AdminProfile";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
   
      <Toaster />
      <Sonner />
      
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/rainfall" element={<Rainfall />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/admin_profile" element={<AdminProfile />} />
            <Route path="/help" element={<HelpSupport />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/*
            Chatbot is rendered globally here — it reads useAuth() internally
            and only shows when the user is logged in. No need to add it to
            individual pages. Remove any <Chatbot /> you have in Index.tsx,
            Recommend.tsx, or any other page.
          */}
          <Chatbot />
        </BrowserRouter>
      
  </QueryClientProvider>
);

export default App;