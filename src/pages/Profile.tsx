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
  const { user, token, loading } = useAuth();
  const { toast }                = useToast();

  const [fullName, setFullName]       = useState("");
  const [phone,    setPhone]          = useState("");
  const [district, setDistrict]       = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving]           = useState(false);

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
      <NavHeader />

      <main className="container max-w-4xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              My Profile
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your account details for NthakaGuide.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

            {/* ── Profile card ──────────────────────────────────── */}
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {fullName.trim() || "NthakaGuide User"}
                  </h2>
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

                  <Button type="submit" disabled={saving}>
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