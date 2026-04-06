import { type District } from "./malawi-districts";
import { CROP_STATISTICS, MALAWI_CROP_MAP } from "./crop-dataset";

export interface SoilInput {
  nitrogen:      number;
  phosphorus:    number;
  potassium:     number;
  ph:            number;
  moisture:      number;
  temperature:   number;
  organicMatter: number;
  district:      District;
  landUse?:      string;
  previousCrop?: string;
}

export interface RotationAdvice {
  type:           "warning" | "positive" | "info";
  message:        string;
  recommendation: string;
}

export interface FertilizerPlan {
  basal?:           string;
  basal_rate?:      string;
  topdress?:        string;
  topdress_rate?:   string;
  topdress_timing?: string;
  notes?:           string;
}

export interface YieldPrediction {
  predicted_tha:    number;
  potential_tha:    number;
  yield_category:   string;
  yield_gap_tha:    number;
  limiting_factors: string[];
  improvement_tips: string[];
  unit:             string;
}

export interface PestRisk {
  name:        string;
  risk_level:  string;
  risk_score:  number;
  symptoms:    string;
  action:      string;
}

export interface PestDiseaseRisk {
  summary: { level: string; message: string; icon?: string };
  risks:   PestRisk[];
}

export interface SoilAlert {
  type:    "danger" | "warning" | "info";
  message: string;
  icon?:   string;
}

export interface CropRecommendation {
  crop:            string;
  score:           number;
  confidence:      number;
  reason:          string;
  season:          string;
  emoji:           string;
  fertilizerPlan:  FertilizerPlan;
  yieldPrediction: YieldPrediction;
  pestDiseaseRisk: PestDiseaseRisk;
  rotationAdvice:  RotationAdvice | null;
}

export interface FarmerContext {
  landUse:      string;
  landUseLabel: string;
  previousCrop: string | null;
  rotationTip:  string | null;
}

export interface Recommendation {
  crops:                   CropRecommendation[];
  forecastedRainfall:      number;
  rainfallCategory:        string;
  rainfallBand:            string;
  rainfallBandDescription: string;
  rainfallSource:          string;
  soilAssessment:          string;
  soilAlerts:              SoilAlert[];
  farmerContext:           FarmerContext;
  districtInfo:            { district: string; climateZone: string; zoneDescription: string };
  mlPrediction: {
    algorithm: string;
    topCrop:   string | null;
    topConf:   number | null;
  } | null;
}

export const CROP_PROFILES = CROP_STATISTICS.map(c => ({
  name:               MALAWI_CROP_MAP[c.label] || c.label,
  emoji:              c.emoji,
  season:             c.season,
  nRange:             [c.features.N.mean - c.features.N.std,                   c.features.N.mean + c.features.N.std]                   as [number, number],
  pRange:             [c.features.P.mean - c.features.P.std,                   c.features.P.mean + c.features.P.std]                   as [number, number],
  kRange:             [c.features.K.mean - c.features.K.std,                   c.features.K.mean + c.features.K.std]                   as [number, number],
  phRange:            [c.features.ph.mean - c.features.ph.std,                 c.features.ph.mean + c.features.ph.std]                 as [number, number],
  moistureRange:      [c.features.humidity.mean - c.features.humidity.std,     c.features.humidity.mean + c.features.humidity.std]     as [number, number],
  tempRange:          [c.features.temperature.mean - c.features.temperature.std, c.features.temperature.mean + c.features.temperature.std] as [number, number],
  rainfallRange:      [c.features.rainfall.mean - c.features.rainfall.std,     c.features.rainfall.mean + c.features.rainfall.std]     as [number, number],
  rainfallPreference: ["Moderate"] as ("Low" | "Moderate" | "High")[],
}));

export async function generateRecommendations(
  input: SoilInput,
  token?: string,
): Promise<Recommendation> {

  const res = await fetch("http://localhost:5000/api/recommend", {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      nitrogen:      input.nitrogen,
      phosphorus:    input.phosphorus,
      potassium:     input.potassium,
      ph:            input.ph,
      moisture:      input.moisture,
      temperature:   input.temperature,
      organicMatter: input.organicMatter,
      districtName:  input.district.name,
      landUse:       input.landUse      ?? "food",
      previousCrop:  input.previousCrop ?? "",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || "Recommendation failed");
  }

  return data as Recommendation;
}