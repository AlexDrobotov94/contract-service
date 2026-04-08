import { getContractContent, getService } from "@/entities/service/server";
import { ContractAsyncServicePage } from "@/pages/contract-async-service-page";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ service: string }>;
};

const SocketServicePage = async ({ params }: Props) => {
  const { service } = await params;
  const serviceData = await getService(service);

  if (!serviceData) {
    return notFound();
  }
  const contract = getContractContent(serviceData, "socket");

  if (!contract) {
    return notFound();
  }

  return (
    <>
      <ContractAsyncServicePage contract={contract} />
    </>
  );
};

export default SocketServicePage;
