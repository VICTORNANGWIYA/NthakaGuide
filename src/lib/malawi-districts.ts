export interface District {
  name: string;
  region: "Northern" | "Central" | "Southern";
  avgRainfallMm: number; // historical avg annual rainfall
  rainfallCategory: "Low" | "Moderate" | "High";
}

export const MALAWI_DISTRICTS: District[] = [
  // Northern Region
  { name: "Chitipa", region: "Northern", avgRainfallMm: 1100, rainfallCategory: "High" },
  { name: "Karonga", region: "Northern", avgRainfallMm: 950, rainfallCategory: "Moderate" },
  { name: "Likoma", region: "Northern", avgRainfallMm: 1050, rainfallCategory: "High" },
  { name: "Mzimba", region: "Northern", avgRainfallMm: 900, rainfallCategory: "Moderate" },
  { name: "Nkhata Bay", region: "Northern", avgRainfallMm: 1400, rainfallCategory: "High" },
  { name: "Rumphi", region: "Northern", avgRainfallMm: 850, rainfallCategory: "Moderate" },
  // Central Region
  { name: "Dedza", region: "Central", avgRainfallMm: 1000, rainfallCategory: "Moderate" },
  { name: "Dowa", region: "Central", avgRainfallMm: 850, rainfallCategory: "Moderate" },
  { name: "Kasungu", region: "Central", avgRainfallMm: 800, rainfallCategory: "Moderate" },
  { name: "Lilongwe", region: "Central", avgRainfallMm: 850, rainfallCategory: "Moderate" },
  { name: "Mchinji", region: "Central", avgRainfallMm: 900, rainfallCategory: "Moderate" },
  { name: "Nkhotakota", region: "Central", avgRainfallMm: 1300, rainfallCategory: "High" },
  { name: "Ntcheu", region: "Central", avgRainfallMm: 950, rainfallCategory: "Moderate" },
  { name: "Ntchisi", region: "Central", avgRainfallMm: 1000, rainfallCategory: "Moderate" },
  { name: "Salima", region: "Central", avgRainfallMm: 900, rainfallCategory: "Moderate" },
  // Southern Region
  { name: "Balaka", region: "Southern", avgRainfallMm: 800, rainfallCategory: "Low" },
  { name: "Blantyre", region: "Southern", avgRainfallMm: 1100, rainfallCategory: "High" },
  { name: "Chikwawa", region: "Southern", avgRainfallMm: 700, rainfallCategory: "Low" },
  { name: "Chiradzulu", region: "Southern", avgRainfallMm: 1050, rainfallCategory: "High" },
  { name: "Machinga", region: "Southern", avgRainfallMm: 850, rainfallCategory: "Moderate" },
  { name: "Mangochi", region: "Southern", avgRainfallMm: 800, rainfallCategory: "Low" },
  { name: "Mulanje", region: "Southern", avgRainfallMm: 1600, rainfallCategory: "High" },
  { name: "Mwanza", region: "Southern", avgRainfallMm: 750, rainfallCategory: "Low" },
  { name: "Neno", region: "Southern", avgRainfallMm: 900, rainfallCategory: "Moderate" },
  { name: "Nsanje", region: "Southern", avgRainfallMm: 700, rainfallCategory: "Low" },
  { name: "Phalombe", region: "Southern", avgRainfallMm: 1200, rainfallCategory: "High" },
  { name: "Thyolo", region: "Southern", avgRainfallMm: 1300, rainfallCategory: "High" },
  { name: "Zomba", region: "Southern", avgRainfallMm: 1100, rainfallCategory: "High" },
];

export function getDistrictByName(name: string): District | undefined {
  return MALAWI_DISTRICTS.find(d => d.name === name);
}

/** EWMA-based rainfall forecast (simplified) */
export function forecastRainfall(historicalAvg: number, alpha = 0.3): number {
  // Simulates EWMA with seasonal variation
  const seasonalFactor = 0.95 + Math.random() * 0.1; // ±5% variation
  return Math.round(historicalAvg * seasonalFactor * (1 - alpha) + historicalAvg * alpha);
}
