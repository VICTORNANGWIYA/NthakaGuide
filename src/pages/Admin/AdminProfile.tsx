import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserRound, Mail, Save, Sprout, Phone, MapPin,
  LogOut, LayoutDashboard, ShieldCheck,
} from "lucide-react";
import logo from "@/assets/logo.jpeg";
import NavHeader from "@/components/NavHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MALAWI_DISTRICTS } from "@/lib/malawi-districts";

const API_URL = "http://localhost:5000";

export default function AdminProfile() {
  const { user, token, loading, signOut } = useAuth();
  const { toast }                         = useToast();
  const navigate                          = useNavigate();

  const [fullName, setFullName]             = useState("");
  const [phone,    setPhone]                = useState("");
  const [district, setDistrict]             = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving]                 = useState(false);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const res  = await fetch(`${API_URL}/profiles/`, {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
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

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  if (loading || initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="NthakaGuide logo" className="h-12 w-12 rounded-lg shadow-lg" />
            </div>
      </div>
    );
  }

  if (!user) return null;

  const regions = ["Northern", "Central", "Southern"] as const;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Admin top bar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-4xl px-4 h-14 flex items-center justify-between">
          {/* Left: back to dashboard */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost" size="sm"
              onClick={() => navigate("/admin")}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Dashboard</span>
            </Button>
            <span className="text-muted-foreground/40">|</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="NthakaGuide logo" className="h-12 w-12 rounded-lg shadow-lg" />
            </div>
              <span className="font-display font-bold text-sm">NthakaGuide</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
          </div>

          {/* Right: sign out */}
          <Button
            variant="ghost" size="sm"
            onClick={handleSignOut}
            className="gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              My Profile
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your admin account details for NthakaGuide.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

            {/* ── Profile card ─────────────────────────────────── */}
            <div className="space-y-4">
              <Card>
                <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">
                      {fullName.trim() || "Admin User"}
                    </h2>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">System Administrator</span>
                    </div>
                    {district && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
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

              {/* Sign out card */}
              <Card className="border-destructive/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-destructive">Sign Out</CardTitle>
                  <CardDescription className="text-xs">
                    You will be returned to the login page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* ── Edit form ─────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-5">

                  {/* Full name */}
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

                  {/* Phone */}
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

                  {/* District */}
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
                                <SelectItem key={d.name} value={d.name}>
                                  {d.name}
                                </SelectItem>
                              ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email — read only */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> Email
                      <span className="text-xs text-muted-foreground font-normal">(cannot be changed)</span>
                    </Label>
                    <Input value={email} disabled />
                  </div>

                  <Separator />

                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>

                </form>
              </CardContent>
            </Card>

          </div>
        </motion.div>
      </main>
    </div>
  );
}