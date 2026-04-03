import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";


import { useToast } from "@/hooks/use-toast";
import NavHeader from "@/components/NavHeader";
import logo from "@/assets/logo.jpeg";
import {
  Sprout, LogIn, UserPlus, Mail, Lock, User,
  Phone, MapPin, ShieldCheck, CheckCircle2, XCircle,
  AlertCircle,
} from "lucide-react";




  


// ─── Component ────────────────────────────────────────────────────────────────
export default function Auth() {
  
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      
      
    </div>
  );
}