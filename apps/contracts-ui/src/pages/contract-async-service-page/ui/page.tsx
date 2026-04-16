import { AsyncApiViewer } from "@/shared/lib/asyncapi-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/atoms/tabs";
import { QualityBar } from "@/shared/ui/molecules/quality-bar";
import { AsyncOperationsTable } from "./async-operations-table";
import type { HttpQualitySummary, AsyncQualitySummary } from "@/shared/types/quality.generated";
import type { AsyncOperationRow } from "@/entities/service/lib/parse-operations";

type Props = {
  contract: string;
  quality?: { score: number; summary: HttpQualitySummary | AsyncQualitySummary };
  operations?: AsyncOperationRow[];
};

export const ContractAsyncServicePage = ({ contract, quality, operations }: Props) => {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Обзор</TabsTrigger>
        <TabsTrigger value="viewer">Viewer</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="flex flex-col gap-6">
          {quality ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quality score</span>
              <QualityBar score={quality.score} summary={quality.summary} className="w-48" />
              <span className="text-sm text-muted-foreground tabular-nums">
                {Math.round(quality.score * 100)}%
              </span>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Данные о качестве недоступны</p>
          )}

          {operations && <AsyncOperationsTable operations={operations} />}
        </div>
      </TabsContent>

      <TabsContent value="viewer">
        <AsyncApiViewer schema={contract} />
      </TabsContent>
    </Tabs>
  );
};
