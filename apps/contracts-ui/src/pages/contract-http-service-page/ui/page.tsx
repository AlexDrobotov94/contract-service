import { ScalarViewer } from "@/shared/lib/scalar-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/atoms/tabs";
import { QualityBar } from "@/shared/ui/molecules/quality-bar";
import { HttpOperationsTable } from "./http-operations-table";
import type { HttpQualitySummary, AsyncQualitySummary } from "@/shared/types/quality.generated";
import type { HttpOperationRow } from "@/entities/service/lib/parse-operations";

type Props = {
  contract: string;
  quality?: { score: number; summary: HttpQualitySummary | AsyncQualitySummary };
  operations?: HttpOperationRow[];
};

export const ContractHttpServicePage = ({ contract, quality, operations }: Props) => {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Обзор</TabsTrigger>
        <TabsTrigger value="viewer">Viewer</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="flex flex-col gap-6">
          {quality ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quality score</span>
                <QualityBar score={quality.score} summary={quality.summary} className="w-48" />
                <span className="text-sm text-muted-foreground tabular-nums">
                  {Math.round(quality.score * 100)}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Данные о качестве недоступны</p>
          )}

          {operations && <HttpOperationsTable operations={operations} />}
        </div>
      </TabsContent>

      <TabsContent value="viewer">
        <ScalarViewer content={contract} />
      </TabsContent>
    </Tabs>
  );
};
