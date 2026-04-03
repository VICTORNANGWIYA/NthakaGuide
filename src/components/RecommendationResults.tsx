import { motion } from "framer-motion";
import { Button }                                  from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge }                                   from "@/components/ui/badge";
import { Progress }                                from "@/components/ui/progress";
import type { Recommendation, SoilInput }          from "@/lib/recommendations";
import { generatePDFReport }                       from "@/lib/pdf-report";
import {
  Download, CloudRain, Sprout, FlaskConical, FileText,
  ArrowLeft, AlertTriangle, CheckCircle, Cpu,
  TrendingUp, Bug, RotateCcw,
} from "lucide-react";

interface Props {
  result: Recommendation;
  input:  SoilInput;
  onBack: () => void;
}

export default function RecommendationResults({ result, input, onBack }: Props) {

  const alertIcon = (type: string) => {
    if (type === "danger")  return <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />;
    if (type === "warning") return <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />;
    return <CheckCircle className="h-4 w-4 text-primary shrink-0" />;
  };

  const crops        = result.crops      ?? [];
  const soilAlerts   = result.soilAlerts ?? [];
  const farmerCtx    = result.farmerContext ?? null;

  const mlPrediction = result.mlPrediction ?? null;
  const mlCrop       = mlPrediction?.topCrop  ?? null;
  const mlConf       = mlPrediction?.topConf  ?? null;
  const mlAlgorithm  = mlPrediction?.algorithm ?? "Random Forest";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >

      {/* ── Header actions ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> New Analysis
        </Button>
        <Button
          onClick={() => generatePDFReport(input, result)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="mr-2 h-4 w-4" /> Download PDF Report
        </Button>
      </div>

      {/* ── ML Prediction badge ────────────────────────────────────── */}
      {mlCrop && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Cpu className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                ML Model Prediction:{" "}
                <span className="text-primary">{mlCrop}</span>
                {mlConf !== null && (
                  <span className="text-muted-foreground ml-2">({mlConf}% confidence)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Algorithm: {mlAlgorithm}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Farmer context banner ──────────────────────────────────── */}
      {farmerCtx && (
        <div className="flex flex-wrap gap-2 items-center text-xs">
          {farmerCtx.landUseLabel && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              🌾 Goal: {farmerCtx.landUseLabel}
            </span>
          )}
          {farmerCtx.previousCrop && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
              <RotateCcw className="h-3 w-3" /> Previous: {farmerCtx.previousCrop}
            </span>
          )}
        </div>
      )}

      {/* ── Rainfall & Soil Assessment ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <CloudRain className="h-4 w-4" /> Rainfall Forecast — {input.district.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {result.forecastedRainfall} mm
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge
                variant={
                  result.rainfallCategory === "High"     ? "default"
                  : result.rainfallCategory === "Low"    ? "destructive"
                  : "secondary"
                }
              >
                {result.rainfallCategory} Rainfall
              </Badge>
              <Badge variant="outline">{result.rainfallBand}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {result.rainfallBandDescription}
            </p>
            {result.rainfallSource && (
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                Source: {result.rainfallSource}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" /> Soil Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {result.soilAssessment}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Soil Alerts ────────────────────────────────────────────── */}
      {soilAlerts.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" /> Soil Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {soilAlerts.map((alert, i) => (
              <div
                key={i}
                className={`flex gap-2 items-start p-2 rounded-md text-sm ${
                  alert.type === "danger"
                    ? "bg-destructive/5 text-destructive"
                    : alert.type === "warning"
                    ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                    : "bg-primary/5 text-primary"
                }`}
              >
                {alertIcon(alert.type)}
                <span>{alert.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── General rotation tip ───────────────────────────────────── */}
      {farmerCtx?.rotationTip && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <CardContent className="p-4 flex gap-3 items-start">
            <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Crop Rotation Tip
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                {farmerCtx.rotationTip}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Crop Recommendations ───────────────────────────────────── */}
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" /> Top Crop Recommendations
        </h2>

        <div className="space-y-4">
          {crops.map((crop, i) => {
            const hasFert  = crop.fertilizerPlan && Object.keys(crop.fertilizerPlan).length > 0;
            const hasYield = !!crop.yieldPrediction;
            const hasPests = (crop.pestDiseaseRisk?.risks?.length ?? 0) > 0;
            const riskLevel = crop.pestDiseaseRisk?.summary?.level ?? "No Data";
            const riskColor =
              riskLevel === "High Risk"   ? "text-destructive"
              : riskLevel === "Medium Risk" ? "text-yellow-600"
              : "text-muted-foreground";

            return (
              <motion.div
                key={`${crop.crop}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className={`bg-card border-border hover:shadow-md transition-shadow ${
                  i === 0 ? "border-primary/30" : ""
                }`}>
                  <CardContent className="p-4 space-y-4">

                    {/* Crop header */}
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{crop.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground text-base">{crop.crop}</h3>
                            {i === 0 && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                                Top Pick
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">{crop.season}</Badge>
                        </div>
                        <Progress value={crop.score ?? 0} className="h-2 mb-1.5" />
                        <p className="text-xs text-muted-foreground">{crop.reason}</p>
                      </div>
                      <span className="text-lg font-bold text-primary tabular-nums shrink-0">
                        {crop.score}%
                      </span>
                    </div>

                    {/* Yield Prediction */}
                    {hasYield && (
                      <div className="rounded-md bg-muted/50 p-3 space-y-1">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-primary" /> Yield Prediction
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                          <span>
                            Predicted:{" "}
                            <strong className="text-foreground">
                              {crop.yieldPrediction.predicted_tha} {crop.yieldPrediction.unit}
                            </strong>
                          </span>
                          <span>
                            Potential:{" "}
                            <strong className="text-foreground">
                              {crop.yieldPrediction.potential_tha} {crop.yieldPrediction.unit}
                            </strong>
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {crop.yieldPrediction.yield_category}
                          </Badge>
                        </div>
                        {(crop.yieldPrediction.limiting_factors ?? []).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ⚠ {crop.yieldPrediction.limiting_factors.join(" · ")}
                          </p>
                        )}
                        {(crop.yieldPrediction.improvement_tips ?? []).length > 0 && (
                          <p className="text-xs text-primary">
                            ✓ {crop.yieldPrediction.improvement_tips[0]}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Fertilizer Plan */}
                    {hasFert && (
                      <div className="rounded-md border border-border p-3 space-y-2">
                        <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                          <FlaskConical className="h-3.5 w-3.5 text-primary" />
                          Fertilizer Plan for {crop.crop}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {crop.fertilizerPlan.basal && (
                            <div>
                              <span className="text-muted-foreground">Basal:</span>{" "}
                              <strong className="text-foreground">{crop.fertilizerPlan.basal}</strong>
                              {crop.fertilizerPlan.basal_rate && (
                                <span className="text-muted-foreground"> @ {crop.fertilizerPlan.basal_rate}</span>
                              )}
                            </div>
                          )}
                          {crop.fertilizerPlan.topdress && (
                            <div>
                              <span className="text-muted-foreground">Top-dress:</span>{" "}
                              <strong className="text-foreground">{crop.fertilizerPlan.topdress}</strong>
                              {crop.fertilizerPlan.topdress_rate && (
                                <span className="text-muted-foreground"> @ {crop.fertilizerPlan.topdress_rate}</span>
                              )}
                            </div>
                          )}
                          {crop.fertilizerPlan.topdress_timing && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Timing:</span>{" "}
                              <span className="text-foreground">{crop.fertilizerPlan.topdress_timing}</span>
                            </div>
                          )}
                        </div>
                        {crop.fertilizerPlan.notes && (
                          <p className="text-xs text-muted-foreground border-t border-border pt-2">
                            {crop.fertilizerPlan.notes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Pest & Disease Risk */}
                    {hasPests && (
                      <div className="rounded-md border border-border p-3 space-y-2">
                        <p className={`text-xs font-semibold flex items-center gap-1 ${riskColor}`}>
                          <Bug className="h-3.5 w-3.5" />
                          Pest & Disease Risk — {riskLevel}
                        </p>
                        {crop.pestDiseaseRisk.risks.map((risk, j) => (
                          <div key={j} className="text-xs space-y-0.5 border-t border-border pt-2 first:border-0 first:pt-0">
                            <p className="font-semibold text-foreground">
                              {risk.name}
                              <Badge variant="outline" className="ml-2 text-xs">{risk.risk_level}</Badge>
                            </p>
                            <p className="text-muted-foreground">{risk.symptoms}</p>
                            <p className="text-foreground">{risk.action}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rotation Advice */}
                    {crop.rotationAdvice && (
                      <div className={`rounded-md p-3 space-y-1 text-xs border ${
                        crop.rotationAdvice.type === "warning"
                          ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                          : crop.rotationAdvice.type === "positive"
                          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                          : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                      }`}>
                        <p className={`font-semibold flex items-center gap-1 ${
                          crop.rotationAdvice.type === "warning"
                            ? "text-yellow-800 dark:text-yellow-300"
                            : crop.rotationAdvice.type === "positive"
                            ? "text-green-800 dark:text-green-300"
                            : "text-blue-800 dark:text-blue-300"
                        }`}>
                          <RotateCcw className="h-3 w-3" />
                          {crop.rotationAdvice.type === "warning"
                            ? "⚠ Rotation Warning"
                            : crop.rotationAdvice.type === "positive"
                            ? "✓ Good Rotation"
                            : "ℹ Rotation Info"}
                        </p>
                        <p className={
                          crop.rotationAdvice.type === "warning"
                            ? "text-yellow-700 dark:text-yellow-400"
                            : crop.rotationAdvice.type === "positive"
                            ? "text-green-700 dark:text-green-400"
                            : "text-blue-700 dark:text-blue-400"
                        }>
                          {crop.rotationAdvice.message}
                        </p>
                        <p className="text-muted-foreground italic">
                          {crop.rotationAdvice.recommendation}
                        </p>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom download ────────────────────────────────────────── */}
      <div className="text-center pt-4 pb-8">
        <Button
          onClick={() => generatePDFReport(input, result)}
          variant="outline"
          size="lg"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Download className="mr-2 h-4 w-4" /> Download Full Report (PDF)
        </Button>
      </div>

    </motion.div>
  );
}