import yaml from "js-yaml";
import { computeScore } from "./compute-score";
import type {
  HttpOperationQuality,
  AsyncOperationQuality,
  HttpQualitySummary,
  AsyncQualitySummary,
} from "@/shared/types/quality.generated";

export type HttpOperationRow = {
  method: string;
  path: string;
  operationId?: string;
  summary?: string;
  score: number;
  flags: HttpOperationQuality;
};

export type AsyncOperationRow = {
  channel: string;
  operationId?: string;
  action?: string;
  score: number;
  flags: AsyncOperationQuality;
};

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options"];

export function parseHttpOperations(content: string): HttpOperationRow[] {
  try {
    const doc = yaml.load(content) as Record<string, unknown>;
    const paths = doc?.["paths"] as Record<string, Record<string, unknown>> | undefined;
    if (!paths) return [];

    const rows: HttpOperationRow[] = [];

    for (const [path, methods] of Object.entries(paths)) {
      for (const method of HTTP_METHODS) {
        const op = methods?.[method] as Record<string, unknown> | undefined;
        if (!op) continue;

        const flags: HttpOperationQuality = {};
        if (typeof op["x-quality-params-typed"] === "boolean")
          flags["x-quality-params-typed"] = op["x-quality-params-typed"];
        if (typeof op["x-quality-body-typed"] === "boolean")
          flags["x-quality-body-typed"] = op["x-quality-body-typed"];
        if (typeof op["x-quality-response-typed"] === "boolean")
          flags["x-quality-response-typed"] = op["x-quality-response-typed"];
        if (typeof op["x-quality-body-validated"] === "boolean")
          flags["x-quality-body-validated"] = op["x-quality-body-validated"];
        if (typeof op["x-quality-errors-defined"] === "boolean")
          flags["x-quality-errors-defined"] = op["x-quality-errors-defined"];
        if (typeof op["x-quality-contract-implemented"] === "boolean")
          flags["x-quality-contract-implemented"] = op["x-quality-contract-implemented"];

        const score = computeOperationScore(flags);

        rows.push({
          method: method.toUpperCase(),
          path,
          operationId: op["operationId"] as string | undefined,
          summary: op["summary"] as string | undefined,
          score,
          flags,
        });
      }
    }

    return rows;
  } catch {
    return [];
  }
}

export function parseAsyncOperations(content: string): AsyncOperationRow[] {
  try {
    const doc = yaml.load(content) as Record<string, unknown>;
    const channels = doc?.["channels"] as Record<string, unknown> | undefined;
    const operations = doc?.["operations"] as Record<string, Record<string, unknown>> | undefined;

    if (!operations) return [];

    const rows: AsyncOperationRow[] = [];

    for (const [operationId, op] of Object.entries(operations)) {
      const channelRef = (op?.["channel"] as Record<string, string> | undefined)?.["$ref"] ?? "";
      const channel = channelRef.replace("#/channels/", "") || operationId;

      // Resolve channel address if channels map is available
      const channelAddress =
        channels && channel
          ? ((channels[channel] as Record<string, unknown>)?.["address"] as string | undefined) ??
            channel
          : channel;

      const flags: AsyncOperationQuality = {};
      if (typeof op["x-quality-payload-typed"] === "boolean")
        flags["x-quality-payload-typed"] = op["x-quality-payload-typed"];
      if (typeof op["x-quality-payload-validated"] === "boolean")
        flags["x-quality-payload-validated"] = op["x-quality-payload-validated"];
      if (typeof op["x-quality-errors-defined"] === "boolean")
        flags["x-quality-errors-defined"] = op["x-quality-errors-defined"];
      if (typeof op["x-quality-contract-implemented"] === "boolean")
        flags["x-quality-contract-implemented"] = op["x-quality-contract-implemented"];

      const score = computeOperationScore(flags);

      rows.push({
        channel: channelAddress,
        operationId,
        action: op["action"] as string | undefined,
        score,
        flags,
      });
    }

    return rows;
  } catch {
    return [];
  }
}

function computeOperationScore(flags: HttpOperationQuality | AsyncOperationQuality): number {
  const entries = Object.entries(flags) as [string, boolean][];
  if (entries.length === 0) return 0;

  // Reuse summary-level compute logic inline for per-operation
  const fakeSummary = {
    total: 1,
    scores: Object.fromEntries(
      entries.map(([key, val]) => [
        key.replace("x-quality-", ""),
        { yes: val ? 1 : 0, no: val ? 0 : 1, na: 0 },
      ]),
    ),
    generatedAt: "",
    generatedBy: "",
  } as unknown as HttpQualitySummary | AsyncQualitySummary;

  return computeScore(fakeSummary);
}
