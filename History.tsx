import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trash2, Calendar, MapPin, Sprout, FlaskConical,
  TrendingUp, Bug, Droplets, Thermometer, CloudRain,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle,
  BarChart3, Leaf,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";

// ── Types ──────────────────────────────────────────────────────────────────
interface CropEntry {
  crop:           string;
  emoji:          string;
  score:          number;
  confidence:     number;
  season:         string;
  reason:         string;
  fertilizerPlan: Record<string, string>;
  yieldPrediction: {
    predicted_tha:    number;
    potential_tha:    number;
    yield_category:   string;
    yield_gap_tha:    number;
    unit:             string;
    limiting_factors: string[];
    improvement_tips: string[];
  };
  pestDiseaseRisk: {
    summary: { level: string; message: string; icon: string };
    risks:   any[];
  };
}

interface SoilAlert {
  type:    string;
  message: string;
  icon:    string;
}

interface HistoryItem {
  id:               string;
  district:         string;
  climate_zone:     string | null;
  input_mode:       string;
  created_at:       string;
  nitrogen:         number | null;
  phosphorus:       number | null;
  potassium:        number | null;
  ph:               number | null;
  moisture:         number | null;
  temperature:      number | null;
  organic_matter:   number | null;
  rainfall_mm:      number | null;
  rainfall_band:    string | null;
  rainfall_category:string | null;
  recommended_crop: string;
  crop_score:       number | null;
  crop_confidence:  number | null;
  crop_season:      string | null;
  fertilizer_type:  string | null;
  yield_predicted:  number | null;
  yield_potential:  number | null;
  yield_category:   string | null;
  pest_risk_level:  string | null;
  all_crops:        CropEntry[];
  soil_alerts:      SoilAlert[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function modeBadge(mode: string) {
  if (mode === "lab")   return { label: "Lab Data",        cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
  if (mode === "field") return { label: "Field Assessment", cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
  return                       { label: "Mixed",            cls: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" };
}

function yieldColor(cat: string | null) {
  if (cat === "Excellent") return "text-green-600 dark:text-green-400";
  if (cat === "Good")      return "text-primary";
  if (cat === "Fair")      return "text-yellow-600";
  return "text-destructive";
}

function pestColor(level: string | null) {
  if (!level || level === "No Data") return "text-muted-foreground";
  if (level === "High Risk")   return "text-destructive";
  if (level === "Medium Risk") return "text-yellow-600";
  return "text-primary";
}

function alertBg(type: string) {
  if (type === "danger")  return "bg-destructive/5 text-destructive";
  if (type === "warning") return "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
  return "bg-primary/5 text-primary";
}

// ── Component ──────────────────────────────────────────────────────────────
export default function History() {
  const { user, token } = useAuth();
  const { toast }       = useToast();

  const [history, setHistory]   = useState<HistoryItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user || !token) { setLoading(false); return; }
    try {
      const res  = await fetch("http://localhost:5000/analysis/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch history");
      setHistory(Array.isArray(data) ? data : (data.items ?? []));
    } catch (err: any) {
      toast({ title: "Error loading history", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [token]);

  const handleDelete = async (id: string) => {
    try {
      const res  = await fetch(`http://localhost:5000/analysis/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistory(prev => prev.filter(h => h.id !== id));
      toast({ title: "Deleted", description: "Analysis record removed." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container max-w-5xl px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
            Analysis History
          </h1>
          <p className="text-muted-foreground mb-8">
            Your previous soil analyses and crop recommendations
          </p>

          {/* ── Loading ──────────────────────────────────────────────── */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>

          ) : history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logo} alt="NthakaGuide logo" className="h-12 w-12 rounded-lg shadow-lg" />
            </div>
                <p className="text-muted-foreground text-lg">No analyses yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Run your first soil analysis to see results here.
                </p>
              </CardContent>
            </Card>

          ) : (
            <div className="space-y-5">
              {history.map((item, i) => {
                const mode   = modeBadge(item.input_mode);
                const isOpen = expanded === item.id;
                const crops  = item.all_crops ?? [];
                const alerts = item.soil_alerts ?? [];

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">

                        {/* ══ CARD HEADER ════════════════════════════════ */}
                        <div className="p-4 sm:p-5">

                          {/* Meta row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${mode.cls}`}>
                                {mode.label}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" /> {item.district}
                                {item.climate_zone && (
                                  <span className="opacity-60">· {item.climate_zone}</span>
                                )}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(item.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric", month: "short", year: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => setExpanded(isOpen ? null : item.id)}
                                className="h-8 w-8 p-0 text-muted-foreground"
                              >
                                {isOpen ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="h-8 w-8 p-0 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Top recommended crop */}
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex items-center justify-center gap-3 mb-4">
                            <img src={logo} alt="NthakaGuide logo" className="h-12 w-12 rounded-lg shadow-lg" />
                             </div>
                            <span className="text-lg font-bold text-foreground">
                              {item.recommended_crop}
                            </span>
                            {item.crop_score !== null && (
                              <Badge variant="outline" className="text-xs">
                                {item.crop_score}% match
                              </Badge>
                            )}
                            {item.crop_season && (
                              <span className="text-xs text-muted-foreground">{item.crop_season}</span>
                            )}
                          </div>

                          {/* Key metric pills */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs">

                            {item.fertilizer_type && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <FlaskConical className="h-3 w-3" /> {item.fertilizer_type}
                              </span>
                            )}

                            {item.yield_predicted !== null && (
                              <span className={`flex items-center gap-1 font-semibold ${yieldColor(item.yield_category)}`}>
                                <TrendingUp className="h-3 w-3" />
                                {item.yield_predicted}t/ha predicted
                                {item.yield_category && ` · ${item.yield_category}`}
                              </span>
                            )}

                            {item.pest_risk_level && item.pest_risk_level !== "No Data" && (
                              <span className={`flex items-center gap-1 ${pestColor(item.pest_risk_level)}`}>
                                <Bug className="h-3 w-3" /> {item.pest_risk_level}
                              </span>
                            )}

                            {item.rainfall_mm !== null && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <CloudRain className="h-3 w-3" /> {item.rainfall_mm}mm
                                {item.rainfall_band && (
                                  <span className="text-muted-foreground opacity-70">({item.rainfall_band})</span>
                                )}
                              </span>
                            )}

                          </div>

                          {/* Soil inputs mini row */}
                          {item.nitrogen !== null && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[11px] text-muted-foreground
                                            border-t border-border pt-3">
                              {item.nitrogen    !== null && <span><Droplets className="h-3 w-3 inline mr-0.5"/>N: <strong className="text-foreground">{item.nitrogen}</strong></span>}
                              {item.phosphorus  !== null && <span>P: <strong className="text-foreground">{item.phosphorus}</strong></span>}
                              {item.potassium   !== null && <span>K: <strong className="text-foreground">{item.potassium}</strong></span>}
                              {item.ph          !== null && <span>pH: <strong className="text-foreground">{item.ph}</strong></span>}
                              {item.moisture    !== null && <span><Droplets className="h-3 w-3 inline mr-0.5"/>{item.moisture}%</span>}
                              {item.temperature !== null && <span><Thermometer className="h-3 w-3 inline mr-0.5"/>{item.temperature}°C</span>}
                              {item.organic_matter !== null && <span><Leaf className="h-3 w-3 inline mr-0.5"/>OM: {item.organic_matter}%</span>}
                            </div>
                          )}
                        </div>

                        {/* ══ EXPANDED DETAIL PANEL ══════════════════════ */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-border bg-muted/20 px-4 sm:px-5 py-5 space-y-6">

                                {/* ── Soil alerts ────────────────────── */}
                                {alerts.length > 0 && (
                                  <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                      Soil Health Alerts
                                    </h3>
                                    <div className="space-y-1.5">
                                      {alerts.map((alert, j) => (
                                        <div key={j} className={`flex gap-2 items-start p-2 rounded-md text-xs ${alertBg(alert.type)}`}>
                                          {alert.type === "danger"
                                            ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5"/>
                                            : alert.type === "warning"
                                            ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5"/>
                                            : <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5"/>}
                                          <span>{alert.message}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* ── All crops ──────────────────────── */}
                                {crops.length > 0 && (
                                  <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                                      All {crops.length} Crop Recommendations
                                    </h3>
                                    <div className="space-y-3">
                                      {crops.map((crop, j) => (
                                        <div
                                          key={j}
                                          className={`rounded-lg border p-3 space-y-3
                                            ${j === 0
                                              ? "border-primary/30 bg-primary/5"
                                              : "border-border bg-background"}`}
                                        >
                                          {/* Crop header */}
                                          <div className="flex items-center gap-3">
                                            <span className="text-2xl">{crop.emoji}</span>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-foreground">{crop.crop}</span>
                                                {j === 0 && (
                                                  <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                                                    Top Pick
                                                  </Badge>
                                                )}
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                  {crop.season}
                                                </Badge>
                                              </div>
                                              <Progress value={crop.score} className="h-1.5 mt-1.5" />
                                            </div>
                                            <span className="text-sm font-bold text-primary tabular-nums shrink-0">
                                              {crop.score}%
                                            </span>
                                          </div>

                                          <p className="text-xs text-muted-foreground leading-relaxed">
                                            {crop.reason}
                                          </p>

                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                                            {/* Fertilizer plan */}
                                            {crop.fertilizerPlan && Object.keys(crop.fertilizerPlan).length > 0 && (
                                              <div className="rounded-md bg-muted/50 p-2.5 space-y-1">
                                                <p className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                                  <FlaskConical className="h-3 w-3"/> Fertilizer
                                                </p>
                                                {crop.fertilizerPlan.basal && (
                                                  <p className="text-xs text-foreground">
                                                    <span className="text-muted-foreground">Basal:</span> {crop.fertilizerPlan.basal}
                                                    {crop.fertilizerPlan.basal_rate && ` · ${crop.fertilizerPlan.basal_rate}`}
                                                  </p>
                                                )}
                                                {crop.fertilizerPlan.topdress && (
                                                  <p className="text-xs text-foreground">
                                                    <span className="text-muted-foreground">Top-dress:</span> {crop.fertilizerPlan.topdress}
                                                    {crop.fertilizerPlan.topdress_rate && ` · ${crop.fertilizerPlan.topdress_rate}`}
                                                  </p>
                                                )}
                                                {crop.fertilizerPlan.topdress_timing && (
                                                  <p className="text-xs text-muted-foreground">{crop.fertilizerPlan.topdress_timing}</p>
                                                )}
                                                {crop.fertilizerPlan.notes && (
                                                  <p className="text-[10px] text-muted-foreground border-t border-border pt-1 mt-1">
                                                    {crop.fertilizerPlan.notes}
                                                  </p>
                                                )}
                                              </div>
                                            )}

                                            {/* Yield prediction */}
                                            {crop.yieldPrediction && (
                                              <div className="rounded-md bg-muted/50 p-2.5 space-y-1">
                                                <p className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                                  <BarChart3 className="h-3 w-3"/> Yield
                                                </p>
                                                <p className="text-xs">
                                                  <span className="text-muted-foreground">Predicted:</span>{" "}
                                                  <strong className={yieldColor(crop.yieldPrediction.yield_category)}>
                                                    {crop.yieldPrediction.predicted_tha} {crop.yieldPrediction.unit}
                                                  </strong>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  Potential: {crop.yieldPrediction.potential_tha} {crop.yieldPrediction.unit}
                                                </p>
                                                <Badge variant="secondary" className="text-[10px]">
                                                  {crop.yieldPrediction.yield_category}
                                                </Badge>
                                                {(crop.yieldPrediction.limiting_factors ?? []).length > 0 && (
                                                  <p className="text-[10px] text-muted-foreground border-t border-border pt-1 mt-1">
                                                    ⚠ {crop.yieldPrediction.limiting_factors.join(" · ")}
                                                  </p>
                                                )}
                                                {(crop.yieldPrediction.improvement_tips ?? []).length > 0 && (
                                                  <p className="text-[10px] text-primary border-t border-border pt-1 mt-1">
                                                    ✓ {crop.yieldPrediction.improvement_tips[0]}
                                                  </p>
                                                )}
                                              </div>
                                            )}

                                            {/* Pest & disease risk */}
                                            {crop.pestDiseaseRisk && (
                                              <div className="rounded-md bg-muted/50 p-2.5 space-y-1">
                                                <p className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                                  <Bug className="h-3 w-3"/> Pest Risk
                                                </p>
                                                <p className={`text-xs font-semibold ${pestColor(crop.pestDiseaseRisk.summary?.level)}`}>
                                                  {crop.pestDiseaseRisk.summary?.icon} {crop.pestDiseaseRisk.summary?.level}
                                                </p>
                                                {(crop.pestDiseaseRisk.risks ?? []).slice(0, 2).map((risk: any, k: number) => (
                                                  <div key={k} className="border-t border-border pt-1 mt-1">
                                                    <p className="text-[10px] font-semibold text-foreground">{risk.name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{risk.symptoms}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* ── Full soil inputs grid ───────────── */}
                                {item.nitrogen !== null && (
                                  <div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                      Soil Inputs Used
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      {[
                                        { label: "Nitrogen",   value: item.nitrogen,       unit: "mg/kg" },
                                        { label: "Phosphorus", value: item.phosphorus,     unit: "mg/kg" },
                                        { label: "Potassium",  value: item.potassium,      unit: "mg/kg" },
                                        { label: "pH",         value: item.ph,             unit: "" },
                                        { label: "Moisture",   value: item.moisture,       unit: "%" },
                                        { label: "Temperature",value: item.temperature,    unit: "°C" },
                                        { label: "Organic Matter", value: item.organic_matter, unit: "%" },
                                        { label: "Rainfall",   value: item.rainfall_mm,    unit: "mm/yr" },
                                      ].filter(f => f.value !== null).map(f => (
                                        <div key={f.label} className="bg-background rounded-md p-2.5 border border-border">
                                          <p className="text-[10px] text-muted-foreground">{f.label}</p>
                                          <p className="text-sm font-bold text-foreground">{f.value}{f.unit}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

        </motion.div>
      </main>
    </div>
  );
}