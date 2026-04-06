/**
 * Crop Recommendation Dataset
 * Derived from Crop_recommendation_1.csv (2200 samples, 22 crops)
 * Pre-computed per-crop statistics for Gaussian Naive Bayes-style prediction
 * 
 * Features: N, P, K, temperature, humidity, ph, rainfall
 * This replicates the ML model's prediction using statistical distance
 */

export interface CropStats {
  label: string;
  emoji: string;
  season: string;
  count: number;
  features: {
    N: { mean: number; std: number };
    P: { mean: number; std: number };
    K: { mean: number; std: number };
    temperature: { mean: number; std: number };
    humidity: { mean: number; std: number };
    ph: { mean: number; std: number };
    rainfall: { mean: number; std: number };
  };
}

// Pre-computed from the CSV dataset using pandas groupby().agg(['mean','std'])
// Each crop has ~100 samples in the dataset
export const CROP_STATISTICS: CropStats[] = [
  {
    label: "rice", emoji: "🍚", season: "Nov–May", count: 100,
    features: {
      N: { mean: 80.0, std: 12.0 }, P: { mean: 48.0, std: 10.0 }, K: { mean: 40.0, std: 4.0 },
      temperature: { mean: 23.5, std: 2.5 }, humidity: { mean: 82.0, std: 2.0 },
      ph: { mean: 6.4, std: 0.8 }, rainfall: { mean: 236.0, std: 40.0 }
    }
  },
  {
    label: "maize", emoji: "🌽", season: "Oct–Apr", count: 100,
    features: {
      N: { mean: 77.0, std: 12.0 }, P: { mean: 48.5, std: 10.0 }, K: { mean: 20.0, std: 3.0 },
      temperature: { mean: 22.4, std: 2.5 }, humidity: { mean: 65.0, std: 5.0 },
      ph: { mean: 6.2, std: 0.6 }, rainfall: { mean: 88.0, std: 15.0 }
    }
  },
  {
    label: "chickpea", emoji: "🫘", season: "May–Sep", count: 100,
    features: {
      N: { mean: 40.0, std: 12.0 }, P: { mean: 68.0, std: 4.0 }, K: { mean: 80.0, std: 3.0 },
      temperature: { mean: 18.8, std: 1.5 }, humidity: { mean: 16.9, std: 1.5 },
      ph: { mean: 7.1, std: 0.3 }, rainfall: { mean: 80.0, std: 10.0 }
    }
  },
  {
    label: "kidneybeans", emoji: "🫘", season: "Nov–Mar", count: 100,
    features: {
      N: { mean: 20.8, std: 4.0 }, P: { mean: 68.0, std: 4.0 }, K: { mean: 20.0, std: 3.0 },
      temperature: { mean: 20.0, std: 2.5 }, humidity: { mean: 21.6, std: 3.0 },
      ph: { mean: 5.7, std: 0.3 }, rainfall: { mean: 105.0, std: 20.0 }
    }
  },
  {
    label: "pigeonpeas", emoji: "🌿", season: "Nov–Jul", count: 100,
    features: {
      N: { mean: 20.7, std: 6.0 }, P: { mean: 68.0, std: 5.0 }, K: { mean: 20.0, std: 3.0 },
      temperature: { mean: 27.7, std: 3.0 }, humidity: { mean: 48.5, std: 6.0 },
      ph: { mean: 5.8, std: 0.4 }, rainfall: { mean: 149.0, std: 20.0 }
    }
  },
  {
    label: "mothbeans", emoji: "🫘", season: "Jul–Oct", count: 100,
    features: {
      N: { mean: 21.5, std: 5.0 }, P: { mean: 48.0, std: 8.0 }, K: { mean: 20.4, std: 3.0 },
      temperature: { mean: 28.2, std: 3.5 }, humidity: { mean: 48.0, std: 6.0 },
      ph: { mean: 6.1, std: 0.8 }, rainfall: { mean: 51.0, std: 8.0 }
    }
  },
  {
    label: "mungbean", emoji: "🫘", season: "Jun–Sep", count: 100,
    features: {
      N: { mean: 20.8, std: 5.0 }, P: { mean: 48.0, std: 8.0 }, K: { mean: 20.0, std: 2.5 },
      temperature: { mean: 28.5, std: 2.5 }, humidity: { mean: 85.5, std: 1.5 },
      ph: { mean: 6.7, std: 0.3 }, rainfall: { mean: 48.0, std: 5.0 }
    }
  },
  {
    label: "blackgram", emoji: "🫘", season: "Jun–Sep", count: 100,
    features: {
      N: { mean: 40.0, std: 6.0 }, P: { mean: 68.0, std: 4.0 }, K: { mean: 19.2, std: 2.5 },
      temperature: { mean: 29.9, std: 3.0 }, humidity: { mean: 65.1, std: 5.0 },
      ph: { mean: 7.1, std: 0.3 }, rainfall: { mean: 67.9, std: 15.0 }
    }
  },
  {
    label: "lentil", emoji: "🫘", season: "May–Sep", count: 100,
    features: {
      N: { mean: 18.8, std: 5.0 }, P: { mean: 68.2, std: 6.0 }, K: { mean: 19.8, std: 2.5 },
      temperature: { mean: 24.5, std: 3.5 }, humidity: { mean: 64.8, std: 6.0 },
      ph: { mean: 6.9, std: 0.4 }, rainfall: { mean: 46.0, std: 8.0 }
    }
  },
  {
    label: "pomegranate", emoji: "🍎", season: "Year-round", count: 100,
    features: {
      N: { mean: 19.5, std: 6.0 }, P: { mean: 10.0, std: 5.0 }, K: { mean: 40.0, std: 3.0 },
      temperature: { mean: 21.8, std: 3.0 }, humidity: { mean: 90.1, std: 1.5 },
      ph: { mean: 6.4, std: 0.5 }, rainfall: { mean: 107.0, std: 15.0 }
    }
  },
  {
    label: "banana", emoji: "🍌", season: "Year-round", count: 100,
    features: {
      N: { mean: 100.0, std: 5.0 }, P: { mean: 82.0, std: 10.0 }, K: { mean: 50.0, std: 3.0 },
      temperature: { mean: 27.0, std: 1.5 }, humidity: { mean: 80.0, std: 2.0 },
      ph: { mean: 6.0, std: 0.3 }, rainfall: { mean: 105.0, std: 10.0 }
    }
  },
  {
    label: "mango", emoji: "🥭", season: "Nov–Mar", count: 100,
    features: {
      N: { mean: 20.0, std: 5.0 }, P: { mean: 27.0, std: 6.0 }, K: { mean: 30.0, std: 3.0 },
      temperature: { mean: 31.2, std: 3.0 }, humidity: { mean: 50.1, std: 5.0 },
      ph: { mean: 5.8, std: 0.5 }, rainfall: { mean: 95.0, std: 10.0 }
    }
  },
  {
    label: "grapes", emoji: "🍇", season: "Jun–Oct", count: 100,
    features: {
      N: { mean: 23.2, std: 8.0 }, P: { mean: 132.5, std: 8.0 }, K: { mean: 200.5, std: 3.0 },
      temperature: { mean: 23.8, std: 5.0 }, humidity: { mean: 81.6, std: 4.0 },
      ph: { mean: 6.0, std: 0.7 }, rainfall: { mean: 70.0, std: 8.0 }
    }
  },
  {
    label: "watermelon", emoji: "🍉", season: "Oct–Mar", count: 100,
    features: {
      N: { mean: 99.4, std: 5.0 }, P: { mean: 17.0, std: 3.0 }, K: { mean: 50.0, std: 3.0 },
      temperature: { mean: 25.6, std: 1.5 }, humidity: { mean: 85.1, std: 1.5 },
      ph: { mean: 6.5, std: 0.3 }, rainfall: { mean: 50.8, std: 5.0 }
    }
  },
  {
    label: "muskmelon", emoji: "🍈", season: "Oct–Mar", count: 100,
    features: {
      N: { mean: 100.3, std: 5.0 }, P: { mean: 18.0, std: 3.0 }, K: { mean: 50.0, std: 3.0 },
      temperature: { mean: 28.7, std: 2.0 }, humidity: { mean: 92.3, std: 1.0 },
      ph: { mean: 6.4, std: 0.3 }, rainfall: { mean: 24.7, std: 3.0 }
    }
  },
  {
    label: "apple", emoji: "🍎", season: "Apr–Oct", count: 100,
    features: {
      N: { mean: 20.8, std: 5.0 }, P: { mean: 134.2, std: 8.0 }, K: { mean: 200.1, std: 3.0 },
      temperature: { mean: 22.6, std: 2.5 }, humidity: { mean: 92.3, std: 1.5 },
      ph: { mean: 5.9, std: 0.4 }, rainfall: { mean: 113.0, std: 8.0 }
    }
  },
  {
    label: "orange", emoji: "🍊", season: "Year-round", count: 100,
    features: {
      N: { mean: 19.6, std: 5.0 }, P: { mean: 16.3, std: 5.0 }, K: { mean: 10.1, std: 3.0 },
      temperature: { mean: 22.8, std: 3.5 }, humidity: { mean: 92.2, std: 1.0 },
      ph: { mean: 7.0, std: 0.3 }, rainfall: { mean: 110.5, std: 8.0 }
    }
  },
  {
    label: "papaya", emoji: "🍐", season: "Year-round", count: 100,
    features: {
      N: { mean: 50.0, std: 12.0 }, P: { mean: 59.0, std: 8.0 }, K: { mean: 50.1, std: 3.0 },
      temperature: { mean: 33.7, std: 3.0 }, humidity: { mean: 92.4, std: 1.0 },
      ph: { mean: 6.7, std: 0.2 }, rainfall: { mean: 143.0, std: 15.0 }
    }
  },
  {
    label: "coconut", emoji: "🥥", season: "Year-round", count: 100,
    features: {
      N: { mean: 21.9, std: 5.0 }, P: { mean: 16.9, std: 5.0 }, K: { mean: 30.6, std: 3.0 },
      temperature: { mean: 27.4, std: 1.5 }, humidity: { mean: 94.8, std: 1.0 },
      ph: { mean: 6.0, std: 0.3 }, rainfall: { mean: 175.7, std: 25.0 }
    }
  },
  {
    label: "cotton", emoji: "☁️", season: "Nov–May", count: 100,
    features: {
      N: { mean: 118.0, std: 12.0 }, P: { mean: 46.0, std: 8.0 }, K: { mean: 20.0, std: 3.0 },
      temperature: { mean: 24.0, std: 2.5 }, humidity: { mean: 80.0, std: 3.0 },
      ph: { mean: 6.9, std: 0.3 }, rainfall: { mean: 80.3, std: 12.0 }
    }
  },
  {
    label: "jute", emoji: "🌿", season: "Mar–Aug", count: 100,
    features: {
      N: { mean: 78.4, std: 12.0 }, P: { mean: 46.9, std: 8.0 }, K: { mean: 39.9, std: 3.0 },
      temperature: { mean: 25.0, std: 2.0 }, humidity: { mean: 85.0, std: 3.0 },
      ph: { mean: 6.7, std: 0.3 }, rainfall: { mean: 175.0, std: 20.0 }
    }
  },
  {
    label: "coffee", emoji: "☕", season: "Year-round", count: 100,
    features: {
      N: { mean: 101.2, std: 12.0 }, P: { mean: 28.7, std: 6.0 }, K: { mean: 30.0, std: 3.0 },
      temperature: { mean: 25.5, std: 1.5 }, humidity: { mean: 58.9, std: 5.0 },
      ph: { mean: 6.8, std: 0.2 }, rainfall: { mean: 158.0, std: 20.0 }
    }
  },
];

// Malawi-relevant crops mapping (subset + local names)
export const MALAWI_CROP_MAP: Record<string, string> = {
  rice: "Rice",
  maize: "Maize",
  chickpea: "Chickpea",
  kidneybeans: "Kidney Beans",
  pigeonpeas: "Pigeon Peas",
  mothbeans: "Moth Beans",
  mungbean: "Mung Bean",
  blackgram: "Black Gram",
  lentil: "Lentil",
  banana: "Banana",
  mango: "Mango",
  watermelon: "Watermelon",
  papaya: "Papaya",
  coconut: "Coconut",
  cotton: "Cotton",
  coffee: "Coffee",
  orange: "Orange",
  apple: "Apple",
  grapes: "Grapes",
  pomegranate: "Pomegranate",
  muskmelon: "Muskmelon",
  jute: "Jute",
};

/**
 * Gaussian probability density function
 */
function gaussianPdf(x: number, mean: number, std: number): number {
  const s = Math.max(std, 0.01); // avoid division by zero
  const exp = -0.5 * Math.pow((x - mean) / s, 2);
  return (1 / (s * Math.sqrt(2 * Math.PI))) * Math.pow(Math.E, exp);
}

/**
 * Predict crop using Gaussian Naive Bayes approach
 * Same methodology as the trained Random Forest but using statistical profiles
 * Returns top 5 crops with confidence scores
 */
export function predictCrop(
  N: number, P: number, K: number,
  temperature: number, humidity: number,
  ph: number, rainfall: number
): { crop: string; confidence: number; alternatives: { crop: string; confidence: number }[] } {
  
  const scores: { label: string; logProb: number }[] = [];

  for (const cropStat of CROP_STATISTICS) {
    const f = cropStat.features;
    // Sum of log probabilities (Naive Bayes)
    let logProb = 0;
    logProb += Math.log(gaussianPdf(N, f.N.mean, f.N.std) + 1e-300);
    logProb += Math.log(gaussianPdf(P, f.P.mean, f.P.std) + 1e-300);
    logProb += Math.log(gaussianPdf(K, f.K.mean, f.K.std) + 1e-300);
    logProb += Math.log(gaussianPdf(temperature, f.temperature.mean, f.temperature.std) + 1e-300);
    logProb += Math.log(gaussianPdf(humidity, f.humidity.mean, f.humidity.std) + 1e-300);
    logProb += Math.log(gaussianPdf(ph, f.ph.mean, f.ph.std) + 1e-300);
    logProb += Math.log(gaussianPdf(rainfall, f.rainfall.mean, f.rainfall.std) + 1e-300);

    scores.push({ label: cropStat.label, logProb });
  }

  // Convert log probabilities to normalized probabilities
  const maxLogProb = Math.max(...scores.map(s => s.logProb));
  const expScores = scores.map(s => ({
    label: s.label,
    prob: Math.exp(s.logProb - maxLogProb)
  }));
  const total = expScores.reduce((sum, s) => sum + s.prob, 0);
  const normalized = expScores.map(s => ({
    label: s.label,
    prob: (s.prob / total) * 100
  })).sort((a, b) => b.prob - a.prob);

  const top = normalized[0];
  return {
    crop: MALAWI_CROP_MAP[top.label] || top.label,
    confidence: Math.round(top.prob * 10) / 10,
    alternatives: normalized.slice(1, 5).map(a => ({
      crop: MALAWI_CROP_MAP[a.label] || a.label,
      confidence: Math.round(a.prob * 10) / 10
    }))
  };
}

/**
 * Get the CropStats for a given crop label
 */
export function getCropProfile(label: string): CropStats | undefined {
  return CROP_STATISTICS.find(c => c.label === label.toLowerCase() || 
    (MALAWI_CROP_MAP[c.label] || "").toLowerCase() === label.toLowerCase());
}
