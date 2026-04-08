import { getServices } from "@/entities/service/server";
import { ContractsTable } from "@/widgets/contracts-table";

export const ContractsPage = async () => {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-10 p-5">
      <ContractsTable services={services} />
    </div>
  );
};
