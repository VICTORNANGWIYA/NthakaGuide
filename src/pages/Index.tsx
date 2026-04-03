import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, HelpCircle } from "lucide-react";

// ── Hero slideshow images ──────────────────────────────────────────────────────
// Add all 5 images to your src/assets/ folder and import them here.
// The existing heroImage stays as slide 1; the 4 uploads become slides 2-5.
import heroImage   from "@/assets/hero-farm.jpg";
import slide2      from "@/assets/hero-slide2.jpg";   // landscape-and-corn-field-with-the-sunset-on-the-farm-free-photo.jpg
import slide3      from "@/assets/hero-slide3.jpg";   // sprouted-corn-arable-farming-photo.jpg
import slide4      from "@/assets/hero-slide4.jpg";   // ai-generated-aerial-view-captures-large-lush-green-field…jpg
import slide5      from "@/assets/hero-slide5.jpg";   // istockphoto-1127189054-612x612.jpg

// ── Feature icon images ────────────────────────────────────────────────────────
// Copy these from uploads into src/assets/ with these names:
import iconCrop        from "@/assets/icon-crop.avif";       // sprouted-corn-arable-farming-photo.jpg  → crop recommendation
import iconFertilizer  from "@/assets/icon-fertilizer.jpeg"; // urea-67d6c941…jpeg                     → fertilizer
import iconInputModes  from "@/assets/icon-input.png";      // pngtree-next-step…png                  → input modes
import iconRainfall    from "@/assets/icon-rainfall.avif";  // rain-icon-set…avif                     → rainfall
import iconReport      from "@/assets/icon-report.avif";    // printer-icon…avif                      → report

import logo from "@/assets/logo.jpeg";
import NavHeader from "@/components/NavHeader";
import Chatbot from "@/components/Chatbot";


// ── Page ──────────────────────────────────────────────────────────────────────
export default function Index() {
  

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      
    

    
    </div>
  );
}