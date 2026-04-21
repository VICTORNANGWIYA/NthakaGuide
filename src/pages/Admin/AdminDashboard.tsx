import { useState, useEffect, useCallback, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BarChart3, Users, MapPin, Brain, Bot,
  CloudRain, Settings, Search, Globe, Sprout, RefreshCw,
  UserCircle, LogOut, Download, Filter, AlertTriangle,
  CheckCircle2, Info, XCircle, Shield, Trash2, UserX,
  UserCheck, Key, ChevronDown, FileText, Calendar,
  Activity, Cpu, ToggleLeft, ToggleRight, Bell,
  ClipboardList,
} from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API = "http://localhost:5000";

// ─── Generic fetch hook ───────────────────────────────────────────────────────
function useAdminFetch<T>(path: string, token: string | null) {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [path, token]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

// ─── Admin action helper ──────────────────────────────────────────────────────
async function adminAction(
  token: string, method: string, path: string, body?: any
): Promise<{ ok: boolean; data: any }> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type":  "application/json",
      Authorization:   `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// ─── CSV export helper ────────────────────────────────────────────────────────
async function downloadCSV(token: string, path: string, filename: string) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;
  const text = await res.text();
  const blob = new Blob([text], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Static model data ────────────────────────────────────────────────────────
const MODEL_PERF = [
  { algo: "Random Forest",    id: "random_forest",    acc: "99.55%", f1: "99.54%", cv: "99.49%" },
  { algo: "Gradient Boosting",id: "gradient_boosting",acc: "98.18%", f1: "98.19%", cv: "98.75%" },
  { algo: "Decision Tree",    id: "decision_tree",    acc: "98.64%", f1: "98.63%", cv: "98.52%" },
  { algo: "Naive Bayes",      id: "naive_bayes",      acc: "99.49%", f1: "99.54%", cv: "99.55%" },
];

// ─── UI helpers ───────────────────────────────────────────────────────────────
function Spark({ data, className = "text-primary" }: { data: number[]; className?: string }) {
  const h = 32, w = 90;
  if (!data.length || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = range === 0 ? h / 2 : h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniBar({ data }: { data: { month: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-16 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className={`w-full rounded-t-sm ${i === data.length-1 ? "bg-primary" : "bg-primary/30"}`}
            style={{ height: `${(d.count / max) * 56}px` }} />
          <span className="text-[9px] text-muted-foreground -rotate-45 origin-top whitespace-nowrap">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const cls = status === "active" ? "bg-primary shadow-[0_0_6px_hsl(var(--primary))]"
            : status === "idle"   ? "bg-golden shadow-[0_0_6px_hsl(var(--golden))]"
            : "bg-muted-foreground";
  return <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${cls}`} />;
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-12 gap-3">
      <img src={logo} alt="" className="h-8 w-8 rounded-lg animate-pulse" />
      <span className="text-sm text-muted-foreground">Loading…</span>
    </div>
  );
}

function ErrorMsg({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <p className="text-sm text-destructive">{msg}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
      </Button>
    </div>
  );
}

function AlertBadge({ level }: { level: string }) {
  if (level === "error")   return <Badge variant="destructive" className="text-[10px]">Error</Badge>;
  if (level === "warning") return <Badge className="bg-golden text-golden-foreground text-[10px]">Warning</Badge>;
  if (level === "success") return <Badge className="bg-primary text-primary-foreground text-[10px]">OK</Badge>;
  return <Badge variant="outline" className="text-[10px]">Info</Badge>;
}

function AlertIcon({ level }: { level: string }) {
  if (level === "error")   return <XCircle      className="h-4 w-4 text-destructive shrink-0" />;
  if (level === "warning") return <AlertTriangle className="h-4 w-4 text-golden     shrink-0" />;
  if (level === "success") return <CheckCircle2  className="h-4 w-4 text-primary    shrink-0" />;
  return <Info className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function scoreColor(s: number) {
  return s >= 90 ? "text-primary" : s >= 75 ? "text-golden" : "text-destructive";
}

// ─── Reset Password Dialog ────────────────────────────────────────────────────
function ResetPasswordDialog({
  userId, userEmail, token, open, onClose, onDone,
}: { userId: string; userEmail: string; token: string; open: boolean; onClose: () => void; onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    setBusy(true);
    const { ok, data } = await adminAction(token, "PUT", `/admin/users/${userId}/reset-password`, { new_password: pw });
    setBusy(false);
    if (ok) { toast({ title: "Password reset", description: data.message }); onDone(); onClose(); }
    else    { toast({ title: "Error", description: data.error, variant: "destructive" }); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>Set a new password for <strong>{userEmail}</strong>.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>New Password</Label>
          <Input type="password" value={pw} onChange={e => setPw(e.target.value)}
            placeholder="Min 8 chars, upper+lower+digit+special" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleReset} disabled={busy || pw.length < 8}>
            {busy ? "Resetting…" : "Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  open, title, description, confirmLabel, variant, onConfirm, onClose,
}: {
  open: boolean; title: string; description: string;
  confirmLabel: string; variant?: "destructive" | "default";
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant={variant ?? "default"} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, token, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQ,    setSearchQ]    = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [filterCrop, setFilterCrop] = useState("");
  const [dateFrom,   setDateFrom]   = useState("");
  const [dateTo,     setDateTo]     = useState("");

  const [resetTarget,   setResetTarget]   = useState<{ id: string; email: string } | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<{ id: string; email: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string; description: string; label: string; variant?: "destructive";
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ── Data hooks ────────────────────────────────────────────────────────────
  const statsApi     = useAdminFetch<any>("/admin/stats",           token);
  const monthlyApi   = useAdminFetch<any[]>("/admin/monthly",       token);
  const analysesApi  = useAdminFetch<any>("/admin/analyses",        token);
  const usersApi     = useAdminFetch<any>("/admin/users",           token);
  const districtsApi = useAdminFetch<any[]>("/admin/districts",     token);
  const cropsApi     = useAdminFetch<any[]>("/admin/crops",         token);
  const fertsApi     = useAdminFetch<any[]>("/admin/fertilizers",   token);
  const alertsApi    = useAdminFetch<any[]>("/admin/alerts",        token);
  const logsApi      = useAdminFetch<any>("/admin/logs",            token);
  const modelApi     = useAdminFetch<any>("/admin/model/status",    token);
  const chatbotApi   = useAdminFetch<any>("/admin/chatbot/stats",   token);  // ← real data

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Sprout className="h-8 w-8 text-primary animate-pulse" />
    </div>
  );
  if (!user || user.role !== "admin") return <Navigate to="/recommend" replace />;

  // ── Destructure ───────────────────────────────────────────────────────────
  const stats        = statsApi.data;
  const monthly      = monthlyApi.data   ?? [];
  const analyses     = analysesApi.data;
  const users        = usersApi.data;
  const districts    = districtsApi.data ?? [];
  const crops        = cropsApi.data     ?? [];
  const ferts        = fertsApi.data     ?? [];
  const alerts       = alertsApi.data    ?? [];
  const logs         = logsApi.data;
  const modelInfo    = modelApi.data;
  const chatbotStats = chatbotApi.data;   // ← used in chatbot tab

  const totalAnalyses = stats?.total_analyses ?? 0;
  const sparkData     = monthly.map((m: any) => m.count);
  const activeAlerts  = (alerts as any[]).filter((a: any) => a.level !== "success").length;

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filteredDistricts = (districts as any[]).filter(d =>
    d.district.toLowerCase().includes(searchQ.toLowerCase())
  );
  const filteredAnalyses = ((analyses?.items ?? []) as any[]).filter(a =>
    [a.user_name, a.district, a.recommended_crop].some(
      (v: string) => v?.toLowerCase().includes(searchQ.toLowerCase())
    ) &&
    (!filterMode || a.input_mode === filterMode) &&
    (!filterCrop || a.recommended_crop?.toLowerCase().includes(filterCrop.toLowerCase()))
  );
  const filteredUsers = ((users?.items ?? []) as any[]).filter(u =>
    [u.email, u.full_name, u.district].some(
      (v: string) => v?.toLowerCase().includes(searchQ.toLowerCase())
    )
  );

  // ── Action helpers ────────────────────────────────────────────────────────
  const userAction = async (path: string, method: string, body?: any, successMsg?: string) => {
    if (!token) return;
    const { ok, data } = await adminAction(token, method, path, body);
    if (ok) {
      toast({ title: "Success", description: successMsg ?? data.message });
      usersApi.reload(); logsApi.reload(); alertsApi.reload();
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  };

  const switchModel = async (algorithmId: string) => {
    if (!token) return;
    const { ok, data } = await adminAction(token, "PUT", "/admin/model/switch", { algorithm: algorithmId });
    if (ok) { toast({ title: "Model switched", description: data.message }); modelApi.reload(); logsApi.reload(); }
    else    { toast({ title: "Error", description: data.error, variant: "destructive" }); }
  };

  // ── KPI cards ─────────────────────────────────────────────────────────────
  const kpis = [
    { label: "Total Analyses",  value: totalAnalyses.toLocaleString(),             sub: `+${stats?.analyses_today ?? 0} today`,        spark: sparkData.length >= 2 ? sparkData : [0,1], Icon: BarChart3 },
    { label: "Registered Users",value: (stats?.total_users ?? 0).toLocaleString(), sub: `+${stats?.new_users_week ?? 0} this week`,     spark: [80,110,130,160,180,200,210,230,240,260],  Icon: Users },
    { label: "Active Districts", value: `${stats?.active_districts ?? 0} / 28`,    sub: stats?.active_districts === 28 ? "100% coverage" : "districts active", spark: [20,22,22,24,26,26,28,28,28,28], Icon: MapPin },
    { label: "API Uptime",       value: stats?.api_uptime ?? "—",                  sub: "Last 30 days",                                 spark: [99,100,100,99,100,100,100,100,99,100],   Icon: Globe },
  ];

  const tabs = [
    { id: "overview",  label: "Overview",   icon: LayoutDashboard },
    { id: "analyses",  label: "Analyses",   icon: BarChart3 },
    { id: "users",     label: "Users",      icon: Users },
    { id: "districts", label: "Districts",  icon: MapPin },
    { id: "model",     label: "ML Model",   icon: Brain },
    { id: "alerts",    label: "Alerts",     icon: Bell,         badge: activeAlerts > 0 ? activeAlerts : undefined },
    { id: "logs",      label: "Logs",       icon: ClipboardList },
    { id: "chatbot",   label: "AI Chatbot", icon: Bot },
    { id: "rainfall",  label: "Rainfall",   icon: CloudRain },
    { id: "settings",  label: "Settings",   icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-7xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="NthakaGuide" className="h-8 w-8 rounded-md" />
            <span className="font-display font-bold text-sm">NthakaGuide</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 mr-2">
              <StatusDot status="active" />
              <span className="text-xs font-semibold text-primary">LIVE</span>
              <span className="text-xs text-muted-foreground font-mono">{totalAnalyses.toLocaleString()}</span>
            </div>
            {activeAlerts > 0 && (
              <div className="relative mr-1">
                <Bell className="h-4 w-4 text-golden" />
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-destructive rounded-full text-[8px] text-white flex items-center justify-center font-bold">{activeAlerts}</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/admin_profile")} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <UserCircle className="h-4 w-4" /><span className="hidden sm:inline text-xs">Profile</span>
            </Button>
            <Button variant="ghost" size="sm"
              onClick={() => { signOut(); navigate("/auth", { replace: true }); }}
              className="gap-1.5 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" /><span className="hidden sm:inline text-xs">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">NthakaGuide system overview and management</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {tabs.map(t => (
                <TabsTrigger key={t.id} value={t.id}
                  className="relative flex items-center gap-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <t.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                  {t.badge && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-destructive rounded-full text-[8px] text-white flex items-center justify-center font-bold">{t.badge}</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ═══ OVERVIEW ═══ */}
            <TabsContent value="overview" className="space-y-6">
              {statsApi.loading ? <Loader /> : statsApi.error ? <ErrorMsg msg={statsApi.error} onRetry={statsApi.reload} /> : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {kpis.map((kpi, i) => (
                    <Card key={i} className="border-border relative overflow-hidden">
                      <CardContent className="p-5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                        <div className="flex items-center gap-2 mb-2">
                          <kpi.Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{kpi.label}</span>
                        </div>
                        <p className="text-2xl font-display font-bold">{kpi.value}</p>
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-xs text-primary font-medium">{kpi.sub}</span>
                          <Spark data={kpi.spark} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 border-border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">Analyses per Month</CardTitle>
                        <p className="text-2xl font-display font-bold mt-1">{monthly.reduce((s: number, m: any) => s + m.count, 0).toLocaleString()}</p>
                        <span className="text-xs text-primary">Last 12 months</span>
                      </div>
                      {monthly.length > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Peak</p>
                          <p className="text-lg font-bold text-primary">{Math.max(...monthly.map((m: any) => m.count)).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>{monthlyApi.loading ? <Loader /> : <MiniBar data={monthly} />}</CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Input Mode Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    {statsApi.loading ? <Loader /> : Object.entries(stats?.mode_breakdown ?? {}).map(([mode, cnt]: any) => {
                      const total = (Object.values(stats?.mode_breakdown ?? {}) as number[]).reduce((s, v) => s + v, 0) || 1;
                      const pct   = Math.round((cnt as number / total) * 100);
                      return (
                        <div key={mode} className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground flex-1 capitalize">{mode}</span>
                          <Progress value={pct} className="flex-1 h-2" />
                          <span className="text-xs font-semibold w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Top Recommended Crops</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {cropsApi.loading ? <Loader /> : (crops as any[]).map((c, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{c.crop}</span>
                          <span className="font-semibold text-primary">{c.count.toLocaleString()}</span>
                        </div>
                        <Progress value={c.pct} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Recent Analyses</CardTitle>
                      <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 text-[10px]">LIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {analysesApi.loading ? <Loader /> : ((analyses?.items ?? []) as any[]).slice(0, 6).map((a, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {(a.user_name || "?").split(" ").map((w: string) => w[0]).slice(0,2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{a.user_name}</p>
                          <p className="text-xs text-muted-foreground">{a.district}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-primary">{a.recommended_crop}</p>
                          <p className="text-xs text-muted-foreground">{a.crop_score ? `${a.crop_score}%` : "—"}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader className="pb-2"><CardTitle className="text-base">Fertilizer Distribution</CardTitle></CardHeader>
                <CardContent>
                  {fertsApi.loading ? <Loader /> : (
                    <div className="space-y-3">
                      {(ferts as any[]).map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-sm flex-1 min-w-[120px]">{f.name}</span>
                          <span className="text-xs font-semibold text-primary w-8 text-right">{f.pct}%</span>
                          <div className="w-40 h-1.5 bg-muted rounded-full">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${f.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ ANALYSES ═══ */}
            <TabsContent value="analyses" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total",      val: totalAnalyses.toLocaleString() },
                  { label: "Lab Mode",   val: String(stats?.mode_breakdown?.lab   ?? "—") },
                  { label: "Field Mode", val: String(stats?.mode_breakdown?.field ?? "—") },
                  { label: "Mixed Mode", val: String(stats?.mode_breakdown?.mixed ?? "—") },
                ].map((s, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-display font-bold mt-1">{s.val}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-border">
                <CardHeader>
                  <div className="flex flex-wrap gap-2 items-end justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Filter className="h-4 w-4" /> Analysis Log
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <div className="relative w-44">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search…" value={searchQ} onChange={e => setSearchQ(e.target.value)} className="pl-9 h-9 text-sm" />
                      </div>
                      <Select value={filterMode === "" ? "all" : filterMode} onValueChange={v => setFilterMode(v === "all" ? "" : v)}>
                        <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="All modes" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All modes</SelectItem>
                          <SelectItem value="lab">Lab</SelectItem>
                          <SelectItem value="field">Field</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 w-36 text-sm" title="From date" />
                      <Input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className="h-9 w-36 text-sm" title="To date" />
                      <Button size="sm" variant="outline" onClick={() => token && downloadCSV(token, "/admin/export/analyses", "analyses.csv")} className="gap-1.5">
                        <Download className="h-3.5 w-3.5" /> Export CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {analysesApi.loading ? <Loader /> : analysesApi.error ? <ErrorMsg msg={analysesApi.error} onRetry={analysesApi.reload} /> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>{["ID","User","District","Crop","Score","Mode","Date"].map(h => <TableHead key={h} className="text-xs">{h}</TableHead>)}</TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAnalyses.map((a: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell className="font-mono text-primary text-xs">{a.id?.slice(0,8)}…</TableCell>
                              <TableCell className="text-sm">{a.user_name}</TableCell>
                              <TableCell className="text-sm">{a.district}</TableCell>
                              <TableCell><Badge variant="secondary" className="text-xs">{a.recommended_crop}</Badge></TableCell>
                              <TableCell className={`text-sm font-semibold ${scoreColor(a.crop_score ?? 0)}`}>{a.crop_score ?? "—"}%</TableCell>
                              <TableCell><Badge variant="outline" className="text-[10px] capitalize">{a.input_mode}</Badge></TableCell>
                              <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ USERS ═══ */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users",      val: String(stats?.total_users    ?? "—") },
                  { label: "Active Today",     val: "—" },
                  { label: "New This Week",    val: String(stats?.new_users_week ?? "—") },
                  { label: "With 5+ Analyses", val: "—" },
                ].map((s, i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-display font-bold mt-1">{s.val}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-border">
                <CardHeader>
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <CardTitle className="text-base">User Management</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative w-48">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search users…" value={searchQ} onChange={e => setSearchQ(e.target.value)} className="pl-9 h-9 text-sm" />
                      </div>
                      <Button size="sm" variant="outline" onClick={() => token && downloadCSV(token, "/admin/export/users", "users.csv")} className="gap-1.5">
                        <Download className="h-3.5 w-3.5" /> Export CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersApi.loading ? <Loader /> : usersApi.error ? <ErrorMsg msg={usersApi.error} onRetry={usersApi.reload} /> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>{["User","Email","District","Analyses","Status","Actions"].map(h => <TableHead key={h} className="text-xs">{h}</TableHead>)}</TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((u: any, i: number) => (
                            <TableRow key={i}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-border flex items-center justify-center text-[10px] font-bold text-primary">
                                    {(u.full_name || u.email || "?").split(" ").map((w: string) => w[0]).slice(0,2).join("")}
                                  </div>
                                  <span className="text-sm">{u.full_name || "—"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                              <TableCell className="text-sm">{u.district || "—"}</TableCell>
                              <TableCell className="text-sm font-semibold text-primary">{u.analyses}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <StatusDot status={u.is_active ? (u.status ?? "active") : "disabled"} />
                                  <span className="text-xs">{u.is_active ? (u.status ?? "active") : "disabled"}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {u.is_active ? (
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-golden hover:text-golden" title="Deactivate"
                                      onClick={() => setConfirmAction({ title: "Deactivate User", description: `Disable ${u.email}'s account?`, label: "Deactivate", variant: "destructive", onConfirm: () => userAction(`/admin/users/${u.id}/deactivate`, "PUT", undefined, `${u.email} deactivated.`) })}>
                                      <UserX className="h-3.5 w-3.5" />
                                    </Button>
                                  ) : (
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:text-primary" title="Activate"
                                      onClick={() => userAction(`/admin/users/${u.id}/activate`, "PUT", undefined, `${u.email} activated.`)}>
                                      <UserCheck className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Promote to Admin"
                                    onClick={() => setConfirmAction({ title: "Promote to Admin", description: `Grant admin privileges to ${u.email}?`, label: "Promote", onConfirm: () => userAction(`/admin/users/${u.id}/promote`, "PUT", undefined, `${u.email} promoted.`) })}>
                                    <Shield className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary" title="Reset Password"
                                    onClick={() => setResetTarget({ id: u.id, email: u.email })}>
                                    <Key className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Delete User"
                                    onClick={() => setDeleteTarget({ id: u.id, email: u.email })}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ DISTRICTS ═══ */}
            <TabsContent value="districts" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{(districts as any[]).length} districts with activity</p>
                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Filter…" value={searchQ} onChange={e => setSearchQ(e.target.value)} className="pl-9 h-9 text-sm" />
                </div>
              </div>
              <Card className="border-border">
                <CardContent className="p-0">
                  {districtsApi.loading ? <div className="p-6"><Loader /></div> : districtsApi.error ? <div className="p-6"><ErrorMsg msg={districtsApi.error} onRetry={districtsApi.reload} /></div> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow>{["District","Analyses","Users","Top Crop","Avg pH","Activity"].map(h => <TableHead key={h} className="text-xs">{h}</TableHead>)}</TableRow></TableHeader>
                        <TableBody>
                          {filteredDistricts.map((d: any, i: number) => {
                            const maxA = (filteredDistricts as any[])[0]?.analyses || 1;
                            const pct  = Math.round((d.analyses / maxA) * 100);
                            const ph   = Number(d.avg_ph);
                            return (
                              <TableRow key={i}>
                                <TableCell className="font-semibold text-sm">{d.district}</TableCell>
                                <TableCell className="text-sm font-semibold text-primary">{d.analyses.toLocaleString()}</TableCell>
                                <TableCell className="text-sm">{d.users}</TableCell>
                                <TableCell><Badge variant="secondary" className="text-xs">{d.top_crop}</Badge></TableCell>
                                <TableCell className={`text-sm ${ph < 6 ? "text-destructive" : ph > 7.5 ? "text-golden" : "text-primary"}`}>{d.avg_ph ?? "—"}</TableCell>
                                <TableCell className="min-w-[120px]">
                                  <div className="flex items-center gap-2">
                                    <Progress value={pct} className="flex-1 h-1.5" />
                                    <span className="text-[10px] text-muted-foreground w-7">{pct}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ ML MODEL ═══ */}
            <TabsContent value="model" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base flex items-center gap-2"><Cpu className="h-4 w-4" /> Model Control</CardTitle>
                      <Button size="sm" variant="outline" onClick={modelApi.reload} className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {modelApi.loading ? <Loader /> : (
                      <div className="space-y-3">
                        {MODEL_PERF.map((m, i) => {
                          const serverModel = (modelInfo?.models ?? []).find((s: any) => s.id === m.id);
                          const isActive    = modelInfo?.active_model === m.id;
                          const present     = serverModel?.present ?? false;
                          return (
                            <div key={i} className={`p-3 rounded-lg border ${isActive ? "border-primary bg-primary/5" : "border-border"}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{m.algo}</span>
                                    {isActive && <Badge className="text-[10px] bg-primary">ACTIVE</Badge>}
                                    {!present && <Badge variant="destructive" className="text-[10px]">MISSING</Badge>}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">Accuracy {m.acc} · F1 {m.f1} · CV {m.cv}</p>
                                  {serverModel && <p className="text-[10px] text-muted-foreground">{serverModel.file} · {serverModel.size}</p>}
                                </div>
                                {!isActive && present && (
                                  <Button size="sm" variant="outline" onClick={() => switchModel(m.id)} className="gap-1.5 shrink-0">
                                    <ToggleRight className="h-3.5 w-3.5" /> Switch
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Training Info</CardTitle></CardHeader>
                  <CardContent>
                    {modelApi.loading ? <Loader /> : (
                      <div className="space-y-0">
                        {[
                          ["Active Model",  modelInfo?.active_model ?? "—"],
                          ["Training Rows", (modelInfo?.training_rows ?? "66,341").toLocaleString()],
                          ["Feature Count", modelInfo?.feature_count ?? 7],
                          ["Crop Classes",  modelInfo?.classes ?? 28],
                          ["Accuracy",      modelInfo?.accuracy ? `${(modelInfo.accuracy * 100).toFixed(2)}%` : "99.55%"],
                          ["F1 Score",      modelInfo?.f1_score  ? `${(modelInfo.f1_score  * 100).toFixed(2)}%` : "99.54%"],
                          ["CV Mean",       modelInfo?.cv_mean   ? `${(modelInfo.cv_mean   * 100).toFixed(2)}%` : "99.49%"],
                        ].map(([k, v], j) => (
                          <div key={j} className="flex gap-3 py-2 border-b border-border last:border-0">
                            <span className="text-xs text-muted-foreground min-w-[120px] shrink-0">{k}</span>
                            <span className="text-xs font-mono">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader><CardTitle className="text-base">Feature Importance (Random Forest)</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                    {[
                      { f: "Rainfall (annual_mm)", imp: 28.4 },
                      { f: "Humidity (%)",          imp: 21.7 },
                      { f: "Temperature (°C)",      imp: 18.2 },
                      { f: "Potassium K (mg/kg)",   imp: 12.1 },
                      { f: "pH",                    imp: 9.8  },
                      { f: "Nitrogen N (mg/kg)",    imp: 5.6  },
                      { f: "Phosphorus P (mg/kg)",  imp: 4.2  },
                    ].map((fi, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{fi.f}</span>
                          <span className="font-semibold text-primary">{fi.imp}%</span>
                        </div>
                        <Progress value={(fi.imp / 28.4) * 100} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ ALERTS ═══ */}
            <TabsContent value="alerts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4" /> System Alerts
                  {activeAlerts > 0 && <Badge variant="destructive">{activeAlerts} active</Badge>}
                </h2>
                <Button size="sm" variant="outline" onClick={alertsApi.reload} className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
              </div>
              {alertsApi.loading ? <Loader /> : alertsApi.error ? <ErrorMsg msg={alertsApi.error} onRetry={alertsApi.reload} /> : (
                <div className="space-y-3">
                  {(alerts as any[]).map((alert, i) => (
                    <Card key={i} className={`border ${alert.level === "error" ? "border-destructive/50 bg-destructive/5" : alert.level === "warning" ? "border-golden/50 bg-golden/5" : alert.level === "success" ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertIcon level={alert.level} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{alert.title}</span>
                              <AlertBadge level={alert.level} />
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ═══ LOGS ═══ */}
            <TabsContent value="logs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Audit Trail</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={logsApi.reload} className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
                  <Button size="sm" variant="outline" onClick={() => token && downloadCSV(token, "/admin/export/monthly-report", "monthly_report.csv")} className="gap-1.5">
                    <Download className="h-3.5 w-3.5" /> Monthly Report
                  </Button>
                </div>
              </div>
              <Card className="border-border">
                <CardContent className="p-0">
                  {logsApi.loading ? <div className="p-6"><Loader /></div> : logsApi.error ? <div className="p-6"><ErrorMsg msg={logsApi.error} onRetry={logsApi.reload} /></div> : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow>{["Time","Admin","Action","Target","Detail"].map(h => <TableHead key={h} className="text-xs">{h}</TableHead>)}</TableRow></TableHeader>
                        <TableBody>
                          {((logs?.items ?? []) as any[]).length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No admin actions logged yet.</TableCell></TableRow>
                          ) : ((logs?.items ?? []) as any[]).map((log, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</TableCell>
                              <TableCell className="text-xs font-mono">{log.admin_id?.slice(0,8)}…</TableCell>
                              <TableCell><Badge variant="outline" className="text-[10px]">{log.action}</Badge></TableCell>
                              <TableCell className="text-xs">{log.target || "—"}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{log.detail || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ CHATBOT ═══ */}
            <TabsContent value="chatbot" className="space-y-6">
              {chatbotApi.loading ? (
                <Loader />
              ) : chatbotApi.error ? (
                <ErrorMsg msg={chatbotApi.error} onRetry={chatbotApi.reload} />
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {(chatbotStats?.kpis ?? []).map((s: any, i: number) => (
                      <Card key={i} className="border-border">
                        <CardContent className="p-5">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                          <p className="text-2xl font-display font-bold mt-1">{s.value}</p>
                          <p className="text-xs text-primary mt-1">{s.delta}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">AI Model Configuration</CardTitle>
                          <Button size="sm" variant="outline" onClick={chatbotApi.reload} className="gap-1.5">
                            <RefreshCw className="h-3.5 w-3.5" /> Refresh
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {(chatbotStats?.model_config ?? []).map(([k, v]: [string, string], i: number) => (
                          <div key={i} className="flex gap-3 py-2 border-b border-border last:border-0">
                            <span className="text-xs text-muted-foreground min-w-[100px] shrink-0">{k}</span>
                            <span className={`text-xs font-mono ${k === "Status" ? (v.startsWith("✔") ? "text-primary" : "text-destructive") : ""}`}>
                              {v}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardHeader><CardTitle className="text-base">Topic Classification</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {(chatbotStats?.topic_breakdown ?? []).map((s: any, i: number) => (
                          <div key={i}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">{s.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{(s.count ?? 0).toLocaleString()}</span>
                                <span className="font-bold text-primary w-8 text-right">{s.pct}%</span>
                              </div>
                            </div>
                            <Progress value={s.pct} className="h-1.5" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ═══ RAINFALL ═══ */}
            <TabsContent value="rainfall" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[{label:"NASA POWER Coverage",val:"2000–2025",sub:"25 years"},{label:"Districts Connected",val:"28 / 28",sub:"All Malawi"},{label:"Avg Annual Forecast",val:"1,043mm",sub:"EWMA"},{label:"Satellite API Uptime",val:"99.1%",sub:"NASA POWER"}].map((s,i) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-display font-bold text-primary mt-1">{s.val}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="border-border">
                <CardHeader><CardTitle className="text-base">Rainfall by Zone</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[{zone:"High Rainfall",mm:1280,districts:6},{zone:"Central Plateau",mm:920,districts:11},{zone:"Lakeshore",mm:790,districts:6},{zone:"N. Highlands",mm:1110,districts:4},{zone:"Shire Valley",mm:620,districts:3}].map(z => (
                      <Card key={z.zone} className="bg-muted/30 border-border text-center">
                        <CardContent className="p-4">
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">{z.zone}</p>
                          <p className="text-2xl font-display font-bold text-primary">{z.mm}</p>
                          <p className="text-[9px] text-muted-foreground">mm/yr · {z.districts} districts</p>
                          <Progress value={(z.mm/1280)*100} className="h-1 mt-2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ SETTINGS ═══ */}
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { title:"System Information", items:[["App Name","NthakaGuide"],["Version","2.0.0"],["Environment","Production"],["Database","PostgreSQL / SQLAlchemy"],["Runtime","Python Flask"],["Framework","React + Vite"]] },
                  { title:"API Configuration",  items:[["Auth","JWT (Flask-JWT-Extended)"],["CORS","flask-cors configured"],["JWT Expiry","24h (configurable)"],["Rate Limit","100 req/min"],["Password Rules","8+ chars, upper+lower+digit+special"],["Max Admins","2 accounts"]] },
                  { title:"ML Model Settings",  items:[["Crop Model","Random Forest (200 trees)"],["Features","7 raw (N,P,K,temp,humidity,pH,rain)"],["Training Rows","~66,000+"],["Malawi Crops","28 classes"],["Zone Filter","climate_zone × land_use"],["Model Switch","PUT /admin/model/switch"]] },
                  { title:"External Services",  items:[["NASA POWER","api.larc.nasa.gov (free)"],["Open-Meteo","api.open-meteo.com (free)"],["Admin API","GET/PUT /admin/* (JWT)"],["Export API","GET /admin/export/*"],["Alerts API","GET /admin/alerts"],["Audit Log","GET /admin/logs"]] },
                ].map((section, i) => (
                  <Card key={i} className="border-border">
                    <CardHeader><CardTitle className="text-base">{section.title}</CardTitle></CardHeader>
                    <CardContent>
                      {section.items.map(([k,v],j) => (
                        <div key={j} className="flex gap-3 py-2 border-b border-border last:border-0">
                          <span className="text-xs text-muted-foreground min-w-[120px] shrink-0">{k}</span>
                          <span className="text-xs font-mono break-all">{v}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

          </Tabs>
        </motion.div>
      </main>

      