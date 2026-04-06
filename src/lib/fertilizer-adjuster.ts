/**
 * Fertilizer Adjuster
 * Ported from Python fertilizer_adjuster.py
 * Adjusts fertilizer recommendations based on predicted seasonal rainfall.
 * Standard recommendations are modified based on how much rain is expected,
 * which affects nutrient leaching.
 */

export interface ApplicationStep {
  timing: string;
  action: string;
  note: string;
}

export interface FertilizerAdjustment {
  rainfallBand: string;
  rainfallMm: number;
  basalNpkKgHa: number;
  ureaKgHa: number;
  applicationMethod: string;
  splits: number;
  plan: ApplicationStep[];
  warnings: string[];
  organicAdvice: string;
}

// Base NPK rates per crop (kg/ha) — from the Python model
const BASE_RATES: Record<string, { basal_npk: number; urea: number }> = {
  maize:        { basal_npk: 200, urea: 100 },
  rice:         { basal_npk: 150, urea: 80 },
  wheat:        { basal_npk: 150, urea: 100 },
  beans:        { basal_npk: 100, urea: 0 },   // legume — fixes own N
  "kidney beans": { basal_npk: 100, urea: 0 },
  soybean:      { basal_npk: 100, urea: 0 },
  soybeans:     { basal_npk: 100, urea: 0 },
  groundnuts:   { basal_npk: 100, urea: 0 },
  cassava:      { basal_npk: 100, urea: 40 },
  sorghum:      { basal_npk: 100, urea: 60 },
  millet:       { basal_npk: 80,  urea: 50 },
  cotton:       { basal_npk: 150, urea: 120 },
  sugarcane:    { basal_npk: 200, urea: 150 },
  tomato:       { basal_npk: 150, urea: 80 },
  potato:       { basal_npk: 200, urea: 80 },
  "sweet potato": { basal_npk: 100, urea: 40 },
  tobacco:      { basal_npk: 150, urea: 100 },
  banana:       { basal_npk: 180, urea: 100 },
  coffee:       { basal_npk: 200, urea: 120 },
  tea:          { basal_npk: 200, urea: 130 },
  "pigeon peas": { basal_npk: 100, urea: 0 },
  chickpea:     { basal_npk: 100, urea: 0 },
  lentil:       { basal_npk: 100, urea: 0 },
  watermelon:   { basal_npk: 150, urea: 80 },
  mango:        { basal_npk: 120, urea: 60 },
  papaya:       { basal_npk: 150, urea: 80 },
  sunflower:    { basal_npk: 120, urea: 60 },
};

// Adjustments by rainfall band
const ADJUSTMENTS: Record<string, { npkFactor: number; ureaFactor: number; split: number; method: string }> = {
  "Very Low":  { npkFactor: 0.6, ureaFactor: 0.5, split: 1, method: "micro-dosing" },
  "Low":       { npkFactor: 0.8, ureaFactor: 0.7, split: 1, method: "standard" },
  "Moderate":  { npkFactor: 1.0, ureaFactor: 1.0, split: 2, method: "standard" },
  "High":      { npkFactor: 1.0, ureaFactor: 1.0, split: 3, method: "split" },
  "Very High": { npkFactor: 1.0, ureaFactor: 0.8, split: 3, method: "slow-release" },
};

export function getRainfallBand(mm: number): string {
  if (mm < 400) return "Very Low";
  if (mm < 650) return "Low";
  if (mm < 950) return "Moderate";
  if (mm < 1400) return "High";
  return "Very High";
}

export function getBandDescription(mm: number): string {
  if (mm < 400) return "Very low rainfall. Only grow drought-resistant crops like sorghum or millet.";
  if (mm < 650) return "Low rainfall. Use micro-dosing fertilizer technique. Drought-tolerant crops recommended.";
  if (mm < 950) return "Moderate rainfall. Good for maize, beans, groundnuts. Standard NPK applies.";
  if (mm < 1400) return "High rainfall. Split nitrogen fertilizer to prevent leaching. Maize and rice do well.";
  return "Very high rainfall. Use slow-release fertilizer. Waterlogging risk — use raised beds.";
}

function buildPlan(npkRate: number, ureaRate: number, splits: number, band: string, method: string): ApplicationStep[] {
  const plan: ApplicationStep[] = [];

  if (method === "micro-dosing") {
    plan.push({
      timing: "At planting",
      action: `Apply ${npkRate} kg/ha NPK — place it in the planting hole near the seed, not broadcast.`,
      note: "Micro-dosing saves fertilizer in dry conditions. A small amount near the root is better than a large amount spread out."
    });
    if (ureaRate > 0) {
      plan.push({
        timing: "4–5 weeks after planting",
        action: `Apply ${ureaRate} kg/ha Urea — only if rain has fallen that week.`,
        note: "Never apply Urea to dry soil. It burns the plant and wastes money."
      });
    }
  } else if (method === "slow-release") {
    plan.push({
      timing: "At planting",
      action: `Apply ${npkRate} kg/ha NPK basal fertilizer.`,
      note: "In very high rainfall, use coated or slow-release Urea to reduce leaching."
    });
    if (ureaRate > 0) {
      const perSplit = Math.round(ureaRate / splits);
      for (let i = 0; i < splits; i++) {
        plan.push({
          timing: `Top-dressing ${i + 1} — ${(i + 1) * 3} weeks after planting`,
          action: `Apply ${perSplit} kg/ha Urea.`,
          note: "Small split applications prevent nitrogen washing away in heavy rains."
        });
      }
    }
  } else {
    // Standard or split
    plan.push({
      timing: "At planting",
      action: `Apply ${npkRate} kg/ha NPK (23:21:0) basal fertilizer.`,
      note: "Apply in planting rows or holes, 5 cm away from seeds."
    });
    if (ureaRate > 0) {
      const perSplit = Math.round(ureaRate / splits);
      for (let i = 0; i < splits; i++) {
        plan.push({
          timing: `Top-dressing ${i + 1} — ${4 + i * 3} weeks after planting`,
          action: `Apply ${perSplit} kg/ha Urea or CAN.`,
          note: "Apply after rain when soil is moist. Do not apply if dry spell is expected."
        });
      }
    }
  }

  return plan;
}

function getWarnings(mm: number, band: string, crop: string): string[] {
  const warnings: string[] = [];
  if (mm < 400) {
    warnings.push("Very low rainfall — irrigation is strongly recommended if possible.");
    warnings.push("Do not broadcast fertilizer — it will not dissolve. Use micro-dosing only.");
  }
  if (mm > 1400) {
    warnings.push("High rainfall causes nitrogen to wash away (leaching). Always split Urea applications.");
    warnings.push("Watch for fungal diseases — wet conditions spread disease quickly.");
  }
  if ((band === "High" || band === "Very High") && ["maize", "wheat", "sorghum"].includes(crop.toLowerCase())) {
    warnings.push("Avoid applying all Urea at once — split into 2–3 applications.");
  }
  if (mm < 600 && ["rice", "sugarcane"].includes(crop.toLowerCase())) {
    warnings.push(`Warning: ${crop} normally needs more rainfall than predicted. Consider a different crop.`);
  }
  return warnings;
}

function getOrganicAdvice(band: string): string {
  if (band === "Very Low") {
    return "Add compost or animal manure — organic matter holds water in the soil and reduces need for chemical fertilizer.";
  }
  if (band === "High" || band === "Very High") {
    return "Add compost to improve soil structure. It also helps bind nutrients that would otherwise wash away.";
  }
  return "Add compost or crop residues after harvest to maintain soil organic matter.";
}

/**
 * Adjust fertilizer recommendation based on predicted rainfall
 */
export function adjustForRainfall(rainfallMm: number, crop: string): FertilizerAdjustment {
  const cropKey = crop.toLowerCase().trim();
  const band = getRainfallBand(rainfallMm);
  const rates = BASE_RATES[cropKey] || { basal_npk: 150, urea: 80 };
  const adj = ADJUSTMENTS[band];

  const npkRate = Math.round(rates.basal_npk * adj.npkFactor);
  const ureaRate = Math.round(rates.urea * adj.ureaFactor);
  const plan = buildPlan(npkRate, ureaRate, adj.split, band, adj.method);
  const warnings = getWarnings(rainfallMm, band, crop);

  return {
    rainfallBand: band,
    rainfallMm: Math.round(rainfallMm),
    basalNpkKgHa: npkRate,
    ureaKgHa: ureaRate,
    applicationMethod: adj.method,
    splits: adj.split,
    plan,
    warnings,
    organicAdvice: getOrganicAdvice(band),
  };
}

/**
 * Get soil health alerts from numeric values
 */
export interface SoilAlert {
  type: "danger" | "warning" | "info";
  message: string;
}

export function getSoilAlerts(N: number, P: number, K: number, ph: number, rainfall: number): SoilAlert[] {
  const alerts: SoilAlert[] = [];

  if (ph < 5.5) {
    alerts.push({ type: "danger", message: `Soil is too acidic (pH ${ph}). Add lime before planting.` });
  } else if (ph > 8.0) {
    alerts.push({ type: "danger", message: `Soil is too alkaline (pH ${ph}). Add sulphur to lower pH.` });
  } else if (ph < 6.0) {
    alerts.push({ type: "warning", message: `Soil is slightly acidic (pH ${ph}). Consider adding a small amount of lime.` });
  }

  if (N < 20) {
    alerts.push({ type: "danger", message: "Nitrogen is very low. Plants will grow slowly. Apply Urea or CAN." });
  } else if (N < 40) {
    alerts.push({ type: "warning", message: "Nitrogen is low. Add a nitrogen fertilizer like Urea before planting." });
  }

  if (P < 10) {
    alerts.push({ type: "danger", message: "Phosphorus is very low. Root growth will be poor. Apply TSP or DAP." });
  } else if (P < 20) {
    alerts.push({ type: "warning", message: "Phosphorus is low. Consider applying phosphate fertilizer." });
  }

  if (K < 20) {
    alerts.push({ type: "warning", message: "Potassium is low. Crops will be more susceptible to disease. Apply MOP." });
  }

  if (rainfall < 400) {
    alerts.push({ type: "danger", message: "Very low rainfall expected. Only grow drought-resistant crops like sorghum or millet." });
  } else if (rainfall > 1800) {
    alerts.push({ type: "warning", message: "Very high rainfall expected. Split your fertilizer into smaller amounts to avoid it washing away." });
  }

  return alerts;
}

/**
 * Generate fertilizer calendar based on rainfall forecast
 */
export interface CalendarEntry {
  month: string;
  action: string;
}

export function getFertilizerCalendar(annualMm: number): CalendarEntry[] {
  if (annualMm < 650) {
    return [
      { month: "November", action: "Soil preparation. Add organic matter/compost." },
      { month: "December", action: "Plant seeds. Apply small amount of fertilizer near seed (micro-dosing)." },
      { month: "January", action: "Weed carefully. Check for pests." },
      { month: "February", action: "Apply small top-dressing only if rain is steady." },
      { month: "March", action: "Monitor crop. Avoid fertilizer if soil is dry." },
    ];
  }
  if (annualMm < 950) {
    return [
      { month: "November", action: "Prepare soil. Add lime if pH is low." },
      { month: "December", action: "Plant with basal NPK fertilizer (200 kg/ha)." },
      { month: "January", action: "Weed. Apply Urea top-dressing at 6 weeks (100 kg/ha)." },
      { month: "February", action: "Check for pests and diseases." },
      { month: "March", action: "Second top-dressing if needed." },
    ];
  }
  return [
    { month: "November", action: "Prepare soil. Apply lime if pH below 6." },
    { month: "December", action: "Plant with basal NPK (200 kg/ha). Avoid waterlogging." },
    { month: "January", action: "First Urea top-dressing — apply 50 kg/ha (split application)." },
    { month: "February", action: "Second Urea application 50 kg/ha. Watch for disease in wet conditions." },
    { month: "March", action: "Reduce fertilizer — heavy rain will cause leaching. Focus on pest control." },
  ];
}
