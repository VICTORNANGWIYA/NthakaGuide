import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import NavHeader from "@/components/NavHeader";

import {
  Trash2, Calendar, MapPin, Sprout, FlaskConical,
  TrendingUp, Bug, Droplets, Thermometer, CloudRain,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  BarChart3, Leaf,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";



// ── Component ──────────────────────────────────────────────────────────────
export default function History() {
  
  

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container max-w-5xl px-4 py-8">
        
      </main>
    </div>
  );
}