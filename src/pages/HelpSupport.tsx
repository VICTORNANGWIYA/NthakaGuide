/**
 * HelpSupport.tsx
 *
 * Full Help & Support page.
 * Linked from the footer Help button (replace the dropdown with <Link to="/help">).
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle, Mail, BookOpen, MessageCircle,
  Sprout, FlaskConical, MapPin, CloudRain, FileText,
  ChevronRight, RotateCcw, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Chatbot from "@/components/Chatbot";

// ── FAQs ──────────────────────────────────────────────────────────────────────


// ── Component ─────────────────────────────────────────────────────────────────
export default function HelpSupport() {
  

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container max-w-4xl px-4 py-8">
       
      </main>

      <Chatbot />
    </div>
  );
}