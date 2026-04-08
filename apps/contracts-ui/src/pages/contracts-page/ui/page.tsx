import { getServices } from "@/entities/service/server";
import { ContractsTable } from "@/widgets/contracts-table";

export const ContractsPage = async () => {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-6 ">
      <h1 className="text-3xl">Контракты</h1>
      <ContractsTable services={services} />
    </div>
  );
};
