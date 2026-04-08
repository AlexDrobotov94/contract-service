import { getServices } from "@/entities/service/server";
import { ServicesTable } from "@/widgets/services-table";

export const ServicesPage = async () => {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl">Сервисы</h1>
      <ServicesTable services={services} />
    </div>
  );
};
