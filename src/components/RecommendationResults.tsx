import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Recommendation, SoilInput, FertilizerPlanItem } from "@/lib/recommendations";
import { generatePDFReport } from "@/lib/pdf-report";
import {
  Download, CloudRain, Sprout, FlaskConical, FileText,
  ArrowLeft, AlertTriangle, CheckCircle, Cpu, RotateCcw,
  Leaf, ShieldAlert,
} from "lucide-react";

interface Props {
  result: Recommendation;
  input: SoilInput;
  onBack: () => void;
}

export default function RecommendationResults({ result, input, onBack }: Props) {
  const alertIcon = (type: string) => {
    if (type === "danger")  return <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />;
    if (type === "warning") return <AlertTriangle className="h-5 w-5 text-yellow-700 shrink-0" />;
    return <CheckCircle className="h-5 w-5 text-primary shrink-0" />;
  };

  const crops      = result.crops ?? [];
  const soilAlerts = result.soilAlerts ?? [];
  const farmerCtx  = result.farmerContext ?? null;
  const mlPrediction = result.mlPrediction ?? null;
  const mlCrop = mlPrediction?.topCrop ?? null;
  const mlConf = mlPrediction?.topConf ?? null;
  const mlAlgorithm = mlPrediction?.algorithm ?? "Random Forest";

  // Base text class — professional, readable, high contrast
  const bodyText = "text-base leading-relaxed text-slate-900 dark:text-slate-100";
  const labelText = "text-sm font-semibold text-slate-700 dark:text-slate-300";

  const renderFertilizerPlan = (
    plan: import("@/lib/recommendations").FertilizerPlan,
    cropName: string
  ) => {
    const hasItems    = (plan.items ?? []).length > 0;
    const hasLegacy   = !!(plan.basal || plan.topdress);
    const hasWarnings = (plan.warnings ?? []).length > 0;
    if (!hasItems && !hasLegacy) return null;

    return (
      <div className="mt-6 rounded-lg border-2 border-primary/30 bg-primary/5 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <FlaskConical className="h-6 w-6 text-primary" />
          <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Fertilizer Plan for {cropName}
          </h4>
          {plan.confidence && (
            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
              plan.confidence.score >= 85
                ? "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200"
                : plan.confidence.score >= 70
                ? "bg-primary/15 text-primary"
                : "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/40 dark:text-yellow-200"
            }`}>
              {plan.confidence.label}
            </span>
          )}
        </div>

        {/* Rich plan items */}
        {hasItems && (
          <div className="space-y-3">
            {plan.items!.map((item: FertilizerPlanItem, j: number) => (
              <div key={j} className="rounded-md border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge variant="default" className="text-sm px-3 py-1">{item.timing}</Badge>
                  <span className="text-base font-bold text-primary">{item.applicationRate}</span>
                </div>
                <p className={`${bodyText} font-semibold`}>{item.type}</p>
                {item.notes && <p className={bodyText}>{item.notes}</p>}
                {item.alternative && (
                  <p className="text-base text-slate-800 dark:text-slate-200">
                    <span className="font-semibold">Alternative:</span> {item.alternative}
                  </p>
                )}
                {item.confidence && (
                  <Badge variant="secondary" className="text-xs">{item.confidence}</Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legacy fields */}
        {!hasItems && hasLegacy && (
          <div className="space-y-2">
            {plan.basal && (
              <p className={bodyText}>
                <span className={labelText}>Basal:</span> {plan.basal}
                {plan.basal_rate && <span className="text-primary font-semibold"> @ {plan.basal_rate}</span>}
              </p>
            )}
            {plan.topdress && (
              <p className={bodyText}>
                <span className={labelText}>Top-dress:</span> {plan.topdress}
                {plan.topdress_rate && <span className="text-primary font-semibold"> @ {plan.topdress_rate}</span>}
              </p>
            )}
            {plan.topdress_timing && (
              <p className={bodyText}>
                <span className={labelText}>Timing:</span> {plan.topdress_timing}
              </p>
            )}
            {plan.notes && <p className={bodyText}>{plan.notes}</p>}
          </div>
        )}

        {plan.organicAdvice && (
          <div className="flex gap-3 rounded-md bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800">
            <Leaf className="h-5 w-5 text-green-700 dark:text-green-300 shrink-0 mt-0.5" />
            <p className="text-base text-green-900 dark:text-green-100">{plan.organicAdvice}</p>
          </div>
        )}

        {hasWarnings && (
          <div className="space-y-2">
            {plan.warnings!.map((w, k) => (
              <div key={k} className="flex gap-2 items-start rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-800">
                <ShieldAlert className="h-5 w-5 text-yellow-700 dark:text-yellow-300 shrink-0 mt-0.5" />
                <p className="text-base text-yellow-900 dark:text-yellow-100">{w}</p>
              </div>
            ))}
          </div>
        )}

        {plan.confidence?.message && (
          <p className="text-sm italic text-slate-700 dark:text-slate-300">{plan.confidence.message}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header actions */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <Button onClick={onBack} variant="outline" size="lg" className="text-base">
          <ArrowLeft className="h-5 w-5 mr-2" /> New Analysis
        </Button>
        <Button
          onClick={() => generatePDFReport(input, result)}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 text-base"
        >
          <Download className="h-5 w-5 mr-2" /> Download PDF Report
        </Button>
      </div>

      {/* ML Prediction */}
      {mlCrop && (
        <Card className="border-2 border-primary/40 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-5">
            <Cpu className="h-6 w-6 text-primary mt-1" />
            <div>
              <p className="text-lg">
                <span className="font-bold">ML Model Prediction:</span>{" "}
                <span className="font-bold text-primary">{mlCrop}</span>
                {mlConf !== null && <span className="ml-2 text-base text-slate-700 dark:text-slate-300">({mlConf}% confidence)</span>}
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">Algorithm: {mlAlgorithm}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Farmer context */}
      {farmerCtx && (
        <div className="flex flex-wrap gap-2">
          {farmerCtx.landUseLabel && <Badge variant="secondary" className="text-base px-3 py-1">🌾 Goal: {farmerCtx.landUseLabel}</Badge>}
          {farmerCtx.previousCrop && <Badge variant="secondary" className="text-base px-3 py-1">Previous: {farmerCtx.previousCrop}</Badge>}
        </div>
      )}

      {/* Rainfall & Soil */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CloudRain className="h-6 w-6 text-primary" />
              Rainfall Forecast — {input.district.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-4xl font-bold text-primary">{result.forecastedRainfall} mm</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="text-base px-3 py-1">{result.rainfallCategory} Rainfall</Badge>
              <span className="text-base text-slate-700 dark:text-slate-300">{result.rainfallBand}</span>
            </div>
            <p className={bodyText}>{result.rainfallBandDescription}</p>
            {result.rainfallSource && (
              <p className="text-sm text-slate-600 dark:text-slate-400">Source: {result.rainfallSource}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sprout className="h-6 w-6 text-primary" /> Soil Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={bodyText}>{result.soilAssessment}</p>
          </CardContent>
        </Card>
      </div>

      {/* Soil Alerts */}
      {soilAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6 text-yellow-700" /> Soil Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {soilAlerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-muted/40">
                {alertIcon(alert.type)}
                <p className={bodyText}>{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rotation tip */}
      {farmerCtx?.rotationTip && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="flex gap-3 p-5">
            <RotateCcw className="h-6 w-6 text-primary mt-1" />
            <div>
              <p className="text-lg font-bold">Crop Rotation Tip</p>
              <p className={`${bodyText} mt-1`}>{farmerCtx.rotationTip}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crop Recommendations */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sprout className="h-7 w-7 text-primary" /> Top Crop Recommendations
        </h2>

        <div className="space-y-4">
          {crops.map((crop, i) => {
            const hasFert = !!(
              (crop.fertilizerPlan?.items ?? []).length > 0 ||
              crop.fertilizerPlan?.basal ||
              crop.fertilizerPlan?.topdress
            );

            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <span className="text-5xl">{crop.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-2xl font-bold">{crop.crop}</h3>
                          {i === 0 && <Badge className="text-sm">Top Pick</Badge>}
                          <span className="text-base text-slate-700 dark:text-slate-300">{crop.season}</span>
                        </div>
                        <p className={`${bodyText} mt-2`}>{crop.reason}</p>
                      </div>
                      <span className="text-2xl font-bold text-primary">{crop.score}%</span>
                    </div>

                    {hasFert && renderFertilizerPlan(crop.fertilizerPlan, crop.crop)}

                    {crop.rotationAdvice && (
                      <div className="mt-4 rounded-md border border-border bg-muted/30 p-4 space-y-2">
                        <p className="text-lg font-bold">
                          {crop.rotationAdvice.type === "warning" ? "⚠ Rotation Warning"
                            : crop.rotationAdvice.type === "positive" ? "✓ Good Rotation"
                            : "ℹ Rotation Info"}
                        </p>
                        <p className={bodyText}>{crop.rotationAdvice.message}</p>
                        <p className={`${bodyText} font-medium`}>{crop.rotationAdvice.recommendation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom download */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={() => generatePDFReport(input, result)}
          variant="outline"
          size="lg"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base"
        >
          <FileText className="h-5 w-5 mr-2" /> Download Full Report (PDF)
        </Button>
      </div>
    </div>
  );
}
