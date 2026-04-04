import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MALAWI_DISTRICTS } from "@/lib/malawi-districts";
import { Loader2, CloudRain, TrendingUp, Calendar, BarChart3 } from "lucide-react";

const MONTHS_LETTER = ["J","F","M","A","M","J","J","A","S","O","N","D"];
const MONTHS_ORDER  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const RAINY_MONTHS  = new Set(["Nov","Dec","Jan","Feb","Mar","Apr","May"]);

interface DailyEntry   { date: string; mm: number }
interface WeeklyEntry  { week: string; start: string; end: string; days: number; total_mm: number; avg_mm: number }
interface MonthlyEntry { month: string; year: number; mm: number }

interface RainfallData {
  annualForecastMm:    number;
  annualConfidence:    number;
  annualSource:        string;
  band:                string;
  bandDescription:     string;
  avgAnnualRainfall:   number;
  stationName:         string | null;
  seasonLabel:         string;
  seasonPeriod:        string;
  inRainySeason:       boolean;
  seasonTotalMm:       number;
  seasonMonths:        string[];
  historicalYears:     number[];
  historicalValues:    number[];
  monthlyDistribution: MonthlyEntry[];
  dailyData:           DailyEntry[];
  dailyAvailableDays:  number;
  weeklyData:          WeeklyEntry[];
  live7DayMm:          number | null;
  live7DayDescription: string | null;
  liveDailyForecast:   any[];
  fertilizerCalendar:  { month: string; action: string }[];
  cropSuitability:     { crop: string; emoji: string; suitability: number }[];
  risks:               { level: string; icon: string; message: string }[];
}

type TabId = "annual" | "monthly" | "weekly" | "daily";

// ── Reusable bar chart component ──────────────────────────────────────────
function BarChart({
  values,
  labels,
  maxVal,
  barClass,
  tooltips,
  height = 160,
}: {
  values:   number[];
  labels:   string[];
  maxVal:   number;
  barClass: (i: number) => string;
  tooltips: (i: number) => string;
  height?:  number;
}) {
  if (!values.length || maxVal <= 0) {
    return (
      <p className="text-muted-foreground text-sm py-12 text-center">
        No data available.
      </p>
    );
  }

  return (
    <div>
      {/* Bars */}
      <div className="flex gap-[2px] items-end" style={{ height }}>
        {values.map((v, i) => (
          <div key={i} className="flex-1 relative group flex flex-col justify-end h-full">
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block
                            bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded
                            whitespace-nowrap z-20 pointer-events-none">
              {tooltips(i)}
            </div>
            {/* Bar — rendered from bottom up using flex */}
            <div
              className={`w-full rounded-t-sm transition-colors ${barClass(i)}`}
              style={{ height: `${Math.max(2, (v / maxVal) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      {/* Labels */}
      <div className="flex gap-[2px] mt-1">
        {labels.map((l, i) => (
          <span key={i} className="flex-1 text-center text-[8px] text-muted-foreground truncate">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Rainfall() {
  const [selectedDistrict, setSelectedDistrict] = useState("Zomba");
  const [data, setData]           = useState<RainfallData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("annual");

  useEffect(() => {
    const fetchRainfall = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5000/api/rainfall", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ districtName: selectedDistrict }),
        });
        if (!res.ok) throw new Error("Failed to fetch rainfall data");
        const json = await res.json();
        console.log("Rainfall API response:", json);
        setData(json);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchRainfall();
  }, [selectedDistrict]);

  const districtSelector = (
    <div className="flex flex-wrap gap-2 mb-8">
      {MALAWI_DISTRICTS.map(d => (
        <button
          key={d.name}
          onClick={() => setSelectedDistrict(d.name)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
            ${d.name === selectedDistrict
              ? "bg-primary/10 border-primary text-primary"
              : "border-border text-muted-foreground hover:border-primary/30"
            }`}
        >
          {d.name}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader />
        <main className="container max-w-6xl px-4 py-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8">
            Rainfall Intelligence
          </h1>
          {districtSelector}
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Fetching NASA POWER satellite data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader />
        <main className="container max-w-6xl px-4 py-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-8">
            Rainfall Intelligence
          </h1>
          {districtSelector}
          <Card>
            <CardContent className="py-12 text-center text-destructive">
              {error ?? "No data returned from server."}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ── Safe data extraction ───────────────────────────────────────────────
  const forecast         = Number(data.annualForecastMm)  || 0;
  const confidence       = Number(data.annualConfidence)  || 0;
  const avgRainfall      = Number(data.avgAnnualRainfall) || 0;
  const band             = data.band             ?? "";
  const bandDescription  = data.bandDescription  ?? "";
  const historicalYears  = data.historicalYears  ?? [];
  const historicalValues = (data.historicalValues ?? []).map(Number);
  const fertilizerCal    = data.fertilizerCalendar ?? [];
  const cropSuitability  = data.cropSuitability   ?? [];
  const risks            = data.risks             ?? [];
  const monthlyRaw       = data.monthlyDistribution ?? [];
  const dailyData        = (data.dailyData ?? []).map(d => ({ ...d, mm: Number(d.mm) }));
  const weeklyData       = (data.weeklyData ?? []).map(w => ({ ...w, total_mm: Number(w.total_mm), avg_mm: Number(w.avg_mm) }));

  // ── Monthly map ────────────────────────────────────────────────────────
  const monthlyMap: Record<string, number> = {};
  monthlyRaw.forEach((item: MonthlyEntry) => {
    monthlyMap[item.month] = Number(item.mm);
  });
  const monthlyValues = MONTHS_ORDER.map(m => monthlyMap[m] ?? 0);

  // ── Max values — guard against empty arrays ────────────────────────────
  const maxHistorical = historicalValues.length
    ? Math.max(...historicalValues, forecast)
    : forecast || 1;

  const maxMonthly = monthlyValues.some(v => v > 0)
    ? Math.max(...monthlyValues)
    : 1;

  const maxWeekly = weeklyData.length
    ? Math.max(...weeklyData.map(w => w.total_mm))
    : 1;

  const maxDaily = dailyData.length
    ? Math.max(...dailyData.map(d => d.mm))
    : 1;

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "annual",  label: "Annual",  icon: TrendingUp },
    { id: "monthly", label: "Monthly", icon: BarChart3  },
    { id: "weekly",  label: "Weekly",  icon: Calendar   },
    { id: "daily",   label: "Daily",   icon: CloudRain  },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container max-w-6xl px-4 py-8">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Rainfall Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            NASA POWER satellite data · {data.annualSource}
          </p>
        </motion.div>

        {districtSelector}

        {/* ── TOP SUMMARY ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">

          <Card className={`col-span-2 ${data.inRainySeason
            ? "border-primary/40 bg-primary/5"
            : "border-amber-500/40 bg-amber-500/5"}`}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {data.seasonLabel}
              </p>
              <p className="text-lg font-bold text-foreground mt-1">{data.seasonPeriod}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant={data.inRainySeason ? "default" : "secondary"}>
                  {data.inRainySeason ? "Rainy season now" : "Dry season now"}
                </Badge>
                <Badge variant="outline">{band}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Season total estimate: <strong>{data.seasonTotalMm}mm</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Annual forecast</p>
              <p className="text-2xl font-bold text-foreground">{forecast}mm</p>
              <p className="text-xs text-muted-foreground mt-1">{confidence}% confidence</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Live 7-day</p>
              <p className="text-2xl font-bold text-foreground">
                {data.live7DayMm != null ? `${data.live7DayMm}mm` : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Open-Meteo forecast</p>
            </CardContent>
          </Card>

        </div>

        {/* ── RISK SUMMARY ──────────────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Season Risk Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {risks.map((r, i) => (
              <div
                key={i}
                className={`flex gap-2 items-start p-2 rounded-md text-sm
                  ${r.level === "ok"
                    ? "bg-primary/5 text-primary"
                    : r.level === "danger"
                    ? "bg-destructive/5 text-destructive"
                    : "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"}`}
              >
                <span className="shrink-0">{r.icon}</span>
                <span>{r.message}</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground italic">{bandDescription}</p>
          </CardContent>
        </Card>

        {/* ── TIME SERIES TABS ──────────────────────────────────────── */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">

            {/* Tab buttons */}
            <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold
                              border-b-2 transition-colors whitespace-nowrap shrink-0
                    ${activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Annual ─────────────────────────────────────────────── */}
            {activeTab === "annual" && (
              <div>
                <p className="text-xs text-muted-foreground mb-4">
                  Annual totals from NASA POWER satellite · 2000–
                  {historicalYears[historicalYears.length - 1] ?? "present"} · FC = EWMA forecast
                </p>

                {historicalYears.length > 0 ? (
                  <>
                    {/* Chart: historical bars + forecast bar */}
                    <div className="flex gap-[2px] items-end" style={{ height: 160 }}>
                      {historicalValues.map((v, i) => (
                        <div key={i} className="flex-1 relative group flex flex-col justify-end h-full">
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                                          hidden group-hover:block bg-foreground text-background
                                          text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                            {historicalYears[i]}: {v}mm
                          </div>
                          <div
                            className="w-full rounded-t-sm bg-primary/50 hover:bg-primary transition-colors"
                            style={{ height: `${Math.max(2, (v / maxHistorical) * 100)}%` }}
                          />
                        </div>
                      ))}
                      {/* Forecast bar */}
                      <div className="flex-1 relative group flex flex-col justify-end h-full">
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                                        hidden group-hover:block bg-foreground text-background
                                        text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                          Forecast: {forecast}mm
                        </div>
                        <div
                          className="w-full rounded-t-sm bg-primary ring-1 ring-primary ring-offset-1"
                          style={{ height: `${Math.max(2, (forecast / maxHistorical) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* X-axis labels */}
                    <div className="flex gap-[2px] mt-1">
                      {historicalYears.map((y, i) => (
                        <span key={i} className="flex-1 text-center text-[8px] text-muted-foreground">
                          {String(y).slice(2)}
                        </span>
                      ))}
                      <span className="flex-1 text-center text-[8px] text-primary font-bold">FC</span>
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
                      <span>Avg: <strong className="text-foreground">{avgRainfall}mm</strong></span>
                      <span>Forecast: <strong className="text-foreground">{forecast}mm</strong></span>
                      <span>Confidence: <strong className="text-foreground">{confidence}%</strong></span>
                      <span className="hidden sm:inline">
                        Source: <strong className="text-foreground">{data.annualSource}</strong>
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm py-12 text-center">
                    No historical data available — NASA POWER may be temporarily unavailable.
                  </p>
                )}
              </div>
            )}

            {/* ── Monthly ────────────────────────────────────────────── */}
            {activeTab === "monthly" && (
              <div>
                <p className="text-xs text-muted-foreground mb-4">
                  Monthly rainfall · shaded = rainy season (Nov–May)
                </p>

                {monthlyValues.some(v => v > 0) ? (
                  <>
                    <div className="flex gap-[3px] items-end" style={{ height: 160 }}>
                      {MONTHS_ORDER.map((m, i) => {
                        const val     = monthlyValues[i];
                        const isRainy = RAINY_MONTHS.has(m);
                        return (
                          <div key={m} className="flex-1 relative group flex flex-col justify-end h-full">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                                            hidden group-hover:block bg-foreground text-background
                                            text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                              {m}: {val}mm
                            </div>
                            <div
                              className={`w-full rounded-t-sm transition-colors
                                ${isRainy
                                  ? "bg-primary/70 hover:bg-primary"
                                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                              style={{ height: `${Math.max(2, (val / maxMonthly) * 100)}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-[3px] mt-1">
                      {MONTHS_LETTER.map((m, i) => (
                        <span
                          key={i}
                          className={`flex-1 text-center text-[9px] font-semibold
                            ${RAINY_MONTHS.has(MONTHS_ORDER[i]) ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {m}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-4 mt-3 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-primary/70 inline-block shrink-0"/>
                        Rainy season (Nov–May)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-muted-foreground/30 inline-block shrink-0"/>
                        Dry season (Jun–Oct)
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm py-12 text-center">
                    Monthly data not available yet for this period.
                  </p>
                )}
              </div>
            )}

            {/* ── Weekly ─────────────────────────────────────────────── */}
            {activeTab === "weekly" && (
              <div>
                <p className="text-xs text-muted-foreground mb-4">
                  Weekly totals · last 30 days from NASA POWER
                </p>

                {weeklyData.length > 0 ? (
                  <>
                    {/* Bar chart */}
                    <div className="flex gap-4 items-end" style={{ height: 160 }}>
                      {weeklyData.map((w, i) => (
                        <div key={i} className="flex-1 relative group flex flex-col justify-end h-full">
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                                          hidden group-hover:block bg-foreground text-background
                                          text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                            {w.total_mm}mm total
                          </div>
                          <div
                            className="w-full rounded-t-sm bg-primary/60 hover:bg-primary transition-colors"
                            style={{ height: `${Math.max(2, (w.total_mm / maxWeekly) * 100)}%` }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 mt-1">
                      {weeklyData.map((w, i) => (
                        <span key={i} className="flex-1 text-center text-[9px] text-muted-foreground">
                          {w.week}
                        </span>
                      ))}
                    </div>

                    {/* ✅ Fixed table — clean grid layout */}
                    <div className="mt-5 border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Week</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Period</th>
                            <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">Total</th>
                            <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">Daily avg</th>
                          </tr>
                        </thead>
                        <tbody>
                          {weeklyData.map((w, i) => (
                            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                              <td className="px-4 py-2 font-semibold text-foreground">{w.week}</td>
                              <td className="px-4 py-2 text-muted-foreground">{w.start} – {w.end}</td>
                              <td className="px-4 py-2 text-right font-bold text-primary">{w.total_mm}mm</td>
                              <td className="px-4 py-2 text-right text-muted-foreground">{w.avg_mm}mm/day</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm py-12 text-center">
                    Weekly data not available for this district.
                  </p>
                )}
              </div>
            )}

            {/* ── Daily ──────────────────────────────────────────────── */}
            {activeTab === "daily" && (
              <div>
                <p className="text-xs text-muted-foreground mb-4">
                  Daily rainfall · last {data.dailyAvailableDays || dailyData.length} days from NASA POWER
                </p>

                {dailyData.length > 0 ? (
                  <>
                    <div className="flex gap-[2px] items-end" style={{ height: 160 }}>
                      {dailyData.map((d, i) => (
                        <div key={i} className="flex-1 relative group flex flex-col justify-end h-full">
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                                          hidden group-hover:block bg-foreground text-background
                                          text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
                            {d.date}: {d.mm}mm
                          </div>
                          <div
                            className="w-full rounded-t-sm bg-primary/50 hover:bg-primary transition-colors"
                            style={{ height: `${Math.max(2, (d.mm / maxDaily) * 100)}%` }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between mt-1 text-[9px] text-muted-foreground px-1">
                      <span>{dailyData[0]?.date}</span>
                      <span>{dailyData[dailyData.length - 1]?.date}</span>
                    </div>

                    {/* Summary stats */}
                    <div className="flex gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
                      <span>
                        Total: <strong className="text-foreground">
                          {dailyData.reduce((s, d) => s + d.mm, 0).toFixed(1)}mm
                        </strong>
                      </span>
                      <span>
                        Avg/day: <strong className="text-foreground">
                          {(dailyData.reduce((s, d) => s + d.mm, 0) / dailyData.length).toFixed(2)}mm
                        </strong>
                      </span>
                      <span>
                        Peak: <strong className="text-foreground">
                          {Math.max(...dailyData.map(d => d.mm)).toFixed(1)}mm
                        </strong>
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm py-12 text-center">
                    Daily data not available for this district.
                  </p>
                )}
              </div>
            )}

          </CardContent>
        </Card>

        {/* ── CROP SUITABILITY + FERTILIZER CALENDAR ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Crop Suitability for {forecast}mm/yr</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {cropSuitability.length > 0 ? cropSuitability.map(c => (
                <div key={c.crop} className="flex items-center gap-3">
                  <span className="text-lg">{c.emoji}</span>
                  <span className="text-sm flex-1">{c.crop}</span>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${c.suitability}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-primary w-8 text-right">
                    {c.suitability}%
                  </span>
                </div>
              )) : (
                <p className="text-muted-foreground text-sm">No suitability data.</p>
              )}
            </CardContent>
          </Card>

          {fertilizerCal.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Fertilizer Calendar — {data.seasonLabel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fertilizerCal.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex items-center justify-center h-6 w-16 rounded-full
                                    bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {item.month}
                    </div>
                    <p className="text-sm text-foreground">{item.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>

      </main>
    </div>
  );
}