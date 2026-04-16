import yaml from "js-yaml";
import type { HttpQualitySummary, AsyncQualitySummary } from "@/shared/types/quality.generated";

export function parseQualitySummary(
  content: string,
): HttpQualitySummary | AsyncQualitySummary | null {
  try {
    const doc = yaml.load(content) as Record<string, unknown>;
    const summary = doc?.["x-quality-summary"];
    if (!summary || typeof summary !== "object") return null;
    return summary as HttpQualitySummary | AsyncQualitySummary;
  } catch {
    return null;
  }
}
