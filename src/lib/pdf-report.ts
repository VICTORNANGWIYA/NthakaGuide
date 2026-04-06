import jsPDF from "jspdf";
import type { Recommendation, SoilInput } from "./recommendations";

export function generatePDFReport(input: SoilInput, result: Recommendation) {
  const doc    = new jsPDF();
  const margin = 20;
  let y        = margin;

  // ── Header ────────────────────────────────────────────────────────────
  doc.setFillColor(34, 87, 50);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("NthakaGuide", margin, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Crop & Fertilizer Recommendation Report", margin, 28);
  doc.text(
    `Generated: ${new Date().toLocaleDateString()} | COM422 UNIMA 2025/2026`,
    margin, 35,
  );

  doc.setTextColor(30, 30, 30);
  y = 50;

  // ── Location & Climate ────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Location & Climate", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`District: ${input.district.name} (${input.district.region} Region)`, margin, y); y += 6;
  doc.text(`Forecasted Rainfall: ${result.forecastedRainfall ?? "N/A"} mm`, margin, y); y += 6;
  doc.text(`Rainfall Band: ${result.rainfallBand ?? "N/A"} (${result.rainfallCategory ?? "N/A"})`, margin, y); y += 6;
  doc.text(`Historical Average: ${input.district.avgRainfallMm} mm/year`, margin, y); y += 6;
  doc.text(`Band Description: ${result.rainfallBandDescription ?? "N/A"}`, margin, y, { maxWidth: 170 });
  y += 6;
  if (result.rainfallSource) {
    doc.text(`Source: ${result.rainfallSource}`, margin, y, { maxWidth: 170 });
    y += 6;
  }
  y += 6;

  // ── Farmer Context ────────────────────────────────────────────────────
  const fc = result.farmerContext;
  if (fc) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Farmer Context", margin, y); y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (fc.landUseLabel) {
      doc.text(`Farming Goal: ${fc.landUseLabel}`, margin, y); y += 6;
    }
    if (fc.previousCrop) {
      doc.text(`Previous Crop: ${fc.previousCrop}`, margin, y); y += 6;
    }
    if (fc.rotationTip) {
      doc.text(`Rotation Tip: ${fc.rotationTip}`, margin, y, { maxWidth: 170 }); y += 8;
    }
    y += 4;
  }

  // ── ML Prediction ─────────────────────────────────────────────────────
  // ✅ Backend sends topCrop / topConf — not crop / confidence / alternatives
  const ml = result.mlPrediction ?? null;
  if (ml) {
    if (y > 220) { doc.addPage(); y = margin; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ML Model Prediction", margin, y); y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Algorithm: ${ml.algorithm ?? "Random Forest"}`, margin, y); y += 6;
    doc.text(
      `Top Prediction: ${ml.topCrop ?? "N/A"} (${ml.topConf ?? "N/A"}% confidence)`,
      margin, y,
    ); y += 10;
  }

  // ── Soil Analysis Input ───────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = margin; }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Soil Analysis Input", margin, y); y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const soilData = [
    `Nitrogen (N): ${input.nitrogen} mg/kg`,
    `Phosphorus (P): ${input.phosphorus} mg/kg`,
    `Potassium (K): ${input.potassium} mg/kg`,
    `pH: ${input.ph}`,
    `Moisture/Humidity: ${input.moisture}%`,
    `Temperature: ${input.temperature}°C`,
    `Organic Matter: ${input.organicMatter}%`,
  ];
  soilData.forEach(line => { doc.text(line, margin, y); y += 6; });
  y += 4;
  doc.text(
    `Assessment: ${result.soilAssessment ?? "N/A"}`,
    margin, y, { maxWidth: 170 },
  );
  y += 14;

  // ── Soil Health Alerts ────────────────────────────────────────────────
  const soilAlerts = result.soilAlerts ?? [];
  if (soilAlerts.length > 0) {
    if (y > 230) { doc.addPage(); y = margin; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Soil Health Alerts", margin, y); y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    soilAlerts.forEach(alert => {
      const prefix =
        alert.type === "danger"  ? "DANGER: "
        : alert.type === "warning" ? "WARNING: "
        : "INFO: ";
      doc.text(`${prefix}${alert.message}`, margin, y, { maxWidth: 170 });
      y += 8;
      if (y > 270) { doc.addPage(); y = margin; }
    });
    y += 4;
  }

  // ── Crop Recommendations ──────────────────────────────────────────────
  const crops = result.crops ?? [];
  if (crops.length > 0) {
    if (y > 220) { doc.addPage(); y = margin; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Top Crop Recommendations", margin, y); y += 8;

    crops.forEach((crop, i) => {
      if (y > 250) { doc.addPage(); y = margin; }

      // ── Crop heading ──────────────────────────────────────────────
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(
        `${i + 1}. ${crop.crop} — Score: ${crop.score}/100 (${crop.season})`,
        margin, y,
      );
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(crop.reason ?? "", margin + 4, y, { maxWidth: 166 });
      y += 8;

      // ── Yield Prediction ──────────────────────────────────────────
      const yp = crop.yieldPrediction;  // ✅ typed via CropRecommendation.yieldPrediction
      if (yp) {
        doc.setFont("helvetica", "italic");
        doc.text(
          `Yield: ${yp.predicted_tha} ${yp.unit} predicted / ${yp.potential_tha} ${yp.unit} potential (${yp.yield_category})`,
          margin + 4, y, { maxWidth: 166 },
        );
        y += 6;
        if ((yp.limiting_factors ?? []).length > 0) {
          doc.text(
            `Limiting: ${yp.limiting_factors.join("; ")}`,
            margin + 4, y, { maxWidth: 166 },
          );
          y += 6;
        }
        if ((yp.improvement_tips ?? []).length > 0) {
          doc.text(
            `Tips: ${yp.improvement_tips[0]}`,
            margin + 4, y, { maxWidth: 166 },
          );
          y += 6;
        }
        doc.setFont("helvetica", "normal");
      }

      // ── Fertilizer Plan ───────────────────────────────────────────
      // ✅ Fertilizer lives in crop.fertilizerPlan — not result.fertilizers
      const fp = crop.fertilizerPlan;
      if (fp && Object.keys(fp).length > 0) {
        if (y > 255) { doc.addPage(); y = margin; }
        doc.setFont("helvetica", "bold");
        doc.text(`Fertilizer Plan for ${crop.crop}:`, margin + 4, y); y += 5;
        doc.setFont("helvetica", "normal");
        if (fp.basal)           { doc.text(`Basal: ${fp.basal}${fp.basal_rate ? ` @ ${fp.basal_rate}` : ""}`, margin + 8, y); y += 5; }
        if (fp.topdress)        { doc.text(`Top-dress: ${fp.topdress}${fp.topdress_rate ? ` @ ${fp.topdress_rate}` : ""}`, margin + 8, y); y += 5; }
        if (fp.topdress_timing) { doc.text(`Timing: ${fp.topdress_timing}`, margin + 8, y); y += 5; }
        if (fp.notes)           { doc.text(`Notes: ${fp.notes}`, margin + 8, y, { maxWidth: 160 }); y += 7; }
      }

      // ── Rotation Advice ───────────────────────────────────────────
      const ra = crop.rotationAdvice;  // ✅ typed via CropRecommendation.rotationAdvice
      if (ra) {
        if (y > 255) { doc.addPage(); y = margin; }
        const label =
          ra.type === "warning"  ? "⚠ Rotation Warning"
          : ra.type === "positive" ? "✓ Good Rotation"
          : "ℹ Rotation Info";
        doc.setFont("helvetica", "bold");
        doc.text(label, margin + 4, y); y += 5;
        doc.setFont("helvetica", "normal");
        doc.text(ra.message,        margin + 8, y, { maxWidth: 160 }); y += 5;
        doc.text(ra.recommendation, margin + 8, y, { maxWidth: 160 }); y += 7;
      }

      // ── Pest & Disease Risk ───────────────────────────────────────
      const risks = crop.pestDiseaseRisk?.risks ?? [];
      if (risks.length > 0) {
        if (y > 250) { doc.addPage(); y = margin; }
        doc.setFont("helvetica", "bold");
        doc.text(
          `Pest & Disease Risks (${crop.pestDiseaseRisk.summary?.level ?? ""}):`,
          margin + 4, y,
        ); y += 5;
        doc.setFont("helvetica", "normal");
        risks.forEach(risk => {
          if (y > 265) { doc.addPage(); y = margin; }
          doc.text(
            `• ${risk.name} [${risk.risk_level}]: ${risk.symptoms}`,
            margin + 8, y, { maxWidth: 160 },
          ); y += 5;
          doc.text(`  Action: ${risk.action}`, margin + 8, y, { maxWidth: 160 }); y += 7;
        });
      }

      y += 4;
    });
  }

  // ── Footer on every page ──────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `NthakaGuide — COM422 Final Year Project | UNIMA 2025/2026 | Page ${p}/${pageCount}`,
      margin, 287,
    );
  }

  doc.save(
    `NthakaGuide_Report_${input.district.name}_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}