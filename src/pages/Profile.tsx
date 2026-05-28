import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserRound, Mail, Save, Phone, MapPin,
  Lock, Trash2, Eye, EyeOff, AlertTriangle, ShieldCheck, X,
  ChevronRight, Camera, Loader2, ZoomIn,
} from "lucide-react";
import NavHeader from "@/components/NavHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";
import { MALAWI_DISTRICTS } from "@/lib/malawi-districts";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://nthakaguide-backend.onrender.com";

const DELETION_REASONS = [
  { key: "not_useful",       label: "The app is not useful for my farming needs" },
  { key: "too_complicated",  label: "The app is too complicated to use" },
  { key: "poor_accuracy",    label: "Crop or fertilizer recommendations are inaccurate" },
  { key: "no_internet",      label: "I do not have reliable internet access" },
  { key: "privacy_concerns", label: "I have concerns about my data and privacy" },
  { key: "switching_app",    label: "I am switching to a different application" },
  { key: "temporary",        label: "I am taking a break and may return" },
  { key: "other",            label: "Other reason" },
];

function PasswordField({
  id, label, value, onChange, placeholder = "••••••••",
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    


      {label}
      


         onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
          autoComplete="off"
          data-lpignore="true"
        />
         setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={show ? "Hide" : "Show"}
        >
          {show ?  : }
        
      


    


  );
}

function ImageLightbox({ src, name, onClose }: { src: string; name: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    
       e.stopPropagation()}
      >
        
          
        

        {/ Full-size image /}
        

        {name && (
          

{name}


        )}

        

Press Esc or click outside to close


      
    
  );
}

function AvatarUpload({
  avatarUrl, initials, name, onUpload, onRemove, uploading,
}: {
  avatarUrl: string;
  initials: string;
  name: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
}) {
  const fileRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <>
      



   {
      if (avatarUrl) setLightboxOpen(true);
    }}
    className="rounded-full focus:outline-none"
  >
    
      {avatarUrl ? (
        
      ) : null}
      
        {initials}
      
    

   fileRef.current?.click()}
    className="absolute bottom-0 right-0 h-8 w-8 rounded-full
               bg-primary text-white flex items-center justify-center
               shadow-lg hover:bg-primary/80 transition"
  >
    {uploading ? (
      
    ) : (
      
    )}
  

  





      
        {lightboxOpen && avatarUrl && (
           setLightboxOpen(false)} />
        )}
      
    
  );
}

function DeleteModal({
  onConfirm, onCancel, loading,
}: {
  onConfirm: (password: string, reason: string, details: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [step,    setStep]    = useState<"survey" | "confirm">("survey");
  const [reason,  setReason]  = useState("");
  const [details, setDetails] = useState("");
  const [pw,      setPw]      = useState("");
  const [showPw,  setShowPw]  = useState(false);

  const selectedLabel = DELETION_REASONS.find(r => r.key === reason)?.label ?? "";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl
                   flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute right-3 top-3 z-10 p-1.5 rounded-full hover:bg-muted transition"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Header (fixed) */}
        <div className="flex items-start gap-3 p-5 sm:p-6 pb-3 shrink-0">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-lg font-bold text-foreground">Delete your account?</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {step === "survey"
                ? "Before you go, please tell us why. Your feedback helps us improve NthakaGuide."
                : "This is permanent. All your soil analyses, history, and data will be erased."}
            </p>
          </div>
        </div>

        {/* Step indicator (fixed) */}
        <div className="flex gap-1.5 px-5 sm:px-6 pb-3 shrink-0">
          {(["survey", "confirm"] as const).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                (step === "survey" && i === 0) || step === "confirm"
                  ? "bg-destructive"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Scrollable middle */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-2 min-h-0">
          {step === "survey" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Why are you deleting your account? *</Label>
                <div className="space-y-1.5">
                  {DELETION_REASONS.map(r => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setReason(r.key)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all
                        ${reason === r.key
                          ? "border-destructive/60 bg-destructive/5 text-destructive font-medium"
                          : "border-border text-foreground hover:border-muted-foreground/40 hover:bg-muted/30"}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Additional comments (optional)</Label>
                <Textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Tell us more…"
                  className="resize-none text-sm"
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-[11px] text-muted-foreground text-right">{details.length}/1000</p>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg px-3 py-2.5 text-sm">
                <p className="text-xs text-muted-foreground mb-0.5">Your reason</p>
                <p className="font-medium text-foreground">{selectedLabel}</p>
                {details && (
                  <p className="text-xs text-muted-foreground mt-1 italic">"{details}"</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Enter your password to confirm deletion</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && pw) onConfirm(pw, reason, details); }}
                    placeholder="Your current password"
                    className="pr-10 border-destructive/40 focus-visible:ring-destructive"
                    autoComplete="off"
                    data-lpignore="true"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions (always visible) */}
        <div className="shrink-0 border-t border-border bg-background px-5 sm:px-6 py-3 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          {step === "survey" ? (
            <>
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                Keep My Account
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-1.5"
                disabled={!reason}
                onClick={() => setStep("confirm")}
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("survey")}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!pw || loading}
                onClick={() => onConfirm(pw, reason, details)}
              >
                {loading ? "Deleting…" : "Yes, delete my account"}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
