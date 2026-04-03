import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import NavHeader from "@/components/NavHeader";
import logo from "@/assets/logo.jpeg";
import {
  Sprout, LogIn, UserPlus, Mail, Lock, User,
  Phone, MapPin, ShieldCheck, CheckCircle2, XCircle,
  AlertCircle,
} from "lucide-react";
import { MALAWI_DISTRICTS } from "@/lib/malawi-districts";

// ─── Known email domains whitelist ───────────────────────────────────────────
// Common legitimate domains. Backend also validates this list.
const KNOWN_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "yahoo.co.uk", "yahoo.co.za",
  "outlook.com", "outlook.co.uk", "hotmail.com", "hotmail.co.uk",
  "live.com", "msn.com", "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "zoho.com",
  "aol.com", "yandex.com", "yandex.ru",
  "unima.ac.mw", "mzuni.ac.mw", "poly.ac.mw", "luanar.ac.mw",
  "gov.mw", "malawi.gov.mw",
  "africa.com", "mweb.co.za",
  "edu.mw", "ac.mw",
  // generic company / business patterns handled separately
]);

// Also allow any *.edu, *.ac.*, *.gov.* TLDs
function isKnownDomain(domain: string): boolean {
  if (KNOWN_DOMAINS.has(domain.toLowerCase())) return true;
  const parts = domain.toLowerCase().split(".");
  const tld   = parts[parts.length - 1];
  const sld   = parts.length >= 2 ? parts[parts.length - 2] : "";
  // *.edu.*, *.ac.*, *.gov.*
  if (["edu", "ac", "gov", "org", "net", "co"].includes(sld)) return true;
  // single .edu / .org / .net TLDs
  if (["edu", "org", "net", "gov"].includes(tld)) return true;
  // company domains like company.co.mw, company.com
  if (tld === "com" || tld === "mw") return true;
  return false;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

/** Phone must be exactly +265 followed by 9 digits starting with 88, 99, 8, or 9 */
function validatePhone(phone: string): string | null {
  if (!phone) return null; // phone is optional
  const cleaned = phone.replace(/\s/g, "");
  // Must start with +265
  if (!cleaned.startsWith("+265")) return "Phone must start with +265";
  const local = cleaned.slice(4); // digits after +265
  if (!/^\d{9}$/.test(local))
    return "After +265, enter exactly 9 digits (e.g. +265 999 000 000)";
  // First digit(s) must be 8 or 9 (covers 88x, 99x, 8xx, 9xx)
  if (!/^[89]/.test(local))
    return "Number after +265 must start with 8 or 9 (e.g. 88, 99, 88x, 99x)";
  return null;
}

/** Username: letters + optional numbers, cannot be numbers-only */
function validateUsername(name: string): string | null {
  if (!name.trim()) return "Full name is required";
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (/^\d+$/.test(trimmed)) return "Name cannot be numbers only";
  if (!/^[a-zA-Z][a-zA-Z0-9 .'\-]*$/.test(trimmed))
    return "Name must start with a letter and may contain letters, numbers, spaces, or . ' -";
  return null;
}

/** Email must have a known domain after @ */
function validateEmail(email: string): string | null {
  if (!email) return "Email is required";
  const parts = email.trim().split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1])
    return "Enter a valid email address";
  const domain = parts[1].toLowerCase();
  if (!domain.includes(".")) return "Email domain must include a dot (e.g. gmail.com)";
  if (!isKnownDomain(domain))
    return `"${domain}" is not a recognised email provider. Use Gmail, Outlook, Yahoo, etc.`;
  return null;
}

// ─── Password strength helpers ────────────────────────────────────────────────
interface StrengthRule { label: string; test: (pw: string) => boolean; }

const RULES: StrengthRule[] = [
  { label: "At least 8 characters",        test: pw => pw.length >= 8 },
  { label: "One lowercase letter (a–z)",   test: pw => /[a-z]/.test(pw) },
  { label: "One uppercase letter (A–Z)",   test: pw => /[A-Z]/.test(pw) },
  { label: "One number (0–9)",             test: pw => /\d/.test(pw) },
  { label: "One special character (!@#…)", test: pw => /[!@#$%^&*()\-_=+\[\]{}|;':",./<>?\\`~]/.test(pw) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed = RULES.filter(r => r.test(password)).length;
  const colors = ["bg-destructive", "bg-destructive", "bg-golden", "bg-golden", "bg-primary"];
  const barColor = colors[passed - 1] ?? "bg-muted";

  return (
    <div className="space-y-2 mt-1">
      <div className="flex gap-1">
        {RULES.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed ? barColor : "bg-muted"}`} />
        ))}
      </div>
      <ul className="space-y-0.5">
        {RULES.map(rule => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className="flex items-center gap-1.5 text-[11px]">
              {ok
                ? <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                : <XCircle      className="h-3 w-3 text-muted-foreground shrink-0" />}
              <span className={ok ? "text-primary" : "text-muted-foreground"}>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Inline field error badge
function FieldError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
      <p className="text-[11px] text-destructive">{msg}</p>
    </div>
  );
}

// ─── Phone input with +265 locked prefix ─────────────────────────────────────
function PhoneInput({
  value, onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  // The displayed suffix is everything after +265
  const suffix = value.startsWith("+265") ? value.slice(4) : value.replace(/^\+?265?/, "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits and spaces only in the suffix
    const raw = e.target.value.replace(/[^\d\s]/g, "").slice(0, 11); // 9 digits + up to 2 spaces
    onChange(raw ? `+265${raw}` : "");
  };

  const error = validatePhone(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="flex items-center gap-2">
        <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number
        <span className="text-muted-foreground text-xs font-normal">(optional)</span>
      </Label>
      <div className="flex">
        {/* Locked prefix */}
        <div className="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm font-mono select-none">
          +265
        </div>
        <Input
          id="phone"
          type="tel"
          inputMode="numeric"
          value={suffix}
          onChange={handleChange}
          placeholder="99 000 0000"
          className="rounded-l-none font-mono"
          maxLength={11}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">
        Format: +265 followed by 9 digits starting with 8 or 9 (e.g. +265 999 000 000)
      </p>
      {value && <FieldError msg={error} />}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Auth() {
  const { user, login, loading } = useAuth();
  const { toast }                = useToast();

  const [isSignUp, setIsSignUp]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Shared
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  // Sign-up only
  const [fullName, setFullName] = useState("");
  const [phone,    setPhone]    = useState("");
  const [district, setDistrict] = useState("");
  const [role,     setRole]     = useState<"user" | "admin">("user");

  // Touched state — show errors only after user has interacted with a field
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [adminOpen, setAdminOpen] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:5000/auth/admin-slots")
      .then(r => r.json())
      .then(d => setAdminOpen(d.admin_registration_open ?? false))
      .catch(() => setAdminOpen(true));
  }, []);

  // ─── Per-field errors ─────────────────────────────────────────────────────
  const emailError    = validateEmail(email);
  const usernameError = isSignUp ? validateUsername(fullName) : null;
  const phoneError    = isSignUp ? validatePhone(phone) : null;
  const passwordValid = RULES.every(r => r.test(password));

  const formValid =
    !emailError &&
    passwordValid &&
    (!isSignUp || (!usernameError && !phoneError));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sprout className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }

  const touch = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  const toggleMode = () => {
    setIsSignUp(prev => !prev);
    setFullName(""); setPhone(""); setDistrict("");
    setRole("user"); setEmail(""); setPassword("");
    setTouched({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched so errors show
    setTouched({ email: true, fullName: true, phone: true, password: true });

    if (!formValid) {
      toast({
        title:       "Please fix the errors",
        description: "Check the highlighted fields before continuing.",
        variant:     "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = isSignUp ? "auth/register" : "auth/login";
      const body = isSignUp
        ? { email: email.trim().toLowerCase(), password, role,
            full_name: fullName.trim() || null,
            phone:     phone || null,
            district:  district || null }
        : { email: email.trim().toLowerCase(), password };

      const res  = await fetch(`http://localhost:5000/${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || data.message || "Authentication failed");

      login(data.user, data.access_token);
      toast({
        title:       "Success",
        description: isSignUp ? "Account created! Welcome to NthakaGuide." : "Logged in successfully.",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const regions = ["Northern", "Central", "Southern"] as const;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-border shadow-golden">
            <CardHeader className="text-center space-y-3">
              <div className="flex justify-center">
                <img src={logo} alt="NthakaGuide" className="h-14 w-14 rounded-lg shadow-md" />
              </div>
              <CardTitle className="font-display text-2xl">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {isSignUp
                  ? "Join NthakaGuide and start optimising your farm"
                  : "Sign in to access your soil analysis tools"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                {/* ── Sign-up only fields ──────────────────────────────── */}
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Role */}
                      {adminOpen && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Account Type
                          </Label>
                          <Select value={role} onValueChange={v => setRole(v as "user" | "admin")}>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Select account type…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Regular User — Farmer / Agronomist</SelectItem>
                              <SelectItem value="admin">Admin — System Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                          {role === "admin" && (
                            <p className="text-xs text-golden">⚠ Admin accounts can access the full system dashboard.</p>
                          )}
                        </div>
                      )}

                      {/* Full name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-primary" /> Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          onBlur={() => touch("fullName")}
                          placeholder="e.g. Chisomo Banda"
                          required
                          className={touched.fullName && usernameError ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Must start with a letter. May include numbers but cannot be numbers only.
                        </p>
                        {touched.fullName && <FieldError msg={usernameError} />}
                      </div>

                      {/* Phone — custom component with locked +265 prefix */}
                      <div onBlur={() => touch("phone")}>
                        <PhoneInput value={phone} onChange={setPhone} />
                      </div>

                      {/* District */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> Your District
                          <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                        </Label>
                        <Select value={district} onValueChange={setDistrict}>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select your district…" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map(region => (
                              <div key={region}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  {region} Region
                                </div>
                                {MALAWI_DISTRICTS.filter(d => d.region === region).map(d => (
                                  <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Email ────────────────────────────────────────────── */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => touch("email")}
                    placeholder="you@gmail.com"
                    required
                    className={touched.email && emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Use a recognised provider: Gmail, Outlook, Yahoo, institutional (.ac.mw, .gov.mw), etc.
                  </p>
                  {touched.email && <FieldError msg={emailError} />}
                </div>

                {/* ── Password ─────────────────────────────────────────── */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-primary" /> Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => touch("password")}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  {isSignUp && <PasswordStrength password={password} />}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-golden text-golden-foreground hover:bg-golden/90 font-semibold"
                  disabled={submitting || (isSignUp && !formValid)}
                >
                  {submitting ? (
                    "Please wait…"
                  ) : isSignUp ? (
                    <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>
                  ) : (
                    <><LogIn className="mr-2 h-4 w-4" /> Sign In</>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Create one"}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}