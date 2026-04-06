import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserRound, Mail, Save, Phone, MapPin,
  Lock, Trash2, Eye, EyeOff, AlertTriangle, ShieldCheck, X,
} from "lucide-react";
import NavHeader from "@/components/NavHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";
import { MALAWI_DISTRICTS } from "@/lib/malawi-districts";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

// ── Password eye-toggle input ─────────────────────────────────────────────────
// Copy/paste is fully allowed — data-lpignore only blocks password manager
// autofill, not keyboard shortcuts (Ctrl+C / Ctrl+V / right-click paste).
function PasswordField({
  id, label, value, onChange, placeholder = "••••••••",
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
          autoComplete="off"
          data-lpignore="true"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({
  onConfirm, onCancel, loading,
}: {
  onConfirm: (password: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [pw, setPw]     = useState("");
  const [show, setShow] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Delete your account?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This is permanent. All your soil analyses, history, and data will be
              erased and cannot be recovered.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Enter your password to confirm</Label>
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Your current password"
              className="pr-10 border-destructive/40 focus-visible:ring-destructive"
              autoComplete="off"
              data-lpignore="true"
            />
            <button
              type="button"
              onClick={() => setShow(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={!pw || loading}
            onClick={() => onConfirm(pw)}
          >
            {loading ? "Deleting…" : "Yes, delete my account"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Password strength constants ───────────────────────────────────────────────
const PW_RULES = [
  (pw: string) => pw.length >= 8,
  (pw: string) => /[a-z]/.test(pw),
  (pw: string) => /[A-Z]/.test(pw),
  (pw: string) => /\d/.test(pw),
  (pw: string) => /[^A-Za-z0-9]/.test(pw),
];
const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = [
  "bg-destructive", "bg-destructive", "bg-golden", "bg-golden", "bg-primary",
];

// ── Main component ────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, token, loading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();

  // Profile fields
  const [fullName,       setFullName]       = useState("");
  const [phone,          setPhone]          = useState("");
  const [district,       setDistrict]       = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving,         setSaving]         = useState(false);

  // Change password
  const [oldPw,      setOldPw]      = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [changingPw, setChangingPw] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const email = user?.email ?? "";

  const initials = useMemo(() => {
    const source = fullName.trim() || email;
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join("") || "NG";
  }, [email, fullName]);

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res  = await fetch(`${API_URL}/profiles/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");
        setFullName(data.full_name || "");
        setPhone(data.phone        || "");
        setDistrict(data.district  || "");
      } catch (err: any) {
        toast({ title: "Error loading profile", description: err.message, variant: "destructive" });
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/profiles/`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name: fullName.trim() || null,
          phone:     phone.trim()    || null,
          district:  district        || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      toast({ title: "Profile updated", description: "Your details have been saved." });
    } catch (err: any) {
      toast({ title: "Unable to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Frontend same-password guard — catch obvious case before network call
    if (oldPw === newPw) {
      toast({
        title: "Same password",
        description: "Your new password must be different from your current password.",
        variant: "destructive",
      });
      return;
    }
    if (newPw.length < 8) {
      toast({
        title: "Password too short",
        description: "New password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPw !== confirmPw) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must be identical.",
        variant: "destructive",
      });
      return;
    }

    setChangingPw(true);
    try {
      const res  = await fetch(`${API_URL}/auth/change-password`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ old_password: oldPw, new_password: newPw }),
      });
      const data = await res.json();
      // Surface the server's exact error (e.g. "New password must be different…")
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      toast({ title: "Password changed", description: "Your password has been updated." });
      setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setChangingPw(false);
    }
  };

  // ── Delete account ────────────────────────────────────────────────────────
  const handleDeleteAccount = async (password: string) => {
    if (!token) return;
    setDeletingAccount(true);
    try {
      const res  = await fetch(`${API_URL}/auth/delete-account`, {
        method:  "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");
      toast({ title: "Account deleted", description: "Your account has been permanently removed." });
      signOut();
      navigate("/auth", { replace: true });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading || initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <img src={logo} alt="NthakaGuide logo" className="h-12 w-12 rounded-lg shadow-lg animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  const regions = ["Northern", "Central", "Southern"] as const;

  // Derived password state
  const pwPassed      = PW_RULES.filter(r => r(newPw)).length;
  const pwAllRules    = pwPassed === PW_RULES.length;
  const isSamePassword = oldPw.length > 0 && newPw.length > 0 && oldPw === newPw;
  const canSubmitPw   = !changingPw && oldPw && newPw && confirmPw
                        && !isSamePassword && pwAllRules && newPw === confirmPw;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container max-w-4xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
            <p className="mt-1 text-muted-foreground">Manage your account details for NthakaGuide.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

            {/* ── Avatar card ───────────────────────────────────────────── */}
            <div className="space-y-4">
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{fullName.trim() || "NthakaGuide User"}</h2>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    {district && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3" /> {district}
                      </p>
                    )}
                    {phone && (
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Phone className="h-3 w-3" /> {phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ── Danger zone ─────────────────────────────────────────── */}
              <Card className="border-destructive/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" /> Danger Zone
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete My Account
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* ── Right column ──────────────────────────────────────────── */}
            <div className="space-y-6">

              {/* Profile details */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-primary" /> Full Name
                      </Label>
                      <Input
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" /> Phone Number
                      </Label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+265 999 000 000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" /> Your District
                      </Label>
                      <Select value={district} onValueChange={setDistrict}>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select your district..." />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map(region => (
                            <div key={region}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {region} Region
                              </div>
                              {MALAWI_DISTRICTS
                                .filter(d => d.region === region)
                                .map(d => (
                                  <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                                ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" /> Email
                        <span className="text-xs text-muted-foreground font-normal">(cannot be changed)</span>
                      </Label>
                      <Input value={email} disabled />
                    </div>

                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* ── Change password ──────────────────────────────────── */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Change Password
                  </CardTitle>
                  <CardDescription>
                    Choose a strong password different from your current one.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4" noValidate autoComplete="off">

                    <PasswordField
                      id="old-pw"
                      label="Current Password"
                      value={oldPw}
                      onChange={setOldPw}
                      placeholder="Your current password"
                    />

                    <PasswordField
                      id="new-pw"
                      label="New Password"
                      value={newPw}
                      onChange={setNewPw}
                    />

                    {/* Same-password warning — instant inline feedback */}
                    {isSamePassword && (
                      <p className="text-xs text-destructive flex items-center gap-1.5">
                        <Lock className="h-3 w-3" />
                        New password must be different from your current password
                      </p>
                    )}

                    {/* Strength bar — hidden when same-password warning shows */}
                    {newPw && !isSamePassword && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {PW_RULES.map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i < pwPassed
                                  ? (STRENGTH_COLORS[pwPassed - 1] ?? "bg-muted")
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {STRENGTH_LABELS[pwPassed - 1] ?? "Very weak"}
                        </p>
                      </div>
                    )}

                    <PasswordField
                      id="confirm-pw"
                      label="Confirm New Password"
                      value={confirmPw}
                      onChange={setConfirmPw}
                    />

                    {/* Match indicator */}
                    {confirmPw && (
                      <p className={`text-xs flex items-center gap-1.5 ${
                        newPw === confirmPw ? "text-primary" : "text-destructive"
                      }`}>
                        <Lock className="h-3 w-3" />
                        {newPw === confirmPw ? "Passwords match" : "Passwords do not match"}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={!canSubmitPw}
                      className="w-full sm:w-auto"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {changingPw ? "Updating…" : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

            </div>
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteModal
            onConfirm={handleDeleteAccount}
            onCancel={() => setShowDeleteModal(false)}
            loading={deletingAccount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}