import { getContractContent, getService } from "@/entities/service/server";
import { parseQualitySummary } from "@/entities/service/lib/parse-quality";
import { computeScore } from "@/entities/service/lib/compute-score";
import { parseHttpOperations } from "@/entities/service/lib/parse-operations";
import { ContractHttpServicePage } from "@/pages/contract-http-service-page";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ service: string }>;
};

const HttpServicePage = async ({ params }: Props) => {
  const { service } = await params;
  const serviceData = await getService(service);

  if (!serviceData) {
    return notFound();
  }
  const contract = getContractContent(serviceData, "http");

  if (!contract) {
    return notFound();
  }

  const summary = parseQualitySummary(contract);
  const quality = summary ? { score: computeScore(summary), summary } : undefined;
  const operations = parseHttpOperations(contract);

  return (
    <ContractHttpServicePage contract={contract} quality={quality} operations={operations} />
  );
};

export default HttpServicePage;
