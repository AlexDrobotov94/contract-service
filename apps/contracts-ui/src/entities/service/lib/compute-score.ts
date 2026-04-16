import type { HttpQualitySummary, AsyncQualitySummary } from "@/shared/types/quality.generated";

export function computeScore(
  summary: HttpQualitySummary | AsyncQualitySummary,
): number {
  let weightedYes = 0;
  let weightedTotal = 0;

  for (const [key, { yes, no }] of Object.entries(summary.scores)) {
    const w = key === "contract-implemented" ? 2 : 1;
    weightedYes += yes * w;
    weightedTotal += (yes + no) * w;
  }

  return weightedTotal > 0 ? weightedYes / weightedTotal : 0;
}
