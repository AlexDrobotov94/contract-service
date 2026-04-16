"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/atoms/tooltip";
import type {
  HttpQualitySummary,
  AsyncQualitySummary,
  QualitySummaryScore,
} from "@/shared/types/quality.generated";

const HTTP_LABELS: Record<string, string> = {
  "params-typed": "Params typed",
  "body-typed": "Body typed",
  "response-typed": "Response typed",
  "body-validated": "Body validated",
  "errors-defined": "Errors defined",
  "contract-implemented": "Contract implemented",
};

const ASYNC_LABELS: Record<string, string> = {
  "payload-typed": "Payload typed",
  "payload-validated": "Payload validated",
  "errors-defined": "Errors defined",
  "contract-implemented": "Contract implemented",
};

function nSegmentsFromSummary(summary: HttpQualitySummary | AsyncQualitySummary): number {
  return "params-typed" in summary.scores ? 6 : 4;
}

type BarProps = {
  score: number;
  nSegments?: number;
  className?: string;
};

function Bar({ score, nSegments = 6, className }: BarProps) {
  const pct = Math.max(0, Math.min(1, score)) * 100;
  const maskWidth = 100 - pct;

  return (
    <div
      className={`relative h-3.5 rounded overflow-hidden border border-border ${className ?? ""}`}
      style={{ minWidth: `${nSegments * 12}px` }}
    >
      {/* Gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, hsl(0,84%,45%), hsl(60,84%,50%), hsl(120,84%,45%))",
        }}
      />

      {/* White mask from right */}
      <div
        className="absolute top-0 right-0 bottom-0 bg-background transition-all"
        style={{ width: `${maskWidth}%` }}
      />

      {/* Segment dividers */}
      {Array.from({ length: nSegments - 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-border/70"
          style={{ left: `${((i + 1) / nSegments) * 100}%` }}
        />
      ))}
    </div>
  );
}

function TooltipRows({ summary }: { summary: HttpQualitySummary | AsyncQualitySummary }) {
  const isHttp = "params-typed" in summary.scores;
  const labels = isHttp ? HTTP_LABELS : ASYNC_LABELS;
  const scores = summary.scores as unknown as Record<string, QualitySummaryScore>;

  return (
    <div className="flex flex-col gap-1 min-w-[220px]">
      {Object.entries(scores).map(([key, s]) => {
        const applicable = s.yes + s.no;
        const pct = applicable > 0 ? Math.round((s.yes / applicable) * 100) : 0;
        const label = labels[key] ?? key;
        const isWeighted = key === "contract-implemented";

        return (
          <div key={key} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">
              {label}
              {isWeighted && <span className="ml-1 opacity-60">×2</span>}
            </span>
            <span className="font-mono tabular-nums">
              {s.yes}/{applicable}
              <span className="ml-1 opacity-60">({pct}%)</span>
            </span>
          </div>
        );
      })}
      <div className="mt-1 border-t pt-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Total operations</span>
        <span className="font-mono">{summary.total}</span>
      </div>
    </div>
  );
}

type QualityBarProps = {
  score: number;
  nSegments?: number;
  summary?: HttpQualitySummary | AsyncQualitySummary;
  showTooltip?: boolean;
  className?: string;
};

export function QualityBar({
  score,
  nSegments,
  summary,
  showTooltip = false,
  className,
}: QualityBarProps) {
  const segments = nSegments ?? (summary ? nSegmentsFromSummary(summary) : 6);
  const bar = <Bar score={score} nSegments={segments} className={className} />;

  if (!showTooltip || !summary) return bar;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-default inline-flex w-full">{bar}</div>
        </TooltipTrigger>
        <TooltipContent side="left" className="p-3">
          <TooltipRows summary={summary} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
