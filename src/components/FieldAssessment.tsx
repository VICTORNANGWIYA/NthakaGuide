import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tractor, History } from "lucide-react";

interface FieldAnswers {
  [step: number]: string;
}

interface Props {
  onComplete: (answers: FieldAnswers, landUse: string, previousCrop: string) => void;
}

const LAND_USE_OPTIONS = [
  { value: "food",      label: "🌽 Food Crops",    description: "Maize, rice, cassava, beans" },
  { value: "cash",      label: "💰 Cash Crops",    description: "Tobacco, cotton, coffee, tea" },
  { value: "vegetable", label: "🥬 Vegetables",    description: "Tomatoes, cabbage, onion" },
  { value: "fruit",     label: "🍌 Fruits",        description: "Banana, mango, avocado" },
  { value: "mixed",     label: "🔀 Mixed Farming", description: "Combination of food crops" },
];

const PREVIOUS_CROPS = [
  "None / First time", "Maize", "Beans", "Groundnuts", "Soybean",
  "Tobacco", "Cotton", "Rice", "Cassava", "Sweet Potato",
  "Pigeon Peas", "Sorghum", "Millet", "Sunflower", "Banana",
  "Tomato", "Cabbage",
];

const QUESTIONS = [
  {
    id:       "colour",
    question: "What colour is your soil?",
    hint:     "Look at freshly dug soil — not the surface crust",
    options: [
      { value: "dark_black",   icon: "⬛", main: "Very dark black / deep brown",  sub: "High organic matter ~4–5.5% — excellent fertility" },
      { value: "medium_brown", icon: "🟫", main: "Medium brown",                  sub: "Moderate fertility ~1.5–3%" },
      { value: "light_brown",  icon: "🏜️", main: "Light brown / yellowish",       sub: "Lower fertility ~0.8–1.5%" },
      { value: "red",          icon: "🔴", main: "Reddish / orange-red",           sub: "Iron-rich laterite — often acidic pH 5–6" },
      { value: "pale",         icon: "⬜", main: "Pale grey / whitish",            sub: "Sandy, very low nutrients" },
    ],
  },
  {
    id:       "texture",
    question: "Roll moist soil between your fingers. What forms?",
    hint:     "Take a handful of moist soil and try to roll it",
    options: [
      { value: "clay",       icon: "🏺", main: "Long smooth ribbon (5cm+)",       sub: "Clay — retains water and nutrients well" },
      { value: "loam",       icon: "🌱", main: "Short crumbly ribbon (2–4cm)",    sub: "Loam — ideal for most crops" },
      { value: "sandy_loam", icon: "🏖️", main: "Barely forms, feels gritty",     sub: "Sandy loam — drains quickly, needs more fertilizer" },
      { value: "sand",       icon: "🏝️", main: "Falls apart completely",          sub: "Sandy — poor water and nutrient retention" },
    ],
  },
  {
    id:       "drainage",
    question: "Pour water on bare soil. What happens?",
    hint:     "Pour about half a cup and watch for 30 seconds",
    options: [
      { value: "fast",     icon: "💨", main: "Soaks in under 10 seconds",         sub: "Very good drainage — may need irrigation in dry spells" },
      { value: "moderate", icon: "✅", main: "Soaks in 10–30 seconds",            sub: "Ideal moisture balance — most crops thrive" },
      { value: "slow",     icon: "🐌", main: "Still on surface after 1 minute",  sub: "Poor drainage — waterlogging risk" },
      { value: "runoff",   icon: "🌊", main: "Mostly runs off, hard crust",       sub: "Compaction — needs breaking up, erosion risk" },
    ],
  },
  {
    id:       "symptoms",
    question: "What did your last crop look like?",
    hint:     "Choose the most noticeable sign you observed",
    options: [
      { value: "yellow_leaves", icon: "🍂", main: "Yellowing leaves (older leaves first)", sub: "Nitrogen deficiency — most common issue" },
      { value: "purple_stems",  icon: "🟣", main: "Purple or reddish stems/leaves",        sub: "Phosphorus deficiency" },
      { value: "brown_edges",   icon: "🍁", main: "Brown or burnt leaf edges",             sub: "Potassium deficiency" },
      { value: "stunted",       icon: "🌿", main: "Stunted growth despite good rain",      sub: "pH problem — likely too acidic" },
      { value: "pests",         icon: "🐛", main: "Lots of pests or disease spots",        sub: "Pest pressure — affects yield significantly" },
      { value: "healthy",       icon: "💚", main: "Crops looked healthy overall",          sub: "Good soil condition" },
    ],
  },
  {
    id:       "smell",
    question: "Smell a handful of moist soil. What do you notice?",
    hint:     "Early morning when soil is naturally moist is best",
    options: [
      { value: "earthy", icon: "🌍", main: "Rich, fresh earthy smell",     sub: "Excellent — very active biological life" },
      { value: "mild",   icon: "😐", main: "Mild, not very distinctive",   sub: "Moderate soil health" },
      { value: "sour",   icon: "😷", main: "Sour, acidic or fermented",    sub: "Likely waterlogged or acidic pH" },
      { value: "none",   icon: "🫙", main: "No smell at all — very dusty", sub: "Low biological activity — poor soil health" },
    ],
  },
  {
    id:       "history",
    question: "What is the history of this land?",
    hint:     "Think about the past 2–3 growing seasons",
    options: [
      { value: "virgin",     icon: "🌳", main: "Newly cleared forest or bush",     sub: "High organic matter, may be slightly acidic" },
      { value: "rotated",    icon: "🔄", main: "Rotated with legumes recently",    sub: "Good nitrogen from biological fixation" },
      { value: "continuous", icon: "🌽", main: "Continuous maize 3+ seasons",      sub: "Likely nitrogen-depleted and acidic" },
      { value: "fallow",     icon: "🍃", main: "Left fallow 1–2 seasons",          sub: "Recovering — moderate fertility returning" },
      { value: "degraded",   icon: "⛰️", main: "Visibly eroded or degraded land", sub: "Severely depleted — needs intensive management" },
    ],
  },
  {
    id:       "moisture_now",
    question: "What is the current moisture feel of the soil?",
    hint:     "Squeeze a handful — don't judge by the surface",
    options: [
      { value: "wet",       icon: "💧", main: "Wet — water oozes when squeezed",   sub: "Too wet — delay planting, drainage needed" },
      { value: "moist",     icon: "✅", main: "Moist — forms a ball but crumbles", sub: "Ideal — good planting conditions" },
      { value: "dry_crumb", icon: "🏜️", main: "Dry — crumbles with pressure",     sub: "Needs irrigation or wait for rain" },
      { value: "very_dry",  icon: "🔥", main: "Very dry — hard and cracked",       sub: "Severely dry — crops will struggle" },
    ],
  },
];

export default function FieldAssessment({ onComplete }: Props) {
  const [step,         setStep]         = useState(0);
  const [answers,      setAnswers]      = useState<FieldAnswers>({});
  const [landUse,      setLandUse]      = useState("food");
  const [previousCrop, setPreviousCrop] = useState("");
  const [showContext,  setShowContext]  = useState(true);

  const q         = QUESTIONS[step];
  const isLast    = step === QUESTIONS.length - 1;
  const hasAnswer = !!answers[step + 1];

  const select = (value: string) =>
    setAnswers(prev => ({ ...prev, [step + 1]: value }));

  const next = () => {
    if (step < QUESTIONS.length - 1) setStep(s => s + 1);
  };

  const back = () => {
    if (step === 0) setShowContext(true);
    else setStep(s => Math.max(0, s - 1));
  };

  const submit = () =>
    onComplete(
      answers,
      landUse,
      previousCrop === "None / First time" ? "" : previousCrop.toLowerCase(),
    );

  // ── Context screen: land use + previous crop ──────────────────────────
  if (showContext) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            Before we start
          </h3>
          <p className="text-sm text-muted-foreground">
            Tell us about your farming goals so we can tailor the recommendations.
          </p>
        </div>

        {/* Land use */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Tractor className="h-4 w-4 text-primary" /> What do you want to grow?
          </Label>
          <Select value={landUse} onValueChange={setLandUse}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select land use..." />
            </SelectTrigger>
            <SelectContent>
              {LAND_USE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{opt.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Filters recommendations to crops matching your farming goal.
          </p>
        </div>

        {/* Previous crop */}
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            What did you grow last season?
            <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Select value={previousCrop} onValueChange={setPreviousCrop}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select previous crop..." />
            </SelectTrigger>
            <SelectContent>
              {PREVIOUS_CROPS.map(crop => (
                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Used for crop rotation advice only — your choice is never restricted.
          </p>
        </div>

        <Button
          onClick={() => setShowContext(false)}
          className="w-full bg-primary text-primary-foreground font-semibold py-5"
          size="lg"
        >
          Start Field Assessment →
        </Button>
      </motion.div>
    );
  }

  // ── Field questions ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Progress bar */}
      <div className="space-y-1">
        <Progress value={((step + 1) / QUESTIONS.length) * 100} className="h-1.5" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)}% complete</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="font-display text-lg font-bold text-foreground mb-1">
            {q.question}
          </h3>
          {q.hint && (
            <p className="text-xs text-muted-foreground mb-4 italic">💡 {q.hint}</p>
          )}

          <div className="space-y-2">
            {q.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  answers[step + 1] === opt.value
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <span className="text-2xl shrink-0">{opt.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${
                    answers[step + 1] === opt.value ? "text-primary" : "text-foreground"
                  }`}>
                    {opt.main}
                  </p>
                  <p className="text-xs text-muted-foreground">{opt.sub}</p>
                </div>
                {answers[step + 1] === opt.value && (
                  <span className="ml-auto text-primary shrink-0 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={back}
          className="border-border"
        >
          ← Back
        </Button>
        {isLast ? (
          <Button
            onClick={submit}
            disabled={!hasAnswer}
            className="flex-1 bg-primary text-primary-foreground font-semibold"
          >
            🌱 Get Recommendations
          </Button>
        ) : (
          <Button
            onClick={next}
            disabled={!hasAnswer}
            className="flex-1 bg-primary text-primary-foreground"
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}

/** Convert field assessment answers to numeric soil values */
export function fieldAnswersToSoilValues(answers: { [step: number]: string }) {
  let N = 80, P = 45, K = 55, ph = 6.2, moisture = 42;

  // Q1: Colour → N, P, K, pH baseline
  switch (answers[1]) {
    case "dark_black":   N = 100; P = 55; K = 65; break;
    case "medium_brown": N = 75;  P = 45; K = 50; break;
    case "light_brown":  N = 55;  P = 35; K = 40; break;
    case "red":          N = 60;  P = 35; K = 45; ph = 5.4; break;
    case "pale":         N = 30;  P = 20; K = 25; break;
  }

  // Q2: Texture → moisture + nutrient adjustments
  switch (answers[2]) {
    case "clay":       moisture = 65; K += 15; P += 10; break;
    case "loam":       moisture = 45; break;
    case "sandy_loam": moisture = 32; K -= 12; P -= 8;  N -= 10; break;
    case "sand":       moisture = 22; K -= 25; P -= 20; N -= 25; break;
  }

  // Q3: Drainage → refine moisture
  switch (answers[3]) {
    case "fast":     moisture = Math.min(moisture, 25); break;
    case "slow":     moisture = Math.max(moisture, 65); break;
    case "runoff":   moisture = Math.max(moisture, 55); N -= 10; break;
  }

  // Q4: Symptoms → nutrient corrections
  switch (answers[4]) {
    case "yellow_leaves": N = Math.max(15, N - 40); break;
    case "purple_stems":  P = Math.max(10, P - 30); ph = Math.min(ph, 5.8); break;
    case "brown_edges":   K = Math.max(10, K - 30); break;
    case "stunted":       ph = Math.min(5.0, ph - 0.5); break;
    case "pests":         N = Math.max(N - 15, 20); break;
    case "healthy":       N = Math.min(N + 10, 130); K = Math.min(K + 5, 130); break;
  }

  // Q5: Smell → pH and biology
  switch (answers[5]) {
    case "earthy": N = Math.min(N + 10, 130); break;
    case "sour":   ph = Math.max(4.5, ph - 0.6); moisture = Math.max(moisture, 60); break;
    case "none":   N = Math.max(N - 10, 15); break;
  }

  // Q6: Land history → N and pH adjustments
  switch (answers[6]) {
    case "virgin":     N = Math.min(N + 15, 130); ph = Math.min(ph, 6.0); break;
    case "rotated":    N = Math.min(N + 25, 140); P = Math.min(P + 10, 100); break;
    case "continuous": N = Math.max(N - 35, 15);  ph = Math.min(ph, 5.5); break;
    case "fallow":     N = Math.min(N + 10, 120); break;
    case "degraded":   N = Math.max(N - 45, 10);  P = Math.max(P - 25, 8); K = Math.max(K - 20, 10); break;
  }

  // Q7: Current moisture feel
  switch (answers[7]) {
    case "wet":       moisture = Math.max(moisture, 80); break;
    case "moist":     moisture = Math.max(40, Math.min(moisture, 65)); break;
    case "dry_crumb": moisture = Math.min(moisture, 30); break;
    case "very_dry":  moisture = Math.min(moisture, 15); break;
  }

  // Clamp all to sensible ranges
  N        = Math.round(Math.max(5,   Math.min(N,   200)));
  P        = Math.round(Math.max(5,   Math.min(P,   150)));
  K        = Math.round(Math.max(5,   Math.min(K,   150)));
  ph       = Math.round(Math.max(3.5, Math.min(ph,  9.5)) * 10) / 10;
  moisture = Math.round(Math.max(5,   Math.min(moisture, 100)));

  const organicMatter =
    N > 90 ? 4.5 :
    N > 70 ? 3.2 :
    N > 50 ? 2.0 :
    N > 30 ? 1.2 : 0.8;

  return {
    nitrogen:      N,
    phosphorus:    P,
    potassium:     K,
    ph,
    moisture,
    temperature:   25,
    organicMatter: Math.round(organicMatter * 10) / 10,
  };
}