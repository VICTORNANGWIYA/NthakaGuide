import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavHeader             from "@/components/NavHeader";
import SoilInputForm         from "@/components/SoilInputForm";
import FieldAssessment, { fieldAnswersToSoilValues } from "@/components/FieldAssessment";
import ComboMode             from "@/components/ComboMode";
import RecommendationResults from "@/components/RecommendationResults";
import {
  generateRecommendations,
  type SoilInput,
  type Recommendation,
  type CropRecommendation,
  type FertilizerPlan,
  type YieldPrediction,
  type PestDiseaseRisk,
} from "@/lib/recommendations";
import { getDistrictByName, MALAWI_DISTRICTS } from "@/lib/malawi-districts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label }   from "@/components/ui/label";
import { Mountain, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast }   from "sonner";
import Chatbot from "@/components/Chatbot";

export default function Recommend() {
 
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container max-w-4xl px-4 py-8">

        
      
      </main>
    </div>
  );
}