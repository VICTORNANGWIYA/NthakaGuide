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

// ── Data ──────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [heroImage, slide2, slide3, slide4, slide5];

const stats = [
  { value: "99.55%", label: "Crop Model F1-Score",  color: "text-primary"   },
  { value: "22",     label: "Crop Classes",          color: "text-accent"    },
  { value: "7",      label: "Fertilizer Types",      color: "text-golden"    },
  { value: "28",     label: "Malawi Districts",       color: "text-secondary" },
];

const features = [
  {
    img:   iconCrop,
    title: "Crop Recommendations",
    desc:  "Get the best crops for your soil conditions across 15+ Malawi-relevant crops.",
    fit:   "object-cover",
  },
  {
    img:   iconFertilizer,
    title: "Fertilizer Plans",
    desc:  "Precise fertilizer type, rate, and timing recommendations tailored to your soil.",
    fit:   "object-cover",
  },
  {
    img:   iconInputModes,
    title: "Three Input Modes",
    desc:  "Lab values, field visual assessment without equipment, or both. No farmer is left out.",
    fit:   "object-contain bg-white",
  },
  {
    img:   iconRainfall,
    title: "Rainfall Intelligence",
    desc:  "30-year district rainfall data with EWMA seasonal forecasting. Plans auto-adjust to rainfall.",
    fit:   "object-contain bg-white",
  },
  {
    img:   iconReport,
    title: "Printable Reports",
    desc:  "Generate and print full crop + fertilizer reports for farmers to take to agri-shops or extension offices.",
    fit:   "object-contain bg-white",
  },
];

// ── Hero Slideshow ─────────────────────────────────────────────────────────────
function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(c => (c + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Slides – cross-fade */}
      {HERO_SLIDES.map((src, i) => (
        <AnimatePresence key={i}>
          {i === current && (
            <motion.img
              key={src}
              src={src}
              alt=""
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          )}
        </AnimatePresence>
      ))}

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-golden"
                : "w-2 bg-primary-foreground/40 hover:bg-primary-foreground/70"
            }`}
          />
        ))}
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Index() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      
       
     
    </div>
  );
}