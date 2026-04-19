"server-only";

import { getContractContent } from "../api/get-contract";
import { parseQualitySummary } from "./parse-quality";
import { computeScore } from "./compute-score";
import type { ServiceMeta, ServiceProtocol } from "../model/types";
import type { HttpQualitySummary, AsyncQualitySummary } from "@/shared/types/quality.generated";

export type QualityEntry = {
  score: number;
  summary: HttpQualitySummary | AsyncQualitySummary;
};

export type QualityMap = Record<string, QualityEntry>;

export function buildQualityMap(services: ServiceMeta[]): QualityMap {
  const map: QualityMap = {};

  for (const service of services) {
    for (const contract of service.providesApis ?? []) {
      const protocol = contract.protocol as ServiceProtocol;
      const content = getContractContent(service, protocol);
      if (!content) continue;

      const summary = parseQualitySummary(content);
      if (!summary) continue;

      const score = computeScore(summary);
      map[`${service.id}:${protocol}`] = { score, summary };
    }
  }

  return map;
}
