import { getContractContent, getService } from "@/entities/service/server";
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

  return (
    <>
      <ContractHttpServicePage contract={contract} />
    </>
  );
};

export default HttpServicePage;
