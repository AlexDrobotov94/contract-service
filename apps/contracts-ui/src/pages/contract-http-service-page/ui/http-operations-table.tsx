"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/atoms/table";
import { QualityBar } from "@/shared/ui/molecules/quality-bar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/atoms/tooltip";
import type { HttpOperationRow } from "@/entities/service/lib/parse-operations";
import type { HttpOperationQuality } from "@/shared/types/quality.generated";

type Props = {
  operations: HttpOperationRow[];
};

const METHOD_COLORS: Record<string, string> = {
  GET: "text-blue-500",
  POST: "text-green-500",
  PUT: "text-yellow-500",
  PATCH: "text-orange-500",
  DELETE: "text-red-500",
};

const FLAG_KEYS: { key: keyof HttpOperationQuality; label: string; hint: string }[] = [
  { key: "x-quality-params-typed", label: "Параметры", hint: "Все path/query/header параметры имеют явные типы" },
  { key: "x-quality-body-typed", label: "Тело", hint: "Тело запроса типизировано явным DTO или схемой" },
  { key: "x-quality-response-typed", label: "Ответ", hint: "Метод возвращает явный не-any тип" },
  { key: "x-quality-body-validated", label: "Валидация", hint: "Тело запроса проходит runtime-валидацию" },
  { key: "x-quality-errors-defined", label: "Ошибки", hint: "Определён хотя бы один error-кейс (4xx/5xx)" },
  { key: "x-quality-contract-implemented", label: "Контракт", hint: "Сервис использует пакет контрактов или кодогенерацию (×2 вес)" },
];

function FlagDot({ value }: { value: boolean | undefined }) {
  if (value === true) return <span className="inline-block w-3 h-3 rounded-full bg-green-500" />;
  if (value === false) return <span className="inline-block w-3 h-3 rounded-full bg-red-500" />;
  return <span className="inline-block w-3 h-3 rounded-full border border-muted-foreground/40" />;
}

function HintHead({ label, hint, className }: { label: string; hint: string; className?: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default underline decoration-dotted underline-offset-2">
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-center">
          {hint}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function HttpOperationsTable({ operations }: Props) {
  if (operations.length === 0) {
    return <p className="text-muted-foreground text-sm">Нет данных об операциях</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Метод</TableHead>
            <TableHead className="max-w-[240px]">Путь</TableHead>
            <TableHead className="w-32">
              <HintHead label="Оценка" hint="Взвешенная оценка качества операции" />
            </TableHead>
            {FLAG_KEYS.map(({ label, hint }) => (
              <TableHead key={label} className="w-20 text-center text-xs">
                <HintHead label={label} hint={hint} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((op, i) => (
            <TableRow key={i}>
              <TableCell>
                <span className={`font-mono text-xs font-bold ${METHOD_COLORS[op.method] ?? ""}`}>
                  {op.method}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs max-w-[240px] truncate">
                {op.path}
              </TableCell>
              <TableCell>
                <QualityBar score={op.score} nSegments={6} />
              </TableCell>
              {FLAG_KEYS.map(({ key }) => (
                <TableCell key={key} className="text-center">
                  <FlagDot value={op.flags[key]} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
