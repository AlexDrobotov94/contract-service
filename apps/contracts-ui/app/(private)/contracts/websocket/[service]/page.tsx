import { getContractContent, getService } from "@/entities/service/server";
import { parseQualitySummary } from "@/entities/service/lib/parse-quality";
import { computeScore } from "@/entities/service/lib/compute-score";
import { parseAsyncOperations } from "@/entities/service/lib/parse-operations";
import { ContractAsyncServicePage } from "@/pages/contract-async-service-page";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ service: string }>;
};

const WebsocketServicePage = async ({ params }: Props) => {
  const { service } = await params;
  const serviceData = await getService(service);

  if (!serviceData) {
    return notFound();
  }
  const contract = getContractContent(serviceData, "websocket");

  if (!contract) {
    return notFound();
  }

  const summary = parseQualitySummary(contract);
  const quality = summary ? { score: computeScore(summary), summary } : undefined;
  const operations = parseAsyncOperations(contract);

  return <ContractAsyncServicePage contract={contract} quality={quality} operations={operations} />;
};

export default WebsocketServicePage;
