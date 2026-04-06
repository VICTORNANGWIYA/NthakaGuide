import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { UserRound, Mail, Save, Sprout, Phone, MapPin } from "lucide-react";
import NavHeader from "@/components/NavHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";
import { MALAWI_DISTRICTS } from "@/lib/malawi-districts";

const API_URL = "http://localhost:5000";

export default function Profile() {
 

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container max-w-4xl px-4 py-8">
        </main>
    </div>
  );
}