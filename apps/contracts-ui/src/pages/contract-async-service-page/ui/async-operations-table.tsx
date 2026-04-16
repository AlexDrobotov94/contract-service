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
import type { AsyncOperationRow } from "@/entities/service/lib/parse-operations";
import type { AsyncOperationQuality } from "@/shared/types/quality.generated";

type Props = {
  operations: AsyncOperationRow[];
};

const FLAG_KEYS: { key: keyof AsyncOperationQuality; label: string; hint: string }[] = [
  { key: "x-quality-payload-typed", label: "Типизация", hint: "Payload сообщения типизирован явным DTO или схемой" },
  { key: "x-quality-payload-validated", label: "Валидация", hint: "Payload проходит runtime-валидацию" },
  { key: "x-quality-errors-defined", label: "Ошибки", hint: "Определена обработка ошибок: nack, DLX, error-событие или close с кодом" },
  { key: "x-quality-contract-implemented", label: "Контракт", hint: "Сервис использует пакет контрактов или кодогенерацию (×2 вес)" },
];

const ACTION_COLORS: Record<string, string> = {
  send: "text-blue-500",
  receive: "text-green-500",
};

function FlagDot({ value }: { value: boolean | undefined }) {
  if (value === true) return <span className="inline-block w-3 h-3 rounded-full bg-green-500" />;
  if (value === false) return <span className="inline-block w-3 h-3 rounded-full bg-red-500" />;
  return <span className="inline-block w-3 h-3 rounded-full border border-muted-foreground/40" />;
}

function HintHead({ label, hint }: { label: string; hint: string }) {
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

export function AsyncOperationsTable({ operations }: Props) {
  if (operations.length === 0) {
    return <p className="text-muted-foreground text-sm">Нет данных об операциях</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="max-w-[240px]">Канал</TableHead>
            <TableHead className="w-24">Действие</TableHead>
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
              <TableCell className="font-mono text-xs max-w-[240px] truncate">
                {op.channel}
              </TableCell>
              <TableCell>
                {op.action && (
                  <span className={`font-mono text-xs font-bold ${ACTION_COLORS[op.action] ?? ""}`}>
                    {op.action}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <QualityBar score={op.score} nSegments={4} />
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
